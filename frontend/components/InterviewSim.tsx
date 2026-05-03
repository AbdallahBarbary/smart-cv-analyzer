"use client";
import { useState, useRef, useEffect } from "react";
import { evaluateInterview } from "../app/lib/api";

interface Props { lang: string; }

const QUESTIONS = {
  hr: [
    "Tell me about yourself.",
    "What is your greatest professional achievement?",
    "Where do you see yourself in 5 years?",
    "Why are you leaving your current job?",
    "How do you handle conflict with a colleague?",
    "What motivates you at work?",
  ],
  technical: [
    "Explain the difference between REST and GraphQL.",
    "What is the virtual DOM and why does React use it?",
    "How would you optimize a slow web application?",
    "Explain CORS — what is it and how do you handle it?",
    "What is the difference between useMemo and useCallback?",
    "How do you approach testing a new feature?",
  ],
  mixed: [
    "Tell me about yourself and your technical background.",
    "What's your experience with modern frontend frameworks?",
    "Describe the hardest bug you've ever fixed.",
    "How do you stay up to date with technology?",
    "Explain code splitting and why it matters.",
    "How do you handle tight deadlines and pressure?",
  ],
};

export default function InterviewSim({ lang }: Props) {
  const [phase, setPhase]         = useState<"setup"|"chat"|"results">("setup");
  const [role, setRole]           = useState("");
  const [type, setType]           = useState("mixed");
  const [pressure, setPressure]   = useState("relaxed");
  const [messages, setMessages]   = useState<{role:"ai"|"user";text:string}[]>([]);
  const [history, setHistory]     = useState<{q:string;a:string}[]>([]);
  const [currentQ, setCurrentQ]   = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answer, setAnswer]       = useState("");
  const [result, setResult]       = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [timer, setTimer]         = useState(90);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatRef  = useRef<HTMLDivElement>(null);

  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startTimer = (secs: number) => {
    setTimer(secs);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          sendAnswer(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startInterview = () => {
    const qs = QUESTIONS[type as keyof typeof QUESTIONS] || QUESTIONS.mixed;
    setQuestions(qs);
    setCurrentQ(0);
    setHistory([]);
    setMessages([{ role: "ai", text: t(
      `Welcome${role ? ` and good luck with the ${role} role` : ""}! Let's begin. ${qs[0]}`,
      `أهلاً${role ? ` وبالتوفيق في وظيفة ${role}` : ""}! هنبدأ. ${qs[0]}`
    )}]);
    setPhase("chat");
    if (pressure !== "relaxed") startTimer(pressure === "pressure" ? 45 : 90);
  };

  const sendAnswer = async (timedOut = false) => {
    const userAnswer = timedOut ? "(No answer — time expired)" : answer.trim();
    if (!userAnswer && !timedOut) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const newHistory = [...history, { q: questions[currentQ], a: userAnswer }];
    setHistory(newHistory);
    setMessages(prev => [...prev, { role: "user", text: userAnswer }]);
    setAnswer("");

    const next = currentQ + 1;
    setCurrentQ(next);

    if (next >= questions.length) {
      setMessages(prev => [...prev, { role: "ai", text: t(
        "Great session! Evaluating your performance now…",
        "شكراً! بقيّم أداءك دلوقتي…"
      )}]);
      setLoading(true);
      try {
        const res = await evaluateInterview(newHistory, lang);
        setResult(res);
        setPhase("results");
      } catch {}
      setLoading(false);
    } else {
      setMessages(prev => [...prev, { role: "ai", text: t(
        `Good. Next question: ${questions[next]}`,
        `تمام. السؤال الجاي: ${questions[next]}`
      )}]);
      if (pressure !== "relaxed") startTimer(pressure === "pressure" ? 45 : 90);
    }
  };

  const maxTime = pressure === "pressure" ? 45 : 90;
  const timerPct = (timer / maxTime) * 100;
  const timerColor = timer > 20 ? "var(--accent)" : "var(--red)";

  if (phase === "results") return (
    <div className="animate-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>{t("Interview Results", "نتائج المقابلة")}</div>
        <button className="btn btn-ghost" onClick={() => setPhase("setup")}>{t("Try Again ↺", "حاول مجدداً ↺")}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          [result?.score, t("Overall Score","النتيجة"), "var(--accent)"],
          [result?.confidence, t("Confidence","الثقة"), "var(--purple)"],
          [result?.clarity, t("Clarity","الوضوح"), "var(--blue)"],
        ].map(([val, label, color]) => (
          <div key={label as string} className="card" style={{ textAlign: "center" }}>
            <div className="font-display" style={{ fontSize: 40, fontWeight: 800, color: color as string }}>{val}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {t("Feedback", "التغذية الراجعة")}
        </div>
        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.8 }}>{result?.feedback}</p>
      </div>
    </div>
  );

  if (phase === "chat") return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>
          {t("Question", "سؤال")} {currentQ + 1} / {questions.length}
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}
          onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setPhase("setup"); }}>
          {t("End Session", "إنهاء الجلسة")}
        </button>
      </div>

      {pressure !== "relaxed" && (
        <div style={{ height: 4, background: "var(--bg3)", borderRadius: 99, marginBottom: 16, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99, background: timerColor,
            width: `${timerPct}%`, transition: "width 1s linear, background 0.3s"
          }} />
        </div>
      )}

      <div
        ref={chatRef}
        style={{
          background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16,
          padding: 16, height: 300, overflowY: "auto", marginBottom: 12,
          display: "flex", flexDirection: "column", gap: 12,
        }}
      >
        {messages.map((m, i) => (
          <div key={i} className={m.role === "ai" ? "bubble-ai" : "bubble-user"}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic" }}>
            {t("Evaluating…", "جاري التقييم…")}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <textarea
          className="input"
          style={{ flex: 1, resize: "none", minHeight: 72 }}
          placeholder={t("Type your answer… (Shift+Enter for new line, Enter to send)", "اكتب إجابتك…")}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAnswer(); }
          }}
        />
        <button className="btn btn-primary" onClick={() => sendAnswer()} style={{ alignSelf: "flex-end", padding: "14px 20px" }}>
          {t("Send", "أرسل")}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("Target Role (optional)", "الوظيفة المستهدفة (اختياري)")}
          </div>
          <input
            className="input"
            placeholder={t("e.g. Senior React Developer", "مثلاً: مطور React")}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("Interview Type", "نوع المقابلة")}
          </div>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="hr">{t("HR / Behavioral", "HR / سلوكي")}</option>
            <option value="technical">{t("Technical", "تقني")}</option>
            <option value="mixed">{t("Mixed", "مختلط")}</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {t("Pressure Mode", "وضع الضغط")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {([
            ["relaxed",  t("Relaxed","هادي"),          t("No time limit","بدون وقت")],
            ["timed",    t("Timed 90s","بوقت 90ث"),    t("90 seconds per answer","90 ثانية للإجابة")],
            ["pressure", t("Full Pressure","ضغط كامل"), t("45 seconds — no mercy","45 ثانية — بلا رحمة")],
          ] as [string,string,string][]).map(([val, label, sub]) => (
            <div
              key={val}
              onClick={() => setPressure(val)}
              style={{
                border: `1px solid ${pressure === val ? "rgba(0,229,160,0.4)" : "var(--border)"}`,
                background: pressure === val ? "var(--accent-dim)" : "var(--bg3)",
                borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s"
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: pressure === val ? "var(--accent)" : "var(--text)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" onClick={startInterview} style={{ fontSize: 15, padding: "12px 28px" }}>
        {t("Start Interview ↗", "ابدأ المقابلة ↗")}
      </button>
    </div>
  );
}

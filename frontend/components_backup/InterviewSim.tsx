"use client";
import { useState, useRef, useEffect } from "react";
import { evaluateInterview } from "../app/lib/api";

interface Props { lang: string; }

const QUESTIONS = {
  hr: ["Tell me about yourself.", "What is your greatest achievement?", "Where do you see yourself in 5 years?", "Why are you leaving your current job?", "How do you handle conflict?", "What motivates you?"],
  technical: ["Explain the virtual DOM in React.", "What is the difference between useMemo and useCallback?", "How would you optimize a slow React app?", "Explain CORS and how you handle it.", "REST vs GraphQL trade-offs?", "How do you approach testing a component?"],
  mixed: ["Tell me about yourself.", "What is your experience with React?", "Describe a challenging bug you fixed.", "How do you stay updated with tech?", "Explain code splitting.", "How do you handle deadlines under pressure?"],
};

export default function InterviewSim({ lang }: Props) {
  const [phase, setPhase] = useState<"setup"|"chat"|"results">("setup");
  const [type, setType] = useState("mixed");
  const [pressure, setPressure] = useState("relaxed");
  const [messages, setMessages] = useState<{role:"ai"|"user";text:string}[]>([]);
  const [history, setHistory] = useState<{q:string;a:string}[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(90);
  const timerRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const startInterview = () => {
    const qs = QUESTIONS[type as keyof typeof QUESTIONS] || QUESTIONS.mixed;
    setQuestions(qs);
    setCurrentQ(0);
    setHistory([]);
    setMessages([{ role: "ai", text: t(`Welcome! Let's begin. ${qs[0]}`, `أهلاً! هنبدأ المقابلة. ${qs[0]}`) }]);
    setPhase("chat");
    if (pressure !== "relaxed") startTimer(pressure === "pressure" ? 45 : 90);
  };

  const startTimer = (secs: number) => {
    setTimer(secs);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); sendAnswer(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const sendAnswer = async (timedOut = false) => {
    const userAnswer = timedOut ? "(No answer — time expired)" : answer.trim();
    if (!userAnswer && !timedOut) return;
    clearInterval(timerRef.current);

    const newHistory = [...history, { q: questions[currentQ], a: userAnswer }];
    setHistory(newHistory);
    setMessages(prev => [...prev, { role: "user", text: userAnswer }]);
    setAnswer("");

    const nextQ = currentQ + 1;
    setCurrentQ(nextQ);

    if (nextQ >= questions.length) {
      setMessages(prev => [...prev, { role: "ai", text: t("Great session! Evaluating your performance...", "شكراً! بقيّم أداءك دلوقتي...") }]);
      setLoading(true);
      try {
        const res = await evaluateInterview(newHistory, lang);
        setResult(res);
        setPhase("results");
      } catch {}
      setLoading(false);
    } else {
      setMessages(prev => [...prev, { role: "ai", text: t(`Good. Next: ${questions[nextQ]}`, `تمام. السؤال الجاي: ${questions[nextQ]}`) }]);
      if (pressure !== "relaxed") startTimer(pressure === "pressure" ? 45 : 90);
    }
  };

  if (phase === "results") return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t("Interview Results", "نتائج المقابلة")}</h2>
        <button onClick={() => setPhase("setup")} className="text-sm text-gray-400">← {t("Try Again", "حاول مجدداً")}</button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[[result?.score, t("Score","النتيجة"), "text-emerald-600"],
          [result?.confidence, t("Confidence","الثقة"), "text-purple-600"],
          [result?.clarity, t("Clarity","الوضوح"), "text-blue-600"]].map(([val, label, color]) => (
          <div key={label as string} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
            <div className={`text-3xl font-bold ${color} mb-1`}>{val}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="font-medium mb-2">{t("Feedback", "التغذية الراجعة")}</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{result?.feedback}</p>
      </div>
    </div>
  );

  if (phase === "chat") return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">{t("Interview in Progress", "المقابلة جارية")}</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Q {currentQ + 1} / {questions.length}</span>
          <button onClick={() => { clearInterval(timerRef.current); setPhase("setup"); }} className="text-xs text-gray-400">End ✕</button>
        </div>
      </div>

      {pressure !== "relaxed" && (
        <div className="h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${(timer / (pressure === "pressure" ? 45 : 90)) * 100}%`, background: timer > 20 ? "#1D9E75" : "#E24B4A" }} />
        </div>
      )}

      <div ref={chatRef} className="bg-white border border-gray-100 rounded-xl p-4 h-72 overflow-y-auto mb-3 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            m.role === "ai" ? "bg-gray-50 text-gray-800 self-start rounded-tl-sm" : "bg-emerald-600 text-white self-end rounded-tr-sm"
          }`}>{m.text}</div>
        ))}
        {loading && <div className="text-sm text-gray-400 animate-pulse">{t("Evaluating...", "جاري التقييم...")}</div>}
      </div>

      <div className="flex gap-2">
        <textarea
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white resize-none"
          rows={2}
          placeholder={t("Type your answer... (Enter to send)", "اكتب إجابتك...")}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAnswer(); } }}
        />
        <button onClick={() => sendAnswer()}
          className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          {t("Send", "أرسل")}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("Interview Simulator", "محاكاة المقابلة")}</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            {t("Interview Type", "نوع المقابلة")}
          </label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-emerald-500"
            value={type} onChange={(e) => setType(e.target.value)}>
            <option value="hr">{t("HR / Behavioral", "HR / سلوكي")}</option>
            <option value="technical">{t("Technical", "تقني")}</option>
            <option value="mixed">{t("Mixed", "مختلط")}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            {t("Pressure Mode", "وضع الضغط")}
          </label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-emerald-500"
            value={pressure} onChange={(e) => setPressure(e.target.value)}>
            <option value="relaxed">{t("Relaxed", "هادي")}</option>
            <option value="timed">{t("Timed 90s", "بوقت 90ث")}</option>
            <option value="pressure">{t("Full Pressure", "ضغط كامل")}</option>
          </select>
        </div>
      </div>
      <button onClick={startInterview}
        className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
        {t("Start Interview ↗", "ابدأ المقابلة ↗")}
      </button>
    </div>
  );
}

"use client";
import { useState, useRef, useCallback } from "react";
import { analyzeCV, analyzeCVFile, rewriteCV } from "../app/lib/api";

interface Props { lang: string; cvText: string; setCvText: (t: string) => void; }

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(20px)' };
const lbl: React.CSSProperties = { fontFamily: "'Syne', sans-serif", fontSize: '0.68rem', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px', display: 'block' };

export default function CVAnalyzer({ lang, cvText, setCvText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [rewritten, setRewritten] = useState<any>(null);
  const [rewriting, setRewriting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const fileRef = useRef<HTMLInputElement>(null);
  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(pdf|docx|doc)$/i)) {
      alert(t("Please upload a PDF or Word document.", "من فضلك ارفع PDF أو Word."));
      return;
    }
    setUploadedFile(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

 const handleAnalyze = async () => {
  setLoading(true);
  try {
    let data: any;
    if (uploadedFile && inputMode === "file") {
      data = await analyzeCVFile(uploadedFile, lang);
    } else {
      if (!cvText.trim()) { setLoading(false); return; }
      data = await analyzeCV(cvText, lang);
    }

    if (data.error) {
      alert(data.error);
      setLoading(false);
      return;
    }

    // Sync CV text to global state so other tabs can use it
    if (data.cv_text) setCvText(data.cv_text);
    setResult(data);
  } catch (e) {
    console.error(e);
    alert(t(
      "Analysis failed. Make sure backend is running at localhost:8000",
      "فشل التحليل. تأكد من تشغيل الباكند"
    ));
  }
  setLoading(false);
};
  const handleRewrite = async () => {
    setRewriting(true);
    try {
      const res = await rewriteCV(cvText, lang);
      setRewritten(res.bullets);
    } catch {}
    setRewriting(false);
  };

  const scoreColor = (s: number) => s >= 75 ? '#00e5a0' : s >= 50 ? '#ffb800' : '#ff6b6b';

  if (result) return (
    <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: '800', fontSize: '1.8rem', color: 'var(--text)', margin: 0 }}>
            {t("Analysis Results", "نتائج التحليل")}
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            {result.seniority_level} · {result.years_experience}y exp
          </p>
        </div>
        <button onClick={() => { setResult(null); setRewritten(null); }} className="btn-ghost">
          ← {t("Back", "رجوع")}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', width: '110px', height: '110px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor(result.score)} strokeWidth="8" strokeLinecap="round"
                strokeDasharray="251" strokeDashoffset={251 - (251 * result.score / 100)}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 8px ${scoreColor(result.score)})` }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.7rem', fontWeight: '800', color: scoreColor(result.score) }}>{result.score}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)', letterSpacing: '0.05em' }}>SCORE</span>
            </div>
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.78rem', fontWeight: '700', color: scoreColor(result.score) }}>
            {result.score >= 75 ? t("Excellent", "ممتاز") : result.score >= 50 ? t("Good", "جيد") : t("Needs Work", "يحتاج تحسين")}
          </div>
        </div>

        <div style={card}>
          <span style={lbl}>{t("Breakdown", "التفاصيل")}</span>
          {([["skills_score", t("Skills","مهارات")], ["experience_score", t("Experience","خبرة")], ["education_score", t("Education","تعليم")], ["formatting_score", t("Formatting","تنسيق")]] as [string,string][]).map(([key, label]) => (
            <div key={key} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{label}</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.8rem', fontWeight: '700', color: scoreColor(result[key]) }}>{result[key]}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '100px', background: scoreColor(result[key]), width: `${result[key]}%`, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)', boxShadow: `0 0 6px ${scoreColor(result[key])}66` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, marginBottom: '12px' }}>
        <span style={lbl}>{t("Skills", "المهارات")}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {result.skills?.map((s: string) => <span key={s} className="tag tag-blue">{s}</span>)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div style={card}>
          <span style={lbl}>{t("Strengths", "نقاط القوة")}</span>
          {result.strengths?.map((s: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text2)', lineHeight: '1.5' }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={card}>
          <span style={lbl}>{t("To Improve", "للتحسين")}</span>
          {result.weaknesses?.map((s: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#ffb800', flexShrink: 0 }}>!</span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text2)', lineHeight: '1.5' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, marginBottom: '20px', borderLeft: '3px solid var(--accent2)', background: 'rgba(124,106,255,0.06)' }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: '1.6' }}>💡 {result.impact_suggestion}</span>
      </div>

      {cvText && (
        <button onClick={handleRewrite} disabled={rewriting} className="btn-primary">
          {rewriting ? <><span className="spinner" />{t("Rewriting...", "جاري الإعادة...")}</> : `✦ ${t("Auto-Rewrite Weak Points", "أعد كتابة النقاط الضعيفة")}`}
        </button>
      )}

      {rewritten && (
        <div style={{ ...card, marginTop: '16px' }}>
          <span style={lbl}>{t("Rewritten Bullets", "نقاط معاد كتابتها")}</span>
          {rewritten.map((b: any, i: number) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.81rem', color: 'var(--text3)', textDecoration: 'line-through', marginBottom: '6px' }}>{b.original}</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--accent)' }}>→ {b.improved}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: '800', fontSize: '2rem', color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          {t("Analyze Your CV", "تحليل سيرتك الذاتية")}
        </h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>
          {t("Upload PDF/Word or paste text — syncs to all other features automatically", "ارفع PDF أو Word أو الصق نص — يتزامن مع كل الميزات تلقائياً")}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(["file", "text"] as const).map(mode => (
          <button key={mode} onClick={() => setInputMode(mode)} style={{
            padding: '8px 20px', borderRadius: '10px', border: '1px solid',
            borderColor: inputMode === mode ? 'var(--accent)' : 'var(--border)',
            background: inputMode === mode ? 'rgba(0,229,160,0.1)' : 'transparent',
            color: inputMode === mode ? 'var(--accent)' : 'var(--text2)',
            fontFamily: "'Syne', sans-serif", fontSize: '0.8rem', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {mode === "file" ? `📁 ${t("Upload File", "رفع ملف")}` : `✏️ ${t("Paste Text", "لصق نص")}`}
          </button>
        ))}
      </div>

      {inputMode === "file" ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : uploadedFile ? 'rgba(0,229,160,0.4)' : 'var(--border)'}`,
            borderRadius: '16px', padding: '52px 24px', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: '20px',
            background: dragOver ? 'rgba(0,229,160,0.05)' : uploadedFile ? 'rgba(0,229,160,0.03)' : 'var(--surface)',
          }}
        >
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{uploadedFile ? '✅' : '📄'}</div>
          {uploadedFile ? (
            <>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: '700', color: 'var(--accent)', fontSize: '1rem' }}>{uploadedFile.name}</div>
              <div style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: '4px' }}>
                {(uploadedFile.size / 1024).toFixed(0)} KB · {t("Click to change", "اضغط للتغيير")}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: '700', color: 'var(--text)', fontSize: '1rem', marginBottom: '4px' }}>
                {t("Drop your CV here", "أفلت CV هنا")}
              </div>
              <div style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>
                {t("PDF, DOC, DOCX · Syncs to all features", "PDF, DOC, DOCX · يتزامن مع كل الميزات")}
              </div>
            </>
          )}
        </div>
      ) : (
        <textarea className="input-field" style={{ minHeight: '200px', marginBottom: '20px' }}
          placeholder={t("Paste your full CV here...", "الصق CV هنا...")}
          value={cvText} onChange={e => setCvText(e.target.value)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleAnalyze}
          disabled={loading || (inputMode === "file" ? !uploadedFile : !cvText.trim())}
          className="btn-primary">
          {loading ? <><span className="spinner" />{t("Analyzing...", "جاري التحليل...")}</> : `◈ ${t("Analyze CV", "تحليل CV")}`}
        </button>
      </div>
    </div>
  );
}
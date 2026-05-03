"use client";
import { useState } from "react";
import { runATS } from "../app/lib/api";

interface Props { lang: string; cvText: string; setCvText: (t: string) => void; }

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(20px)' };
const lbl: React.CSSProperties = { fontFamily: "'Syne', sans-serif", fontSize: '0.68rem', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '10px', display: 'block' };

export default function ATSCheck({ lang, cvText, setCvText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  const handleRun = async () => {
    if (!cvText.trim()) {
      alert(t("Please upload or paste your CV first (use the CV Analyzer tab).", "من فضلك ارفع CV أولاً من تبويب تحليل CV."));
      return;
    }
    setLoading(true);
    try { setResult(await runATS(cvText)); }
    catch { alert(t("ATS simulation failed.", "فشلت المحاكاة.")); }
    setLoading(false);
  };

  const pass = result?.verdict?.includes("PASS");

  return (
    <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: '800', fontSize: '2rem', color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          {t("ATS Simulation", "محاكاة ATS")}
        </h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>
          {t("See how applicant tracking systems score your CV", "اعرف كيف تقيّم أنظمة ATS سيرتك")}
        </p>
      </div>

      {/* CV status */}
      {!cvText ? (
        <div style={{ ...card, marginBottom: '20px', borderColor: 'rgba(255,184,0,0.2)', background: 'rgba(255,184,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: '600', color: '#ffb800', fontSize: '0.9rem' }}>
              {t("No CV loaded", "لم يتم تحميل CV")}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginTop: '2px' }}>
              {t("Go to CV Analyzer tab first to upload or paste your CV", "اذهب لتبويب تحليل CV أولاً لرفع أو لصق CV")}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...card, marginBottom: '20px', borderColor: 'rgba(0,229,160,0.2)', background: 'rgba(0,229,160,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>✅</span>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: '600', color: 'var(--accent)', fontSize: '0.9rem' }}>
              {t("CV Ready", "CV جاهز")}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginTop: '2px' }}>
              {cvText.length} {t("characters loaded", "حرف محمّل")}
            </div>
          </div>
        </div>
      )}

      {/* Optional: paste CV here too */}
      {!cvText && (
        <div style={{ marginBottom: '20px' }}>
          <span style={lbl}>{t("Or paste CV directly here", "أو الصق CV هنا مباشرة")}</span>
          <textarea className="input-field" style={{ minHeight: '150px' }}
            placeholder={t("Paste your CV text...", "الصق نص CV...")}
            onChange={e => setCvText(e.target.value)}
          />
        </div>
      )}

      <button onClick={handleRun} disabled={loading || !cvText.trim()} className="btn-primary" style={{ marginBottom: '28px' }}>
        {loading ? <><span className="spinner" />{t("Simulating...", "جاري المحاكاة...")}</> : `⬡ ${t("Run ATS Simulation", "ابدأ محاكاة ATS")}`}
      </button>

      {result && (
        <div style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
          <div style={{ ...card, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${pass ? 'var(--accent)' : '#ff6b6b'}` }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t("Verdict", "النتيجة")}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: '800', fontSize: '1.4rem', color: pass ? 'var(--accent)' : '#ff6b6b' }}>{result.verdict}</div>
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: '800', fontSize: '2.5rem', color: pass ? 'var(--accent)' : '#ff6b6b' }}>{result.score}%</div>
          </div>

          <div style={{ ...card, marginBottom: '16px' }}>
            <span style={lbl}>{t("Section Scores", "نتائج الأقسام")}</span>
            {Object.entries(result.section_scores || {}).map(([key, val]: any) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text2)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: val >= 70 ? 'var(--accent)' : val >= 40 ? '#ffb800' : '#ff6b6b' }}>{val}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: val >= 70 ? 'var(--accent)' : val >= 40 ? '#ffb800' : '#ff6b6b', width: `${val}%`, borderRadius: '100px', transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={card}>
            <span style={lbl}>{t("ATS Flags", "تحذيرات ATS")}</span>
            {result.flags?.map((f: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: '#ffb800', flexShrink: 0 }}>⚠</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
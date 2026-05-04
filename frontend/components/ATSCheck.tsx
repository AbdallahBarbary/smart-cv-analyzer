"use client";
import { useState } from "react";
import { runATS } from "../app/lib/api";

interface Props { lang: string; cvText: string; setCvText: (t: string) => void; }

const P: React.CSSProperties = { background: 'rgba(13,17,24,0.95)', border: '1px solid rgba(0,255,136,0.1)', position: 'relative', overflow: 'hidden' };

export default function ATSCheck({ lang, cvText, setCvText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const t = (en: string, ar: string) => lang === "ar" ? ar : en;
  const pass = result?.verdict?.includes("PASS");

  return (
    <div className="animate-fadeUp">
      <div style={{ marginBottom: '32px' }}>
        <div className="data-label" style={{ marginBottom: '6px' }}>// MODULE_05</div>
        <h1 style={{ fontFamily: 'var(--cond)', fontWeight: '800', fontSize: '2.6rem', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1, marginBottom: '8px' }}>
          ATS <span style={{ color: 'var(--accent)' }}>SIMULATOR</span>
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)' }}>
          SIMULATE APPLICANT TRACKING SYSTEM SCORING ALGORITHMS
        </p>
      </div>

      {/* CV status */}
      {cvText ? (
        <div style={{ ...P, padding: '14px 20px', marginBottom: '20px', borderColor: 'rgba(0,255,136,0.3)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="dot-green" />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.08em' }}>
            CV_LOADED — {cvText.length} CHARS — READY FOR SIMULATION
          </span>
        </div>
      ) : (
        <div style={{ ...P, padding: '20px', marginBottom: '20px', borderColor: 'rgba(255,170,0,0.3)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
            <span className="dot-amber" />
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--amber)', letterSpacing: '0.08em' }}>NO_CV_LOADED — PASTE BELOW OR USE CV ANALYZER</span>
          </div>
          <textarea className="input-field" style={{ minHeight: '140px', fontFamily: 'var(--mono)', fontSize: '0.78rem' }}
            placeholder="> PASTE CV TEXT TO SIMULATE..."
            onChange={e => setCvText(e.target.value)}
          />
        </div>
      )}

      <button onClick={async () => {
        if (!cvText.trim()) { alert("Please load your CV first."); return; }
        setLoading(true);
        try { setResult(await runATS(cvText)); } catch { alert("ATS simulation failed."); }
        setLoading(false);
      }} disabled={loading || !cvText.trim()} className="btn-primary" style={{ marginBottom: '32px' }}>
        {loading ? <><span className="spinner" />SIMULATING ATS...</> : 'RUN ATS SIMULATION →'}
      </button>

      {result && (
        <div className="animate-fadeUp">
          {/* Verdict banner */}
          <div style={{
            ...P, padding: '24px 28px', marginBottom: '20px',
            borderColor: pass ? 'rgba(0,255,136,0.4)' : 'rgba(255,51,102,0.4)',
            background: pass ? 'rgba(0,255,136,0.04)' : 'rgba(255,51,102,0.04)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div className="data-label" style={{ marginBottom: '6px' }}>SYSTEM_VERDICT</div>
              <div style={{ fontFamily: 'var(--cond)', fontWeight: '800', fontSize: '2rem', letterSpacing: '0.06em', color: pass ? 'var(--accent)' : 'var(--accent3)' }}>
                {result.verdict}
              </div>
            </div>
            <div>
              <div className="data-label" style={{ marginBottom: '4px', textAlign: 'right' }}>ATS_SCORE</div>
              <div className="big-number" style={{ fontSize: '3.5rem', color: pass ? 'var(--accent)' : 'var(--accent3)', textShadow: `0 0 30px ${pass ? 'rgba(0,255,136,0.4)' : 'rgba(255,51,102,0.4)'}` }}>
                {result.score}
              </div>
            </div>
          </div>

          {/* Section scores */}
          <div style={{ ...P, padding: '24px', marginBottom: '16px' }}>
            <div className="data-label" style={{ marginBottom: '16px' }}>// SECTION_BREAKDOWN</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {Object.entries(result.section_scores || {}).map(([key, val]: any) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{key.replace(/_/g,' ')}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', fontWeight: '700', color: val >= 70 ? 'var(--accent)' : val >= 40 ? 'var(--amber)' : 'var(--accent3)' }}>{val}%</span>
                  </div>
                  <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: val >= 70 ? 'var(--accent)' : val >= 40 ? 'var(--amber)' : 'var(--accent3)', transition: 'width 1s cubic-bezier(0.22,1,0.36,1)', boxShadow: `0 0 4px currentColor` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div style={{ ...P, padding: '24px' }}>
            <div className="data-label" style={{ marginBottom: '16px' }}>// ATS_FLAGS [{result.flags?.length}]</div>
            {result.flags?.map((f: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--amber)', fontSize: '0.65rem', flexShrink: 0, marginTop: '3px' }}>WARN_{String(i+1).padStart(2,'0')}</span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
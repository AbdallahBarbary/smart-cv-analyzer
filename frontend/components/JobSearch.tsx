"use client";
import { useState } from "react";
import { searchJobs } from "../app/lib/api";

interface Props { lang: string; cvText: string; setCvText: (t: string) => void; }

const P: React.CSSProperties = { background: 'rgba(13,17,24,0.95)', border: '1px solid rgba(0,255,136,0.1)', position: 'relative', overflow: 'hidden' };

export default function JobSearch({ lang, cvText, setCvText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [localCV, setLocalCV] = useState("");
  const t = (en: string, ar: string) => lang === "ar" ? ar : en;
  const activeCV = cvText || localCV;
  const mc = (p: number) => p >= 85 ? '#00ff88' : p >= 70 ? '#ffaa00' : '#ff6688';

  const handleSearch = async () => {
    if (!activeCV.trim()) { alert("Please load or paste your CV first."); return; }
    setLoading(true);
    try { setResult(await searchJobs(activeCV, lang)); }
    catch { alert("Job search failed. Is the backend running?"); }
    setLoading(false);
  };

  return (
    <div className="animate-fadeUp">
      <div style={{ marginBottom: '32px' }}>
        <div className="data-label" style={{ marginBottom: '6px' }}>// MODULE_04</div>
        <h1 style={{ fontFamily: 'var(--cond)', fontWeight: '800', fontSize: '2.6rem', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1, marginBottom: '8px' }}>
          AI JOB <span style={{ color: 'var(--accent)' }}>SEARCH</span>
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)' }}>
          INTELLIGENT JOB MATCHING BASED ON YOUR SKILLS AND EXPERIENCE PROFILE
        </p>
      </div>

      {!result ? (
        <>
          {cvText ? (
            <div style={{ ...P, padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', borderColor: 'rgba(0,255,136,0.3)' }}>
              <span className="dot-green" />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.08em' }}>
                CV_SYNCED FROM ANALYZER — {cvText.length} CHARS READY
              </span>
            </div>
          ) : (
            <div style={{ ...P, padding: '20px', marginBottom: '20px' }}>
              <div className="data-label" style={{ marginBottom: '10px' }}>PASTE_CV_INPUT</div>
              <textarea className="input-field" style={{ minHeight: '160px', fontFamily: 'var(--mono)', fontSize: '0.78rem' }}
                placeholder="> PASTE CV TEXT HERE OR GO TO CV ANALYZER MODULE TO UPLOAD..."
                value={localCV} onChange={e => { setLocalCV(e.target.value); setCvText(e.target.value); }}
              />
            </div>
          )}

          <div style={{ ...P, padding: '24px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', borderColor: 'rgba(51,102,255,0.2)', background: 'rgba(51,102,255,0.03)' }}>
            {[['01', 'AI reads CV', 'Extracts skills, titles & experience level'], ['02', 'Matches roles', 'Computes compatibility score for job openings'], ['03', 'Returns results', '6 curated jobs with apply links & salary data']].map(([n, h, d]) => (
              <div key={n}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--accent2)', letterSpacing: '0.15em', marginBottom: '8px' }}>STEP_{n}</div>
                <div style={{ fontFamily: 'var(--cond)', fontWeight: '700', fontSize: '1rem', color: 'var(--text)', letterSpacing: '0.04em', marginBottom: '4px' }}>{h.toUpperCase()}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: '1.5' }}>{d}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSearch} disabled={loading || !activeCV.trim()} className="btn-primary" type="button">
              {loading ? <><span className="spinner" />SEARCHING JOBS...</> : 'FIND MY JOBS →'}
            </button>
          </div>
        </>
      ) : (
        <div className="animate-fadeUp">
          {/* Profile */}
          <div style={{ ...P, padding: '20px', marginBottom: '20px', borderLeft: '3px solid var(--accent)', borderColor: 'rgba(0,255,136,0.15)' }}>
            <div className="data-label" style={{ marginBottom: '8px' }}>// CANDIDATE_PROFILE</div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '12px', lineHeight: '1.7' }}>{result.profile_summary}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {result.best_titles?.map((t: string) => <span key={t} className="tag tag-green">{t}</span>)}
            </div>
          </div>

          {/* Jobs grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {result.jobs?.map((job: any, i: number) => (
              <div key={i} style={{
                ...P, padding: '20px',
                transition: 'border-color 0.15s',
                animation: `fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) ${i*0.07}s both`,
                cursor: 'default',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,255,136,0.3)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,255,136,0.1)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--cond)', fontWeight: '700', fontSize: '1.05rem', color: 'var(--text)', letterSpacing: '0.04em' }}>{job.title}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--text2)', marginTop: '3px' }}>{job.company} / {job.location}</div>
                  </div>
                  <div className="big-number" style={{ fontSize: '1.5rem', color: mc(job.match_percent) }}>
                    {job.match_percent}%
                  </div>
                </div>
                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '10px' }} />
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text2)', marginBottom: '12px', lineHeight: '1.6' }}>{job.why_match}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {job.skills_needed?.map((s: string) => <span key={s} className="tag tag-blue" style={{ fontSize: '0.62rem' }}>{s}</span>)}
                    <span className="tag tag-amber">{job.salary_range}</span>
                  </div>
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer" style={{
                    fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: '0.1em',
                    color: '#050609', background: 'var(--accent)',
                    padding: '5px 14px', textDecoration: 'none',
                    transition: 'all 0.15s', flexShrink: 0,
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                  }}>APPLY →</a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ ...P, padding: '16px' }}>
              <div className="data-label" style={{ marginBottom: '8px' }}>SEARCH_KEYWORDS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {result.search_keywords?.map((k: string) => <span key={k} className="tag tag-amber">{k}</span>)}
              </div>
            </div>
            <div style={{ ...P, padding: '16px' }}>
              <div className="data-label" style={{ marginBottom: '8px' }}>TOP_PLATFORMS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {result.top_platforms?.map((p: string) => <span key={p} className="tag tag-purple">{p}</span>)}
              </div>
            </div>
          </div>

          <button onClick={() => setResult(null)} className="btn-ghost">← NEW SEARCH</button>
        </div>
      )}
    </div>
  );
}
"use client";
import { useState } from "react";
import { searchJobs } from "../app/lib/api";

interface Props { lang: string; cvText: string; setCvText: (t: string) => void; }

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(20px)' };
const lbl: React.CSSProperties = { fontFamily: "'Syne', sans-serif", fontSize: '0.68rem', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '10px', display: 'block' };

export default function JobSearch({ lang, cvText, setCvText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [localCV, setLocalCV] = useState("");
  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  // Use global CV if available, else local
  const activeCV = cvText || localCV;

  const handleSearch = async () => {
    if (!activeCV.trim()) {
      alert(t("Please upload or paste your CV first.", "من فضلك ارفع أو الصق CV أولاً."));
      return;
    }
    setLoading(true);
    try {
      const res = await searchJobs(activeCV, lang);
      setResult(res);
    } catch (e) {
      console.error(e);
      alert(t("Job search failed. Make sure the backend is running.", "فشل البحث. تأكد أن الـ backend شغال."));
    }
    setLoading(false);
  };

  const matchColor = (pct: number) => pct >= 85 ? '#00e5a0' : pct >= 70 ? '#ffb800' : '#ff8888';

  return (
    <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: '800', fontSize: '2rem', color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          {t("AI Job Search", "بحث وظائف بالذكاء الاصطناعي")}
        </h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>
          {t("Get personalized job matches based on your skills and experience", "احصل على وظائف مخصصة بناءً على مهاراتك وخبرتك")}
        </p>
      </div>

      {!result ? (
        <div>
          {/* CV Status */}
          {cvText ? (
            <div style={{ ...card, marginBottom: '20px', borderColor: 'rgba(0,229,160,0.25)', background: 'rgba(0,229,160,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: '600', color: 'var(--accent)', fontSize: '0.9rem' }}>
                  {t("CV synced from CV Analyzer", "CV مزامن من تحليل CV")}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '2px' }}>
                  {cvText.length} {t("characters ready", "حرف جاهز")}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ ...card, marginBottom: '20px' }}>
              <span style={lbl}>{t("Paste Your CV", "الصق CV بتاعك")}</span>
              <textarea className="input-field" style={{ minHeight: '160px' }}
                placeholder={t("Paste your CV here, or go to CV Analyzer tab to upload a file...", "الصق CV هنا، أو اذهب لتبويب تحليل CV لرفع ملف...")}
                value={localCV}
                onChange={e => {
                  setLocalCV(e.target.value);
                  setCvText(e.target.value); // sync globally
                }}
              />
            </div>
          )}

          <div style={{ ...card, marginBottom: '20px', background: 'rgba(124,106,255,0.04)', borderColor: 'rgba(124,106,255,0.12)' }}>
            <span style={{ ...lbl, color: '#a89dff' }}>{t("How It Works", "كيف يعمل")}</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[['⊹', t('AI reads your skills & experience', 'الذكاء يقرأ مهاراتك وخبرتك')], ['⌖', t('Matches to relevant roles', 'يطابقك بالأدوار المناسبة')], ['✦', t('Returns 6 curated job matches', 'يعطيك 6 وظائف مختارة')]].map(([icon, text]) => (
                <div key={text} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--accent2)' }}>{icon}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text2)', lineHeight: '1.4' }}>{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSearch}
              disabled={loading || !activeCV.trim()}
              className="btn-primary"
              type="button"
            >
              {loading
                ? <><span className="spinner" />{t("Searching jobs...", "جاري البحث عن وظائف...")}</>
                : `⊹ ${t("Find My Jobs", "ابحث عن وظائفي")}`
              }
            </button>
          </div>
        </div>
      ) : (
        <div style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
          {/* Profile */}
          <div style={{ ...card, marginBottom: '16px', borderLeft: '3px solid var(--accent)' }}>
            <span style={lbl}>{t("Your Profile", "ملفك الشخصي")}</span>
            <p style={{ fontSize: '0.88rem', color: 'var(--text2)', margin: '0 0 12px', lineHeight: '1.6' }}>{result.profile_summary}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {result.best_titles?.map((title: string) => <span key={title} className="tag tag-purple">{title}</span>)}
            </div>
          </div>

          {/* Job cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {result.jobs?.map((job: any, i: number) => (
              <div key={i} style={{
                ...card, padding: '20px', transition: 'all 0.2s',
                animation: `fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s both`,
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(255,255,255,0.14)'; el.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: '700', fontSize: '1rem', color: 'var(--text)', marginBottom: '3px' }}>{job.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{job.company} · {job.location}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: '800', fontSize: '1.1rem', color: matchColor(job.match_percent) }}>{job.match_percent}%</div>
                    <span className="tag" style={{ background: job.type === 'Remote' ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.05)', color: job.type === 'Remote' ? 'var(--accent)' : 'var(--text2)', border: `1px solid ${job.type === 'Remote' ? 'rgba(0,229,160,0.2)' : 'var(--border)'}` }}>{job.type}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text3)', margin: '0 0 12px', lineHeight: '1.5' }}>{job.why_match}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    {job.skills_needed?.map((s: string) => <span key={s} className="tag tag-blue" style={{ fontSize: '0.7rem' }}>{s}</span>)}
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '500' }}>{job.salary_range}</span>
                  </div>
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer" style={{
                    padding: '7px 16px', borderRadius: '8px', background: 'var(--accent)',
                    color: '#080b14', fontFamily: "'Syne', sans-serif", fontWeight: '700',
                    fontSize: '0.75rem', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}>
                    {t("Apply →", "تقدّم →")}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={card}>
              <span style={lbl}>{t("Search Keywords", "كلمات للبحث")}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.search_keywords?.map((k: string) => <span key={k} className="tag tag-amber">{k}</span>)}
              </div>
            </div>
            <div style={card}>
              <span style={lbl}>{t("Top Platforms", "أفضل المنصات")}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.top_platforms?.map((p: string) => <span key={p} className="tag tag-green">{p}</span>)}
              </div>
            </div>
          </div>

          <button onClick={() => setResult(null)} className="btn-ghost">
            ← {t("Search Again", "ابحث مجدداً")}
          </button>
        </div>
      )}
    </div>
  );
}
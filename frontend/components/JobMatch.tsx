"use client";
import { useState } from "react";
import { matchJob, searchJobs } from "../app/lib/api";

interface Props { lang: string; cvText: string; }

export default function JobMatch({ lang, cvText }: Props) {
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError]     = useState("");
  const [view, setView] = useState<"manual" | "auto">("manual"); // toggle view

  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  const handleMatch = async () => {
    if (!cvText.trim()) {
      setError(t("Go to CV Analyzer first and paste your CV there.", "اذهب إلى تحليل CV أولاً والصق سيرتك الذاتية."));
      return;
    }
    if (!jobDesc.trim()) return;
    setLoading(true); setError("");
    try { setResult(await matchJob(cvText, jobDesc, lang)); }
    catch { setError(t("Match failed. Is the backend running?", "فشلت المطابقة. هل الخادم شغال؟")); }
    setLoading(false);
  };

  const handleAutoSearch = async () => {
    if (!cvText.trim()) {
      setError(t("Go to CV Analyzer first and paste your CV there.", "اذهب إلى تحليل CV أولاً والصق سيرتك الذاتية."));
      return;
    }
    setSearching(true); setError("");
    try {
      const data = await searchJobs(cvText, lang);
      setJobs(data.jobs || []);
      setView("auto");
    } catch {
      setError("Job search failed. Check backend.");
    }
    setSearching(false);
  };

  const matchColor = result
    ? result.match_percent >= 70 ? "var(--accent)" : result.match_percent >= 50 ? "var(--amber)" : "var(--red)"
    : "var(--accent)";

  return (
    <div>
      {error && (
        <div style={{
          background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)",
          borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--red)"
        }}>{error}</div>
      )}

     
      {view === "manual" && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("Paste job description", "الصق وصف الوظيفة")}
            </div>
          <textarea
  className="input"
  style={{ 
    minHeight: 200, 
    resize: "vertical", 
    lineHeight: 1.7,
    background: "rgba(255,255,255,0.03)",
    color: "#f0ebe3",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "12px 16px",
    width: "100%",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const
  }}
              placeholder={t("Paste the full job description here…", "الصق وصف الوظيفة الكامل هنا…")}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
            <button className="btn btn-primary" onClick={handleMatch} disabled={loading || !jobDesc.trim()}>
              {loading ? t("Matching…", "جاري المطابقة…") : t("Match My CV ↗", "طابق CV بتاعي ↗")}
            </button>
          </div>

          {result && (
            <div className="animate-fade-up">
              {/* 3 metric cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div className="card-glow" style={{ textAlign: "center" }}>
                  <div className="font-display" style={{ fontSize: 36, fontWeight: 800, color: matchColor }}>
                    {result.match_percent}%
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{t("Match Score", "نسبة المطابقة")}</div>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <div className="font-display" style={{ fontSize: 36, fontWeight: 800, color: "var(--red)" }}>
                    {result.missing_keywords?.length ?? 0}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{t("Missing Keywords", "كلمات ناقصة")}</div>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <div className="font-display" style={{ fontSize: 36, fontWeight: 800, color: "var(--blue)" }}>
                    {result.strong_matches ?? 0}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{t("Strong Matches", "تطابقات قوية")}</div>
                </div>
              </div>

              {/* Missing keywords */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t("Missing Keywords — Add These to Your CV", "كلمات ناقصة — أضفها لـ CV بتاعك")}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.missing_keywords?.map((k: string) => (
                    <span key={k} className="tag tag-red">{k}</span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t("Suggestions", "اقتراحات")}
                </div>
                {result.suggestions?.map((s: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--purple)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {view === "auto" && (
        <>
          <div className="card" style={{ marginBottom: 20, textAlign: "center" }}>
            <button 
              className="btn btn-primary" 
              onClick={handleAutoSearch}
              disabled={searching || !cvText.trim()}
              style={{ maxWidth: 300, margin: "0 auto" }}
            >
              {searching ? "🔍 Searching recent jobs..." : "🔍 Auto Search Jobs Based on My Skills"}
            </button>
            {jobs.length > 0 && (
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>

              </div>
            )}
          </div>

          {jobs.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr)", gap: 20 }}>
              {jobs.map((job: any, i: number) => (
                <div key={i} className="card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                        {job.title}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text2)" }}>
                        📍 {job.location} • Posted {new Date(job.pub_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontSize: 32, color: job.match_score >= 70 ? "var(--accent)" : "var(--amber)" }}>
                      {Math.round(job.match_score)}%
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary w-full" 
                    onClick={() => window.open(job.url, "_blank")}
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          ) : view === "auto" && !searching && (
            <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text2)" }}>
              Click "Auto Search" to find recent jobs matching your skills from Indeed.
            </div>
          )}
        </>
      )}
    </div>
  );
}

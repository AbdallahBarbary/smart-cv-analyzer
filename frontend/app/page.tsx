"use client";
import { useState, useEffect } from "react";
import CVAnalyzer from "@/components/CVAnalyzer";
import JobMatch from "@/components/JobMatch";
import ATSCheck from "@/components/ATSCheck";
import InterviewSim from "@/components/InterviewSim";
import ProgressTracker from "@/components/ProgressTracker";
import JobSearch from "@/components/JobSearch";
import CVGenerator from "@/components/CVGenerator";

type Tab = "cv" | "generate" | "job" | "search" | "ats" | "interview" | "tracker";

const tabs: { id: Tab; code: string; label: string; labelAr: string }[] = [
  { id: "cv",        code: "01", label: "CV ANALYZER",  labelAr: "تحليل CV" },
  { id: "generate",  code: "02", label: "CV GENERATOR", labelAr: "توليد CV" },
  { id: "job",       code: "03", label: "JOB MATCH",    labelAr: "مطابقة" },
  { id: "search",    code: "04", label: "JOB SEARCH",   labelAr: "بحث وظائف" },
  { id: "ats",       code: "05", label: "ATS CHECK",    labelAr: "فحص ATS" },
  { id: "interview", code: "06", label: "INTERVIEW",    labelAr: "مقابلة" },
  { id: "tracker",   code: "07", label: "PROGRESS",     labelAr: "التقدم" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("cv");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [cvText, setCvText] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--sans)',
      position: 'relative',
      zIndex: 1,
    }}>

      {/* TOP STATUS BAR */}
      <div style={{
        background: 'var(--accent)',
        color: '#050609',
        fontFamily: 'var(--mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.12em',
        padding: '4px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>SMARTCV_OS v2.4.1 — AI CAREER INTELLIGENCE PLATFORM</span>
        <span style={{ display: 'flex', gap: '20px' }}>
          <span>SYS:NOMINAL</span>
          <span>AI:ONLINE</span>
          <span>{time}</span>
        </span>
      </div>

      {/* HEADER */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(5,6,9,0.98)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: '0', zIndex: 50,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 28px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          height: '56px',
        }}>
          {/* LEFT — Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '32px', height: '32px',
              border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontWeight: '700', fontSize: '0.7rem',
              color: 'var(--accent)',
              boxShadow: '0 0 12px rgba(0,255,136,0.2), inset 0 0 12px rgba(0,255,136,0.05)',
              letterSpacing: '0.05em',
            }}>SC</div>
            <div>
              <div style={{ fontFamily: 'var(--cond)', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '0.08em', lineHeight: 1 }}>
                SMART<span style={{ color: 'var(--accent)' }}>CV</span>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text3)', letterSpacing: '0.15em' }}>
                CAREER.INTELLIGENCE.SYSTEM
              </div>
            </div>
          </div>

          {/* CENTER — CV Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '6px 16px',
            border: '1px solid',
            borderColor: cvText ? 'rgba(0,255,136,0.3)' : 'var(--border)',
            background: cvText ? 'rgba(0,255,136,0.05)' : 'transparent',
            transition: 'all 0.3s',
          }}>
            <span className={cvText ? 'dot-green' : 'dot-red'} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: cvText ? 'var(--accent)' : 'var(--text3)' }}>
              {cvText ? `CV_LOADED — ${cvText.length}c` : 'NO_CV_LOADED'}
            </span>
          </div>

          {/* RIGHT — Lang + controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', letterSpacing: '0.1em' }}>
              LANG
            </div>
            {(["en", "ar"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '4px 12px',
                border: '1px solid',
                borderColor: lang === l ? 'var(--accent)' : 'var(--border)',
                background: lang === l ? 'rgba(0,255,136,0.1)' : 'transparent',
                color: lang === l ? 'var(--accent)' : 'var(--text3)',
                fontFamily: 'var(--mono)', fontSize: '0.65rem',
                letterSpacing: '0.1em', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* TAB BAR */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(5,6,9,0.95)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: '56px', zIndex: 40,
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 28px',
          display: 'flex', overflowX: 'auto',
        }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn-tab${activeTab === tab.id ? ' active' : ''}`}
            >
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', color: activeTab === tab.id ? 'var(--accent2)' : 'var(--text3)', opacity: 0.8 }}>
                {tab.code}
              </span>
              <span>{lang === "ar" ? tab.labelAr : tab.label}</span>
            </button>
          ))}
        </div>
        {/* Active tab indicator line */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.15), transparent)' }} />
      </nav>

      {/* MAIN CONTENT */}
      <main style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '36px 28px',
        position: 'relative', zIndex: 1,
      }}>
        <div key={activeTab} className="animate-fadeUp">
          {activeTab === "cv"        && <CVAnalyzer      lang={lang} cvText={cvText} setCvText={setCvText} />}
          {activeTab === "generate"  && <CVGenerator     lang={lang} cvText={cvText} setCvText={setCvText} />}
          {activeTab === "job"       && <JobMatch        lang={lang} cvText={cvText} />}
          {activeTab === "search"    && <JobSearch       lang={lang} cvText={cvText} setCvText={setCvText} />}
          {activeTab === "ats"       && <ATSCheck        lang={lang} cvText={cvText} setCvText={setCvText} />}
          {activeTab === "interview" && <InterviewSim    lang={lang} />}
          {activeTab === "tracker"   && <ProgressTracker lang={lang} />}
        </div>
      </main>

      {/* BOTTOM STATUS BAR */}
      <footer style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        borderTop: '1px solid var(--border)',
        background: 'rgba(5,6,9,0.98)',
        padding: '4px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 100,
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', letterSpacing: '0.1em', display: 'flex', gap: '20px' }}>
          <span>MODULE: <span style={{ color: 'var(--accent)' }}>{tabs.find(t => t.id === activeTab)?.label}</span></span>
          <span>BUILD: <span style={{ color: 'var(--text2)' }}>2025.04</span></span>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', letterSpacing: '0.1em' }}>
          BUILT BY <span style={{ color: 'var(--accent)' }}>ELBAR</span> // POWERED BY GROQ + LLAMA-3.3
        </div>
      </footer>

      {/* Bottom padding for footer */}
      <div style={{ height: '32px' }} />
    </div>
  );
}
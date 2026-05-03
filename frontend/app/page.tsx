"use client";
import { useState } from "react";
import CVAnalyzer from "@/components/CVAnalyzer";
import JobMatch from "@/components/JobMatch";
import ATSCheck from "@/components/ATSCheck";
import InterviewSim from "@/components/InterviewSim";
import ProgressTracker from "@/components/ProgressTracker";
import JobSearch from "@/components/JobSearch";
import CVGenerator from "@/components/CVGenerator";

type Tab = "cv" | "generate" | "job" | "search" | "ats" | "interview" | "tracker";

const tabs = [
  { id: "cv" as Tab,        icon: "◈", label: "CV Analyzer",  labelAr: "تحليل CV" },
  { id: "generate" as Tab,  icon: "✦", label: "CV Generator", labelAr: "توليد CV" },
  { id: "job" as Tab,       icon: "⌖", label: "Job Match",    labelAr: "مطابقة" },
  { id: "search" as Tab,    icon: "⊹", label: "Job Search",   labelAr: "بحث وظائف" },
  { id: "ats" as Tab,       icon: "⬡", label: "ATS Check",    labelAr: "فحص ATS" },
  { id: "interview" as Tab, icon: "◎", label: "Interview",    labelAr: "مقابلة" },
  { id: "tracker" as Tab,   icon: "∿", label: "Progress",     labelAr: "التقدم" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("cv");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [cvText, setCvText] = useState("");

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: '700px', height: '700px', borderRadius: '50%', top: '-300px', left: '-200px', background: 'radial-gradient(circle, rgba(0,229,160,0.055) 0%, transparent 65%)', animation: 'float 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', bottom: '-200px', right: '-150px', background: 'radial-gradient(circle, rgba(124,106,255,0.055) 0%, transparent 65%)', animation: 'float 12s ease-in-out infinite reverse' }} />
      </div>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,10,18,0.85)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '62px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #00e5a0, #00c882)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: '800', fontSize: '14px', color: '#080b14', boxShadow: '0 0 24px rgba(0,229,160,0.35)' }}>CV</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: '700', fontSize: '1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>SmartCV</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Career Platform</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '100px', background: cvText ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${cvText ? 'rgba(0,229,160,0.25)' : 'var(--border)'}`, color: cvText ? 'var(--accent)' : 'var(--text3)', transition: 'all 0.3s' }}>
              {cvText ? `✓ CV Ready` : 'No CV loaded'}
            </div>
            <div style={{ display: 'flex', gap: '2px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px' }}>
              {(["en", "ar"] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: '5px 13px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: '0.75rem', fontWeight: '600', transition: 'all 0.2s', background: lang === l ? 'var(--accent)' : 'transparent', color: lang === l ? '#080b14' : 'var(--text2)' }}>
                  {l === "en" ? "EN" : "عر"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <nav style={{ position: 'sticky', top: '62px', zIndex: 40, background: 'rgba(7,10,18,0.9)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 28px', display: 'flex', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '13px 18px', border: 'none', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent' }}>
              <span style={{ fontSize: '0.95rem', color: activeTab === tab.id ? 'var(--accent)' : 'var(--text3)' }}>{tab.icon}</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.8rem', fontWeight: '600', color: activeTab === tab.id ? 'var(--accent)' : 'var(--text2)' }}>
                {lang === "ar" ? tab.labelAr : tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 28px', position: 'relative', zIndex: 1 }}>
        <div key={activeTab} className="animate-fadeUp">
          {activeTab === "cv"        && <CVAnalyzer      lang={lang} cvText={cvText} setCvText={setCvText} />}
          {activeTab === "generate"  && <CVGenerator     lang={lang} cvText={cvText} setCvText={setCvText} />}
          {activeTab === "job"       && <JobMatch        lang={lang} cvText={cvText} setCvText={setCvText} />}
          {activeTab === "search"    && <JobSearch       lang={lang} cvText={cvText} setCvText={setCvText} />}
          {activeTab === "ats"       && <ATSCheck        lang={lang} cvText={cvText} setCvText={setCvText} />}
          {activeTab === "interview" && <InterviewSim    lang={lang} />}
          {activeTab === "tracker"   && <ProgressTracker lang={lang} />}
        </div>
      </main>
    </div>
  );
}
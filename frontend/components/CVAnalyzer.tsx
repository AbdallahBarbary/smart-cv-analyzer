"use client";
import { useState, useRef, useCallback } from "react";
import { analyzeCV, extractCVText, rewriteCV } from "../app/lib/api";

interface Props { lang: string; cvText: string; setCvText: (t: string) => void; }

const P: React.CSSProperties = {
  background: 'rgba(13,17,24,0.95)', border: '1px solid rgba(0,255,136,0.1)',
  position: 'relative', overflow: 'hidden',
};

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
      alert("Please upload PDF or Word (.pdf, .docx, .doc)");
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
      let res;
      if (uploadedFile && inputMode === "file") {
        const extractedText = await extractCVText(uploadedFile, lang);
        setCvText(extractedText);
        res = await analyzeCV(extractedText, lang);
      } else {
        if (!cvText.trim()) { setLoading(false); return; }
        res = await analyzeCV(cvText, lang);
      }
      setResult(res);
    } catch (err: any) {
      alert(err?.message || t("Analysis failed. Make sure the backend is running.", "فشل التحليل."));
    }
    setLoading(false);
  };

  const sc = (n: number) => n >= 75 ? '#00ff88' : n >= 50 ? '#ffaa00' : '#ff3366';

  if (result) return (
    <div className="animate-fadeUp">
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div className="data-label" style={{ marginBottom: '6px' }}>// ANALYSIS_OUTPUT</div>
          <h1 style={{ fontFamily: 'var(--cond)', fontWeight: '800', fontSize: '2.4rem', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>
            CV ANALYSIS <span style={{ color: 'var(--accent)' }}>COMPLETE</span>
          </h1>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--text2)', marginTop: '6px' }}>
            {result.seniority_level} · EXP: {result.years_experience}Y · PROCESSED {new Date().toISOString().slice(0,10)}
          </div>
        </div>
        <button onClick={() => { setResult(null); setRewritten(null); }} className="btn-ghost">
          ← BACK
        </button>
      </div>

      {/* Top metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr 1fr', gap: '1px', marginBottom: '24px', border: '1px solid var(--border)', background: 'var(--border)' }}>
        {/* Big score */}
        <div style={{ ...P, padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.6)' }}>
          <div className="data-label" style={{ marginBottom: '8px' }}>TOTAL SCORE</div>
          <div className="big-number" style={{ fontSize: '4rem', color: sc(result.score), textShadow: `0 0 30px ${sc(result.score)}66` }}>
            {result.score}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: sc(result.score), marginTop: '4px', letterSpacing: '0.1em' }}>
            {result.score >= 75 ? 'EXCELLENT' : result.score >= 50 ? 'AVERAGE' : 'POOR'}
          </div>
        </div>

        {/* Sub scores */}
        {[
          ["SKILLS", result.skills_score],
          ["EXPERIENCE", result.experience_score],
          ["EDUCATION", result.education_score],
          ["FORMAT", result.formatting_score],
        ].map(([label, val]: any, i) => (
          <div key={label} style={{ ...P, padding: '20px', background: 'rgba(5,6,9,0.9)' }}>
            <div className="data-label" style={{ marginBottom: '8px' }}>{label}</div>
            <div className="big-number" style={{ fontSize: '2.2rem', color: sc(val), marginBottom: '10px' }}>{val}</div>
            <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${val}%`, background: sc(val), boxShadow: `0 0 6px ${sc(val)}`, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Skills + Info row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ ...P, padding: '20px' }}>
          <div className="data-label" style={{ marginBottom: '12px' }}>// DETECTED_SKILLS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {result.skills?.map((s: string) => <span key={s} className="tag tag-green">{s}</span>)}
          </div>
        </div>
        <div style={{ ...P, padding: '20px' }}>
          <div className="data-label" style={{ marginBottom: '12px' }}>// IMPACT_VECTOR</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--accent)', lineHeight: '1.7', borderLeft: '2px solid var(--accent)', paddingLeft: '12px' }}>
            {result.impact_suggestion}
          </div>
        </div>
      </div>

      {/* Strengths / Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ ...P, padding: '20px' }}>
          <div className="data-label" style={{ marginBottom: '12px', color: 'var(--accent)' }}>▲ STRENGTHS</div>
          {result.strengths?.map((s: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontSize: '0.7rem', flexShrink: 0, marginTop: '2px' }}>+</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ ...P, padding: '20px' }}>
          <div className="data-label" style={{ marginBottom: '12px', color: 'var(--amber)' }}>▼ WEAKNESSES</div>
          {result.weaknesses?.map((s: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--amber)', fontSize: '0.7rem', flexShrink: 0, marginTop: '2px' }}>!</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {cvText && (
          <button onClick={async () => {
            setRewriting(true);
            try { setRewritten((await rewriteCV(cvText, lang)).bullets); } catch {}
            setRewriting(false);
          }} disabled={rewriting} className="btn-primary">
            {rewriting ? <><span className="spinner" />REWRITING...</> : '✦ AUTO-REWRITE WEAK POINTS'}
          </button>
        )}
      </div>

      {rewritten && (
        <div style={{ ...P, padding: '24px', marginTop: '16px' }}>
          <div className="data-label" style={{ marginBottom: '16px' }}>// REWRITTEN_BULLETS</div>
          {rewritten.map((b: any, i: number) => (
            <div key={i} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text3)', textDecoration: 'line-through', marginBottom: '6px' }}>BEFORE: {b.original}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--accent)' }}>AFTER: {b.improved}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fadeUp">
      <div style={{ marginBottom: '32px' }}>
        <div className="data-label" style={{ marginBottom: '6px' }}>// MODULE_01</div>
        <h1 style={{ fontFamily: 'var(--cond)', fontWeight: '800', fontSize: '2.6rem', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1, marginBottom: '8px' }}>
          CV <span style={{ color: 'var(--accent)' }}>ANALYZER</span>
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)', letterSpacing: '0.04em' }}>
          UPLOAD PDF/DOCX OR PASTE TEXT — SYNCS ACROSS ALL MODULES
        </p>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '20px', border: '1px solid var(--border)', width: 'fit-content' }}>
        {(["file", "text"] as const).map(mode => (
          <button key={mode} onClick={() => setInputMode(mode)} style={{
            padding: '8px 20px',
            border: 'none',
            background: inputMode === mode ? 'rgba(0,255,136,0.1)' : 'transparent',
            color: inputMode === mode ? 'var(--accent)' : 'var(--text3)',
            fontFamily: 'var(--mono)', fontSize: '0.68rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.15s',
            borderRight: mode === "file" ? '1px solid var(--border)' : 'none',
          }}>
            {mode === "file" ? "[ UPLOAD FILE ]" : "[ PASTE TEXT ]"}
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
            border: `1px dashed ${dragOver ? 'var(--accent)' : uploadedFile ? 'rgba(0,255,136,0.5)' : 'rgba(0,255,136,0.15)'}`,
            padding: '56px 24px', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: '20px',
            background: dragOver ? 'rgba(0,255,136,0.04)' : uploadedFile ? 'rgba(0,255,136,0.02)' : 'rgba(0,0,0,0.3)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* corner marks */}
          {[{top:0,left:0,bt:'1px 0 0 1px'},{top:0,right:0,bt:'1px 1px 0 0'},{bottom:0,left:0,bt:'0 0 1px 1px'},{bottom:0,right:0,bt:'0 1px 1px 0'}].map((pos,i) => (
            <div key={i} style={{ position:'absolute', width:'16px', height:'16px', border:`1px solid var(--accent2)`, borderWidth: pos.bt, opacity:0.5, ...pos }} />
          ))}
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {uploadedFile ? (
            <div>
              <div style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '6px', letterSpacing: '0.05em' }}>
                FILE_LOADED: {uploadedFile.name}
              </div>
              <div style={{ fontFamily: 'var(--mono)', color: 'var(--text3)', fontSize: '0.7rem' }}>
                SIZE: {(uploadedFile.size / 1024).toFixed(1)}KB — CLICK TO CHANGE
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: 'var(--cond)', fontWeight: '700', color: 'var(--text2)', fontSize: '1.1rem', letterSpacing: '0.1em', marginBottom: '8px' }}>
                DROP FILE HERE OR CLICK TO BROWSE
              </div>
              <div style={{ fontFamily: 'var(--mono)', color: 'var(--text3)', fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                SUPPORTED: PDF · DOCX · DOC
              </div>
            </div>
          )}
        </div>
      ) : (
        <textarea className="input-field" style={{ minHeight: '220px', marginBottom: '20px', fontFamily: 'var(--mono)', fontSize: '0.8rem', lineHeight: '1.6' }}
          placeholder="> PASTE CV TEXT HERE..."
          value={cvText} onChange={e => setCvText(e.target.value)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleAnalyze}
          disabled={loading || (inputMode === "file" ? !uploadedFile : !cvText.trim())}
          className="btn-primary">
          {loading ? <><span className="spinner" />ANALYZING...</> : 'RUN ANALYSIS →'}
        </button>
      </div>
    </div>
  );
}
"use client";
import { useState, useRef, useCallback } from "react";
import { exportGeneratedCV, generateAtsCV } from "../app/lib/api";

interface Props { lang: string; cvText: string; setCvText: (t: string) => void; }

const P: React.CSSProperties = { background: 'rgba(13,17,24,0.95)', border: '1px solid rgba(0,255,136,0.1)', position: 'relative', overflow: 'hidden' };

export default function CVGenerator({ lang, cvText, setCvText }: Props) {
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<"" | "pdf" | "docx">("");
  const [localCV, setLocalCV] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [inputMode, setInputMode] = useState<"file" | "text">("text");
  const fileRef = useRef<HTMLInputElement>(null);
  const t = (en: string, ar: string) => lang === "ar" ? ar : en;
  const activeCV = cvText || localCV;

  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(pdf|docx|doc)$/i)) { alert("PDF or Word only."); return; }
    setUploadedFile(file);
  }, []);

  const handleGenerate = async () => {
    if (!activeCV.trim()) { alert("Please load or paste your CV first."); return; }
    setLoading(true);
    try { setResult(await generateAtsCV(activeCV, jobDesc, lang)); }
    catch { alert("Generation failed. Is the backend running?"); }
    setLoading(false);
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!result?.cv_text?.trim()) return;
    setExporting(format);
    try {
      const { blob, filename } = await exportGeneratedCV(result.cv_text, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.message || "Failed to export CV");
    }
    setExporting("");
  };

  return (
    <div className="animate-fadeUp">
      <div style={{ marginBottom: '32px' }}>
        <div className="data-label" style={{ marginBottom: '6px' }}>// MODULE_02</div>
        <h1 style={{ fontFamily: 'var(--cond)', fontWeight: '800', fontSize: '2.6rem', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1, marginBottom: '8px' }}>
          CV <span style={{ color: 'var(--accent)' }}>GENERATOR</span>
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)' }}>
          REWRITE & OPTIMIZE YOUR CV FOR MAXIMUM ATS PENETRATION
        </p>
      </div>

      {!result ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Left: CV Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ ...P, padding: '20px' }}>
              <div className="data-label" style={{ marginBottom: '12px' }}>INPUT_CV</div>

              {cvText && (
                <div style={{ padding: '10px 12px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="dot-green" />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.06em' }}>CV_SYNCED ({cvText.length}c)</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0', marginBottom: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
                {(["text","file"] as const).map(m => (
                  <button key={m} onClick={() => setInputMode(m)} style={{
                    padding: '6px 14px', border: 'none',
                    background: inputMode === m ? 'rgba(0,255,136,0.1)' : 'transparent',
                    color: inputMode === m ? 'var(--accent)' : 'var(--text3)',
                    fontFamily: 'var(--mono)', fontSize: '0.63rem', letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s',
                    borderRight: m === "text" ? '1px solid var(--border)' : 'none',
                  }}>
                    {m === "text" ? "[TEXT]" : "[FILE]"}
                  </button>
                ))}
              </div>

              {inputMode === "file" ? (
                <div onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if(f) handleFile(f); }}
                  onClick={() => fileRef.current?.click()}
                  style={{ border: `1px dashed ${dragOver ? 'var(--accent)' : 'rgba(0,255,136,0.2)'}`, padding: '32px', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.3)' }}>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {uploadedFile ? (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--accent)' }}>{uploadedFile.name}</div>
                  ) : (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.08em' }}>DROP PDF/DOCX HERE</div>
                  )}
                </div>
              ) : (
                <textarea className="input-field" style={{ minHeight: '200px', fontFamily: 'var(--mono)', fontSize: '0.78rem', lineHeight: '1.6' }}
                  placeholder="> PASTE CV TEXT HERE..."
                  value={cvText || localCV}
                  onChange={e => { setLocalCV(e.target.value); setCvText(e.target.value); }}
                />
              )}
            </div>
          </div>

          {/* Right: Job desc + action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ ...P, padding: '20px', flex: 1 }}>
              <div className="data-label" style={{ marginBottom: '12px' }}>TARGET_JOB_DESCRIPTION <span style={{ color: 'var(--text3)' }}>(OPTIONAL)</span></div>
              <textarea className="input-field" style={{ minHeight: '200px', fontFamily: 'var(--mono)', fontSize: '0.78rem', lineHeight: '1.6' }}
                placeholder="> PASTE JOB DESCRIPTION TO TARGET OPTIMIZATION..."
                value={jobDesc} onChange={e => setJobDesc(e.target.value)}
              />
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', marginTop: '8px', lineHeight: '1.5', letterSpacing: '0.04em' }}>
                // ADDING A JOB DESCRIPTION INCREASES ATS KEYWORD MATCH RATE BY ~35%
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading || !activeCV.trim()} className="btn-primary" type="button" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              {loading ? <><span className="spinner" />GENERATING OPTIMIZED CV...</> : '✦ GENERATE ATS-OPTIMIZED CV →'}
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-fadeUp">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', marginBottom: '20px', border: '1px solid var(--border)', background: 'var(--border)' }}>
            {[[result.ats_score_estimate, 'ATS_SCORE', '#00ff88'], [result.keywords_added?.length, 'KEYWORDS_ADDED', '#aa88ff'], [result.improvements?.length, 'IMPROVEMENTS', '#ffaa00']].map(([v,l,c]: any) => (
              <div key={l} style={{ background: 'var(--bg1)', padding: '20px', textAlign: 'center' }}>
                <div className="data-label" style={{ marginBottom: '6px' }}>{l}</div>
                <div className="big-number" style={{ fontSize: '2.5rem', color: c }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Improvements + keywords */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ ...P, padding: '20px' }}>
              <div className="data-label" style={{ marginBottom: '12px' }}>// CHANGES_MADE</div>
              {result.improvements?.map((imp: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontSize: '0.65rem', flexShrink: 0 }}>+{i+1}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{imp}</span>
                </div>
              ))}
            </div>
            <div style={{ ...P, padding: '20px' }}>
              <div className="data-label" style={{ marginBottom: '12px' }}>// KEYWORDS_INJECTED</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.keywords_added?.map((k: string) => <span key={k} className="tag tag-green">{k}</span>)}
              </div>
            </div>
          </div>

          {/* Output CV */}
          <div style={{ ...P, padding: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="data-label">// OPTIMIZED_CV_OUTPUT</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-ghost" onClick={() => { navigator.clipboard.writeText(result.cv_text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? 'COPIED ✓' : '⎘ COPY'}
                </button>
                <button className="btn-ghost" onClick={() => handleExport("pdf")} disabled={exporting !== ""}>
                  {exporting === "pdf" ? "PDF..." : "↓ PDF"}
                </button>
                <button className="btn-ghost" onClick={() => handleExport("docx")} disabled={exporting !== ""}>
                  {exporting === "docx" ? "WORD..." : "↓ WORD"}
                </button>
              </div>
            </div>
            <pre style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', padding: '20px', fontSize: '0.77rem', color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: '1.7', maxHeight: '420px', overflowY: 'auto', fontFamily: 'var(--mono)' }}>
              {result.cv_text}
            </pre>
          </div>

          <button onClick={() => setResult(null)} className="btn-ghost">← REGENERATE</button>
        </div>
      )}
    </div>
  );
}
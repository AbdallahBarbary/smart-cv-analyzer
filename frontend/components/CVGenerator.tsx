"use client";
import { useState, useRef, useCallback } from "react";
import { generateAtsCV } from "../app/lib/api";

interface Props { lang: string; cvText: string; setCvText: (t: string) => void; }

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(20px)' };
const lbl: React.CSSProperties = { fontFamily: "'Syne', sans-serif", fontSize: '0.68rem', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '10px', display: 'block' };

export default function CVGenerator({ lang, cvText, setCvText }: Props) {
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [localCV, setLocalCV] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [extracting, setExtracting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  // Use synced global CV if available
  const activeCV = cvText || localCV;

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(pdf|docx|doc)$/i)) {
      alert(t("Please upload PDF or Word.", "من فضلك ارفع PDF أو Word."));
      return;
    }
    setUploadedFile(file);
    setExtracting(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const form = new FormData();
      form.append("file", file);
      form.append("language", lang);
      const res = await fetch(`${API}/api/cv/extract`, { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setLocalCV(data.text);
          setCvText(data.text); // sync globally
        }
      }
    } catch {}
    setExtracting(false);
  }, [lang, setCvText]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleGenerate = async () => {
    if (!activeCV.trim()) {
      alert(t("Please upload or paste your CV first.", "من فضلك ارفع أو الصق CV أولاً."));
      return;
    }
    setLoading(true);
    try {
      const res = await generateAtsCV(activeCV, jobDesc, lang);
      setResult(res);
    } catch {
      alert(t("Generation failed. Is the backend running?", "فشل التوليد."));
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.cv_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.cv_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ATS_Optimized_CV.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: '800', fontSize: '2rem', color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          {t("ATS CV Generator", "توليد CV محسّن للـ ATS")}
        </h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>
          {t("Upload your CV and get a fully rewritten, ATS-optimized version", "ارفع CV واحصل على نسخة محسّنة تجتاز فلاتر ATS")}
        </p>
      </div>

      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* CV Input */}
          <div style={card}>
            <span style={lbl}>{t("Your CV", "CV بتاعك")}</span>

            {/* Show synced CV status */}
            {cvText && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.2)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
                  {t("CV synced from CV Analyzer tab", "CV مزامن من تبويب التحليل")} ({cvText.length} {t("chars", "حرف")})
                </span>
              </div>
            )}

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {(["file", "text"] as const).map(mode => (
                <button key={mode} onClick={() => setInputMode(mode)} style={{
                  padding: '7px 16px', borderRadius: '8px', border: '1px solid',
                  borderColor: inputMode === mode ? 'var(--accent)' : 'var(--border)',
                  background: inputMode === mode ? 'rgba(0,229,160,0.1)' : 'transparent',
                  color: inputMode === mode ? 'var(--accent)' : 'var(--text2)',
                  fontFamily: "'Syne', sans-serif", fontSize: '0.78rem', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {mode === "file" ? `📁 ${t("Upload New File", "رفع ملف جديد")}` : `✏️ ${t("Edit/Paste Text", "تعديل أو لصق")}`}
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
                  borderRadius: '12px', padding: '36px 24px', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: uploadedFile ? 'rgba(0,229,160,0.03)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{extracting ? '⏳' : uploadedFile ? '✅' : '📄'}</div>
                {extracting ? (
                  <div style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>{t("Extracting text...", "جاري استخراج النص...")}</div>
                ) : uploadedFile ? (
                  <>
                    <div style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.9rem' }}>{uploadedFile.name}</div>
                    <div style={{ color: 'var(--text3)', fontSize: '0.78rem', marginTop: '4px' }}>{t("Click to change", "اضغط للتغيير")}</div>
                  </>
                ) : (
                  <>
                    <div style={{ color: 'var(--text)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{t("Drop CV here", "أفلت CV هنا")}</div>
                    <div style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>PDF, DOC, DOCX</div>
                  </>
                )}
              </div>
            ) : (
              <textarea className="input-field" style={{ minHeight: '160px' }}
                placeholder={t("Paste or edit your CV text...", "الصق أو عدّل نص CV...")}
                value={cvText || localCV}
                onChange={e => {
                  setLocalCV(e.target.value);
                  setCvText(e.target.value);
                }}
              />
            )}
          </div>

          {/* Job description */}
          <div style={card}>
            <span style={lbl}>{t("Target Job Description (Optional)", "وصف الوظيفة المستهدفة (اختياري)")}</span>
            <textarea className="input-field" style={{ minHeight: '110px' }}
              placeholder={t("Paste a job description to optimize the CV for that specific role...", "الصق وصف الوظيفة لتحسين CV لها...")}
              value={jobDesc} onChange={e => setJobDesc(e.target.value)}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text3)', margin: '8px 0 0' }}>
              {t("Adding a job description increases keyword match and ATS score.", "إضافة وصف الوظيفة يزيد من دقة الكلمات المفتاحية.")}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleGenerate} disabled={loading || !activeCV.trim()} className="btn-primary" type="button">
              {loading ? <><span className="spinner" />{t("Generating...", "جاري التوليد...")}</> : `✦ ${t("Generate ATS CV", "ولّد CV محسّن")}`}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[[result.ats_score_estimate, t("ATS Score", "نقاط ATS"), '#00e5a0'], [result.keywords_added?.length, t("Keywords Added", "كلمات أضيفت"), '#a89dff'], [result.improvements?.length, t("Improvements", "تحسينات"), '#ffb800']].map(([val, label, color]: any) => (
              <div key={label} style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: '800', color, marginBottom: '4px' }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ ...card, marginBottom: '12px' }}>
            <span style={lbl}>{t("Improvements Made", "التحسينات المُجراة")}</span>
            {result.improvements?.map((imp: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text2)' }}>{imp}</span>
              </div>
            ))}
          </div>

          <div style={{ ...card, marginBottom: '12px' }}>
            <span style={lbl}>{t("Keywords Added", "كلمات مضافة")}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {result.keywords_added?.map((k: string) => <span key={k} className="tag tag-green">{k}</span>)}
            </div>
          </div>

          <div style={{ ...card, marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={lbl}>{t("Your New ATS-Optimized CV", "CV الجديد المحسّن")}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleCopy} className="btn-ghost" style={{ fontSize: '0.78rem' }}>
                  {copied ? '✓ Copied' : '⎘ Copy'}
                </button>
                <button onClick={handleDownload} className="btn-ghost" style={{ fontSize: '0.78rem' }}>
                  ↓ {t("Download", "تحميل")}
                </button>
              </div>
            </div>
            <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', fontSize: '0.8rem', color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: '1.7', maxHeight: '400px', overflowY: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
              {result.cv_text}
            </pre>
          </div>

          <button onClick={() => setResult(null)} className="btn-ghost">
            ← {t("Generate Another", "ولّد مجدداً")}
          </button>
        </div>
      )}
    </div>
  );
}
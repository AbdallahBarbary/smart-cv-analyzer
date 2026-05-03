"use client";
import { useState } from "react";
import { analyzeCV, rewriteCV } from "../app/lib/api";

interface Props { lang: string; cvText: string; setCvText: (t: string) => void; }

export default function CVAnalyzer({ lang, cvText, setCvText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [rewritten, setRewritten] = useState<any>(null);
  const [rewriting, setRewriting] = useState(false);

  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  const handleAnalyze = async () => {
    if (!cvText.trim()) return;
    setLoading(true);
    try {
      setResult(await analyzeCV(cvText, lang));
    } catch { alert("Analysis failed. Is the backend running?"); }
    setLoading(false);
  };

  const handleRewrite = async () => {
    setRewriting(true);
    try { setRewritten((await rewriteCV(cvText, lang)).bullets); } catch {}
    setRewriting(false);
  };

  if (result) return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t("CV Results", "نتائج التحليل")}</h2>
        <button onClick={() => { setResult(null); setRewritten(null); }} className="text-sm text-gray-400 hover:text-gray-600">
          ← {t("Back", "رجوع")}
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4 text-center">
        <div className="text-5xl font-bold text-emerald-600 mb-1">{result.score}</div>
        <div className="text-sm text-gray-400">{t("Overall CV Score", "النتيجة الكلية")}</div>
        <div className="mt-4 space-y-2">
          {[["skills_score","Skills","مهارات"],["experience_score","Experience","خبرة"],
            ["education_score","Education","تعليم"],["formatting_score","Formatting","تنسيق"]].map(([key,en,ar]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-gray-400 w-24 text-left">{t(en, ar)}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result[key]}%` }} />
              </div>
              <span className="text-sm font-medium w-8">{result[key]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
        <h3 className="font-medium mb-3">{t("Skills", "المهارات")}</h3>
        <div className="flex flex-wrap gap-2">
          {result.skills?.map((s: string) => (
            <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{s}</span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
        <h3 className="font-medium mb-3">{t("Strengths", "نقاط القوة")}</h3>
        {result.strengths?.map((s: string) => (
          <div key={s} className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
            <span className="text-emerald-500">✓</span>
            <span className="text-sm text-gray-700">{s}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
        <h3 className="font-medium mb-3">{t("Areas to Improve", "نقاط للتحسين")}</h3>
        {result.weaknesses?.map((s: string) => (
          <div key={s} className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
            <span className="text-red-400">!</span>
            <span className="text-sm text-gray-700">{s}</span>
          </div>
        ))}
      </div>

      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded mb-4 text-sm text-purple-800">
        💡 {result.impact_suggestion}
      </div>

      <button onClick={handleRewrite} disabled={rewriting}
        className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40">
        {rewriting ? t("Rewriting...", "جاري الإعادة...") : t("Auto-Rewrite Weak Points ↗", "أعد كتابة النقاط الضعيفة ↗")}
      </button>

      {rewritten && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mt-4">
          <h3 className="font-medium mb-3">{t("Rewritten Bullets", "نقاط معاد كتابتها")}</h3>
          {rewritten.map((b: any, i: number) => (
            <div key={i} className="mb-4 pb-4 border-b border-gray-50 last:border-0">
              <div className="text-sm text-gray-400 line-through mb-1">{b.original}</div>
              <div className="text-sm text-emerald-600 font-medium">→ {b.improved}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("Upload Your CV", "ارفع سيرتك الذاتية")}</h2>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
        {t("Paste your CV text", "الصق نص سيرتك الذاتية")}
      </label>
      <textarea
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white min-h-48 resize-y mb-4"
        placeholder={t("Paste your full CV here...", "الصق سيرتك الذاتية هنا...")}
        value={cvText}
        onChange={(e) => setCvText(e.target.value)}
      />
      <div className="flex justify-end">
        <button onClick={handleAnalyze} disabled={loading || !cvText.trim()}
          className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? t("Analyzing...", "جاري التحليل...") : t("Analyze CV ↗", "تحليل CV ↗")}
        </button>
      </div>
    </div>
  );
}

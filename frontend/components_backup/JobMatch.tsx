"use client";
import { useState } from "react";
import { matchJob } from "../app/lib/api";

interface Props { lang: string; cvText: string; }

export default function JobMatch({ lang, cvText }: Props) {
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  const handleMatch = async () => {
    if (!jobDesc.trim() || !cvText.trim()) {
      alert(t("Please analyze a CV first, then paste a job description.", "من فضلك حلل CV أولاً."));
      return;
    }
    setLoading(true);
    try { setResult(await matchJob(cvText, jobDesc, lang)); } catch {}
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("Job Match Engine", "محرك مطابقة الوظائف")}</h2>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
        {t("Paste job description", "الصق وصف الوظيفة")}
      </label>
      <textarea
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white min-h-40 resize-y mb-4"
        placeholder={t("Paste the full job description here...", "الصق وصف الوظيفة هنا...")}
        value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}
      />
      <div className="flex justify-end mb-6">
        <button onClick={handleMatch} disabled={loading}
          className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40">
          {loading ? t("Matching...", "جاري المطابقة...") : t("Match My CV ↗", "طابق CV بتاعي ↗")}
        </button>
      </div>

      {result && (
        <div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              [result.match_percent + "%", t("Match Score","نسبة المطابقة"), "text-emerald-600"],
              [result.missing_keywords?.length, t("Missing Keywords","كلمات ناقصة"), "text-red-500"],
              [result.strong_matches, t("Strong Matches","تطابقات قوية"), "text-blue-600"],
            ].map(([val, label, color]) => (
              <div key={label as string} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                <div className={`text-3xl font-bold ${color} mb-1`}>{val}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
            <h3 className="font-medium mb-3">{t("Missing Keywords", "كلمات ناقصة")}</h3>
            <div className="flex flex-wrap gap-2">
              {result.missing_keywords?.map((k: string) => (
                <span key={k} className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">{k}</span>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-medium mb-3">{t("Suggestions", "اقتراحات")}</h3>
            {result.suggestions?.map((s: string, i: number) => (
              <div key={i} className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
                <span className="text-purple-500 font-medium">{i + 1}.</span>
                <span className="text-sm text-gray-700">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

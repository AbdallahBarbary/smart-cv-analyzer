"use client";
import { useState } from "react";
import { runATS } from "../app/lib/api";

interface Props { lang: string; cvText: string; }

export default function ATSCheck({ lang, cvText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  const handleRun = async () => {
    if (!cvText.trim()) { alert(t("Please analyze a CV first.", "من فضلك حلل CV أولاً.")); return; }
    setLoading(true);
    try { setResult(await runATS(cvText)); } catch {}
    setLoading(false);
  };

  const pass = result?.verdict?.includes("PASS");

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t("ATS Simulation Engine", "محاكاة نظام ATS")}</h2>
      <p className="text-sm text-gray-400 mb-4">
        {t("Simulate how Applicant Tracking Systems will score your CV.", "اعرف إزاي أنظمة التوظيف هتقيّم سيرتك.")}
      </p>
      <button onClick={handleRun} disabled={loading}
        className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 mb-6">
        {loading ? t("Simulating...", "جاري المحاكاة...") : t("Run ATS Simulation ↗", "ابدأ محاكاة ATS ↗")}
      </button>

      {result && (
        <div>
          <div className={`bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4 flex items-center justify-between border-l-4 ${pass ? "border-l-emerald-500" : "border-l-red-500"}`}>
            <div>
              <div className="text-xs text-gray-400 mb-1">{t("Verdict", "النتيجة")}</div>
              <div className={`text-2xl font-bold ${pass ? "text-emerald-600" : "text-red-500"}`}>{result.verdict}</div>
            </div>
            <div className={`text-3xl font-bold ${pass ? "text-emerald-600" : "text-red-500"}`}>{result.score}%</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
            <h3 className="font-medium mb-3">{t("Section Scores", "نتائج الأقسام")}</h3>
            {Object.entries(result.section_scores || {}).map(([key, val]) => (
              <div key={key} className="flex items-center gap-3 mb-2">
                <span className="text-sm text-gray-400 w-36 capitalize">{key.replace(/_/g, " ")}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${val}%` }} />
                </div>
                <span className="text-sm font-medium w-10">{val as number}%</span>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-medium mb-3">{t("ATS Flags", "تحذيرات ATS")}</h3>
            {result.flags?.map((f: string, i: number) => (
              <div key={i} className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
                <span className="text-amber-500">⚠</span>
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

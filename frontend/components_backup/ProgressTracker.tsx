"use client";
import { useState, useEffect } from "react";
import { getSessions } from "../app/lib/api";

interface Props { lang: string; }

export default function ProgressTracker({ lang }: Props) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  useEffect(() => {
    getSessions().then(setSessions).catch(() => setSessions([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-gray-400 animate-pulse">{t("Loading...", "جاري التحميل...")}</div>;

  if (sessions.length === 0) return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("Progress Tracker", "متابعة التقدم")}</h2>
      <div className="bg-white border border-gray-100 rounded-xl p-12 shadow-sm text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-gray-400 text-sm">{t("No sessions yet. Complete an interview to see your progress.", "لا توجد جلسات بعد.")}</p>
      </div>
    </div>
  );

  const avg = Math.round(sessions.reduce((a, s) => a + (s.score || 0), 0) / sessions.length);
  const best = Math.max(...sessions.map(s => s.score || 0));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("Progress Tracker", "متابعة التقدم")}</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[[avg, t("Avg Score","متوسط النتيجة"), "text-emerald-600"],
          [best, t("Best Score","أفضل نتيجة"), "text-blue-600"],
          [sessions.length, t("Sessions","جلسات"), "text-purple-600"]].map(([val, label, color]) => (
          <div key={label as string} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
            <div className={`text-3xl font-bold ${color} mb-1`}>{val}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="font-medium mb-3">{t("Session History", "سجل الجلسات")}</h3>
        {sessions.map((s, i) => (
          <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <div className="text-sm font-medium text-gray-800">{t("Session", "جلسة")} #{sessions.length - i}</div>
              <div className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">{t("Score","نتيجة")}: {s.score}</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{t("Conf","ثقة")}: {s.confidence}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

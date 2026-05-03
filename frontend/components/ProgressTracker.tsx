"use client";
import { useState, useEffect } from "react";
import { getSessions } from "../app/lib/api";

interface Props { lang: string; }

export default function ProgressTracker({ lang }: Props) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  const t = (en: string, ar: string) => lang === "ar" ? ar : en;

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1,2,3].map(i => <div key={i} className="loading-shimmer" style={{ height: 60 }} />)}
    </div>
  );

  if (sessions.length === 0) return (
    <div className="card" style={{ textAlign: "center", padding: "60px 40px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <div className="font-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        {t("No sessions yet", "لا توجد جلسات بعد")}
      </div>
      <div style={{ fontSize: 14, color: "var(--text2)" }}>
        {t("Complete an interview to see your progress here.", "أكمل مقابلة لترى تقدمك هنا.")}
      </div>
    </div>
  );

  const avg  = Math.round(sessions.reduce((a, s) => a + (s.score || 0), 0) / sessions.length);
  const best = Math.max(...sessions.map(s => s.score || 0));
  const trend = sessions.length > 1 ? (sessions[0].score || 0) - (sessions[sessions.length - 1].score || 0) : 0;

  const maxScore = 100;
  const chartH = 80;
  const pts = [...sessions].reverse();

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          [avg, t("Avg Score","متوسط"), "var(--accent)"],
          [best, t("Best Score","الأفضل"), "var(--blue)"],
          [sessions.length, t("Sessions","جلسات"), "var(--purple)"],
          [trend > 0 ? `+${trend}` : trend, t("Trend","التحسن"), trend >= 0 ? "var(--accent)" : "var(--red)"],
        ].map(([val, label, color]) => (
          <div key={label as string} className="card" style={{ textAlign: "center" }}>
            <div className="font-display" style={{ fontSize: 32, fontWeight: 800, color: color as string }}>{val}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Mini chart */}
      {pts.length > 1 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("Score Trend", "منحنى التقدم")}
          </div>
          <svg width="100%" height={chartH + 20} style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const n = pts.length;
              const xStep = 100 / (n - 1);
              const coords = pts.map((s, i) => ({
                x: `${i * xStep}%`,
                y: chartH - (((s.score || 0) / maxScore) * chartH),
                score: s.score,
              }));
              const polyline = coords.map(c => `${c.x},${c.y}`).join(" ");
              const area = `${coords[0].x},${chartH} ${polyline} ${coords[n-1].x},${chartH}`;
              return (
                <>
                  <polyline points={area} fill="url(#chartGrad)" stroke="none" />
                  <polyline points={polyline} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
                  {coords.map((c, i) => (
                    <g key={i}>
                      <circle cx={c.x} cy={c.y} r="5" fill="var(--accent)" />
                      <text x={c.x} y={c.y - 10} textAnchor="middle" fontSize="11" fill="var(--text2)">{c.score}</text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {/* Session list */}
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {t("Session History", "سجل الجلسات")}
        </div>
        {sessions.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0", borderBottom: "1px solid var(--border)"
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {t("Session", "جلسة")} #{sessions.length - i}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                {new Date(s.created_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="tag tag-green">{t("Score","نتيجة")}: {s.score}</span>
              <span className="tag tag-blue">{t("Conf","ثقة")}: {s.confidence}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

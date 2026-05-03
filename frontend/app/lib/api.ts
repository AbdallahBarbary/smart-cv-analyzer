const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── CV ──────────────────────────────────────────────
export async function analyzeCV(cvText: string, language: string) {
  const form = new FormData();
  form.append("cv_text", cvText);
  form.append("language", language);
  const res = await fetch(`${API}/api/cv/analyze`, { method: "POST", body: form });
  if (!res.ok) throw new Error("CV analysis failed");
  return res.json();
}

export async function analyzeCVFile(file: File, language: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);
  const res = await fetch(`${API}/api/cv/analyze`, { method: "POST", body: form });
  if (!res.ok) throw new Error("CV file analysis failed");
  return res.json();
}

export async function rewriteCV(cvText: string, language: string) {
  const form = new FormData();
  form.append("cv_text", cvText);
  form.append("language", language);
  const res = await fetch(`${API}/api/cv/rewrite`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Rewrite failed");
  return res.json();
}

export async function generateAtsCV(cvText: string, jobDescription: string, language: string) {
  const form = new FormData();
  form.append("cv_text", cvText);
  form.append("job_description", jobDescription);
  form.append("language", language);
  const res = await fetch(`${API}/api/cv/generate`, { method: "POST", body: form });
  if (!res.ok) throw new Error("CV generation failed");
  return res.json();
}

// ── JOBS ─────────────────────────────────────────────
export async function matchJob(cvText: string, jobDescription: string, language: string) {
  const form = new FormData();
  form.append("cv_text", cvText);
  form.append("job_description", jobDescription);
  form.append("language", language);
  const res = await fetch(`${API}/api/jobs/match`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Job match failed");
  return res.json();
}

export async function searchJobs(cvText: string, language: string) {
  const form = new FormData();
  form.append("cv_text", cvText);
  form.append("language", language);
  const res = await fetch(`${API}/api/jobs/search`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Job search failed");
  return res.json();
}

// ── ATS ──────────────────────────────────────────────
export async function runATS(cvText: string, jobDescription = "") {
  const form = new FormData();
  form.append("cv_text", cvText);
  form.append("job_description", jobDescription);
  const res = await fetch(`${API}/api/ats/simulate`, { method: "POST", body: form });
  if (!res.ok) throw new Error("ATS simulation failed");
  return res.json();
}

// ── INTERVIEW ─────────────────────────────────────────
export async function evaluateInterview(history: { q: string; a: string }[], language: string) {
  const res = await fetch(`${API}/api/interview/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, language }),
  });
  if (!res.ok) throw new Error("Interview evaluation failed");
  return res.json();
}

export async function getSessions() {
  const res = await fetch(`${API}/api/interview/sessions`);
  if (!res.ok) return [];
  return res.json();
}
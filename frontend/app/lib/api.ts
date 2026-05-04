const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function throwApiError(res: Response, fallbackMessage: string): Promise<never> {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore parse errors and use fallback below
  }
  const message = data?.detail || data?.error || fallbackMessage;
  throw new Error(message);
}

// ── CV ──────────────────────────────────────────────
export async function analyzeCV(cvText: string, language: string) {
  const form = new FormData();
  form.append("cv_text", cvText);
  form.append("language", language);
  const res = await fetch(`${API}/api/cv/analyze`, { method: "POST", body: form });
  if (!res.ok) await throwApiError(res, "CV analysis failed");
  return res.json();
}

export async function analyzeCVFile(file: File, language: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);
  const res = await fetch(`${API}/api/cv/analyze`, { method: "POST", body: form });
  if (!res.ok) await throwApiError(res, "CV file analysis failed");
  return res.json();
}

export async function extractCVText(file: File, language: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);
  const res = await fetch(`${API}/api/cv/extract`, { method: "POST", body: form });
  if (!res.ok) await throwApiError(res, "CV extraction failed");
  const data = await res.json();
  if (data?.error) throw new Error(data.error);
  if (!data?.text?.trim()) throw new Error("No text extracted from CV file");
  return data.text as string;
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

export async function exportGeneratedCV(cvText: string, exportFormat: "pdf" | "docx") {
  const form = new FormData();
  form.append("cv_text", cvText);
  form.append("export_format", exportFormat);
  const res = await fetch(`${API}/api/cv/export`, { method: "POST", body: form });
  if (!res.ok) await throwApiError(res, "CV export failed");
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/i);
  const filename = match?.[1] || `ATS_Optimized_CV.${exportFormat}`;
  return { blob, filename };
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
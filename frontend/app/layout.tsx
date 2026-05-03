import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV.ai — Smart CV Analyzer",
  description: "AI-powered CV analysis and interview simulation",
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body style={{ paddingBottom: "70px" }}> {/* Prevent footer overlap */}
        {children}
        <footer style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: "60px", background: "var(--bg2)", borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: "var(--text3)", zIndex: 9999,
          paddingBottom: "env(safe-area-inset-bottom, 0)"
        }}>
          <span>Built by <a href="https://linkedin.com/in/abdallah-elbarbary-a16440365" target="_blank" style={{ color: "var(--accent)", textDecoration: "none" }}>Abduallah Elbarbary</a></span>
          {' | '}
          <a href="https://github.com/AbdallahBarbary" target="_blank" style={{ color: "var(--blue)", textDecoration: "none" }}>GitHub</a>
        </footer>

      </body>
    </html>
  );
}

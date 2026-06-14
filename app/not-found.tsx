import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          background: "#050507",
          color: "#f0ede4",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <main style={{ textAlign: "center", padding: "0 1.5rem" }}>
          <p
            style={{
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 12,
              letterSpacing: "0.18em",
              color: "#9a9aa6",
              marginBottom: 24,
              textTransform: "uppercase",
            }}
          >
            AIcon · 404
          </p>
          <h1
            style={{
              fontSize: "clamp(3rem, 9vw, 7rem)",
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Page out <span style={{ fontStyle: "italic", color: "#c8ff5f" }}>of frame.</span>
          </h1>
          <p style={{ marginTop: 32, color: "#9a9aa6", maxWidth: 480, marginInline: "auto" }}>
            The URL you tried doesn&apos;t exist. Head back to the spine.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: 40,
              padding: "14px 28px",
              background: "#c8ff5f",
              color: "#050507",
              borderRadius: 9999,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Back home
          </Link>
        </main>
      </body>
    </html>
  );
}

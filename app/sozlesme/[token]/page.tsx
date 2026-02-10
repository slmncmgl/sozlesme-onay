"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ContractPage({ params }: { params: { token: string } }) {
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [canApprove, setCanApprove] = useState(false);
  const [approved, setApproved] = useState(false);

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/contract?token=${encodeURIComponent(token)}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `Contract fetch failed (${res.status})`);
        }

        const data = await res.json();
        if (!data?.contractHtml) throw new Error("contractHtml missing");

        if (!cancelled) setHtml(data.contractHtml);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    function onScroll() {
      const nearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 8; // tolerans
      if (nearBottom) setCanApprove(true);
    }

    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [loading, html]);

  async function approve() {
    setError("");
    try {
      const res = await fetch(`/api/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Approve failed (${res.status})`);
      }

      setApproved(true);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    }
  }

  const content = useMemo(() => {
    if (loading) return <div>Yükleniyor...</div>;
    if (error) return <div style={{ color: "crimson" }}>Hata: {error}</div>;

    return (
      <div
        ref={boxRef}
        style={{
          height: "70vh",
          overflow: "auto",
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          background: "#fff",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }, [loading, error, html]);

  return (
    <main style={{ maxWidth: 920, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Sözleşme Onayı</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Aşağı kaydırıp sözleşmeyi okuduktan sonra onaylayabilirsiniz.
      </p>

      {content}

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        <button
          onClick={approve}
          disabled={!canApprove || approved || loading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #111",
            background: (!canApprove || approved) ? "#eee" : "#111",
            color: (!canApprove || approved) ? "#666" : "#fff",
            cursor: (!canApprove || approved) ? "not-allowed" : "pointer",
          }}
        >
          {approved ? "Onaylandı ✅" : "Okudum ve Onaylıyorum"}
        </button>

        {!canApprove && !approved && (
          <span style={{ color: "#888" }}>
            Buton, en alta kaydırınca aktif olur.
          </span>
        )}
      </div>

      {error && !loading && (
        <div style={{ marginTop: 12, color: "crimson" }}>Hata: {error}</div>
      )}
    </main>
  );
}

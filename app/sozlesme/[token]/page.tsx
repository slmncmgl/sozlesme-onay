// State ekle (en üstte)
const [fullName, setFullName] = useState("");

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ContractResp = {
  contract_html: string;
  approval_status?: string;
  contract_version?: string;
};

export default function ContractPage({ params }: { params: { token: string } }) {
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [contract, setContract] = useState<ContractResp | null>(null);

  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`/api/contract?token=${encodeURIComponent(token)}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `Contract fetch failed (${res.status})`);
        }

        const data = (await res.json()) as ContractResp;

        if (!data?.contract_html || typeof data.contract_html !== "string") {
          throw new Error("contract_html boş veya geçersiz.");
        }

        if (!cancelled) setContract(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Bilinmeyen hata");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    function onScroll() {
      const el = containerRef.current;
      if (!el) return;

      const thresholdPx = 20;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - thresholdPx;
      setScrolledToBottom(atBottom);
    }

    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, [loading, contract]);

  // State ekle (en üstte)
const [fullName, setFullName] = useState("");

// approve fonksiyonunu güncelle
async function approve() {
  if (!fullName.trim()) {
    setErr("Lütfen adınızı soyadınızı girin.");
    return;
  }

  setApproving(true);
  setErr(null);

  try {
    const res = await fetch(`/api/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        token,
        full_name: fullName.trim()  // ← YENİ!
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || `Approve failed (${res.status})`);
    }

    setApproved(true);
  } catch (e: any) {
    setErr(e?.message || "Bilinmeyen hata");
  } finally {
    setApproving(false);
  }
}

  const normalizedHtml = useMemo(() => {
    const html = contract?.contract_html ?? "";
    if (!html) return "";

    const style = `
      <style>
        /* Reset */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        
        /* A4 Container */
        body {
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        /* Typography */
        p, div, span, li {
          font-size: 11pt;
          line-height: 1.6;
          text-align: justify;
          color: #1a1a1a;
        }
        
        h1, h2, h3, strong, b {
          font-weight: 700;
          color: #000;
        }
        
        /* Tables */
        table {
          width: 100% !important;
          border-collapse: collapse;
          margin: 12pt 0;
        }
        
        td, th {
          padding: 8pt;
          border: 1px solid #ddd;
        }
        
        /* Images */
        img {
          max-width: 100%;
          height: auto;
        }
        
        /* Lists */
        ul, ol {
          margin-left: 20pt;
          margin-bottom: 12pt;
        }
        
        /* Override Google Docs inline styles */
        [style*="padding-left"] { padding-left: 0 !important; }
        [style*="padding-right"] { padding-right: 0 !important; }
      </style>
    `;

    const withStyle = html.toLowerCase().includes("</head>")
      ? html.replace(/<\/head>/i, `${style}</head>`)
      : `${style}${html}`;

    if (withStyle.toLowerCase().includes("<body")) {
      return withStyle.replace(/<body([^>]*)>/i, `<body$1><div class="a4-page">`)
                      .replace(/<\/body>/i, `</div></body>`);
    }

    return `<div class="a4-page">${withStyle}</div>`;
  }, [contract?.contract_html]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
      padding: "40px 20px" 
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "32px",
          color: "white"
        }}>
          <h1 style={{ 
            fontSize: "32px", 
            fontWeight: "700",
            marginBottom: "8px",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            Bilimevi Sözleşme Onayı
          </h1>
          <p style={{ fontSize: "14px", opacity: 0.9 }}>
            Lütfen sözleşmeyi dikkatle okuyun ve en alta kaydırarak onaylayın
          </p>
        </div>

        {loading ? (
          <div style={{ 
            padding: "48px", 
            background: "white", 
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
          }}>
            <div style={{ fontSize: "18px", color: "#666" }}>Sözleşme yükleniyor...</div>
          </div>
        ) : err ? (
          <div style={{ 
            padding: "32px", 
            background: "white", 
            borderRadius: "16px",
            border: "2px solid #ef4444",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
          }}>
            <div style={{ color: "#ef4444", fontWeight: "700", marginBottom: "12px", fontSize: "18px" }}>
              ⚠️ Hata Oluştu
            </div>
            <div style={{ color: "#666", whiteSpace: "pre-wrap" }}>{err}</div>
          </div>
        ) : (
          <>
            {/* A4 Scroll Container */}
            <div
              ref={containerRef}
              style={{
                height: "70vh",
                overflowY: "auto",
                overflowX: "hidden",
                background: "#f5f5f5",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  overflowX: "hidden",
                }}
                dangerouslySetInnerHTML={{ __html: normalizedHtml }}
              />
            </div>

            {/* Action Area */}
            <div style={{ 
              marginTop: "24px",
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              
              {/* Status */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "14px",
                color: scrolledToBottom ? "#10b981" : "#f59e0b",
                fontWeight: "600"
              }}>
                <span style={{ fontSize: "20px" }}>
                  {scrolledToBottom ? "✓" : "↓"}
                </span>
                {scrolledToBottom 
                  ? "Sözleşmeyi tamamen okudunuz, onaylayabilirsiniz" 
                  : "Lütfen sözleşmeyi sonuna kadar okuyun"}
              </div>
{/* İmza Input - Scroll en alta gelince görünür */}
{scrolledToBottom && !approved && (
  <div style={{
    marginBottom: "16px",
    padding: "16px",
    background: "#f0f9ff",
    borderRadius: "12px",
    border: "1px solid #bae6fd"
  }}>
    <label style={{
      display: "block",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#0c4a6e"
    }}>
      ✍️ İmza (Adınız Soyadınız)
    </label>
    <input
      type="text"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      placeholder="Örn: Ahmet Yılmaz"
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "8px",
        border: "2px solid #bae6fd",
        fontSize: "15px",
        outline: "none",
        transition: "border-color 0.2s"
      }}
      onFocus={(e) => e.target.style.borderColor = "#0ea5e9"}
      onBlur={(e) => e.target.style.borderColor = "#bae6fd"}
    />
  </div>
)}
              {/* Button */}
              <button
                onClick={approve}
                disabled={!scrolledToBottom || approving || approved}
                style={{
                  padding: "16px 32px",
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: !scrolledToBottom || approving || approved ? "not-allowed" : "pointer",
                  background: approved 
                    ? "#10b981" 
                    : !scrolledToBottom || approving 
                      ? "#d1d5db" 
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  transition: "all 0.3s ease",
                  boxShadow: !scrolledToBottom || approving || approved 
                    ? "none" 
                    : "0 4px 12px rgba(102, 126, 234, 0.4)",
                }}
              >
                {approved ? "✓ Sözleşme Onaylandı" : approving ? "Onaylanıyor..." : "Sözleşmeyi Onaylıyorum"}
              </button>

              {approved && (
                <div style={{
                  padding: "16px",
                  background: "#d1fae5",
                  borderRadius: "8px",
                  color: "#065f46",
                  fontSize: "14px",
                  textAlign: "center",
                  fontWeight: "600"
                }}>
                  🎉 Sözleşmeniz başarıyla onaylandı. Teşekkür ederiz!
                </div>
              )}

              {err && (
                <div style={{ 
                  padding: "16px",
                  background: "#fee2e2",
                  borderRadius: "8px",
                  color: "#991b1b",
                  fontSize: "14px",
                  whiteSpace: "pre-wrap"
                }}>
                  {err}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type ContractResp = {
  contract_html: string;
  approval_status?: string;
  contract_version?: string;
  sirket_adi?: string;  // ← YENİ!
};

// ...

const pageTitle = useMemo(() => {
  const sirket = contract?.sirket_adi?.toUpperCase() || "BİLİMEVİ";
  
  if (sirket.includes("BİLİMEVİ")) {
    return "BİLİMEVİ YURTDIŞI EĞİTİM DANIŞMANLIĞI SÖZLEŞME ONAYI";
  }
  
  return `${sirket} SÖZLEŞME ONAYI`;
}, [contract?.sirket_adi]);

// Başlık kısmında:
<h1 style={{ 
  fontSize: "28px",  // Biraz küçülttüm (32'den 28'e)
  fontWeight: "700",
  marginBottom: "8px",
  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
  textAlign: "center"
}}>
  {pageTitle}
</h1>

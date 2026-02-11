export async function updateApprovalStatus(token: string, ip: string, fullName: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: 'Sözleşme Onayları!A2:A1000',
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(r => r[0] === token);
  
  if (rowIndex === -1) throw new Error('Contract not found');
  
  const actualRow = rowIndex + 2;
  
  // L kolonu = approved_by (index 11)
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: `Sözleşme Onayları!B${actualRow}:E${actualRow}`,  // ← D'den E'ye genişlet
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        'APPROVED',           // B: approval_status
        new Date().toISOString(),  // C: approved_at
        ip,                   // D: approved_ip
        fullName              // E: approved_by ← YENİ!
      ]]
    }
  });
}
```

---

## 📊 **4. Google Sheet'e Kolon Ekle**

**"Sözleşme Onayları" sekmesinde E kolonu:**
```
A: tally_submission_id
B: approval_status
C: approved_at
D: approved_ip
E: approved_by  ← YENİ KOLON EKLE!
F: contract_version
...
```

---

## 🎯 **SONUÇ:**
```
Kullanıcı:
  1. Scroll → En alta
  2. Input görünür: "Adınız Soyadınız"
  3. Yazar: "Ahmet Yılmaz"
  4. Buton: "Onaylıyorum"
  5. Sheet'te: approved_by = "Ahmet Yılmaz" ✅

import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Mevcut yılı dinamik al
function getCurrentYear(): string {
  return new Date().getFullYear().toString();
}

export async function getContractByToken(token: string) {
  const currentYear = getCurrentYear();
  const sheetName = currentYear; // "2026", "2027" vs.
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: `${sheetName}!A2:M1000`,  // Dinamik sekme adı!
  });

  const rows = response.data.values || [];
  const row = rows.find(r => r[0] === token);
  
  if (!row) return null;
  
  return {
    tally_submission_id: row[0],     // A
    approval_status: row[1],          // B
    approved_at: row[2],              // C
    approved_ip: row[3],              // D
    contract_version: row[4],         // E
    student_tc_no: row[5],            // F
    student_name: row[6],             // G
    danisman_tc_no: row[7],           // H
    danisman_adi: row[8],             // I
    notes: row[9],                    // J
    contract_html_url: row[10],       // K
    approved_by: row[11],             // L
    sirket_adi: row[12],              // M
  };
}

export async function updateApprovalStatus(token: string, ip: string, fullName: string) {
  const currentYear = getCurrentYear();
  const sheetName = currentYear;
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: `${sheetName}!A2:A1000`,  // Dinamik sekme adı!
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(r => r[0] === token);
  
  if (rowIndex === -1) throw new Error('Contract not found');
  
  const actualRow = rowIndex + 2;
  
  // B, C, D kolonları (approval_status, approved_at, approved_ip)
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: `${sheetName}!B${actualRow}:D${actualRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        'APPROVED',
        new Date().toISOString(),
        ip
      ]]
    }
  });
  
  // L kolonu (approved_by)
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: `${sheetName}!L${actualRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[fullName]]
    }
  });
}

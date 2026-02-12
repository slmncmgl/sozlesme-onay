import { NextRequest, NextResponse } from 'next/server';
import { getContractByToken } from '@/lib/sheets';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }
  
  try {
    const contract = await getContractByToken(token);
    
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    // Drive URL'den HTML çek
    const driveUrl = contract.contract_html_url;
    if (!driveUrl) {
      return NextResponse.json({ error: 'Contract HTML URL not found' }, { status: 404 });
    }
    
    // Drive export URL'e çevir
    const fileId = driveUrl.match(/\/d\/([^\/]+)/)?.[1];
    if (!fileId) {
      return NextResponse.json({ error: 'Invalid Drive URL' }, { status: 400 });
    }
    
    const exportUrl = `https://docs.google.com/document/d/${fileId}/export?format=html`;
    
    // HTML'i çek
    const htmlResponse = await fetch(exportUrl);
    const html = await htmlResponse.text();
    
    return NextResponse.json({
      contract_html: html,
      status: contract.approval_status,
      version: contract.contract_version,
      sirket_adi: contract.sirket_adi
    });
  } catch (error) {
    console.error('Contract fetch error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

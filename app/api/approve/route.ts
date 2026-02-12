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
    
    return NextResponse.json({
      contract_html: contract.contract_html,
      status: contract.approval_status,
      version: contract.contract_version,
      sirket_adi: contract.sirket_adi  // ← YENİ!
    });
  } catch (error) {
    console.error('Contract fetch error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

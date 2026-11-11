import { NextResponse } from 'next/server';
import { getAllResults } from '@/lib/db';

export async function GET() {
  try {
    const results = getAllResults();
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


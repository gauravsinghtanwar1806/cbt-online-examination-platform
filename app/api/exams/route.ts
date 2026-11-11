import { NextResponse } from 'next/server';
import { getExams } from '@/lib/db';

export async function GET() {
  try {
    const exams = getExams();
    return NextResponse.json({ success: true, exams });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

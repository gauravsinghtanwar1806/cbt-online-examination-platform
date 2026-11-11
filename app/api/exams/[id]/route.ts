import { NextRequest, NextResponse } from 'next/server';
import { getExam } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exam = getExam(id);
    if (!exam) {
      return NextResponse.json({ success: false, error: 'Examination not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


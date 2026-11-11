import { NextRequest, NextResponse } from 'next/server';
import { createAttempt, getExam } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { examId, studentName, studentEmail, chapterIndex } = body;

    if (!examId || !studentName || !studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: examId, studentName, studentEmail' },
        { status: 400 }
      );
    }

    const exam = getExam(examId);
    if (!exam) {
      return NextResponse.json({ success: false, error: 'Examination not found' }, { status: 404 });
    }

    const attempt = createAttempt(examId, studentName, studentEmail, chapterIndex);
    return NextResponse.json({ success: true, attempt });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

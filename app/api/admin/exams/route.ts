import { NextRequest, NextResponse } from 'next/server';
import { getExams, updateExamConfig } from '@/lib/db';

export async function GET() {
  try {
    const exams = getExams();
    return NextResponse.json({ success: true, exams });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { examId, durationMinutes, isPublished, markingScheme } = body;

    if (!examId) {
      return NextResponse.json({ success: false, error: 'Missing examId' }, { status: 400 });
    }

    const updated = updateExamConfig(examId, {
      ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
      ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
      ...(markingScheme && { markingScheme })
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

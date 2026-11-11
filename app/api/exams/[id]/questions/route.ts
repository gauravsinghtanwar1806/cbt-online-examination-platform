import { NextRequest, NextResponse } from 'next/server';
import { getStudentQuestions, getExam } from '@/lib/db';

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

    const { searchParams } = new URL(request.url);
    const chapterParam = searchParams.get('chapter');
    const chapterIndex = chapterParam ? parseInt(chapterParam, 10) : undefined;

    const questions = getStudentQuestions(id, chapterIndex);
    return NextResponse.json({
      success: true,
      examId: id,
      examTitle: exam.title,
      totalQuestions: questions.length,
      durationMinutes: exam.durationMinutes,
      markingScheme: exam.markingScheme,
      questions
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


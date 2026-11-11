import { NextRequest, NextResponse } from 'next/server';
import { getAdminQuestions, updateQuestion } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId') || 'achiever_minor_test_02';
    const questions = getAdminQuestions(examId);
    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, questionText, options, imageUrl, questionType } = body;

    if (!questionId) {
      return NextResponse.json({ success: false, error: 'Missing questionId' }, { status: 400 });
    }

    const updated = updateQuestion(questionId, {
      questionText,
      options,
      imageUrl,
      questionType
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, question: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

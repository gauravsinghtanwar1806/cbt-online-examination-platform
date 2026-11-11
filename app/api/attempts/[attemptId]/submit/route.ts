import { NextRequest, NextResponse } from 'next/server';
import { submitExamAttempt } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json().catch(() => ({}));
    const { 
      timeSpentSeconds = 0, 
      responses = {}, 
      examId, 
      studentName, 
      studentEmail, 
      chapterIndex 
    } = body;

    console.log(`[Submit API] Evaluating attempt ${attemptId} for exam ${examId || 'default'}, ${Object.keys(responses || {}).length} responses.`);

    const result = submitExamAttempt(
      attemptId, 
      timeSpentSeconds, 
      responses, 
      examId, 
      studentName, 
      studentEmail, 
      chapterIndex
    );

    if (!result) {
      console.error(`[Submit API] Evaluation returned null for attempt: ${attemptId}`);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to evaluate attempt',
        details: `Questions or exam manifest could not be resolved for exam: ${examId || 'achiever_minor_test_02'}`
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[Submit API Error]', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Server evaluation error',
      details: 'Check serverless logs for stack trace.'
    }, { status: 500 });
  }
}



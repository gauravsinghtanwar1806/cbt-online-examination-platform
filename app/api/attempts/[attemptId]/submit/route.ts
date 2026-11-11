import { NextRequest, NextResponse } from 'next/server';
import { submitExamAttempt } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json().catch(() => ({}));
    const { timeSpentSeconds = 0, responses } = body;

    const result = submitExamAttempt(attemptId, timeSpentSeconds, responses);
    if (!result) {
      return NextResponse.json({ success: false, error: 'Failed to evaluate attempt' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

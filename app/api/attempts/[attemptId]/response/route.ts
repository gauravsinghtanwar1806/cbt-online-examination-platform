import { NextRequest, NextResponse } from 'next/server';
import { saveResponse } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();
    const { questionId, selectedOption, isMarkedForReview, paletteState } = body;

    if (!questionId) {
      return NextResponse.json({ success: false, error: 'Missing questionId' }, { status: 400 });
    }

    const saved = saveResponse(attemptId, questionId, {
      questionId,
      selectedOption: selectedOption ?? null,
      isMarkedForReview: !!isMarkedForReview,
      paletteState: paletteState || 'not_answered'
    });

    if (!saved) {
      return NextResponse.json({ success: false, error: 'Attempt not found or already submitted' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

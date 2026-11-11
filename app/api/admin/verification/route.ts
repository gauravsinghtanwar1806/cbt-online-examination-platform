import { NextRequest, NextResponse } from 'next/server';
import { getVerifications, updateVerification } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    let list = getVerifications();
    if (examId) {
      list = list.filter(v => v.examId === examId);
    }
    return NextResponse.json({ success: true, verifications: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, approvedAnswer, status, notes } = body;

    if (!questionId) {
      return NextResponse.json({ success: false, error: 'Missing questionId' }, { status: 400 });
    }

    const updated = updateVerification(questionId, {
      approvedAnswer,
      status,
      notes
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Verification record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, verification: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getResult, getAttempt, storeResult } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const result = getResult(attemptId);
    if (!result) {
      const attempt = getAttempt(attemptId);
      if (attempt && !attempt.isSubmitted) {
        return NextResponse.json({ success: true, isSubmitted: false, attempt });
      }
      return NextResponse.json({ success: false, error: 'Result not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, isSubmitted: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json().catch(() => ({}));
    if (body && body.result && body.result.attemptId === attemptId) {
      storeResult(body.result);
      return NextResponse.json({ success: true, cached: true });
    }
    return NextResponse.json({ success: false, error: 'Invalid result body' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}



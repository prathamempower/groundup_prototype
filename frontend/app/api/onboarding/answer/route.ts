import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      questionId: body.questionId,
    });
  } catch {
    return NextResponse.json({ success: true });
  }
}

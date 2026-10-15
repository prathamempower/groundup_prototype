import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    session: {
      id: 'session-default',
      current_step_index: 1,
      role: 'OWNER',
    },
    responses: {},
  });
}

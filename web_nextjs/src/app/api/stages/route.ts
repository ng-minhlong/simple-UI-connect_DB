import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: {
        StageCode: 'asc'
      }
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

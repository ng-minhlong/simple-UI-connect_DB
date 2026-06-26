import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { stageCode: string } }
) {
  try {
    const { stageCode } = params;
    
    const lines = await prisma.line.findMany({
      where: {
        StageCode: stageCode
      },
      orderBy: {
        LineCode: 'asc'
      }
    });

    return NextResponse.json(lines);
  } catch (error) {
    console.error('Error fetching lines:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

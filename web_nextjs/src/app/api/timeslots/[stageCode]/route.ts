import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { stageCode: string } }
) {
  try {
    const { stageCode } = params;
    
    const lineTimeSlots = await prisma.lineTimeSlot.findMany({
      where: {
        line: {
          StageCode: stageCode
        }
      },
      include: {
        timeSlot: true,
        line: true
      },
      orderBy: {
        SortOrder: 'asc'
      }
    });

    const uniqueSlots: { SlotCode: string; SlotName: string }[] = [];
    const seenCodes = new Set<string>();
    
    lineTimeSlots.forEach((lts: any) => {
      if (!seenCodes.has(lts.SlotCode)) {
        seenCodes.add(lts.SlotCode);
        uniqueSlots.push({
          SlotCode: lts.SlotCode,
          SlotName: lts.timeSlot.SlotName
        });
      }
    });

    return NextResponse.json(uniqueSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

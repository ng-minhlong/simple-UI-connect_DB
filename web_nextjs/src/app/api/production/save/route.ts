import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, productCode, stageCode, lineCode, slotCode, planQty, actualQty, user } = body;
    
    if (!date || !productCode || !stageCode || !lineCode || !slotCode) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const productionDate = new Date(date);
    
    const existing = await prisma.productionData.findUnique({
      where: {
        ProductionDate_ProductCode_StageCode_LineCode_SlotCode: {
          ProductionDate: productionDate,
          ProductCode: productCode,
          StageCode: stageCode,
          LineCode: lineCode,
          SlotCode: slotCode
        }
      }
    });

    let result;
    
    if (existing) {
      const updateData: any = {
        UpdatedBy: user,
        UpdatedAt: new Date()
      };
      
      if (planQty !== null && planQty !== undefined) {
        updateData.PlanQuantity = parseInt(planQty);
      }
      if (actualQty !== null && actualQty !== undefined) {
        updateData.ActualQuantity = parseInt(actualQty);
      }
      
      result = await prisma.productionData.update({
        where: {
          Id: existing.Id
        },
        data: updateData
      });
    } else {
      result = await prisma.productionData.create({
        data: {
          ProductionDate: productionDate,
          ProductCode: productCode,
          StageCode: stageCode,
          LineCode: lineCode,
          SlotCode: slotCode,
          PlanQuantity: planQty !== null ? parseInt(planQty) : 0,
          ActualQuantity: actualQty !== null ? parseInt(actualQty) : 0,
          UpdatedBy: user,
          UpdatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving production data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

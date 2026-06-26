import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { productCode: string } }
) {
  try {
    const { productCode } = params;
    
    const product = await prisma.product.findUnique({
      where: {
        ProductCode: productCode
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

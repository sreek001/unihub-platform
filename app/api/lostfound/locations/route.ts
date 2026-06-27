import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.campusLocation.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json({ success: true, locations });
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const semester = searchParams.get('semester');

    const where: any = {};
    
    // If status parameter is specifically 'all', we don't filter by status.
    // Otherwise, default to filtering by status if provided, or show all if status=all is specified.
    if (status && status !== 'all') {
      where.status = status;
    } else if (!status) {
      where.status = 'Available';
    }

    if (semester) {
      where.semester = parseInt(semester, 10);
    }

    const textbooks = await prisma.textbook.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            branch: true,
            currentSemester: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    return NextResponse.json(textbooks);
  } catch (error: any) {
    console.error('Error fetching textbooks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, semester, condition, ownerId } = body;

    if (!title || !semester || !condition || !ownerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const textbook = await prisma.textbook.create({
      data: {
        title,
        semester: parseInt(semester, 10),
        condition,
        ownerId,
        status: 'Available',
      },
      include: {
        owner: true,
      },
    });

    return NextResponse.json(textbook, { status: 201 });
  } catch (error: any) {
    console.error('Error creating textbook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

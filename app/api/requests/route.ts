import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');
    const ownerId = searchParams.get('ownerId');

    if (requesterId) {
      // Outgoing requests made by the user
      const requests = await prisma.handoverRequest.findMany({
        where: { requesterId },
        include: {
          textbook: {
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
          },
          requester: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });
      return NextResponse.json(requests);
    }

    if (ownerId) {
      // Incoming requests for the user's textbooks
      const requests = await prisma.handoverRequest.findMany({
        where: {
          textbook: {
            ownerId,
          },
        },
        include: {
          textbook: true,
          requester: {
            select: {
              id: true,
              name: true,
              branch: true,
              currentSemester: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });
      return NextResponse.json(requests);
    }

    const requests = await prisma.handoverRequest.findMany({
      include: {
        textbook: true,
        requester: true,
      },
    });
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { textbookId, requesterId } = body;

    if (!textbookId || !requesterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if textbook is available
    const textbook = await prisma.textbook.findUnique({
      where: { id: textbookId },
    });

    if (!textbook) {
      return NextResponse.json({ error: 'Textbook not found' }, { status: 404 });
    }

    if (textbook.status !== 'Available') {
      return NextResponse.json({ error: 'Textbook is not available for handover' }, { status: 400 });
    }

    if (textbook.ownerId === requesterId) {
      return NextResponse.json({ error: 'You cannot request your own textbook' }, { status: 400 });
    }

    // Start a transaction to create the request and update textbook status
    const result = await prisma.$transaction(async (tx) => {
      const newRequest = await tx.handoverRequest.create({
        data: {
          textbookId,
          requesterId,
          status: 'Pending',
        },
        include: {
          textbook: true,
          requester: true,
        },
      });

      await tx.textbook.update({
        where: { id: textbookId },
        data: { status: 'Pending' },
      });

      return newRequest;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating handover request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { status } = body; // 'Accepted', 'Completed', or 'Rejected'

    if (!status || !['Accepted', 'Completed', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
    }

    const handoverRequest = await prisma.handoverRequest.findUnique({
      where: { id },
      include: { textbook: true },
    });

    if (!handoverRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update request status
      const updatedRequest = await tx.handoverRequest.update({
        where: { id },
        data: { status },
        include: {
          textbook: true,
          requester: true,
        },
      });

      if (status === 'Accepted') {
        // Keep textbook status as Pending
        await tx.textbook.update({
          where: { id: handoverRequest.textbookId },
          data: { status: 'Pending' },
        });

        // Reject other requests for this book
        await tx.handoverRequest.updateMany({
          where: {
            textbookId: handoverRequest.textbookId,
            id: { not: id },
            status: 'Pending',
          },
          data: { status: 'Rejected' },
        });
      } else if (status === 'Completed') {
        // Mark textbook as Handed_Over
        await tx.textbook.update({
          where: { id: handoverRequest.textbookId },
          data: { status: 'Handed_Over' },
        });
      } else if (status === 'Rejected') {
        // Check if there are other requests. If not, reset textbook to Available
        const otherRequests = await tx.handoverRequest.findMany({
          where: {
            textbookId: handoverRequest.textbookId,
            id: { not: id },
            status: 'Pending',
          },
        });

        await tx.textbook.update({
          where: { id: handoverRequest.textbookId },
          data: {
            status: otherRequests.length > 0 ? 'Pending' : 'Available',
          },
        });
      }

      return updatedRequest;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

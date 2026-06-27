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
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'status is required' }, { status: 400 });
    }

    const post = await prisma.lostFoundPost.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, updatedId: post.id });
  } catch (error: any) {
    console.error('Error updating lost & found post status:', error);
    // Prisma record not found code
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const { id } = params;

    const post = await prisma.lostFoundPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: post.id });
  } catch (error: any) {
    console.error('Error deleting lost & found post:', error);
    // Prisma record not found code
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

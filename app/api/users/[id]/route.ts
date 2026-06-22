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
    const { name, branch, currentSemester } = body;

    if (!name || !branch || !currentSemester) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        branch,
        currentSemester: parseInt(currentSemester, 10),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

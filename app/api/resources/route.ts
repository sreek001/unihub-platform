import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const uploaderId = searchParams.get('uploaderId');

    const where: any = {};

    if (semester) {
      where.semester = parseInt(semester, 10);
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.title = {
        contains: search,
      };
    }

    if (uploaderId) {
      where.uploaderId = uploaderId;
    }

    const resources = await prisma.digitalResource.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            branch: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('Error fetching digital resources:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, semester, category, url, uploaderId } = body;

    if (!title || !semester || !category || !url || !uploaderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resource = await prisma.digitalResource.create({
      data: {
        title,
        semester: parseInt(semester, 10),
        category,
        url,
        uploaderId,
      },
      include: {
        uploader: true,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    console.error('Error creating digital resource:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

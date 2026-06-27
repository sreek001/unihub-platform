import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.lostFoundPost.findMany({
      include: {
        location: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        postedAt: 'desc',
      },
    });

    // Format output to match old API signature:
    // { id, category, itemName, description, location: location.name, contactEmail, ... }
    const formattedPosts = posts.map((p) => ({
      id: p.id,
      category: p.category,
      itemName: p.itemName,
      description: p.description,
      location: p.location.name,
      contactEmail: p.contactEmail,
      contactPhone: p.contactPhone,
      contactInfo: p.contactInfo,
      image: p.image,
      status: p.status,
      postedAt: p.postedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, posts: formattedPosts });
  } catch (error: any) {
    console.error('Error fetching lost & found posts:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      category, 
      itemName, 
      description, 
      location, // location name 
      contactEmail, 
      contactPhone, 
      contactInfo, 
      image 
    } = body;

    if (!category || !itemName || !description || !location || !contactEmail) {
      return NextResponse.json(
        { success: false, error: 'category, itemName, description, location, and contactEmail are required' }, 
        { status: 400 }
      );
    }

    // Resolve or create location by name
    const campusLocation = await prisma.campusLocation.upsert({
      where: { name: location },
      update: {},
      create: { name: location },
    });

    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days expiration

    const post = await prisma.lostFoundPost.create({
      data: {
        category,
        itemName,
        description,
        locationId: campusLocation.id,
        contactEmail,
        contactPhone: contactPhone || null,
        contactInfo: contactInfo || null,
        image: image || null,
        status: 'Available',
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, createdId: post.id }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lost & found post:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

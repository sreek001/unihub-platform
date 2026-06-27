import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up database
  await prisma.handoverRequest.deleteMany();
  await prisma.textbook.deleteMany();
  await prisma.digitalResource.deleteMany();
  await prisma.lostFoundPost.deleteMany();
  await prisma.campusLocation.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Vance',
      branch: 'Computer Science & Engineering',
      currentSemester: 6,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      branch: 'Electronics & Communication Engineering',
      currentSemester: 4,
    },
  });

  console.log('Seeded Users:', [user1.name, user2.name]);

  // Create Textbooks
  const book1 = await prisma.textbook.create({
    data: {
      title: 'Introduction to Algorithms (CLRS)',
      semester: 4,
      condition: 'Like New',
      status: 'Available',
      ownerId: user1.id,
    },
  });

  const book2 = await prisma.textbook.create({
    data: {
      title: 'Computer Networking: A Top-Down Approach',
      semester: 6,
      condition: 'Good',
      status: 'Available',
      ownerId: user2.id,
    },
  });

  const book3 = await prisma.textbook.create({
    data: {
      title: 'Database System Concepts (Silberschatz)',
      semester: 4,
      condition: 'Fair',
      status: 'Pending',
      ownerId: user1.id,
    },
  });

  console.log('Seeded Textbooks:', [book1.title, book2.title, book3.title]);

  // Create Digital Resources
  const res1 = await prisma.digitalResource.create({
    data: {
      title: 'Machine Learning Unit 1-4 Complete Notes',
      semester: 6,
      category: 'Notes',
      url: '/docs/ml-notes-u1-4.pdf',
      uploaderId: user1.id,
    },
  });

  const res2 = await prisma.digitalResource.create({
    data: {
      title: 'Digital Signal Processing Lab Manual',
      semester: 4,
      category: 'LabManual',
      url: '/docs/dsp-lab-manual.pdf',
      uploaderId: user2.id,
    },
  });

  console.log('Seeded Digital Resources:', [res1.title, res2.title]);

  // Create a pending HandoverRequest for Silberschatz book (book3) from Bob (user2) to Alice (user1)
  const req = await prisma.handoverRequest.create({
    data: {
      textbookId: book3.id,
      requesterId: user2.id,
      status: 'Pending',
    },
  });

  console.log('Seeded Handover Request:', req.id);

  // Create Campus Locations
  const locationsData = [
    'Library Commons',
    'Student Center',
    'Chemistry Building',
    'Engineering Quad',
    'Campus Canteen',
    'Sports Complex',
    'Other Area'
  ];

  const locationsMap: { [name: string]: any } = {};
  for (const name of locationsData) {
    const loc = await prisma.campusLocation.create({
      data: { name },
    });
    locationsMap[name] = loc;
  }
  console.log('Seeded Campus Locations:', Object.keys(locationsMap));

  // Seed LostFound Posts
  const post1 = await prisma.lostFoundPost.create({
    data: {
      category: 'Found',
      itemName: 'Blue commuter backpack',
      description: 'Black and blue backpack with a silver water bottle sleeve and campus ID badge attached.',
      locationId: locationsMap['Library Commons'].id,
      contactEmail: 'backpack-owner@campus.edu',
      contactPhone: '+18005551234',
      contactInfo: 'Email or text. Located in Library Room 204.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
      status: 'Available',
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    },
  });

  const post2 = await prisma.lostFoundPost.create({
    data: {
      category: 'Lost',
      itemName: 'Silver key ring',
      description: 'Metal key ring with three keys, one red plastic tag, and a handwritten name label inside.',
      locationId: locationsMap['Chemistry Building'].id,
      contactEmail: 'chemkeys@campus.edu',
      contactPhone: '+18005559876',
      contactInfo: 'Call if found. Reward offered.',
      image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&q=80',
      status: 'Claim pending',
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    },
  });

  const post3 = await prisma.lostFoundPost.create({
    data: {
      category: 'Found',
      itemName: 'Student ID wallet',
      description: 'Brown leather wallet with student ID, library card, and a few receipts inside.',
      locationId: locationsMap['Student Center'].id,
      contactEmail: 'id-wallet@campus.edu',
      contactPhone: '+18005553421',
      contactInfo: 'Can pick up at front desk.',
      image: 'https://images.unsplash.com/photo-1627124089633-8fc6d5d05aa2?w=500&q=80',
      status: 'Ready for pickup',
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
    },
  });

  const post4 = await prisma.lostFoundPost.create({
    data: {
      category: 'Lost',
      itemName: 'Noise-cancelling earphones',
      description: 'Black over-ear earphones in a branded carrying pouch with a zipper pull.',
      locationId: locationsMap['Engineering Quad'].id,
      contactEmail: 'earphones-owner@campus.edu',
      contactPhone: '+18005555678',
      contactInfo: 'Lost near the benches.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
      status: 'Available',
      postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Seeded Lost & Found Posts:', [post1.itemName, post2.itemName, post3.itemName, post4.itemName]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

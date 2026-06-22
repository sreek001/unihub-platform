import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up database
  await prisma.handoverRequest.deleteMany();
  await prisma.textbook.deleteMany();
  await prisma.digitalResource.deleteMany();
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

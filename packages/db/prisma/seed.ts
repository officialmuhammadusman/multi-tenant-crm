// packages/db/prisma/seed.ts
import { PrismaClient, UserRole, ActivityAction } from '../src/generated/prisma';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main(): Promise<void> {
  console.log('🌱 Starting seed...');

  // ── Super Admin ──────────────────────────────────────────────────────────
  const superAdminEmail = 'superadmin@system.com';
  const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });

  let superAdmin = existingSuperAdmin;
  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: superAdminEmail,
        passwordHash: await hashPassword('SuperAdmin@123'),
        role: UserRole.SUPER_ADMIN,
        isSuperAdmin: true,
        organizationId: null,
      },
    });
    console.log('✅ Super admin created:', superAdminEmail);
  } else {
    console.log('⏭️  Super admin already exists, skipping');
  }

  // ── Organizations ─────────────────────────────────────────────────────────
  const orgs = [
    { name: 'Acme Inc.' },
    { name: 'Beta Corp.' },
  ];

  for (const orgData of orgs) {
    const existingOrg = await prisma.organization.findFirst({ where: { name: orgData.name } });
    if (existingOrg) {
      console.log(`⏭️  Organization "${orgData.name}" exists, skipping`);
      continue;
    }

    const org = await prisma.organization.create({ data: { name: orgData.name } });
    console.log(`✅ Organization created: ${orgData.name}`);

    // Create 1 admin + 2 members per org
    const adminEmail = `admin@${orgData.name.toLowerCase().replace(/[^a-z]/g, '')}.com`;
    const admin = await prisma.user.create({
      data: {
        name: `${orgData.name} Admin`,
        email: adminEmail,
        passwordHash: await hashPassword('Admin@123456'),
        role: UserRole.ADMIN,
        isSuperAdmin: false,
        organizationId: org.id,
      },
    });

    const members: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
    for (let m = 1; m <= 2; m++) {
      const memberEmail = `member${m}@${orgData.name.toLowerCase().replace(/[^a-z]/g, '')}.com`;
      const member = await prisma.user.create({
        data: {
          name: `${orgData.name} Member ${m}`,
          email: memberEmail,
          passwordHash: await hashPassword('Member@123456'),
          role: UserRole.MEMBER,
          isSuperAdmin: false,
          organizationId: org.id,
        },
      });
      members.push(member);
    }

    console.log(`✅ Users created for ${orgData.name}: 1 admin + 2 members`);

    // Create 50 customers per org
    const allUsers = [admin, ...members];
    const assignmentCounts: Record<string, number> = {};
    allUsers.forEach((u) => { assignmentCounts[u.id] = 0; });

    for (let i = 0; i < 50; i++) {
      // Pick a user with < 5 assignments for auto-assignment
      const availableUser = allUsers.find((u) => (assignmentCounts[u.id] ?? 0) < 5);
      const creatorUser = availableUser ?? members[0]!;

      // Find a user to assign to (respecting 5-limit)
      const assignableUser = allUsers.find((u) => (assignmentCounts[u.id] ?? 0) < 5);

      const customer = await prisma.customer.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          organizationId: org.id,
          assignedTo: assignableUser?.id ?? null,
        },
      });

      if (assignableUser) {
        assignmentCounts[assignableUser.id] = (assignmentCounts[assignableUser.id] ?? 0) + 1;
      }

      // Log customer creation
      await prisma.activityLog.create({
        data: {
          entityType: 'Customer',
          entityId: customer.id,
          action: ActivityAction.CUSTOMER_CREATED,
          performedBy: creatorUser.id,
          organizationId: org.id,
        },
      });

      if (assignableUser) {
        await prisma.activityLog.create({
          data: {
            entityType: 'Customer',
            entityId: customer.id,
            action: ActivityAction.CUSTOMER_ASSIGNED,
            performedBy: admin.id,
            organizationId: org.id,
          },
        });
      }

      // Create 2-3 notes per customer
      const noteCount = faker.number.int({ min: 2, max: 3 });
      for (let n = 0; n < noteCount; n++) {
        const noteCreator = allUsers[n % allUsers.length]!;
        const note = await prisma.note.create({
          data: {
            content: faker.lorem.sentences(2),
            customerId: customer.id,
            organizationId: org.id,
            createdBy: noteCreator.id,
          },
        });

        await prisma.activityLog.create({
          data: {
            entityType: 'Note',
            entityId: note.id,
            action: ActivityAction.NOTE_ADDED,
            performedBy: noteCreator.id,
            organizationId: org.id,
          },
        });
      }
    }

    console.log(`✅ 50 customers + notes + activity logs created for ${orgData.name}`);
  }

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('Test credentials:');
  console.log('  Super Admin: superadmin@system.com / SuperAdmin@123');
  console.log('  Acme Admin:  admin@acmeinc.com / Admin@123456');
  console.log('  Acme Member: member1@acmeinc.com / Member@123456');
  console.log('  Beta Admin:  admin@betacorp.com / Admin@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

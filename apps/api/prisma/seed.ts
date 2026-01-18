import { PrismaClient, UserRole, EventStatus, PaymentMethod } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create super admin
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@takbohub.ph' },
    update: {},
    create: {
      email: 'admin@takbohub.ph',
      passwordHash: adminPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  })
  console.log(`✅ Created admin user: ${admin.email}`)

  // Create demo organizer
  const organizerPassword = await bcrypt.hash('organizer123', 12)
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@takbohub.ph' },
    update: {},
    create: {
      email: 'organizer@takbohub.ph',
      passwordHash: organizerPassword,
      name: 'Demo Organizer',
      role: UserRole.ORGANIZER,
      emailVerified: true,
    },
  })
  console.log(`✅ Created organizer user: ${organizer.email}`)

  // Create demo organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'dumaguete-runners' },
    update: {},
    create: {
      name: 'Dumaguete Runners Club',
      slug: 'dumaguete-runners',
      ownerId: organizer.id,
    },
  })
  console.log(`✅ Created organization: ${organization.name}`)

  // Create demo event
  const eventDate = new Date()
  eventDate.setMonth(eventDate.getMonth() + 2) // 2 months from now

  const registrationOpen = new Date()
  const registrationClose = new Date(eventDate)
  registrationClose.setDate(registrationClose.getDate() - 3) // 3 days before event

  const event = await prisma.event.upsert({
    where: { slug: 'dumaguete-fun-run-2026' },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Dumaguete Fun Run 2026',
      slug: 'dumaguete-fun-run-2026',
      description:
        'Join us for the biggest fun run in Dumaguete City! Run along the scenic Rizal Boulevard and enjoy the beautiful sunrise. Open to all ages and fitness levels.',
      date: eventDate,
      location: 'Rizal Boulevard, Dumaguete City',
      locationMapUrl: 'https://maps.google.com/?q=Rizal+Boulevard+Dumaguete+City',
      registrationOpen: registrationOpen,
      registrationClose: registrationClose,
      status: EventStatus.PUBLISHED,
      paymentMethods: [
        PaymentMethod.GCASH,
        PaymentMethod.MAYA,
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.CASH,
      ],
      bankDetails: {
        bankName: 'BDO',
        accountName: 'Dumaguete Runners Club',
        accountNumber: '1234567890',
      },
      cashInstructions:
        'Pay in person at our registration booth at Lee Plaza every Saturday 8AM-12PM.',
    },
  })
  console.log(`✅ Created event: ${event.name}`)

  // Create race categories
  const categories = [
    { name: '3K Fun Run', distance: 3, price: 300, earlyBirdPrice: 250, slotLimit: 200 },
    { name: '5K', distance: 5, price: 500, earlyBirdPrice: 400, slotLimit: 300 },
    { name: '10K', distance: 10, price: 700, earlyBirdPrice: 600, slotLimit: 200 },
    {
      name: '21K Half Marathon',
      distance: 21.0975,
      price: 1000,
      earlyBirdPrice: 850,
      slotLimit: 100,
    },
  ]

  const earlyBirdDeadline = new Date(registrationClose)
  earlyBirdDeadline.setDate(earlyBirdDeadline.getDate() - 14) // 2 weeks before close

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]
    await prisma.raceCategory.upsert({
      where: {
        id: `seed-category-${event.id}-${i}`,
      },
      update: {},
      create: {
        id: `seed-category-${event.id}-${i}`,
        eventId: event.id,
        name: cat.name,
        distance: cat.distance,
        price: cat.price,
        earlyBirdPrice: cat.earlyBirdPrice,
        earlyBirdDeadline: earlyBirdDeadline,
        slotLimit: cat.slotLimit,
        sortOrder: i,
      },
    })
    console.log(`  ✅ Created category: ${cat.name}`)
  }

  // Create demo runner
  const runnerPassword = await bcrypt.hash('runner123', 12)
  const runner = await prisma.user.upsert({
    where: { email: 'runner@example.com' },
    update: {},
    create: {
      email: 'runner@example.com',
      passwordHash: runnerPassword,
      name: 'Juan dela Cruz',
      role: UserRole.RUNNER,
      emailVerified: true,
    },
  })
  console.log(`✅ Created runner user: ${runner.email}`)

  console.log('\n🎉 Seeding complete!')
  console.log('\n📋 Test accounts:')
  console.log('  Admin:     admin@takbohub.ph / admin123')
  console.log('  Organizer: organizer@takbohub.ph / organizer123')
  console.log('  Runner:    runner@example.com / runner123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

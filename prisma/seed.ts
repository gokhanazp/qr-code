// Veritabanı Seed dosyası
// Başlangıç verilerini oluşturur

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin kullanıcısı oluştur
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qrcode.com' },
    update: {},
    create: {
      email: 'admin@qrcode.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Test kullanıcısı oluştur
  const userPassword = await bcrypt.hash('user1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@qrcode.com' },
    update: {},
    create: {
      email: 'user@qrcode.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
    },
  })
  console.log('✅ Test user created:', user.email)

  // Paket planları oluştur
  const plans = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Basic QR code generation',
      price: 0,
      currency: 'USD',
      interval: 'monthly',
      qrCodeLimit: 5,
      scanLimit: 100,
      dynamicQR: false,
      analytics: false,
      customDesign: true,
      bulkCreate: false,
      apiAccess: false,
      priority: 1,
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'Advanced features for professionals',
      price: 9.99,
      currency: 'USD',
      interval: 'monthly',
      qrCodeLimit: 50,
      scanLimit: 10000,
      dynamicQR: true,
      analytics: true,
      customDesign: true,
      bulkCreate: true,
      apiAccess: false,
      priority: 2,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Unlimited access for businesses',
      price: 29.99,
      currency: 'USD',
      interval: 'monthly',
      qrCodeLimit: -1,
      scanLimit: -1,
      dynamicQR: true,
      analytics: true,
      customDesign: true,
      bulkCreate: true,
      apiAccess: true,
      priority: 3,
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    })
  }
  console.log('✅ Plans created')

  // Test QR kodları oluştur
  const qrCodes = [
    {
      name: 'My Website',
      type: 'URL' as const,
      content: 'https://example.com',
      userId: user.id,
      isActive: true,
      isDynamic: false,
      scanCount: 42,
    },
    {
      name: 'WiFi Network',
      type: 'WIFI' as const,
      content: 'WIFI:T:WPA;S:MyNetwork;P:password123;;',
      userId: user.id,
      isActive: true,
      isDynamic: false,
      scanCount: 15,
    },
    {
      name: 'Contact Card',
      type: 'VCARD' as const,
      content: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD',
      userId: user.id,
      isActive: true,
      isDynamic: true,
      scanCount: 8,
    },
  ]

  for (const qr of qrCodes) {
    await prisma.qRCode.create({ data: qr })
  }
  console.log('✅ Sample QR codes created')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


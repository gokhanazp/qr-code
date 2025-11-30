// Prisma Client singleton pattern
// Bu dosya veritabanı bağlantısını yönetir

import { PrismaClient } from '@prisma/client'

// Global tanımlama (development'ta hot reload için gerekli)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma client instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Development'ta hot reload sırasında birden fazla instance oluşmasını önle
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma


import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Centralized Prisma Module
 * 
 * This module provides a global instance of PrismaService that can be used
 * across all other modules in the application. It's marked as @Global() so
 * that any module can inject PrismaService without explicitly importing this module.
 * 
 * Usage in other modules:
 * - Simply inject PrismaService in your constructors
 * - No need to import this module in your feature modules
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

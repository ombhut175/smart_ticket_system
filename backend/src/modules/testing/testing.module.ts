import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { TestingService } from './testing.service';
import { DatabaseModule } from '../../core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TestingController],
  providers: [TestingService],
  exports: [TestingService],
})
export class TestingModule {}

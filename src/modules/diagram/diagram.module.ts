import { Module } from '@nestjs/common';
import { DiagramController } from './diagram.controller';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  controllers: [DiagramController],
  providers: [PrismaService],
})
export class DiagramModule {}

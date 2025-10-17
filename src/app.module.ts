import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LlmController } from './llm/llm.controller';
import { Prisma } from '@prisma/client/extension';
import { PrismaService } from './prisma.service';
import { LlmService } from './llm/llm.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, LlmController],
  providers: [AppService, PrismaService, LlmService],
})
export class AppModule {}

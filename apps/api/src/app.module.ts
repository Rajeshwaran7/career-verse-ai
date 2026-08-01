import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { CompaniesModule } from './companies/companies.module';
import { InternshipsModule } from './internships/internships.module';
import { AiModule } from './ai/ai.module';
import { GithubModule } from './github/github.module';
import { UploadModule } from './upload/upload.module';
import { SearchModule } from './search/search.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    CompaniesModule,
    InternshipsModule,
    AiModule,
    GithubModule,
    UploadModule,
    SearchModule,
    AdminModule,
  ],
})
export class AppModule {}

import {
  Controller, Post, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe,
  MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('resume')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload resume PDF' })
  async uploadResume(
    @CurrentUser() user: { userId: string },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadService.uploadResume(user.userId, file);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile avatar' })
  async uploadAvatar(
    @CurrentUser() user: { userId: string },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadService.uploadAvatar(user.userId, file);
  }

  @Post('company-logo')
  @UseGuards(RolesGuard)
  @Roles(Role.STARTUP)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload company logo' })
  async uploadCompanyLogo(
    @CurrentUser() user: { userId: string },
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadService.uploadCompanyLogo(user.userId, file);
  }
}

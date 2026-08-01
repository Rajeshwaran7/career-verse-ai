import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import pdfParse from 'pdf-parse';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private aiService: AiService,
  ) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadResume(userId: string, file: Express.Multer.File) {
    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'raw', folder: 'career-verse/resumes', format: 'pdf' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(file.buffer);
    });

    // Update student record
    await this.prisma.student.update({
      where: { userId },
      data: {
        resumeUrl: uploadResult.secure_url,
        resumePublicId: uploadResult.public_id,
      },
    });

    // Parse resume with AI in background
    this.parseResumeInBackground(userId, file.buffer).catch((err) =>
      this.logger.error('Resume parse error', err),
    );

    return { resumeUrl: uploadResult.secure_url, message: 'Resume uploaded successfully' };
  }

  private async parseResumeInBackground(userId: string, buffer: Buffer) {
    try {
      const data = await pdfParse(buffer);
      const parsed = await this.aiService.parseResume(data.text);

      const updateData: any = {};
      if (parsed.education?.college) updateData.college = parsed.education.college;
      if (parsed.education?.degree) updateData.degree = parsed.education.degree;
      if (parsed.education?.branch) updateData.branch = parsed.education.branch;
      if (parsed.education?.graduationYear) updateData.graduationYear = parsed.education.graduationYear;
      if (parsed.skills?.length > 0) updateData.programmingLangs = parsed.skills;

      if (Object.keys(updateData).length > 0) {
        await this.prisma.student.update({ where: { userId }, data: updateData });
      }

      // Create projects from parsed data
      if (parsed.projects?.length > 0) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (student) {
          for (const project of parsed.projects.slice(0, 5)) {
            await this.prisma.project.create({
              data: {
                studentId: student.id,
                title: project.title,
                description: project.description,
                technologies: project.technologies || [],
              },
            });
          }
        }
      }
    } catch (err) {
      this.logger.error('Failed to parse resume', err);
    }
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', folder: 'career-verse/avatars', transformation: [{ width: 400, height: 400, crop: 'fill' }] },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(file.buffer);
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: uploadResult.secure_url },
    });

    // Also update student/company avatar
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (student) {
      await this.prisma.student.update({
        where: { userId },
        data: { avatarUrl: uploadResult.secure_url },
      });
    }

    return { avatarUrl: uploadResult.secure_url };
  }

  async uploadCompanyLogo(userId: string, file: Express.Multer.File) {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', folder: 'career-verse/logos' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(file.buffer);
    });

    await this.prisma.company.update({
      where: { userId },
      data: { logoUrl: uploadResult.secure_url, logoPublicId: uploadResult.public_id },
    });

    return { logoUrl: uploadResult.secure_url };
  }
}

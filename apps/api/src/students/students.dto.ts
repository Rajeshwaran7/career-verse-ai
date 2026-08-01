import {
  IsString, IsOptional, IsNumber, IsArray, IsUrl, Min, Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateStudentDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() location?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() bio?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() college?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() degree?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() branch?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) graduationYear?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) @Min(0) @Max(10) cgpa?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() githubUsername?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() linkedinUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() portfolioUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() @IsString({ each: true }) programmingLangs?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsArray() @IsString({ each: true }) frameworks?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsArray() @IsString({ each: true }) databases?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsArray() @IsString({ each: true }) cloudPlatforms?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsArray() @IsString({ each: true }) tools?: string[];
}

export class CreateProjectDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsArray() @IsString({ each: true }) technologies: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsString() githubUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() liveUrl?: string;
}

export class UpdateProjectDto extends CreateProjectDto {}

export class CreateExperienceDto {
  @ApiProperty() @IsString() company: string;
  @ApiProperty() @IsString() role: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty() startDate: Date;
  @ApiProperty({ required: false }) @IsOptional() endDate?: Date;
  @ApiProperty({ required: false }) @IsOptional() isCurrent?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() location?: string;
}

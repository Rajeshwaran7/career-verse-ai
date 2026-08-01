import { IsString, IsArray, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkType, InternshipStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateInternshipDto {
  @ApiProperty() @IsString() position: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsArray() @IsString({ each: true }) skillsRequired: string[];
  @ApiProperty() @IsString() duration: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() stipend?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() location?: string;
  @ApiProperty({ enum: WorkType, default: WorkType.REMOTE }) @IsEnum(WorkType) workType: WorkType;
  @ApiProperty({ default: 1 }) @IsNumber() @Min(1) @Type(() => Number) openings: number;
}

export class UpdateInternshipDto extends CreateInternshipDto {
  @ApiProperty({ enum: InternshipStatus, required: false })
  @IsOptional()
  @IsEnum(InternshipStatus)
  status?: InternshipStatus;
}

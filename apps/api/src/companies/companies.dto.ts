import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() website?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() industry?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() size?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() location?: string;
}

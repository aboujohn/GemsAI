import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateStoryDto {
  @ApiProperty({
    description: 'The title of the story',
    example: 'Our Updated Love Story',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: 'The content of the story',
    example: 'We met at a coffee shop on a sunny day in April...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @ApiProperty({
    description: 'Tags associated with the story',
    example: ['romance', 'anniversary', 'proposal'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
} 
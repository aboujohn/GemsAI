import { IsString, IsArray, IsOptional, IsNumber, IsIn, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmotionTagDto {
  @ApiProperty({ 
    description: 'Name of the emotion',
    example: 'joy'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Intensity of the emotion (0-1)',
    example: 0.8,
    minimum: 0,
    maximum: 1
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  intensity: number;
}

export class GenerateSketchDto {
  @ApiProperty({ 
    description: 'ID of the story to generate sketches for',
    example: 'story-123'
  })
  @IsString()
  storyId: string;

  @ApiProperty({ 
    description: 'The story text content',
    example: 'A magical forest where ancient trees whisper secrets of old'
  })
  @IsString()
  storyText: string;

  @ApiProperty({ 
    description: 'Array of emotion tags that should influence the sketch',
    type: [EmotionTagDto],
    example: [
      { name: 'peace', intensity: 0.7 },
      { name: 'wonder', intensity: 0.9 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmotionTagDto)
  emotionTags: EmotionTagDto[];

  @ApiProperty({ 
    description: 'Sketch style to use',
    enum: ['realistic', 'cartoon', 'abstract', 'sketch', 'watercolor'],
    example: 'watercolor'
  })
  @IsString()
  @IsIn(['realistic', 'cartoon', 'abstract', 'sketch', 'watercolor'])
  style: string;

  @ApiPropertyOptional({ 
    description: 'Number of sketch variants to generate (1-5)',
    example: 3,
    minimum: 1,
    maximum: 5,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  variants?: number;

  @ApiPropertyOptional({ 
    description: 'Additional context or instructions for the sketch generation',
    example: 'Focus on the magical elements and use ethereal lighting'
  })
  @IsOptional()
  @IsString()
  additionalContext?: string;

  @ApiPropertyOptional({ 
    description: 'User ID (for quota tracking)',
    example: 'user-456'
  })
  @IsOptional()
  @IsString()
  userId?: string;
} 
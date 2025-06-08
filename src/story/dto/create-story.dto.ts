import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStoryDto {
  @ApiProperty({
    description: 'The title of the story',
    example: 'Our Love Story',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'The content of the story',
    example: 'We met at a coffee shop on a rainy day in April...',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  content: string;

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

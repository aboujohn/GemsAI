import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateSketchDto {
  @ApiProperty({
    description: 'The ID of the story this sketch belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  storyId: string;

  @ApiProperty({
    description: 'URL to the sketch image',
    example: 'https://example.com/images/sketch123.jpg',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  imageUrl: string;

  @ApiProperty({
    description: 'Description of the sketch',
    example: 'A beautiful ring with a diamond in the center',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Additional notes or design instructions',
    example: 'Please use white gold and make the band thinner',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

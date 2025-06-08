import { ApiProperty } from '@nestjs/swagger';

export class SketchResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the sketch',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The ID of the story this sketch belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  storyId: string;

  @ApiProperty({
    description: 'URL to the sketch image',
    example: 'https://example.com/images/sketch123.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Description of the sketch',
    example: 'A beautiful ring with a diamond in the center',
  })
  description: string;

  @ApiProperty({
    description: 'Additional notes or design instructions',
    example: 'Please use white gold and make the band thinner',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Creation date of the sketch',
    example: '2023-06-05T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date of the sketch',
    example: '2023-06-05T12:30:00.000Z',
  })
  updatedAt: Date;
} 
import { ApiProperty } from '@nestjs/swagger';

export class StoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the story',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The title of the story',
    example: 'Our Love Story',
  })
  title: string;

  @ApiProperty({
    description: 'The content of the story',
    example: 'We met at a coffee shop on a rainy day in April...',
  })
  content: string;

  @ApiProperty({
    description: 'Tags associated with the story',
    example: ['romance', 'anniversary', 'proposal'],
    type: [String],
  })
  tags?: string[];

  @ApiProperty({
    description: 'Creation date of the story',
    example: '2023-06-05T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date of the story',
    example: '2023-06-05T12:30:00.000Z',
  })
  updatedAt: Date;
}

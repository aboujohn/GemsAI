import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateSketchDto {
  @ApiProperty({
    description: 'URL to the sketch image',
    example: 'https://example.com/images/updated-sketch123.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'Description of the sketch',
    example: 'An updated beautiful ring with a diamond in the center',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Additional notes or design instructions',
    example: 'Please use rose gold instead and make the band thinner',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

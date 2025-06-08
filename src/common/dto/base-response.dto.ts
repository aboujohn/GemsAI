import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty({ description: 'Whether the request was successful', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Operation completed successfully' })
  message: string;

  @ApiProperty({ description: 'Response data', example: {} })
  data?: T;

  @ApiProperty({
    description: 'Timestamp of the response',
    example: '2023-06-05T04:30:00.000Z',
  })
  timestamp: string;

  constructor(data?: T, message = 'Operation completed successfully') {
    this.success = true;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Whether the request was successful', example: false })
  success: boolean;

  @ApiProperty({ description: 'Error message', example: 'An error occurred' })
  message: string;

  @ApiProperty({ description: 'Error code', example: 'VALIDATION_ERROR' })
  errorCode?: string;

  @ApiProperty({
    description: 'Error details',
    example: { field: 'email', issue: 'must be a valid email' },
  })
  details?: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp of the response',
    example: '2023-06-05T04:30:00.000Z',
  })
  timestamp: string;

  constructor(message = 'An error occurred', errorCode?: string, details?: Record<string, any>) {
    this.success = false;
    this.message = message;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ParseEnumPipe,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StorageService, UploadConfiguration } from './storage.service';
import { StorageBucket } from './s3.service';
import { ApiSuccessResponse, ApiErrorResponse } from '../common/decorators/api-response.decorator';
import { BaseResponseDto } from '../common/dto/base-response.dto';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload/:bucket')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a single file',
    description: 'Upload a file to the specified bucket with validation and optimization',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'bucket', enum: StorageBucket })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or validation failed' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('bucket', new ParseEnumPipe(StorageBucket)) bucket: StorageBucket,
    @Body('fileType') fileType: 'image' | 'sketch' | 'document' | 'video' = 'image',
    @Body('prefix') prefix?: string,
    @Body('generateSizes') generateSizes?: boolean,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const config: UploadConfiguration = {
      bucket,
      fileType,
      prefix,
      generateSizes: generateSizes !== false,
    };

    const result = await this.storageService.uploadFile(file, config);
    return new BaseResponseDto(result, 'File uploaded successfully');
  }

  @Post('upload-multiple/:bucket')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiOperation({
    summary: 'Upload multiple files',
    description: 'Upload multiple files to the specified bucket with validation and optimization',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'bucket', enum: StorageBucket })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid files or validation failed' })
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('bucket', new ParseEnumPipe(StorageBucket)) bucket: StorageBucket,
    @Body('fileType') fileType: 'image' | 'sketch' | 'document' | 'video' = 'image',
    @Body('prefix') prefix?: string,
    @Body('generateSizes') generateSizes?: boolean,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const config: UploadConfiguration = {
      bucket,
      fileType,
      prefix,
      generateSizes: generateSizes !== false,
    };

    const result = await this.storageService.uploadFiles(files, config);
    return new BaseResponseDto(result, 'Files processed successfully');
  }

  @Get('signed-url/:bucket/:key')
  @ApiOperation({
    summary: 'Generate signed URL',
    description: 'Generate a signed URL for secure file access',
  })
  @ApiParam({ name: 'bucket', enum: StorageBucket })
  @ApiParam({ name: 'key', description: 'File key/path' })
  @ApiQuery({ name: 'operation', enum: ['getObject', 'putObject'], required: false })
  @ApiQuery({ name: 'expiresIn', type: Number, required: false, description: 'Expiry time in seconds' })
  @ApiResponse({ status: 200, description: 'Signed URL generated successfully' })
  async getSignedUrl(
    @Param('bucket', new ParseEnumPipe(StorageBucket)) bucket: StorageBucket,
    @Param('key') key: string,
    @Query('operation') operation: 'getObject' | 'putObject' = 'getObject',
    @Query('expiresIn') expiresIn?: number,
  ) {
    const signedUrl = await this.storageService.getSignedUrl({
      bucket,
      key,
      operation,
      expiresIn,
    });

    return new BaseResponseDto({ signedUrl }, 'Signed URL generated successfully');
  }

  @Get('public-url/:bucket/:key')
  @ApiOperation({
    summary: 'Get public URL',
    description: 'Get the public URL for a file (CloudFront or S3)',
  })
  @ApiParam({ name: 'bucket', enum: StorageBucket })
  @ApiParam({ name: 'key', description: 'File key/path' })
  @ApiResponse({ status: 200, description: 'Public URL retrieved successfully' })
  getPublicUrl(
    @Param('bucket', new ParseEnumPipe(StorageBucket)) bucket: StorageBucket,
    @Param('key') key: string,
  ) {
    const publicUrl = this.storageService.getPublicUrl(bucket, key);
    return new BaseResponseDto({ publicUrl }, 'Public URL retrieved successfully');
  }

  @Get('exists/:bucket/:key')
  @ApiOperation({
    summary: 'Check if file exists',
    description: 'Check if a file exists in the specified bucket',
  })
  @ApiParam({ name: 'bucket', enum: StorageBucket })
  @ApiParam({ name: 'key', description: 'File key/path' })
  @ApiResponse({ status: 200, description: 'File existence checked successfully' })
  async checkFileExists(
    @Param('bucket', new ParseEnumPipe(StorageBucket)) bucket: StorageBucket,
    @Param('key') key: string,
  ) {
    const exists = await this.storageService.fileExists(bucket, key);
    return new BaseResponseDto({ exists }, 'File existence checked successfully');
  }

  @Get('list/:bucket')
  @ApiOperation({
    summary: 'List files in bucket',
    description: 'List files in the specified bucket with optional prefix filter',
  })
  @ApiParam({ name: 'bucket', enum: StorageBucket })
  @ApiQuery({ name: 'prefix', required: false, description: 'File key prefix filter' })
  @ApiQuery({ name: 'maxKeys', type: Number, required: false, description: 'Maximum number of files to return' })
  @ApiResponse({ status: 200, description: 'Files listed successfully' })
  async listFiles(
    @Param('bucket', new ParseEnumPipe(StorageBucket)) bucket: StorageBucket,
    @Query('prefix') prefix?: string,
    @Query('maxKeys') maxKeys?: number,
  ) {
    const files = await this.storageService.listFiles(bucket, prefix, maxKeys);
    return new BaseResponseDto({ files, count: files.length }, 'Files listed successfully');
  }

  @Delete(':bucket/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete file',
    description: 'Delete a file and all its variants from the specified bucket',
  })
  @ApiParam({ name: 'bucket', enum: StorageBucket })
  @ApiParam({ name: 'key', description: 'File key/path' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(
    @Param('bucket', new ParseEnumPipe(StorageBucket)) bucket: StorageBucket,
    @Param('key') key: string,
  ) {
    await this.storageService.deleteFile(bucket, key);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get storage statistics',
    description: 'Get statistics about files in all buckets',
  })
  @ApiResponse({ status: 200, description: 'Storage statistics retrieved successfully' })
  async getStorageStats() {
    const stats = await this.storageService.getStorageStats();
    return new BaseResponseDto(stats, 'Storage statistics retrieved successfully');
  }

  @Post('initialize')
  @ApiOperation({
    summary: 'Initialize storage',
    description: 'Initialize storage by creating buckets if they don\'t exist',
  })
  @ApiResponse({ status: 201, description: 'Storage initialized successfully' })
  async initializeStorage() {
    await this.storageService.initializeStorage();
    return new BaseResponseDto(null, 'Storage initialized successfully');
  }

  @Get('download/:bucket/:key')
  @ApiOperation({
    summary: 'Download file',
    description: 'Download a file from the specified bucket',
  })
  @ApiParam({ name: 'bucket', enum: StorageBucket })
  @ApiParam({ name: 'key', description: 'File key/path' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  async downloadFile(
    @Param('bucket', new ParseEnumPipe(StorageBucket)) bucket: StorageBucket,
    @Param('key') key: string,
  ) {
    const buffer = await this.storageService.downloadFile(bucket, key);
    return {
      buffer: buffer.toString('base64'),
      contentType: 'application/octet-stream',
    };
  }
} 
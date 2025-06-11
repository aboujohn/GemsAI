import { Injectable, Logger } from '@nestjs/common';
import { 
  CloudFrontClient,
  CreateDistributionCommand,
  GetDistributionCommand,
  ListDistributionsCommand,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { ConfigService } from '../config/config.service';

export interface DistributionConfig {
  originDomainName: string; // S3 bucket domain
  comment: string;
  enabled: boolean;
  defaultRootObject?: string;
  priceClass?: 'PriceClass_All' | 'PriceClass_100' | 'PriceClass_200';
}

export interface InvalidationResult {
  invalidationId: string;
  status: string;
  createTime: Date;
}

@Injectable()
export class CloudFrontService {
  private readonly logger = new Logger(CloudFrontService.name);
  private readonly cloudFrontClient: CloudFrontClient;

  constructor(private readonly configService: ConfigService) {
    this.cloudFrontClient = new CloudFrontClient({
      region: this.configService.awsRegion,
      credentials: this.configService.awsAccessKeyId && this.configService.awsSecretAccessKey ? {
        accessKeyId: this.configService.awsAccessKeyId,
        secretAccessKey: this.configService.awsSecretAccessKey,
      } : undefined,
    });
  }

  /**
   * Create a new CloudFront distribution
   */
  async createDistribution(config: DistributionConfig): Promise<any> {
    try {
      const distributionConfig = {
        CallerReference: `gemsai-${Date.now()}`,
        Comment: config.comment,
        DefaultRootObject: config.defaultRootObject || 'index.html',
        Enabled: config.enabled,
        Origins: {
          Quantity: 1,
          Items: [
            {
              Id: 'S3Origin',
              DomainName: config.originDomainName,
              S3OriginConfig: {
                OriginAccessIdentity: '',
              },
            },
          ],
        },
        DefaultCacheBehavior: {
          TargetOriginId: 'S3Origin',
          ViewerProtocolPolicy: 'redirect-to-https',
          MinTTL: 0,
          ForwardedValues: {
            QueryString: false,
            Cookies: {
              Forward: 'none',
            },
          },
          TrustedSigners: {
            Enabled: false,
            Quantity: 0,
          },
        },
        PriceClass: config.priceClass || 'PriceClass_100',
        ViewerCertificate: {
          CloudFrontDefaultCertificate: true,
        },
      };

      const command = new CreateDistributionCommand({
        DistributionConfig: distributionConfig,
      });

      const result = await this.cloudFrontClient.send(command);
      this.logger.log(`CloudFront distribution created: ${result.Distribution?.Id}`);
      
      return result.Distribution;
    } catch (error) {
      this.logger.error('Failed to create CloudFront distribution:', error);
      throw new Error(`CloudFront distribution creation failed: ${error.message}`);
    }
  }

  /**
   * Get distribution information
   */
  async getDistribution(distributionId: string): Promise<any> {
    try {
      const command = new GetDistributionCommand({
        Id: distributionId,
      });

      const result = await this.cloudFrontClient.send(command);
      return result.Distribution;
    } catch (error) {
      this.logger.error(`Failed to get distribution ${distributionId}:`, error);
      throw new Error(`Failed to get distribution: ${error.message}`);
    }
  }

  /**
   * List all distributions
   */
  async listDistributions(): Promise<any[]> {
    try {
      const command = new ListDistributionsCommand({});
      const result = await this.cloudFrontClient.send(command);
      
      return result.DistributionList?.Items || [];
    } catch (error) {
      this.logger.error('Failed to list distributions:', error);
      throw new Error(`Failed to list distributions: ${error.message}`);
    }
  }

  /**
   * Create invalidation to refresh cached content
   */
  async createInvalidation(
    distributionId: string,
    paths: string[]
  ): Promise<InvalidationResult> {
    try {
      const command = new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: `invalidation-${Date.now()}`,
          Paths: {
            Quantity: paths.length,
            Items: paths,
          },
        },
      });

      const result = await this.cloudFrontClient.send(command);
      
      const invalidation = result.Invalidation;
      this.logger.log(`Invalidation created: ${invalidation?.Id} for paths: ${paths.join(', ')}`);
      
      return {
        invalidationId: invalidation?.Id || '',
        status: invalidation?.Status || '',
        createTime: invalidation?.CreateTime || new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to create invalidation for ${distributionId}:`, error);
      throw new Error(`Invalidation creation failed: ${error.message}`);
    }
  }

  /**
   * Invalidate all files (use with caution)
   */
  async invalidateAll(distributionId: string): Promise<InvalidationResult> {
    return this.createInvalidation(distributionId, ['/*']);
  }

  /**
   * Invalidate specific file types
   */
  async invalidateByPattern(distributionId: string, pattern: string): Promise<InvalidationResult> {
    return this.createInvalidation(distributionId, [pattern]);
  }

  /**
   * Get CloudFront URL for a file
   */
  getCloudFrontUrl(key: string, customDomain?: string): string {
    const domain = customDomain || this.configService.awsCloudFrontDomain;
    
    if (!domain) {
      throw new Error('CloudFront domain not configured');
    }

    return `https://${domain}/${key}`;
  }

  /**
   * Check if CloudFront is configured
   */
  isConfigured(): boolean {
    return !!this.configService.awsCloudFrontDomain;
  }

  /**
   * Get cache control headers for different file types
   */
  getCacheControlHeaders(fileType: string): string {
    const cacheRules = {
      'image': 'public, max-age=31536000, immutable', // 1 year for images
      'video': 'public, max-age=31536000, immutable', // 1 year for videos
      'document': 'public, max-age=86400', // 1 day for documents
      'api': 'no-cache, no-store, must-revalidate', // No cache for API responses
      'default': 'public, max-age=3600', // 1 hour default
    };

    return cacheRules[fileType] || cacheRules['default'];
  }

  /**
   * Generate recommended cache behaviors for different content types
   */
  getRecommendedCacheBehaviors(): any[] {
    return [
      {
        PathPattern: '*.jpg',
        TargetOriginId: 'S3Origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        DefaultTTL: 31536000, // 1 year
        MaxTTL: 31536000,
        MinTTL: 31536000,
        Compress: true,
      },
      {
        PathPattern: '*.png',
        TargetOriginId: 'S3Origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        DefaultTTL: 31536000, // 1 year
        MaxTTL: 31536000,
        MinTTL: 31536000,
        Compress: true,
      },
      {
        PathPattern: '*.webp',
        TargetOriginId: 'S3Origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        DefaultTTL: 31536000, // 1 year
        MaxTTL: 31536000,
        MinTTL: 31536000,
        Compress: true,
      },
      {
        PathPattern: '*.pdf',
        TargetOriginId: 'S3Origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        DefaultTTL: 86400, // 1 day
        MaxTTL: 86400,
        MinTTL: 0,
        Compress: true,
      },
    ];
  }
} 
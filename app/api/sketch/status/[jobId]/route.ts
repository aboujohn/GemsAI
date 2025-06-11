import { NextRequest, NextResponse } from 'next/server';

interface SketchStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  sketches?: Array<{
    id: string;
    url: string;
    style: string;
    variant: number;
    metadata: {
      prompt: string;
      model: string;
      generatedAt: string;
    };
  }>;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // For demo purposes, simulate different statuses based on job ID
    const mockStatuses: SketchStatus[] = [
      {
        jobId,
        status: 'completed',
        progress: 100,
        message: 'Sketch generation completed successfully',
        sketches: [
          {
            id: `${jobId}_1`,
            url: `https://picsum.photos/512/512?random=${jobId}_1`,
            style: 'modern',
            variant: 1,
            metadata: {
              prompt: 'A beautiful love story under moonlight, modern style',
              model: 'DALL-E-3',
              generatedAt: new Date().toISOString(),
            }
          },
          {
            id: `${jobId}_2`,
            url: `https://picsum.photos/512/512?random=${jobId}_2`,
            style: 'modern',
            variant: 2,
            metadata: {
              prompt: 'A beautiful love story under moonlight, modern style, variant 2',
              model: 'DALL-E-3',
              generatedAt: new Date().toISOString(),
            }
          },
          {
            id: `${jobId}_3`,
            url: `https://picsum.photos/512/512?random=${jobId}_3`,
            style: 'modern',
            variant: 3,
            metadata: {
              prompt: 'A beautiful love story under moonlight, modern style, variant 3',
              model: 'DALL-E-3',
              generatedAt: new Date().toISOString(),
            }
          }
        ]
      }
    ];

    // Simulate different statuses randomly
    const random = Math.random();
    let status: SketchStatus;

    if (random < 0.1) {
      status = {
        jobId,
        status: 'failed',
        message: 'Sketch generation failed due to API limit',
        error: 'Rate limit exceeded. Please try again later.'
      };
    } else if (random < 0.3) {
      status = {
        jobId,
        status: 'processing',
        progress: Math.floor(random * 80) + 10,
        message: 'Generating sketches using AI...'
      };
    } else if (random < 0.5) {
      status = {
        jobId,
        status: 'queued',
        progress: 5,
        message: 'Request queued, waiting for processing...'
      };
    } else {
      status = mockStatuses[0];
    }

    return NextResponse.json(status);
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check sketch status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
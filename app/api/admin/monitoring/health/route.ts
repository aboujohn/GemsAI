import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin access
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Perform health checks
    const healthChecks = await Promise.allSettled([
      checkDatabaseHealth(supabase),
      checkRedisHealth(),
      checkOpenAIHealth(),
      checkElevenLabsHealth(),
      checkStorageHealth(),
      checkQueueHealth()
    ]);

    const [database, redis, openai, elevenlabs, storage, queue] = healthChecks;

    const systemHealth = {
      database: database.status === 'fulfilled' ? database.value : {
        status: 'error' as const,
        response_time: 0,
        connection_count: 0,
        max_connections: 100,
        last_check: new Date().toISOString(),
        error: database.status === 'rejected' ? database.reason : 'Unknown error'
      },
      redis: redis.status === 'fulfilled' ? redis.value : {
        status: 'error' as const,
        memory_usage: 0,
        max_memory: 1024,
        connected_clients: 0,
        last_check: new Date().toISOString(),
        error: redis.status === 'rejected' ? redis.reason : 'Unknown error'
      },
      ai_services: {
        openai: openai.status === 'fulfilled' ? openai.value : {
          status: 'error' as const,
          response_time: 0,
          rate_limit_remaining: 0,
          last_check: new Date().toISOString(),
          error: openai.status === 'rejected' ? openai.reason : 'Unknown error'
        },
        elevenlabs: elevenlabs.status === 'fulfilled' ? elevenlabs.value : {
          status: 'error' as const,
          response_time: 0,
          rate_limit_remaining: 0,
          last_check: new Date().toISOString(),
          error: elevenlabs.status === 'rejected' ? elevenlabs.reason : 'Unknown error'
        }
      },
      storage: storage.status === 'fulfilled' ? storage.value : {
        status: 'error' as const,
        used_space: 0,
        total_space: 10,
        last_check: new Date().toISOString(),
        error: storage.status === 'rejected' ? storage.reason : 'Unknown error'
      },
      queue_system: queue.status === 'fulfilled' ? queue.value : {
        status: 'error' as const,
        active_jobs: 0,
        waiting_jobs: 0,
        failed_jobs: 0,
        completed_jobs_24h: 0,
        last_check: new Date().toISOString(),
        error: queue.status === 'rejected' ? queue.reason : 'Unknown error'
      }
    };

    // Log health check
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_user_id: session.user.id,
        action: 'system_health_checked',
        entity_type: 'system',
        changes: { health_status: systemHealth },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    return NextResponse.json(systemHealth);

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}

async function checkDatabaseHealth(supabase: any) {
  const startTime = Date.now();
  
  try {
    // Simple query to test database connectivity
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'error' as const,
        response_time: responseTime,
        connection_count: 0,
        max_connections: 100,
        last_check: new Date().toISOString(),
        error: error.message
      };
    }

    // Mock connection count (would typically come from database monitoring)
    const connectionCount = Math.floor(Math.random() * 20) + 5;
    
    return {
      status: responseTime < 100 ? 'healthy' as const : 
              responseTime < 500 ? 'warning' as const : 'error' as const,
      response_time: responseTime,
      connection_count: connectionCount,
      max_connections: 100,
      last_check: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error' as const,
      response_time: Date.now() - startTime,
      connection_count: 0,
      max_connections: 100,
      last_check: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkRedisHealth() {
  // Mock Redis health check
  // In production, you would use your Redis client here
  const mockResponseTime = Math.floor(Math.random() * 50) + 10;
  const mockMemoryUsage = Math.floor(Math.random() * 200) + 100;
  const mockClients = Math.floor(Math.random() * 15) + 3;
  
  return {
    status: mockResponseTime < 30 ? 'healthy' as const : 
            mockResponseTime < 100 ? 'warning' as const : 'error' as const,
    memory_usage: mockMemoryUsage,
    max_memory: 1024,
    connected_clients: mockClients,
    last_check: new Date().toISOString()
  };
}

async function checkOpenAIHealth() {
  // Mock OpenAI health check
  // In production, you would make a test API call to OpenAI
  const mockResponseTime = Math.floor(Math.random() * 1000) + 500;
  const mockRateLimit = Math.floor(Math.random() * 5000) + 5000;
  
  return {
    status: mockResponseTime < 800 ? 'healthy' as const : 
            mockResponseTime < 1500 ? 'warning' as const : 'error' as const,
    response_time: mockResponseTime,
    rate_limit_remaining: mockRateLimit,
    last_check: new Date().toISOString()
  };
}

async function checkElevenLabsHealth() {
  // Mock ElevenLabs health check
  const mockResponseTime = Math.floor(Math.random() * 1500) + 800;
  const mockRateLimit = Math.floor(Math.random() * 1000) + 200;
  
  return {
    status: mockResponseTime < 1000 ? 'healthy' as const : 
            mockResponseTime < 2000 ? 'warning' as const : 'error' as const,
    response_time: mockResponseTime,
    rate_limit_remaining: mockRateLimit,
    last_check: new Date().toISOString()
  };
}

async function checkStorageHealth() {
  // Mock storage health check
  // In production, you would check S3 or your storage service
  const mockUsedSpace = Math.floor(Math.random() * 3) + 1;
  
  return {
    status: 'healthy' as const,
    used_space: mockUsedSpace,
    total_space: 10,
    last_check: new Date().toISOString()
  };
}

async function checkQueueHealth() {
  // Mock queue system health check
  // In production, you would check BullMQ/Redis queue status
  const mockActiveJobs = Math.floor(Math.random() * 10);
  const mockWaitingJobs = Math.floor(Math.random() * 20);
  const mockFailedJobs = Math.floor(Math.random() * 5);
  const mockCompletedJobs = Math.floor(Math.random() * 500) + 100;
  
  return {
    status: mockFailedJobs < 5 ? 'healthy' as const : 
            mockFailedJobs < 10 ? 'warning' as const : 'error' as const,
    active_jobs: mockActiveJobs,
    waiting_jobs: mockWaitingJobs,
    failed_jobs: mockFailedJobs,
    completed_jobs_24h: mockCompletedJobs,
    last_check: new Date().toISOString()
  };
}
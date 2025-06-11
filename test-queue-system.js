/**
 * Simple test script for Redis/Queue system
 * This demonstrates how the job processing works with and without Redis
 */

async function testQueueSystem() {
  console.log('🧪 Testing GemsAI Queue System');
  console.log('================================\n');

  try {
    // Test API endpoints
    const baseUrl = 'http://localhost:3001';
    
    console.log('📊 Checking queue health...');
    const healthResponse = await fetch(`${baseUrl}/queue/health`);
    const health = await healthResponse.json();
    
    console.log('Queue Health Status:', health.redisEnabled ? '🟢 Redis Enabled' : '🟡 In-Memory Mode');
    console.log('Redis Available:', health.redisAvailable ? '✅ Connected' : '❌ Not Available');
    console.log('\nQueue Stats:');
    
    Object.entries(health.queues).forEach(([type, stats]) => {
      if (stats) {
        console.log(`  ${type}:`, stats);
      }
    });

    console.log('\n📈 Getting dashboard data...');
    const dashboardResponse = await fetch(`${baseUrl}/queue/dashboard`);
    const dashboard = await dashboardResponse.json();
    
    console.log('Dashboard Summary:', dashboard.summary);
    console.log('Job Types Available:', dashboard.jobTypes);

    console.log('\n✅ Queue system is working!');
    console.log('\n🔄 To enable Redis:');
    console.log('1. Set REDIS_ENABLED=true in your .env.local');
    console.log('2. Install Redis: sudo apt install redis-server');
    console.log('3. Start Redis: sudo systemctl start redis-server');
    console.log('4. Restart your application');

  } catch (error) {
    console.error('❌ Error testing queue system:', error.message);
    console.log('\n💡 Make sure your application is running on port 3001');
    console.log('   npm run dev');
  }
}

// Run if called directly
if (require.main === module) {
  testQueueSystem();
}

module.exports = { testQueueSystem }; 
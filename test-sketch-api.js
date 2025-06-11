#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');

console.log('🎨 Testing AI Sketch Generation API Endpoints');
console.log('===============================================\n');

const BASE_URL = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            error: 'Failed to parse JSON'
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEndpoints() {
  console.log('1. Testing Health Check...');
  try {
    const health = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${health.status}`);
    if (health.status === 200) {
      console.log('   ✅ Server is responding');
    } else {
      console.log('   ⚠️  Server responded with error:', health.data);
    }
  } catch (error) {
    console.log('   ❌ Server not accessible:', error.message);
  }

  console.log('\n2. Testing Sketch Generation Endpoint...');
  try {
    const generatePayload = {
      storyText: "A brave knight rescues a princess from a dragon in a medieval castle",
      emotionTags: ["courage", "adventure", "fantasy"],
      style: "cartoon",
      variants: 3,
      additionalContext: "Child-friendly illustration style"
    };

    const result = await makeRequest('POST', '/api/sketches/generate', generatePayload);
    console.log(`   Status: ${result.status}`);
    
    if (result.status === 201 || result.status === 200) {
      console.log('   ✅ Sketch generation endpoint working');
      console.log('   📋 Response:', JSON.stringify(result.data, null, 2));
      
      // If we got a job ID, test the status endpoint
      if (result.data && result.data.jobId) {
        console.log('\n3. Testing Job Status Endpoint...');
        const statusResult = await makeRequest('GET', `/api/sketches/generate/${result.data.jobId}/status`);
        console.log(`   Status: ${statusResult.status}`);
        console.log('   📋 Job Status:', JSON.stringify(statusResult.data, null, 2));
      }
    } else {
      console.log('   ❌ Error:', result.data);
    }
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  console.log('\n4. Testing Queue Monitoring Endpoints...');
  try {
    const monitorResult = await makeRequest('GET', '/api/queue/sketches/stats');
    console.log(`   Queue Stats Status: ${monitorResult.status}`);
    if (monitorResult.status === 200) {
      console.log('   ✅ Queue monitoring working');
      console.log('   📊 Stats:', JSON.stringify(monitorResult.data, null, 2));
    } else {
      console.log('   ⚠️  Queue monitoring error:', monitorResult.data);
    }
  } catch (error) {
    console.log('   ❌ Queue monitoring failed:', error.message);
  }

  console.log('\n🎯 API Testing Complete!');
  console.log('=========================');
}

// Check environment first
console.log('📋 Environment Check:');
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const hasOpenAI = envContent.includes('OPENAI_API_KEY=sk-');
  console.log(`   OpenAI API Key: ${hasOpenAI ? '✅ Configured' : '❌ Missing'}`);
} catch (error) {
  console.log('   ❌ Could not read .env.local');
}

console.log('   🚀 Server URL:', BASE_URL);
console.log('');

// Run tests
testEndpoints().catch(console.error); 
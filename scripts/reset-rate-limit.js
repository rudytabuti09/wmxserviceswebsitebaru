#!/usr/bin/env node

/**
 * Script untuk reset rate limit dalam mode development
 * Usage:
 *   node scripts/reset-rate-limit.js                    // Reset semua
 *   node scripts/reset-rate-limit.js payment            // Reset payment saja
 *   node scripts/reset-rate-limit.js payment 127.0.0.1  // Reset payment untuk IP tertentu
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function resetRateLimit(type, ip) {
  try {
    const url = new URL('/api/dev/reset-rate-limit', BASE_URL);
    if (type) url.searchParams.set('type', type);
    if (ip) url.searchParams.set('ip', ip);

    const requestModule = url.protocol === 'https:' ? https : http;
    
    const response = await new Promise((resolve, reject) => {
      const req = requestModule.request(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }, resolve);
      
      req.on('error', reject);
      req.end();
    });

    let data = '';
    response.on('data', chunk => data += chunk);
    
    await new Promise(resolve => response.on('end', resolve));
    const parsedData = JSON.parse(data);

    if (response.statusCode === 200) {
      console.log('✅ Rate limit reset successful:', parsedData.message);
      console.log('📊 Details:', {
        type: parsedData.type,
        ip: parsedData.ip,
        resetCount: parsedData.resetCount,
        timestamp: parsedData.timestamp,
      });
    } else {
      console.error('❌ Rate limit reset failed:', parsedData.error || `HTTP ${response.statusCode}`);
    }
  } catch (error) {
    console.error('❌ Error resetting rate limit:', error.message);
    console.error('💡 Make sure the development server is running on', BASE_URL);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const type = args[0]; // 'payment', 'auth', etc.
const ip = args[1]; // specific IP address

console.log('🔄 Resetting rate limit...');
console.log('🎯 Type:', type || 'all');
console.log('🌐 IP:', ip || 'all');
console.log('🔗 URL:', BASE_URL);

resetRateLimit(type, ip);

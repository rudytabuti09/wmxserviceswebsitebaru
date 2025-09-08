/**
 * Script to unblock localhost IP addresses and reset security monitoring
 * Run this script if localhost gets blocked during development
 */

import { unblockIP, getSecurityStats } from '../src/lib/security/monitoring';

async function unblockLocalhost() {
  console.log('🔧 Unblocking localhost IPs...');
  
  // Common localhost IP addresses
  const localhostIPs = [
    '127.0.0.1',
    '::1',
    'localhost',
    '0.0.0.0',
    '::',
  ];

  // Unblock all localhost IPs
  localhostIPs.forEach(ip => {
    try {
      unblockIP(ip);
      console.log(`✅ Unblocked ${ip}`);
    } catch (error) {
      console.log(`ℹ️  ${ip} was not blocked`);
    }
  });

  // Show current security stats
  const stats = getSecurityStats();
  console.log('\n📊 Current Security Stats:');
  console.log(`- Total Events: ${stats.totalEvents}`);
  console.log(`- Blocked IPs: ${stats.blockedIPs.length}`);
  console.log(`- Recent Events: ${stats.recentEvents.length}`);
  
  if (stats.blockedIPs.length > 0) {
    console.log('\n🚫 Still Blocked IPs:');
    stats.blockedIPs.forEach(ip => console.log(`  - ${ip}`));
  }

  console.log('\n✨ Done! Localhost should now be accessible.');
}

// Run the script
unblockLocalhost().catch(console.error);

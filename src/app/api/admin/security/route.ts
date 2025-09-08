import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getSecurityStats,
  getSecurityEvents,
  blockIP,
  unblockIP,
  SecurityEventType,
} from '@/lib/security/monitoring';

// GET - Get security statistics and events
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'stats':
        // Get overall security statistics
        const stats = getSecurityStats();
        return NextResponse.json(stats);

      case 'events':
        // Get security events with optional filters
        const type = url.searchParams.get('type') as SecurityEventType;
        const severity = url.searchParams.get('severity');
        const ip = url.searchParams.get('ip');
        const userId = url.searchParams.get('userId');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        const events = getSecurityEvents({
          type,
          severity,
          ip,
          userId,
          limit,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        });

        return NextResponse.json({ events });

      default:
        // Default: return both stats and recent events
        const defaultStats = getSecurityStats();
        return NextResponse.json(defaultStats);
    }
  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Security actions (block IP, etc.)
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ip, reason } = body;

    switch (action) {
      case 'blockIP':
        if (!ip) {
          return NextResponse.json(
            { error: 'IP address is required' },
            { status: 400 }
          );
        }

        blockIP(ip, reason || 'Manually blocked by admin');
        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been blocked`,
        });

      case 'unblockIP':
        if (!ip) {
          return NextResponse.json(
            { error: 'IP address is required' },
            { status: 400 }
          );
        }

        unblockIP(ip);
        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been unblocked`,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Security action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

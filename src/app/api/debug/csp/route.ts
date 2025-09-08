import { NextRequest, NextResponse } from 'next/server';
import { getCSPDirectives, buildCSPHeader, getPageCSPConfig } from '@/lib/security/csp';

export async function GET(request: NextRequest) {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Get base CSP directives
    const baseDirectives = getCSPDirectives(isDevelopment);
    
    // Get payment page specific CSP
    const paymentPageCSP = getPageCSPConfig('payment');
    
    // Merge payment page CSP with base directives
    const mergedDirectives = { ...baseDirectives, ...paymentPageCSP };
    
    // Build the actual CSP header
    const cspHeader = buildCSPHeader(mergedDirectives);
    
    return NextResponse.json({
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        isDevelopment,
        isProduction: process.env.NODE_ENV === 'production',
      },
      csp: {
        baseDirectives,
        paymentPageCSP,
        mergedDirectives,
        finalCSPHeader: cspHeader,
      },
      midtrans: {
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? 'SET' : 'NOT_SET',
        serverKey: process.env.MIDTRANS_SERVER_KEY ? 'SET' : 'NOT_SET',
        isProduction: process.env.MIDTRANS_IS_PRODUCTION,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('CSP Debug error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get CSP debug info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

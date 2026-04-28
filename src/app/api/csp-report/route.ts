/**
 * @fileoverview CSP Violation Report Handler (SEC-19).
 * Receives and logs Content Security Policy violation reports from browsers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/services/auditService';

interface CspReport {
  'csp-report': {
    'document-uri': string;
    'violated-directive': string;
    'blocked-uri': string;
    'source-file': string;
    'line-number': number;
    'column-number': number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CspReport;
    const report = body['csp-report'];

    if (!report) return new NextResponse(null, { status: 400 });

    // Log to audit trail for security analysis
    await AuditService.log('system', 'SECURITY.CSP_VIOLATION', {
      documentUri: report['document-uri'],
      violatedDirective: report['violated-directive'],
      blockedUri: report['blocked-uri'],
      sourceFile: report['source-file'],
      lineNumber: report['line-number'],
      timestamp: new Date().toISOString(),
    });

    console.warn('[CSP Violation]', {
      directive: report['violated-directive'],
      blocked: report['blocked-uri'],
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 }); // Always return 204 to browsers
  }
}

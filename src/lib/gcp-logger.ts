/**
 * GOOGLE-06: Google Cloud Structured Logging.
 * Formats application logs for high-fidelity ingestion into GCP Cloud Logging.
 */

type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export const gcpLog = (level: LogLevel, message: string, metadata: Record<string, any> = {}) => {
  const logEntry = {
    severity: level,
    message,
    timestamp: new Date().toISOString(),
    'logging.googleapis.com/labels': {
      service: 'civicflow-web',
      environment: process.env.NODE_ENV || 'development'
    },
    ...metadata
  };

  // In GCP environment, standard output is automatically collected
  console.log(JSON.stringify(logEntry));
};

export const logger = {
  info: (msg: string, meta?: any) => gcpLog('INFO', msg, meta),
  warn: (msg: string, meta?: any) => gcpLog('WARNING', msg, meta),
  error: (msg: string, meta?: any) => gcpLog('ERROR', msg, meta),
  critical: (msg: string, meta?: any) => gcpLog('CRITICAL', msg, meta),
};

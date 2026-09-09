import 'dotenv/config';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const assamApiTimeoutMs = Number.parseInt(process.env.ASSAM_API_TIMEOUT_MS ?? '10000', 10);
const assamMaxRetries = Number.parseInt(process.env.ASSAM_MAX_RETRIES ?? '2', 10);
const assamRetryBaseDelayMs = Number.parseInt(process.env.ASSAM_RETRY_BASE_DELAY_MS ?? '250', 10);
const assamStaleAfterMs = Number.parseInt(process.env.ASSAM_STALE_AFTER_MS ?? '86400000', 10);
const parseCorsOrigins = (rawValue) => {
  const configuredOrigins = rawValue
    ? rawValue.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  return configuredOrigins.length > 0
    ? [...new Set(configuredOrigins)]
    : ['http://localhost:5173', 'http://localhost:3000'];
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

if (!Number.isInteger(assamApiTimeoutMs) || assamApiTimeoutMs < 100 || assamApiTimeoutMs > 120000) {
  throw new Error('ASSAM_API_TIMEOUT_MS must be an integer between 100 and 120000');
}

if (!Number.isInteger(assamMaxRetries) || assamMaxRetries < 0 || assamMaxRetries > 5) {
  throw new Error('ASSAM_MAX_RETRIES must be an integer between 0 and 5');
}

if (!Number.isInteger(assamRetryBaseDelayMs) || assamRetryBaseDelayMs < 0 || assamRetryBaseDelayMs > 30000) {
  throw new Error('ASSAM_RETRY_BASE_DELAY_MS must be an integer between 0 and 30000');
}

if (!Number.isInteger(assamStaleAfterMs) || assamStaleAfterMs < 1000) {
  throw new Error('ASSAM_STALE_AFTER_MS must be an integer of at least 1000');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN),
  assamBhuNakshaBaseUrl: process.env.ASSAM_BHUNAKSHA_BASE_URL ?? 'https://bhunaksha.assam.gov.in/bhunakshaBackEnd',
  assamApiTimeoutMs,
  assamMaxRetries,
  assamRetryBaseDelayMs,
  assamStaleAfterMs,
  assamStateCode: process.env.ASSAM_STATE_CODE ?? 'AS',
  assamDefaultDistrictCode: process.env.ASSAM_DEFAULT_DISTRICT_CODE ?? 'AS-KM',
  jwtSecret: process.env.JWT_SECRET ?? 'bhoomisetu-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h'
};

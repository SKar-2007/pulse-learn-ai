export function logError(error, context = {}) {
  const message = error?.message || 'Unknown error';
  const code = error?.code || error?.status || 'ERR_UNKNOWN';
  console.error('[PulseLearn][ERROR]', message, { code, ...context });
  if (process.env.NODE_ENV === 'development' && error?.stack) {
    console.error(error.stack);
  }
}

export function logInfo(message, context = {}) {
  console.info('[PulseLearn][INFO]', message, context);
}

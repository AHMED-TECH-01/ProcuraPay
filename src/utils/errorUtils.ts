/**
 * Sanitizes technical system or network error messages so that raw parser
 * tracebacks (e.g. JSON SyntaxErrors, HTML proxy errors) are never displayed on the UI.
 */
export function sanitizeErrorMessage(
  err: unknown,
  fallbackMessage = 'Invalid email or password. Please try again.'
): string {
  if (!err) return fallbackMessage;

  const raw =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
      ? err
      : typeof (err as any)?.error === 'string'
      ? (err as any).error
      : '';

  if (!raw) return fallbackMessage;

  // Catch JSON parsing errors, HTML proxy / Cloud Run error snippets
  const lower = raw.toLowerCase();
  if (
    lower.includes('unexpected token') ||
    lower.includes('is not valid json') ||
    lower.includes('the page c') ||
    lower.includes('<!doctype') ||
    lower.includes('syntaxerror') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('bad gateway') ||
    lower.includes('service unavailable')
  ) {
    return 'Unable to reach authentication service. Please check your connection and try again.';
  }

  return raw;
}

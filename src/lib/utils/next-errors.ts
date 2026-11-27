// Next.js の redirect() が投げるエラーかどうか。握りつぶさずに投げ直すために使う
export function isNextRedirectError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof err.digest === 'string' &&
    err.digest.startsWith('NEXT_REDIRECT')
  );
}

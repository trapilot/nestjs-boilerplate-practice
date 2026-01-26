export function getErrorMsg(err: unknown, defaultMsg?: string) {
  return err instanceof Error ? err.message : (defaultMsg ?? 'Unknown error')
}

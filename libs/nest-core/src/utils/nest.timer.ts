export class NestTimer {
  static ms(val: number | string): number {
    if (`${val}`.length > 0) {
      return NestTimer.parse(val)
    }
    throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
  }

  static seconds(val: number | string) {
    if (`${val}`.length > 0) {
      return NestTimer.parse(val) / 1000
    }
    throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
  }

  static format(val: number, options: { long: boolean }) {
    if (isFinite(Number(val))) {
      return options.long ? NestTimer.fmtLong(val) : NestTimer.fmtShort(val)
    }
    throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
  }

  private static parse(str: string | number): number {
    str = String(str)
    if (str.length > 100) {
      return
    }
    var match =
      /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str,
      )
    if (!match) {
      return
    }
    var n = parseFloat(match[1])
    var type = (match[2] || 'ms').toLowerCase()
    switch (type) {
      case 'years':
      case 'year':
      case 'yrs':
      case 'yr':
      case 'y':
        return n * 31_536_000_000
      case 'weeks':
      case 'week':
      case 'w':
        return n * 604_800_000
      case 'days':
      case 'day':
      case 'd':
        return n * 86_400_000
      case 'hours':
      case 'hour':
      case 'hrs':
      case 'hr':
      case 'h':
        return n * 3_600_000
      case 'minutes':
      case 'minute':
      case 'mins':
      case 'min':
      case 'm':
        return n * 60_000
      case 'seconds':
      case 'second':
      case 'secs':
      case 'sec':
      case 's':
        return n * 1_000
      case 'milliseconds':
      case 'millisecond':
      case 'msecs':
      case 'msec':
      case 'ms':
        return n
      default:
        return undefined
    }
  }

  private static fmtShort(ms: number): string {
    var msAbs = Math.abs(ms)
    if (msAbs >= 86_400_000) {
      return Math.round(ms / 86_400_000) + 'd'
    }
    if (msAbs >= 3_600_000) {
      return Math.round(ms / 3_600_000) + 'h'
    }
    if (msAbs >= 60_000) {
      return Math.round(ms / 60_000) + 'm'
    }
    if (msAbs >= 1_000) {
      return Math.round(ms / 1_000) + 's'
    }
    return ms + 'ms'
  }

  private static fmtLong(ms: number): string {
    var msAbs = Math.abs(ms)
    if (msAbs >= 86_400_000) {
      return NestTimer.plural(ms, msAbs, 86_400_000, 'day')
    }
    if (msAbs >= 3_600_000) {
      return NestTimer.plural(ms, msAbs, 3_600_000, 'hour')
    }
    if (msAbs >= 60_000) {
      return NestTimer.plural(ms, msAbs, 60_000, 'minute')
    }
    if (msAbs >= 1_000) {
      return NestTimer.plural(ms, msAbs, 1_000, 'second')
    }
    return ms + ' ms'
  }

  private static plural(ms: number, msAbs: number, n: number, name: string): string {
    const isPlural = msAbs >= n * 1.5
    return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '')
  }
}

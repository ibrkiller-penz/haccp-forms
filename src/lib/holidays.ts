/** 국내 공휴일 (2025~2028). 음력 명절·대체공휴일은 연도별 고정표 */
const FIXED: [number, number, string][] = [
  [1, 1, '신정'], [3, 1, '삼일절'], [5, 5, '어린이날'], [6, 6, '현충일'],
  [8, 15, '광복절'], [10, 3, '개천절'], [10, 9, '한글날'], [12, 25, '성탄절'],
]

const BY_YEAR: Record<number, [string, string][]> = {
  2025: [
    ['01-27', '임시공휴일'], ['01-28', '설날 연휴'], ['01-29', '설날'], ['01-30', '설날 연휴'],
    ['03-03', '대체공휴일(삼일절)'], ['05-06', '대체공휴일(어린이날)'], ['06-03', '대통령선거'],
    ['10-06', '추석'], ['10-07', '추석 연휴'], ['10-08', '대체공휴일(추석)'],
  ],
  2026: [
    ['02-16', '설날 연휴'], ['02-17', '설날'], ['02-18', '설날 연휴'],
    ['03-02', '대체공휴일(삼일절)'], ['05-24', '부처님오신날'], ['05-25', '대체공휴일(부처님오신날)'],
    ['06-03', '지방선거'], ['08-17', '대체공휴일(광복절)'],
    ['09-24', '추석 연휴'], ['09-25', '추석'], ['09-26', '추석 연휴'], ['10-05', '대체공휴일(개천절)'],
  ],
  2027: [
    ['02-06', '설날 연휴'], ['02-07', '설날'], ['02-08', '설날 연휴'], ['02-09', '대체공휴일(설날)'],
    ['05-13', '부처님오신날'], ['09-14', '추석 연휴'], ['09-15', '추석'], ['09-16', '추석 연휴'],
    ['10-04', '대체공휴일(개천절)'], ['10-11', '대체공휴일(한글날)'], ['12-27', '대체공휴일(성탄절)'],
  ],
  2028: [
    ['01-26', '설날 연휴'], ['01-27', '설날'], ['01-28', '설날 연휴'],
    ['05-02', '부처님오신날'], ['10-02', '추석 연휴'], ['10-03', '추석'], ['10-04', '추석 연휴'], ['10-05', '대체공휴일(개천절)'],
  ],
}

const pad = (n: number) => String(n).padStart(2, '0')

export function publicHoliday(dateStr: string): string | null {
  const [y, m, d] = dateStr.split('-').map(Number)
  const fixed = FIXED.find(([mm, dd]) => mm === m && dd === d)
  if (fixed) return fixed[2]
  const extra = BY_YEAR[y]?.find(([md]) => md === `${pad(m)}-${pad(d)}`)
  return extra ? extra[1] : null
}

/** 기간 내 공휴일 목록 (주말 제외) */
export function publicHolidaysBetween(from: string, to: string): { date: string; name: string }[] {
  const out: { date: string; name: string }[] = []
  const cur = new Date(from)
  const end = new Date(to)
  while (cur <= end) {
    const ds = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`
    const dow = cur.getDay()
    if (dow !== 0 && dow !== 6) {
      const name = publicHoliday(ds)
      if (name) out.push({ date: ds, name })
    }
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

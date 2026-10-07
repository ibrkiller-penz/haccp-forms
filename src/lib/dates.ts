export const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토']
export const WEEKDAYS_KO = ['월', '화', '수', '목', '금']

export const pad = (n: number) => String(n).padStart(2, '0')

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function toMonday(d: Date): Date {
  const dow = d.getDay()
  return addDays(d, dow === 0 ? -6 : 1 - dow)
}

/** 2026. 10. 06. */
export function fmtDot(d: Date): string {
  return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}.`
}

/** 10/06 */
export function fmtMD(d: Date): string {
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}

/** 월~금 Date 배열 */
export function weekDays(monday: Date): Date[] {
  return WEEKDAYS_KO.map((_, i) => addDays(monday, i))
}

/** "2026. 10. 06. ~ 2026. 10. 10." */
export function fmtWeekPeriod(monday: Date): string {
  return `${fmtDot(monday)} ~ ${fmtDot(addDays(monday, 4))}`
}

export function dayKo(d: Date): string {
  return DAYS_KO[d.getDay()]
}

/** 평일 기준 다음 날 (금 → 월) */
export function nextWeekday(d: Date): Date {
  let r = addDays(d, 1)
  while (r.getDay() === 0 || r.getDay() === 6) r = addDays(r, 1)
  return r
}

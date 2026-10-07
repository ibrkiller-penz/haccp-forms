// 나이스(NEIS) 교육정보 개방 포털 — 학교 검색 · 학사일정 조회
// 급식당번(10_급식배정시스템) 구현을 TS로 이식. API 키 없이도 동작(7일 단위 분할 조회).
import type { CalEvent, CalEventType, SchoolInfo } from '../store/settings'

export const OFFICES: { code: string; name: string }[] = [
  { code: 'B10', name: '서울' }, { code: 'C10', name: '부산' }, { code: 'D10', name: '대구' },
  { code: 'E10', name: '인천' }, { code: 'F10', name: '광주' }, { code: 'G10', name: '대전' },
  { code: 'H10', name: '울산' }, { code: 'I10', name: '세종' }, { code: 'J10', name: '경기' },
  { code: 'K10', name: '강원' }, { code: 'M10', name: '충북' }, { code: 'N10', name: '충남' },
  { code: 'P10', name: '전북' }, { code: 'Q10', name: '전남' }, { code: 'R10', name: '경북' },
  { code: 'S10', name: '경남' }, { code: 'T10', name: '제주' },
]

const BASE = 'https://open.neis.go.kr/hub'

export interface SchoolHit extends SchoolInfo {
  kind: string      // 초등학교/중학교/고등학교
  address: string
}

interface NeisRow { [k: string]: string }

async function neisGet(path: string, params: Record<string, string>): Promise<NeisRow[]> {
  const q = new URLSearchParams({ Type: 'json', ...params })
  const res = await fetch(`${BASE}/${path}?${q}`)
  if (!res.ok) throw new Error(`NEIS ${res.status}`)
  const json = await res.json()
  const root = json[path]
  if (!root) {
    const code: string = json?.RESULT?.CODE ?? ''
    if (code === 'INFO-200') return []   // 데이터 없음
    throw new Error(json?.RESULT?.MESSAGE ?? 'NEIS 응답 오류')
  }
  return root[1]?.row ?? []
}

export async function searchSchools(name: string, ofcdcCode?: string, apiKey?: string): Promise<SchoolHit[]> {
  const params: Record<string, string> = { SCHUL_NM: name.trim(), pSize: '100' }
  if (ofcdcCode) params.ATPT_OFCDC_SC_CODE = ofcdcCode
  if (apiKey) params.KEY = apiKey
  const rows = await neisGet('schoolInfo', params)
  return rows.map((r) => ({
    name: r.SCHUL_NM,
    ofcdcCode: r.ATPT_OFCDC_SC_CODE,
    schulCode: r.SD_SCHUL_CODE,
    kind: r.SCHUL_KND_SC_NM,
    address: r.ORG_RDNMA,
  }))
}

const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }

async function fetchWindow(school: SchoolInfo, from: Date, to: Date, apiKey: string | undefined, depth: number): Promise<NeisRow[]> {
  const params: Record<string, string> = {
    ATPT_OFCDC_SC_CODE: school.ofcdcCode,
    SD_SCHUL_CODE: school.schulCode,
    AA_FROM_YMD: ymd(from),
    AA_TO_YMD: ymd(to),
  }
  if (apiKey) { params.KEY = apiKey; params.pSize = '1000' }
  const rows = await neisGet('SchoolSchedule', params)
  // 키 없는 모드는 5건까지만 반환 → 결과가 5건 이상이면 반으로 쪼개 재조회
  if (!apiKey && rows.length >= 5 && depth < 5 && to > from) {
    const mid = addDays(from, Math.floor((to.getTime() - from.getTime()) / 86400000 / 2))
    const [a, b] = await Promise.all([
      fetchWindow(school, from, mid, apiKey, depth + 1),
      fetchWindow(school, addDays(mid, 1), to, apiKey, depth + 1),
    ])
    return [...a, ...b]
  }
  return rows
}

function classify(name: string, subType: string): CalEventType {
  const n = name
  if (/휴업|공휴일/.test(subType) || /휴업|방학|개교기념일|공휴일|대체휴일|휴일/.test(n)) return '휴업'
  if (/지필|중간고사|기말고사|수능|모의고사|학력평가|평가/.test(n)) return '시험'
  if (/체험|수련|수학여행|축제|행사|입학식|졸업식|개학|종업/.test(n)) return '행사'
  return '기타'
}

export async function fetchSchedule(
  school: SchoolInfo,
  from: string,
  to: string,
  apiKey?: string,
  onProgress?: (done: number, total: number) => void,
): Promise<CalEvent[]> {
  const start = new Date(from)
  const end = new Date(to)
  let rows: NeisRow[] = []
  if (apiKey) {
    rows = await fetchWindow(school, start, end, apiKey, 0)
  } else {
    const windows: [Date, Date][] = []
    for (let cur = start; cur <= end; cur = addDays(cur, 7)) {
      windows.push([cur, addDays(cur, 6) > end ? end : addDays(cur, 6)])
    }
    let done = 0
    // 동시 요청 4개씩
    for (let i = 0; i < windows.length; i += 4) {
      const chunk = windows.slice(i, i + 4)
      const results = await Promise.all(chunk.map(([a, b]) => fetchWindow(school, a, b, undefined, 0)))
      results.forEach((r) => { rows = rows.concat(r) })
      done += chunk.length
      onProgress?.(done, windows.length)
    }
  }

  const seen = new Set<string>()
  const events: CalEvent[] = []
  for (const r of rows) {
    const d = r.AA_YMD
    const name = (r.EVENT_NM ?? '').trim()
    if (!d || !name) continue
    const key = `${d}|${name}`
    if (seen.has(key)) continue
    seen.add(key)
    // 서식은 월~금만 다루므로 주말 일정은 제외
    const dow = new Date(Number(d.slice(0, 4)), Number(d.slice(4, 6)) - 1, Number(d.slice(6, 8))).getDay()
    if (dow === 0 || dow === 6) continue
    events.push({
      date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
      name,
      type: classify(name, r.SBTR_DD_SC_NM ?? ''),
    })
  }
  events.sort((a, b) => a.date.localeCompare(b.date))
  return events
}

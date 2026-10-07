import { useSyncExternalStore } from 'react'

export type KitchenType = 'A' | 'B'            // A: 장소 구분 가능(CCP1A), B: 불가(CCP1B)
export type ServingType = 'A' | 'B' | 'C'      // CCP2A 식당 / CCP2B 교실 / CCP2C 공동조리
export type DishwasherType = 'A' | 'B' | 'C'   // CP2A 소독 불가 / CP2B 소독 가능 / CP2C 없음

export interface SchoolType {
  kitchen: KitchenType
  serving: ServingType
  dishwasher: DishwasherType
}

export interface RoleNames {
  checker: string   // 점검자·검수자
  writer: string    // 작성자
  confirmer: string // 확인자
}

export interface SchoolInfo {
  name: string
  ofcdcCode: string   // ATPT_OFCDC_SC_CODE
  schulCode: string   // SD_SCHUL_CODE
}

export type CalEventType = '휴업' | '시험' | '행사' | '기타'

export interface CalEvent {
  date: string        // YYYY-MM-DD
  name: string
  type: CalEventType
}

export interface TermCalendar {
  year: number
  termName: string
  from: string        // YYYY-MM-DD
  to: string
  events: CalEvent[]
  syncedAt?: string
}

export interface Settings {
  schoolName: string
  school: SchoolInfo | null
  neisKey: string
  names: string[]
  defaultNames: RoleNames
  schoolType: SchoolType | null
  calendar: TermCalendar | null
  favorites: number[]
  recent: number[]
  cleaningItems: { daily: string[]; weekly: string[] } | null
}

const KEY = 'haccp-forms:settings'
const SCHEMA_VERSION = 2

const DEFAULTS: Settings = {
  schoolName: '',
  school: null,
  neisKey: '',
  names: [],
  defaultNames: { checker: '', writer: '', confirmer: '' },
  schoolType: null,
  calendar: null,
  favorites: [],
  recent: [],
  cleaningItems: null,
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULTS, ...parsed.data }
  } catch {
    return { ...DEFAULTS }
  }
}

let state: Settings = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: SCHEMA_VERSION, data: state }))
  } catch {
    // 저장 공간 부족 등 — 화면 상태는 유지
  }
}

function emit() {
  listeners.forEach((l) => l())
}

export function getSettings(): Settings {
  return state
}

export function updateSettings(patch: Partial<Settings> | ((prev: Settings) => Partial<Settings>)) {
  const p = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...p }
  persist()
  emit()
}

export function clearAllData() {
  localStorage.removeItem(KEY)
  state = { ...DEFAULTS }
  emit()
}

export function exportJSON(): string {
  return JSON.stringify({ version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data: state }, null, 2)
}

export function importJSON(text: string): void {
  const parsed = JSON.parse(text)
  const data = parsed?.data
  if (!data || typeof data !== 'object') throw new Error('올바른 백업 파일이 아닙니다.')
  state = { ...DEFAULTS, ...data }
  persist()
  emit()
}

export function toggleFavorite(id: number) {
  updateSettings((s) => ({
    favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
  }))
}

export function pushRecent(id: number) {
  updateSettings((s) => ({ recent: [id, ...s.recent.filter((r) => r !== id)].slice(0, 5) }))
}

/** 휴업일 맵 (YYYY-MM-DD → 명칭) */
export function holidayMap(s: Settings): Record<string, string> {
  const m: Record<string, string> = {}
  s.calendar?.events.forEach((e) => { if (e.type === '휴업') m[e.date] = e.name })
  return m
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => state,
  )
}

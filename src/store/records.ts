// 서식 입력값 자동 저장 (localStorage). 키 = 서식 id + 날짜
import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

const PREFIX = 'haccp-forms:rec:'

export interface RecordMeta {
  key: string
  formId: number
  date: string      // YYYY-MM-DD 또는 'nodate'
  savedAt: string
}

interface RecordFile extends RecordMeta {
  slots: Record<string, unknown>
}

export const recordKey = (formId: number, date: Date | null) =>
  `${formId}:${date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : 'nodate'}`

function read(key: string): RecordFile | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as RecordFile) : null
  } catch {
    return null
  }
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function writeSlot(key: string, slot: string, value: unknown) {
  const [formId, date] = key.split(':')
  const cur = read(key) ?? { key, formId: Number(formId), date, savedAt: '', slots: {} }
  cur.slots[slot] = value
  cur.savedAt = new Date().toISOString()
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(cur))
    emit()
  } catch {
    // 용량 초과 등
  }
}

export function listRecords(): RecordMeta[] {
  const out: RecordMeta[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k?.startsWith(PREFIX)) continue
    const r = read(k.slice(PREFIX.length))
    if (r) out.push({ key: r.key, formId: r.formId, date: r.date, savedAt: r.savedAt })
  }
  return out.sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export function getRecordMeta(key: string): RecordMeta | null {
  const r = read(key)
  return r ? { key: r.key, formId: r.formId, date: r.date, savedAt: r.savedAt } : null
}

export function deleteRecord(key: string) {
  localStorage.removeItem(PREFIX + key)
  emit()
}

export function clearRecords() {
  listRecords().forEach((r) => localStorage.removeItem(PREFIX + r.key))
  emit()
}

export function exportRecords(): string {
  const files = listRecords().map((m) => read(m.key)).filter((r): r is RecordFile => !!r)
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records: files }, null, 2)
}

export function importRecords(text: string): number {
  const parsed = JSON.parse(text)
  const files: RecordFile[] = parsed?.records
  if (!Array.isArray(files)) throw new Error('올바른 기록 파일이 아닙니다.')
  files.forEach((f) => { if (f.key && f.slots) localStorage.setItem(PREFIX + f.key, JSON.stringify(f)) })
  emit()
  return files.length
}

export function useRecordList(): RecordMeta[] {
  const [list, setList] = useState<RecordMeta[]>(listRecords)
  useEffect(() => {
    const cb = () => setList(listRecords())
    listeners.add(cb)
    return () => { listeners.delete(cb) }
  }, [])
  return list
}

export function useRecordMeta(key: string | null): RecordMeta | null {
  const [meta, setMeta] = useState<RecordMeta | null>(() => (key ? getRecordMeta(key) : null))
  useEffect(() => {
    const cb = () => setMeta(key ? getRecordMeta(key) : null)
    cb()
    listeners.add(cb)
    return () => { listeners.delete(cb) }
  }, [key])
  return meta
}

/** 서식 컴포넌트에 저장 키를 내려주는 컨텍스트. null이면 저장 안 함(미리보기 전용) */
export const RecordContext = createContext<string | null>(null)

/** useState 대체: 슬롯 단위로 자동 저장·복원 */
export function useRecordState<T>(slot: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const key = useContext(RecordContext)
  const init = () => (typeof initial === 'function' ? (initial as () => T)() : initial)
  const load = (k: string | null): T => {
    if (!k) return init()
    const r = read(k)
    return r && slot in r.slots ? (r.slots[slot] as T) : init()
  }
  const [value, setValue] = useState<T>(() => load(key))
  const keyRef = useRef(key)
  const skipSave = useRef(true)

  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key
      skipSave.current = true
      setValue(load(key))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (skipSave.current) { skipSave.current = false; return }
    if (key) writeSlot(key, slot, value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return [value, setValue]
}

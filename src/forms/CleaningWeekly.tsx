import { useEffect, useMemo, useState } from 'react'
import SignLine from '../components/SignLine'
import CheckboxChar from '../components/CheckboxChar'
import type { FormProps } from './types'
import { toKey } from './types'
import { WEEKDAYS_KO, weekDays, fmtWeekPeriod, fmtMD } from '../lib/dates'
import { getSettings, updateSettings } from '../store/settings'
import '../print.css'
import './CleaningWeekly.css'

// 지침서 51쪽 <표 10> 원본 항목. "※ 학교 실정을 고려하여 조정 가능"
export const DAILY_ITEMS_DEFAULT = [
  '취사기', '국솥', '조림솥·튀김솥', '식판', '검수대·작업대', '분쇄기', '세정대', '무침기', '절단기',
  '도마·칼', '오프너·믹서기', '밥통·찬통·국통', '밥판', '세미기', '배식용바구니', '운반차·배식차',
  '식기세척기', '냉장냉동고(실)', '가스렌지·오븐', '식재료보관실', '배식기기류', '주방 및 식생활교육관',
  '벽 및 바닥', '배수구·트랜치', '그리스트랩', '화장실·전용손세척대',
]
export const WEEKLY_ITEMS_DEFAULT = ['배기후드', '유리창·방충망', '전기소독고', '조명·환기시설', '보일러실', '휴게실']

interface Row {
  label: string
  checked: boolean[]
  assignee: string
  action: string
}

const makeRows = (labels: string[]): Row[] =>
  labels.map((label) => ({ label, checked: [false, false, false, false, false], assignee: '', action: '' }))

export default function CleaningWeekly({ date, grayscale, names, holidays }: FormProps) {
  const saved = getSettings().cleaningItems
  const [checker, setChecker] = useState(names?.checker ?? '')
  const [daily, setDaily] = useState<Row[]>(makeRows(saved?.daily ?? DAILY_ITEMS_DEFAULT))
  const [weekly, setWeekly] = useState<Row[]>(makeRows(saved?.weekly ?? WEEKLY_ITEMS_DEFAULT))
  const [editing, setEditing] = useState(false)

  useEffect(() => setChecker(names?.checker ?? ''), [names])

  const week = useMemo(() => (date ? weekDays(date) : null), [date])

  const toggle = (set: React.Dispatch<React.SetStateAction<Row[]>>, i: number, day: number) =>
    set((p) => p.map((r, idx) => (idx === i ? { ...r, checked: r.checked.map((c, d) => (d === day ? !c : c)) } : r)))
  const patch = (set: React.Dispatch<React.SetStateAction<Row[]>>, i: number, p: Partial<Row>) =>
    set((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...p } : r)))
  const move = (set: React.Dispatch<React.SetStateAction<Row[]>>, i: number, dir: -1 | 1) =>
    set((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  const remove = (set: React.Dispatch<React.SetStateAction<Row[]>>, i: number) =>
    set((prev) => prev.filter((_, idx) => idx !== i))
  const add = (set: React.Dispatch<React.SetStateAction<Row[]>>) =>
    set((prev) => [...prev, { label: '새 항목', checked: [false, false, false, false, false], assignee: '', action: '' }])

  const finishEdit = () => {
    updateSettings({ cleaningItems: { daily: daily.map((r) => r.label), weekly: weekly.map((r) => r.label) } })
    setEditing(false)
  }
  const resetItems = () => {
    if (!confirm('청소 항목을 지침서 원본으로 되돌릴까요?')) return
    updateSettings({ cleaningItems: null })
    setDaily(makeRows(DAILY_ITEMS_DEFAULT))
    setWeekly(makeRows(WEEKLY_ITEMS_DEFAULT))
  }

  const COLS = 8 + (editing ? 1 : 0)

  const renderRows = (rows: Row[], set: React.Dispatch<React.SetStateAction<Row[]>>, section: string) =>
    rows.map((row, i) => (
      <tr key={i}>
        {i === 0 && (
          <td className="col-section section-cell" rowSpan={rows.length}>{section}</td>
        )}
        <td className="col-item item-cell">
          {editing ? (
            <input className="label-input" value={row.label} onChange={(e) => patch(set, i, { label: e.target.value })} />
          ) : row.label}
        </td>
        <td className="col-assignee">
          <input className="assignee-input" value={row.assignee} onChange={(e) => patch(set, i, { assignee: e.target.value })} />
        </td>
        {row.checked.map((chk, d) => (
          <td key={d} className="col-day check-cell">
            <button type="button" className="check-btn no-print" onClick={() => toggle(set, i, d)}>{chk ? '✓' : ''}</button>
            <CheckboxChar checked={chk} className="print-only" />
          </td>
        ))}
        <td className="col-action">
          <input className="action-input" value={row.action} onChange={(e) => patch(set, i, { action: e.target.value })} />
        </td>
        {editing && (
          <td className="col-edit no-print">
            <button type="button" className="mini-btn" onClick={() => move(set, i, -1)} title="위로">▲</button>
            <button type="button" className="mini-btn" onClick={() => move(set, i, 1)} title="아래로">▼</button>
            <button type="button" className="mini-btn danger" onClick={() => remove(set, i)} title="삭제">×</button>
          </td>
        )}
      </tr>
    ))

  return (
    <div className={`form-container cleaning-weekly${grayscale ? ' grayscale' : ''}`} data-printable>
      <div className="form-title">주(일)별 세척·청소 점검표</div>

      <div className="form-meta-row">
        <span>점검기간: <span className="meta-value">{date ? fmtWeekPeriod(date) : '20    .    .    . ~ 20    .    .    .'}</span></span>
        <span>점검자: <input className="meta-input" value={checker} onChange={(e) => setChecker(e.target.value)} /></span>
        <span className="no-print" style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {editing ? (
            <>
              <button type="button" className="btn-sm btn-primary" onClick={finishEdit}>편집 완료 (저장)</button>
              <button type="button" className="btn-sm" onClick={resetItems}>원본으로 되돌리기</button>
            </>
          ) : (
            <button type="button" className="btn-sm" onClick={() => setEditing(true)}>항목 편집</button>
          )}
        </span>
      </div>

      <table className="cleaning-table">
        <thead>
          <tr className="form-header-row">
            <th className="col-section">구<br />분</th>
            <th className="col-item">항 목</th>
            <th className="col-assignee">담당</th>
            {WEEKDAYS_KO.map((d, i) => {
              const day = week?.[i]
              const hol = day ? holidays[toKey(day)] : undefined
              return (
                <th key={d} className="col-day-hd">
                  {d}
                  {day && <><br /><span className="day-date">{fmtMD(day)}</span></>}
                  {hol && <><br /><span className="day-holiday">휴업</span></>}
                </th>
              )
            })}
            <th className="col-action">조치사항</th>
            {editing && <th className="col-edit no-print">편집</th>}
          </tr>
        </thead>
        <tbody>
          {renderRows(daily, setDaily, '일\n별')}
          {editing && (
            <tr className="no-print"><td colSpan={COLS} style={{ textAlign: 'center' }}>
              <button type="button" className="btn-sm" onClick={() => add(setDaily)}>+ 일별 항목 추가</button>
            </td></tr>
          )}
          {renderRows(weekly, setWeekly, '주\n별')}
          {editing && (
            <tr className="no-print"><td colSpan={COLS} style={{ textAlign: 'center' }}>
              <button type="button" className="btn-sm" onClick={() => add(setWeekly)}>+ 주별 항목 추가</button>
            </td></tr>
          )}
          <tr className="notice-row">
            <td colSpan={2} className="notice-label">청소 시 유의사항</td>
            <td colSpan={COLS - 2} className="notice-body">
              - 식기·조리도구용 고무장갑과 청소용 고무장갑은 구분 사용한다.<br />
              - 전열기구의 코드를 뽑거나 차단기를 내려 감전사고에 유의한다.<br />
              - 음식물이 청소오물에 오염되지 않도록 보호 조치 후 청소한다.
            </td>
          </tr>
        </tbody>
      </table>

      <div className="form-footnote">※ 학교 실정을 고려하여 조정 가능</div>

      <div className="form-sign-row">
        <SignLine role="점검자" name={checker} />
        <SignLine role="확인자(팀장 이상)" name={names?.confirmer} />
      </div>
    </div>
  )
}

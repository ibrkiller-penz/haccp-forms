import { useEffect } from 'react'
import { useRecordState } from '../store/records'
import type { RoleNames } from '../store/settings'
import { dayKo, fmtMD, pad } from '../lib/dates'
import DatePick from '../components/DatePick'
import './records-common.css'

export const MEAL_TYPES = ['조', '중', '석'] as const
export type MealType = (typeof MEAL_TYPES)[number]

export function RecordTitle({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <div className="record-title-wrap">
      <div className="line left" />
      <div className="record-title" style={small ? { fontSize: '0.85rem' } : undefined}>{children}</div>
      <div className="line right" />
    </div>
  )
}

/** 급식일자 : 20xx. xx. xx.( x요일)(조·중·석)식 */
export function MealDateHeader({ date, mealType, onMealType, onDateChange }: { date: Date | null; mealType: MealType; onMealType: (m: MealType) => void; onDateChange?: (d: Date) => void }) {
  const dateStr = date ? `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}.` : '20    .    .    .'
  const dow = date ? `(${dayKo(date)}요일)` : '(   요일)'
  return (
    <div className="record-header">
      급식일자 : <DatePick date={date} onChange={onDateChange}>{dateStr}{dow}</DatePick> (
      {MEAL_TYPES.map((t, i) => (
        <span key={t}>
          <button type="button" className={`meal-btn no-print${mealType === t ? ' on' : ''}`} onClick={() => onMealType(t)}>{t}</button>
          <span className={`print-only meal-print${mealType === t ? ' on' : ''}`}>{t}</span>
          {i < 2 && <span className="meal-dot">·</span>}
        </span>
      ))}
      )식
    </div>
  )
}

/** 점검기간 / 점검자 (주간 기록지) */
export function WeekHeader({ monday, checker, onChecker, onDateChange }: { monday: Date | null; checker: string; onChecker: (v: string) => void; onDateChange?: (d: Date) => void }) {
  const period = monday
    ? `${monday.getFullYear()}. ${fmtMD(monday).replace('/', '. ')}. ~ ${fmtMD(new Date(monday.getTime() + 4 * 86400000)).replace('/', '. ')}.`
    : '20    .    .    . ~    .    .'
  return (
    <div className="record-header">
      점검기간 : <DatePick date={monday} onChange={onDateChange}>{period}</DatePick>&nbsp;&nbsp; 점검자 : <input className="meta-input" value={checker} onChange={(e) => onChecker(e.target.value)} />
    </div>
  )
}

/** 확인자 서명 / 확인일자 */
export function ConfirmBlock({ names, paren }: { names: RoleNames | null; paren?: boolean }) {
  const [name, setName] = useRecordState('confirmName', names?.confirmer ?? '')
  const [d, setD] = useRecordState('confirmDate', '')
  useEffect(() => { if (names) setName(names.confirmer) }, [names])
  return (
    <div className="record-confirm">
      확인자{paren ? ' : (' : ' 서명 :'} <input className="confirm-input" value={name} onChange={(e) => setName(e.target.value)} />{paren ? ' )' : ''}<br />
      확인일자 : 20 <input className="confirm-input" style={{ width: 130 }} value={d} onChange={(e) => setD(e.target.value)} /> (   요일)
    </div>
  )
}

export function MgmtTable({ rows, head }: { rows: [string, React.ReactNode][]; head?: React.ReactNode }) {
  return (
    <table className="mgmt-box">
      {head}
      <tbody>
        {rows.map(([label, body]) => (
          <tr key={label}><td className="mgmt-label">{label}</td>{body}</tr>
        ))}
      </tbody>
    </table>
  )
}

export function RowControls({ count, max, onAdd, onRemove, label = '행' }: { count: number; max: number; onAdd: () => void; onRemove: () => void; label?: string }) {
  return (
    <div className="row-controls no-print">
      <button type="button" onClick={onAdd} disabled={count >= max}>+ {label} 추가</button>
      <button type="button" onClick={onRemove} disabled={count <= 1}>- {label} 삭제</button>
      <span>{count}{label} (최대 {max}, A4 1쪽 기준)</span>
    </div>
  )
}

export function OkFail({ value, onChange }: { value: boolean | null; onChange: (v: boolean | null) => void }) {
  return (
    <>
      <div className="ok-fail-btns no-print">
        <button type="button" className={`ok-fail-btn${value === true ? ' selected' : ''}`} onClick={() => onChange(value === true ? null : true)}>양호</button>
        <button type="button" className={`ok-fail-btn${value === false ? ' selected' : ''}`} onClick={() => onChange(value === false ? null : false)}>불량</button>
      </div>
      <span className="print-only ok-fail-print">{value === true ? '양호' : value === false ? '불량' : '양호\n불량'}</span>
    </>
  )
}

export const CellInput = ({ value, onChange, left, style }: { value: string; onChange: (v: string) => void; left?: boolean; style?: React.CSSProperties }) => (
  <input className={`cell-input${left ? ' left' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} style={style} />
)

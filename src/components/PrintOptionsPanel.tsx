import { Link } from 'react-router-dom'
import { useSettings, toggleFavorite, holidayMap, type RoleNames } from '../store/settings'
import type { DateMode } from '../forms/registry'
import { toMonday, addDays, fmtMD, dayKo } from '../lib/dates'
import { toKey } from '../forms/types'
import './PrintOptionsPanel.css'

export interface PrintOptions {
  date: Date | null
  grayscale: boolean
  autoFill: boolean
  names: RoleNames
  copies: number
}

interface Props {
  options: PrintOptions
  onChange: (patch: Partial<PrintOptions>) => void
  dateMode: DateMode
  formId?: number
  title?: string
  onPrint: () => void
  showCopies?: boolean
  children?: React.ReactNode
}

function toInputValue(d: Date | null): string {
  if (!d) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export default function PrintOptionsPanel({ options, onChange, dateMode, formId, title, onPrint, showCopies = true, children }: Props) {
  const s = useSettings()
  const isFav = formId !== undefined && s.favorites.includes(formId)
  const holidays = holidayMap(s)

  const setDate = (d: Date | null) => onChange({ date: d && dateMode === 'weekly' ? toMonday(d) : d })
  const handleDate = (value: string) => {
    if (!value) { setDate(null); return }
    const [y, m, d] = value.split('-').map(Number)
    setDate(new Date(y, m - 1, d))
  }
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const setName = (role: keyof RoleNames, v: string) => onChange({ names: { ...options.names, [role]: v } })

  // 선택한 날짜의 휴업 안내
  let holidayNote = ''
  if (options.date) {
    if (dateMode === 'daily') {
      const h = holidays[toKey(options.date)]
      if (h) holidayNote = `${fmtMD(options.date)}(${dayKo(options.date)})은 휴업일(${h})입니다.`
    } else if (dateMode === 'weekly') {
      const hs = Array.from({ length: 5 }, (_, i) => addDays(options.date!, i)).filter((d) => holidays[toKey(d)])
      if (hs.length === 5) holidayNote = '이 주는 전부 휴업(방학 등)입니다.'
      else if (hs.length) holidayNote = `휴업: ${hs.map((d) => `${dayKo(d)}(${holidays[toKey(d)]})`).join(', ')}`
    }
  }

  return (
    <div className="print-options-panel no-print">
      <div className="print-options-row">
        <Link to="/" className="back-link">← 목록</Link>
        {title && <strong className="panel-title">{title}</strong>}
        {formId !== undefined && (
          <button type="button" className={`fav-btn${isFav ? ' on' : ''}`} title="즐겨찾기" onClick={() => toggleFavorite(formId)}>
            {isFav ? '★' : '☆'}
          </button>
        )}

        {dateMode !== 'none' && (
          <div className="option-group">
            <label className="option-label">{dateMode === 'daily' ? '급식일자' : '기간(월요일)'}</label>
            <input type="date" value={toInputValue(options.date)} onChange={(e) => handleDate(e.target.value)} />
            <button type="button" className="btn-sm" onClick={() => setDate(today)}>{dateMode === 'daily' ? '오늘' : '이번 주'}</button>
            {dateMode === 'weekly' && <button type="button" className="btn-sm" onClick={() => setDate(addDays(toMonday(today), 7))}>다음 주</button>}
            {options.date && <button type="button" className="btn-ghost btn-sm" onClick={() => setDate(null)}>비우기</button>}
          </div>
        )}

        {dateMode !== 'none' && showCopies && (
          <div className="option-group">
            <label className="option-label">{dateMode === 'daily' ? '연속 일수' : '연속 주수'}</label>
            <input
              type="number" min={1} max={10} value={options.copies} disabled={!options.date}
              title={options.date ? '' : '날짜를 먼저 선택하세요'}
              onChange={(e) => onChange({ copies: Math.min(10, Math.max(1, Number(e.target.value) || 1)) })}
              style={{ width: '3.6rem' }}
            />
          </div>
        )}

        <div className="option-group">
          <label className="option-check">
            <input type="checkbox" checked={options.autoFill} onChange={(e) => onChange({ autoFill: e.target.checked })} />
            이름 자동 채움
          </label>
          {options.autoFill && (
            <>
              {(['checker', 'writer', 'confirmer'] as const).map((role) => (
                <label key={role} className="name-select">
                  {{ checker: '점검자', writer: '작성자', confirmer: '확인자' }[role]}
                  <select value={options.names[role]} onChange={(e) => setName(role, e.target.value)}>
                    <option value="">(빈칸)</option>
                    {s.names.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              ))}
              {s.names.length === 0 && <Link to="/settings" className="hint-link">설정에서 이름 추가</Link>}
            </>
          )}
        </div>

        <div className="option-group">
          <label className="option-check">
            <input type="checkbox" checked={options.grayscale} onChange={(e) => onChange({ grayscale: e.target.checked })} />
            흑백 인쇄
          </label>
        </div>

        {children}

        <div className="print-btns">
          <button type="button" onClick={onPrint} className="btn-primary">🖨️ 인쇄</button>
          <button type="button" onClick={onPrint} className="btn-blue" title="인쇄 대화상자에서 대상(프린터)을 'PDF로 저장'으로 고르면 PDF 파일로 저장됩니다. 파일명은 서식명+날짜로 자동 제안됩니다.">📄 PDF 저장</button>
        </div>
      </div>
      {(holidayNote || (s.calendar && dateMode !== 'none')) && (
        <div className="print-options-sub">
          {s.calendar && <span className="tag tag-gray">{s.calendar.termName} {s.calendar.from} ~ {s.calendar.to}</span>}
          {holidayNote && <span className="tag tag-red">{holidayNote}</span>}
        </div>
      )}
    </div>
  )
}

import { toKey } from '../forms/types'
import './DatePick.css'

interface Props {
  date: Date | null
  onChange?: (d: Date) => void
  /** 인쇄될 텍스트 */
  children: React.ReactNode
}

/** 서식 안 날짜 텍스트 + (화면에서만) 📅 날짜 선택기 */
export default function DatePick({ date, onChange, children }: Props) {
  if (!onChange) return <span className="meta-value">{children}</span>
  return (
    <span className="date-pick">
      <span className="meta-value">{children}</span>
      <label className="date-pick-btn no-print" title="날짜 선택">
        📅
        <input
          type="date"
          value={date ? toKey(date) : ''}
          onChange={(e) => {
            if (!e.target.value) return
            const [y, m, d] = e.target.value.split('-').map(Number)
            onChange(new Date(y, m - 1, d))
          }}
        />
      </label>
    </span>
  )
}

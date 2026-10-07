import { useEffect, useMemo } from 'react'
import { useRecordState } from '../store/records'
import CheckboxChar from '../components/CheckboxChar'
import DatePick from '../components/DatePick'
import type { FormProps } from './types'
import { toKey } from './types'
import { WEEKDAYS_KO, weekDays, pad } from '../lib/dates'
import '../print.css'
import './records-common.css'

interface MealEntry {
  type: string
  menuName: string
  sanitize: boolean
  heat: boolean
}

// 원본: 요일마다 조식1 / 중식 여러 줄 / 석식1
const MEALS_PER_DAY = ['조식', '중식', '중식', '중식', '석식']

const makeDay = () => MEALS_PER_DAY.map((type) => ({ type, menuName: '', sanitize: false, heat: false }))

export default function MenuReview({ date, grayscale, names, holidays, onDateChange }: FormProps) {
  const [writer, setWriter] = useRecordState('writer', names?.writer ?? '')
  const [confirmer, setConfirmer] = useRecordState('confirmer', names?.confirmer ?? '')
  const [confirmDate, setConfirmDate] = useRecordState('confirmDate', '')
  const [days, setDays] = useRecordState<MealEntry[][]>('days', WEEKDAYS_KO.map(makeDay))
  const [animalExclude, setAnimalExclude] = useRecordState('animalExclude', false)

  useEffect(() => { if (names) { setWriter(names.writer); setConfirmer(names.confirmer) } }, [names])

  const week = useMemo(() => (date ? weekDays(date) : null), [date])
  const period = date && week
    ? `20${String(date.getFullYear()).slice(2)}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}. ~ 20${String(week[4].getFullYear()).slice(2)}. ${pad(week[4].getMonth() + 1)}. ${pad(week[4].getDate())}.`
    : '20   .   .   . ~ 20   .   .   .'

  const updateMeal = (d: number, m: number, patch: Partial<MealEntry>) =>
    setDays((prev) => prev.map((day, di) => (di === d ? day.map((meal, mi) => (mi === m ? { ...meal, ...patch } : meal)) : day)))

  return (
    <div className={`form-container${grayscale ? ' grayscale' : ''}`} data-printable>
      <div className="record-title-wrap">
        <div className="line left" /><div className="record-title">식단검토</div><div className="line right" />
      </div>

      <div className="record-header">
        급식일자 : <DatePick date={date} onChange={onDateChange}>{period}</DatePick><br />
        작성자 : ( <input className="meta-input wide" value={writer} onChange={(e) => setWriter(e.target.value)} /> )
      </div>

      <table className="record-table">
        <thead>
          <tr>
            <th style={{ width: '16%' }}>급식일</th>
            <th style={{ width: '10%' }}>구분</th>
            <th>식단명(요리명)</th>
            <th style={{ width: '9%' }}>소독</th>
            <th style={{ width: '9%' }}>가열</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={5} style={{ textAlign: 'left', padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <button type="button" className="check-btn-inline no-print" onClick={() => setAnimalExclude((v) => !v)}>{animalExclude ? '✓' : ''}</button>
                <CheckboxChar checked={animalExclude} className="print-only" />
                익히지 않은 동물성 식품이나 자연독을 함유한 식단 제외
              </label>
            </td>
          </tr>
          {days.map((meals, d) => {
            const day = week?.[d]
            const hol = day ? holidays[toKey(day)] : undefined
            return meals.map((meal, m) => (
              <tr key={`${d}-${m}`} style={{ height: '6.5mm' }}>
                {m === 0 && (
                  <td rowSpan={meals.length} style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                    {day ? `${pad(day.getMonth() + 1)}/ ${pad(day.getDate())}` : '월/  일'} ({WEEKDAYS_KO[d]})
                    {hol && <><br /><span style={{ fontSize: '0.62rem', color: '#c41e3a', fontWeight: 'normal' }}>휴업</span></>}
                  </td>
                )}
                <td style={{ fontSize: '0.72rem' }}>{meal.type}</td>
                <td style={{ textAlign: 'left' }}>
                  <input className="cell-input left" value={meal.menuName} onChange={(e) => updateMeal(d, m, { menuName: e.target.value })} />
                </td>
                <td>
                  <button type="button" className="check-btn-inline no-print" onClick={() => updateMeal(d, m, { sanitize: !meal.sanitize })}>{meal.sanitize ? '✓' : ''}</button>
                  <CheckboxChar checked={meal.sanitize} className="print-only" />
                </td>
                <td>
                  <button type="button" className="check-btn-inline no-print" onClick={() => updateMeal(d, m, { heat: !meal.heat })}>{meal.heat ? '✓' : ''}</button>
                  <CheckboxChar checked={meal.heat} className="print-only" />
                </td>
              </tr>
            ))
          })}
        </tbody>
      </table>

      <div className="record-confirm">
        확인자 : ( <input className="confirm-input" value={confirmer} onChange={(e) => setConfirmer(e.target.value)} /> )<br />
        확인일자 : 20 <input className="confirm-input" style={{ width: 130 }} value={confirmDate} onChange={(e) => setConfirmDate(e.target.value)} /> (   요일)
      </div>
    </div>
  )
}

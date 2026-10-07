import { useEffect, useMemo } from 'react'
import { useRecordState } from '../store/records'
import type { FormProps } from './types'
import { toKey } from './types'
import { WEEKDAYS_KO, weekDays, fmtMD } from '../lib/dates'
import { RecordTitle, WeekHeader, ConfirmBlock, MgmtTable, CellInput } from './RecordParts'
import '../print.css'

const TIMES = ['a.m.', 'p.m.', 'p.m.'] as const
interface Slot { fridge: string; preserve: string; freezer: string }
interface DayRec { slots: Slot[]; clean: string; cover: string; separate: string; sign: string }
const emptyDay = (): DayRec => ({ slots: TIMES.map(() => ({ fridge: '', preserve: '', freezer: '' })), clean: '', cover: '', separate: '', sign: '' })

export default function CP1({ date, grayscale, names, holidays, onDateChange }: FormProps) {
  const [checker, setChecker] = useRecordState('checker', names?.checker ?? '')
  const [days, setDays] = useRecordState<DayRec[]>('days', WEEKDAYS_KO.map(emptyDay))
  const [bigo, setBigo] = useRecordState('bigo', '')
  useEffect(() => { if (names) setChecker(names.checker) }, [names])
  const week = useMemo(() => (date ? weekDays(date) : null), [date])

  const setSlot = (d: number, t: number, k: keyof Slot, v: string) =>
    setDays((p) => p.map((day, di) => (di === d ? { ...day, slots: day.slots.map((s, ti) => (ti === t ? { ...s, [k]: v } : s)) } : day)))
  const setDay = (d: number, k: keyof Omit<DayRec, 'slots'>, v: string) =>
    setDays((p) => p.map((day, di) => (di === d ? { ...day, [k]: v } : day)))

  return (
    <div className={`form-container${grayscale ? ' grayscale' : ''}`} data-printable>
      <RecordTitle>CP1. 냉장·냉동고(실) 온도관리</RecordTitle>
      <WeekHeader monday={date} checker={checker} onChecker={setChecker} onDateChange={onDateChange} />

      <table className="record-table">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: '11%' }}>요 일<br />(일자)</th>
            <th rowSpan={2} style={{ width: '9%' }}>확 인<br />시 간</th>
            <th colSpan={3}>온 도 (℃)</th>
            <th rowSpan={2} style={{ width: '10%' }}>청결상태<br />확 인</th>
            <th rowSpan={2} style={{ width: '9%' }}>덮개<br />확인</th>
            <th rowSpan={2} style={{ width: '9%' }}>분리<br />보관<br />여부</th>
            <th rowSpan={2} style={{ width: '10%' }}>작성자<br />서 명</th>
          </tr>
          <tr><th style={{ width: '14%' }}>냉장고(실)</th><th style={{ width: '14%' }}>보존식<br />냉동고</th><th style={{ width: '14%' }}>냉동고(실)</th></tr>
        </thead>
        <tbody>
          {days.map((day, d) => {
            const dt = week?.[d]
            const hol = dt ? holidays[toKey(dt)] : undefined
            return TIMES.map((t, ti) => (
              <tr key={`${d}-${ti}`} style={{ height: '5.8mm' }}>
                {ti === 0 && (
                  <td rowSpan={3} style={{ fontWeight: 'bold' }}>
                    {WEEKDAYS_KO[d]}<br />( {dt ? fmtMD(dt) : '    /    '} )
                    {hol && <><br /><span style={{ fontSize: '0.6rem', color: '#c41e3a', fontWeight: 'normal' }}>휴업</span></>}
                  </td>
                )}
                <td style={{ fontSize: '0.65rem', color: '#444' }}>{t}</td>
                <td><CellInput value={day.slots[ti].fridge} onChange={(v) => setSlot(d, ti, 'fridge', v)} /></td>
                <td><CellInput value={day.slots[ti].preserve} onChange={(v) => setSlot(d, ti, 'preserve', v)} /></td>
                <td><CellInput value={day.slots[ti].freezer} onChange={(v) => setSlot(d, ti, 'freezer', v)} /></td>
                {ti === 0 && (
                  <>
                    <td rowSpan={3}><CellInput value={day.clean} onChange={(v) => setDay(d, 'clean', v)} /></td>
                    <td rowSpan={3}><CellInput value={day.cover} onChange={(v) => setDay(d, 'cover', v)} /></td>
                    <td rowSpan={3}><CellInput value={day.separate} onChange={(v) => setDay(d, 'separate', v)} /></td>
                    <td rowSpan={3}><CellInput value={day.sign} onChange={(v) => setDay(d, 'sign', v)} /></td>
                  </>
                )}
              </tr>
            ))
          })}
          <tr className="bigo-row" style={{ height: '8mm' }}>
            <td colSpan={2} className="bigo-label" style={{ textAlign: 'center' }}>비 고</td>
            <td colSpan={7}><CellInput value={bigo} onChange={setBigo} left /></td>
          </tr>
        </tbody>
      </table>

      <MgmtTable rows={[
        ['관 리 기 준', <td>• 냉장고(실) : 5℃, 냉동고(실) : -18℃ 이하</td>],
        ['관 리 방 안', <td>• 조리장 내의 모든 냉장·냉동고(실) 온도 확인 및 작성<br />• 문을 장시간 열지 않았을 때 외부 부착 온도계로 온도 확인<br />• 중식만 제공 시 : 하루 2회 (출근 직후, 배식 후 청소 직전 또는 퇴근 전)<br />• 2식 이상 제공 시 : 하루 3회 (출근 직후, 중식 후, 석식 배식 후 청소 직전 또는 퇴근 전)</td>],
        ['개 선 조 치', <td>• 냉장·냉동고(실) 온도 보정, 고장 시 수리 의뢰<br />• 식품 이동 혹은 폐기</td>],
      ]} />
      <ConfirmBlock names={names} />
    </div>
  )
}

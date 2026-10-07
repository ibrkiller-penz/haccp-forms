import { useEffect, useMemo } from 'react'
import { useRecordState } from '../store/records'
import type { FormProps } from './types'
import { toKey } from './types'
import { WEEKDAYS_KO, weekDays, fmtMD } from '../lib/dates'
import { RecordTitle, WeekHeader, ConfirmBlock, MgmtTable, CellInput, OkFail } from './RecordParts'
import '../print.css'

export type CP2Variant = 'A' | 'B' | 'C'

interface DayRec { washTemp: string; washOk: boolean | null; sterilize: string; disinfectTime: string; disinfectConc: string; sign: string }
const emptyDay = (): DayRec => ({ washTemp: '', washOk: null, sterilize: '', disinfectTime: '', disinfectConc: '', sign: '' })

const TITLES: Record<CP2Variant, [string, string]> = {
  A: ['CP2A. 식품 접촉표면 세척 및 소독', '(식기세척기로 식판 소독이 안 되는 학교)'],
  B: ['CP2B. 식품 접촉표면 세척 및 소독', '(식기세척기로 식판 소독이 가능한 학교)'],
  C: ['CP2C. 식품 접촉표면 세척 및 소독', '(식기세척기가 없는 학교)'],
}

const CRITERIA: Record<CP2Variant, [string, string, string]> = {
  A: ['• 식기소독고 내 식판 온도 71℃ 이상', '• 식기소독고 설정 온도, 시간 확인', '• 식기소독고 온도, 시간 보정'],
  B: ['• 최종헹굼수 온도 71℃ 이상', '• 최종 헹굼 단계의 온도 확인', '• 세척기 A/S'],
  C: ['• 식기소독고 내 식판 온도 71℃ 이상', '• 식기소독고 설정 온도, 시간 확인', '• 식기소독고 온도, 시간 보정'],
}

export default function CP2Base({ variant, date, grayscale, names, holidays, onDateChange }: FormProps & { variant: CP2Variant }) {
  const [checker, setChecker] = useRecordState('checker', names?.checker ?? '')
  const [days, setDays] = useRecordState<DayRec[]>('days', WEEKDAYS_KO.map(emptyDay))
  const [agent, setAgent] = useRecordState('agent', '')
  const [ppm, setPpm] = useRecordState('ppm', '')
  const [residue, setResidue] = useRecordState('residue', '')
  const [residueDate, setResidueDate] = useRecordState('residueDate', '')
  const [thermo, setThermo] = useRecordState('thermo', '')
  useEffect(() => { if (names) setChecker(names.checker) }, [names])
  const week = useMemo(() => (date ? weekDays(date) : null), [date])
  const set = (d: number, patch: Partial<DayRec>) => setDays((p) => p.map((day, i) => (i === d ? { ...day, ...patch } : day)))

  const hasWasher = variant !== 'C'
  const hasSterilizer = variant !== 'B'
  const [title, sub] = TITLES[variant]
  const [c1, m1, f1] = CRITERIA[variant]
  const cols = 1 + (hasWasher ? 2 : 1) + (hasSterilizer ? 1 : 0) + 3

  return (
    <div className={`form-container${grayscale ? ' grayscale' : ''}`} data-printable>
      <RecordTitle small>{title}<br /><span style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>{sub}</span></RecordTitle>
      <WeekHeader monday={date} checker={checker} onChecker={setChecker} onDateChange={onDateChange} />

      <table className="record-table">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: '12%' }}>요 일<br />(일자)</th>
            {hasWasher ? <th colSpan={2}>식기세척기</th> : <th rowSpan={2} style={{ width: '12%' }}>식기<br />세척상태</th>}
            {hasSterilizer && <th rowSpan={2} style={{ width: '16%' }}>소독고<br />설정 온도<br />·시간 확인<br />(    )℃<br />:</th>}
            <th rowSpan={2} style={{ width: '10%' }}>소독제<br />제 조<br />시 간</th>
            <th rowSpan={2}>
              소독제 희석농도 확인<br />
              <span style={{ fontSize: '0.62rem', fontWeight: 'normal', lineHeight: 1.5 }}>
                칼·도마·장갑소독조, 세정대<br />
                유효성분명 : ( <input className="cell-input" style={{ width: 70, display: 'inline' }} value={agent} onChange={(e) => setAgent(e.target.value)} /> )<br />
                희석액 농도 : ( <input className="cell-input" style={{ width: 50, display: 'inline' }} value={ppm} onChange={(e) => setPpm(e.target.value)} /> )ppm
              </span>
            </th>
            <th rowSpan={2} style={{ width: '11%' }}>작성자<br />서 명</th>
          </tr>
          {hasWasher && <tr><th style={{ width: '11%' }}>최종헹굼수<br />온도<br />(    )℃</th><th style={{ width: '9%' }}>세척<br />상태</th></tr>}
        </thead>
        <tbody>
          {days.map((day, d) => {
            const dt = week?.[d]
            const hol = dt ? holidays[toKey(dt)] : undefined
            return (
              <tr key={d} style={{ height: '10mm' }}>
                <td style={{ fontWeight: 'bold' }}>
                  {WEEKDAYS_KO[d]}<br />( {dt ? fmtMD(dt) : '    /    '} )
                  {hol && <><br /><span style={{ fontSize: '0.6rem', color: '#c41e3a', fontWeight: 'normal' }}>휴업</span></>}
                </td>
                {hasWasher && <td><CellInput value={day.washTemp} onChange={(v) => set(d, { washTemp: v })} /></td>}
                <td><OkFail value={day.washOk} onChange={(v) => set(d, { washOk: v })} /></td>
                {hasSterilizer && <td><CellInput value={day.sterilize} onChange={(v) => set(d, { sterilize: v })} /></td>}
                <td><CellInput value={day.disinfectTime} onChange={(v) => set(d, { disinfectTime: v })} /><span style={{ fontSize: '0.6rem' }}>a.m.</span></td>
                <td><CellInput value={day.disinfectConc} onChange={(v) => set(d, { disinfectConc: v })} /></td>
                <td><CellInput value={day.sign} onChange={(v) => set(d, { sign: v })} /></td>
              </tr>
            )
          })}
          <tr className="bigo-row" style={{ height: '7mm' }}>
            <td className="bigo-label" style={{ textAlign: 'center' }}>비 고</td>
            <td colSpan={cols - 1}></td>
          </tr>
        </tbody>
      </table>

      <MgmtTable rows={[
        ['관 리 기 준', <td>{c1}<br />• 기구 및 기물류 소독 시 소독제 희석농도 및 세제 잔류 여부 확인</td>],
        ['관 리 방 안', <td>{m1}<br />• Thermolabel로 소독 확인<br />• Test paper나 농도측정기를 사용하여 소독제 희석농도 확인<br />• Test paper나 페놀프탈레인 지시약을 사용하여 세제 잔류 여부 확인</td>],
        ['개 선 조 치', <td>{f1}<br />• 재세척 및 소독제 희석농도 조정</td>],
      ]} />

      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.4rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1.3 }}>
          <div className="side-box" style={{ marginBottom: 6 }}>
            잔류세제 확인 여부(월 1회) &nbsp;( <input className="cell-input" style={{ width: 28, display: 'inline' }} value={residue} onChange={(e) => setResidue(e.target.value)} /> )
            &nbsp; 검출(  ) 불검출(  ) &nbsp;
            <input className="cell-input" style={{ width: 70, display: 'inline' }} value={residueDate} onChange={(e) => setResidueDate(e.target.value)} /> 월 &nbsp;일 &nbsp;시
          </div>
          <div className="side-box">
            Thermolabel 부착(월 1회) &nbsp;
            <input className="cell-input" style={{ width: 90, display: 'inline' }} value={thermo} onChange={(e) => setThermo(e.target.value)} /> 월 &nbsp;일
          </div>
        </div>
        <div style={{ flex: 1 }}><ConfirmBlock names={names} /></div>
      </div>
    </div>
  )
}

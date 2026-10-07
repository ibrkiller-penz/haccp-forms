import { useState } from 'react'
import type { FormProps } from './types'
import { RecordTitle, MealDateHeader, ConfirmBlock, MgmtTable, RowControls, CellInput, type MealType } from './RecordParts'
import '../print.css'

interface Row { name: string; mix: string; done: string; loadTemp: string; served: string; sTemp: string; vehicle: string; tool: string; sealed: string; uniform: string; sign: string }
const emptyRow = (): Row => ({ name: '', mix: '', done: '', loadTemp: '', served: '', sTemp: '', vehicle: '', tool: '', sealed: '', uniform: '', sign: '' })
const KEYS: (keyof Row)[] = ['name', 'mix', 'done', 'loadTemp', 'served', 'sTemp', 'vehicle', 'tool', 'sealed', 'uniform', 'sign']
const MAX = 12

export default function CCP2C({ date, grayscale, names }: FormProps) {
  const [meal, setMeal] = useState<MealType>('중')
  const [rows, setRows] = useState<Row[]>(Array.from({ length: 6 }, emptyRow))
  const [bigo, setBigo] = useState('')
  const set = (i: number, k: keyof Row, v: string) => setRows((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))

  return (
    <div className={`form-container${grayscale ? ' grayscale' : ''}`} data-printable>
      <RecordTitle>CCP2C. 조리완료 및 배식 <span style={{ fontWeight: 'normal', fontSize: '0.85rem' }}>(공동조리)</span></RecordTitle>
      <MealDateHeader date={date} mealType={meal} onMealType={setMeal} />

      <table className="record-table" style={{ fontSize: '0.68rem' }}>
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: '13%' }}>음식명</th>
            <th rowSpan={2} style={{ width: '7%' }}>혼합<br />시작<br />시간</th>
            <th rowSpan={2} style={{ width: '7%' }}>조리<br />완료<br />시간</th>
            <th colSpan={3}>시간·온도확인</th>
            <th rowSpan={2} style={{ width: '8%' }}>차량<br />내부<br />청결<br />상태</th>
            <th rowSpan={2} style={{ width: '8%' }}>배식<br />도구<br />청결도</th>
            <th rowSpan={2} style={{ width: '8%' }}>운반<br />용기<br />밀폐<br />상태</th>
            <th rowSpan={2} style={{ width: '8%' }}>위생<br />복장<br />착용</th>
            <th rowSpan={2} style={{ width: '9%' }}>작성자<br />서 명</th>
          </tr>
          <tr><th style={{ width: '8%' }}>상차<br />온도<br />(℃)</th><th style={{ width: '8%' }}>배식<br />완료<br />시간</th><th style={{ width: '8%' }}>배식<br />온도<br />(℃)</th></tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ height: '7mm' }}>
              {KEYS.map((k) => <td key={k}><CellInput value={row[k]} onChange={(v) => set(i, k, v)} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>

      <RowControls count={rows.length} max={MAX} onAdd={() => setRows((p) => [...p, emptyRow()])} onRemove={() => setRows((p) => p.slice(0, -1))} />

      <MgmtTable rows={[
        ['비 고', <td><CellInput value={bigo} onChange={setBigo} left /></td>],
        ['한 계 기 준', <td>• 열장 음식 57℃ 이상 유지 또는 2시간 이내 배식 완료<br />• 운반 용기의 밀폐</td>],
        ['관 리 방 안', <td>• 가열조리와 비가열조리 혼합음식은 배식 직전에 혼합<br />• 열장 음식의 57℃ 이상 유지 또는 조리부터 배식완료까지 2시간 이내로 공정관리<br />• 급식품 운반용기의 밀폐성 확인<br />• 배식대 및 배식 전용도구는 세척 소독하여 건조된 것 사용<br />• 배식도우미는 깨끗한 앞치마, 위생모, 마스크, 위생장갑 착용<br />• 조리교에서 혼합 시작 시간, 조리완료 시간 기록하여 운반</td>],
        ['개 선 조 치', <td>• 상차 시 온도조정 또는 공정관리<br />• 운반용기 개선</td>],
      ]} />
      <div className="footnote">※ 배식완료 시 열장 음식의 온도가 57℃ 이상이면 시간 확인은 불필요함</div>
      <ConfirmBlock names={names} />
    </div>
  )
}

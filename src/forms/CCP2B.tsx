import { useState } from 'react'
import type { FormProps } from './types'
import { RecordTitle, MealDateHeader, ConfirmBlock, MgmtTable, RowControls, CellInput, type MealType } from './RecordParts'
import '../print.css'

interface Row { name: string; mix: string; done: string; served: string; in2h: string; tool: string; uniform: string; place: string; sign: string }
const emptyRow = (): Row => ({ name: '', mix: '', done: '', served: '', in2h: '', tool: '', uniform: '', place: '', sign: '' })
const KEYS: (keyof Row)[] = ['name', 'mix', 'done', 'served', 'in2h', 'tool', 'uniform', 'place', 'sign']
const MAX = 14

export default function CCP2B({ date, grayscale, names, onDateChange }: FormProps) {
  const [meal, setMeal] = useState<MealType>('중')
  const [rows, setRows] = useState<Row[]>(Array.from({ length: 9 }, emptyRow))
  const [bigo, setBigo] = useState('')
  const set = (i: number, k: keyof Row, v: string) => setRows((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))

  return (
    <div className={`form-container${grayscale ? ' grayscale' : ''}`} data-printable>
      <RecordTitle>CCP2B. 조리완료 및 배식 <span style={{ fontWeight: 'normal', fontSize: '0.85rem' }}>(단독조리 : 교실배식)</span></RecordTitle>
      <MealDateHeader date={date} mealType={meal} onMealType={setMeal} onDateChange={onDateChange} />

      <table className="record-table">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: '18%' }}>음식명</th>
            <th colSpan={4}>급식소요시간</th>
            <th rowSpan={2} style={{ width: '9%' }}>배 식<br />도 구<br />청결도</th>
            <th rowSpan={2} style={{ width: '9%' }}>위생<br />복장<br />착용</th>
            <th rowSpan={2} style={{ width: '12%' }}>확 인<br />장 소<br />(학/반)</th>
            <th rowSpan={2} style={{ width: '10%' }}>작성자<br />서 명</th>
          </tr>
          <tr>
            <th style={{ width: '8%' }}>혼합<br />시작<br />시간</th><th style={{ width: '8%' }}>조리<br />완료<br />시간</th>
            <th style={{ width: '8%' }}>배식<br />완료<br />시간</th><th style={{ width: '8%' }}>2시간<br />이내</th>
          </tr>
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
        ['한 계 기 준', <td>• 배식 완료 2시간 이전에 조리완료<br />• 배식 시 오염 방지</td>],
        ['관 리 방 안', <td>• 가열조리와 비가열조리 혼합음식은 배식 직전에 혼합<br />• 혼합 과정이 있는 음식은 혼합 시작 시각 기록<br />• 공정관리를 통해 조리완료 시간 조정<br />• 배식대 및 배식 전용 도구는 세척 소독하여 건조된 것 사용<br />• 배식도우미는 깨끗한 앞치마, 위생모, 마스크, 위생장갑 착용</td>],
        ['개 선 조 치', <td>• 공정관리<br />• 오염 음식 교체<br />• 식생활교육관(식당) 공간 확보</td>],
      ]} />
      <ConfirmBlock names={names} />
    </div>
  )
}

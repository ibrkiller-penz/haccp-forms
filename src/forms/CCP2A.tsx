import { useRecordState } from '../store/records'
import type { FormProps } from './types'
import { RecordTitle, MealDateHeader, ConfirmBlock, MgmtTable, RowControls, CellInput, type MealType } from './RecordParts'
import '../print.css'

interface Row { name: string; mix: string; done: string; sTime: string; sTemp: string; in2h: string; tool: string; uniform: string; vat: string; sign: string }
const emptyRow = (): Row => ({ name: '', mix: '', done: '', sTime: '', sTemp: '', in2h: '', tool: '', uniform: '', vat: '', sign: '' })
const KEYS: (keyof Row)[] = ['name', 'mix', 'done', 'sTime', 'sTemp', 'in2h', 'tool', 'uniform', 'vat', 'sign']
const MAX = 14

export default function CCP2A({ date, grayscale, names, onDateChange }: FormProps) {
  const [meal, setMeal] = useRecordState<MealType>('meal', '중')
  const [rows, setRows] = useRecordState<Row[]>('rows', Array.from({ length: 8 }, emptyRow))
  const [bigo, setBigo] = useRecordState('bigo', '')
  const set = (i: number, k: keyof Row, v: string) => setRows((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))

  return (
    <div className={`form-container${grayscale ? ' grayscale' : ''}`} data-printable>
      <RecordTitle>CCP2A. 조리완료 및 배식 <span style={{ fontWeight: 'normal', fontSize: '0.85rem' }}>(단독조리 : 식생활교육관(식당) 배식)</span></RecordTitle>
      <MealDateHeader date={date} mealType={meal} onMealType={setMeal} onDateChange={onDateChange} />

      <table className="record-table">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: '17%' }}>음식명</th>
            <th rowSpan={2} style={{ width: '8%' }}>혼합<br />시작<br />시간</th>
            <th rowSpan={2} style={{ width: '8%' }}>조리<br />완료<br />시간</th>
            <th colSpan={3}>배 식 완 료</th>
            <th rowSpan={2} style={{ width: '9%' }}>배 식<br />도 구<br />청결도</th>
            <th rowSpan={2} style={{ width: '8%' }}>위생<br />복장<br />착용</th>
            <th rowSpan={2} style={{ width: '8%' }}>배식통<br />관 리</th>
            <th rowSpan={2} style={{ width: '10%' }}>작성자<br />서 명</th>
          </tr>
          <tr><th style={{ width: '8%' }}>시간</th><th style={{ width: '8%' }}>온도<br />(℃)</th><th style={{ width: '8%' }}>2시간<br />이내</th></tr>
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
        ['한 계 기 준', <td>• 열장 음식 57℃ 이상 유지 또는 2시간 이내 배식 완료</td>],
        ['관 리 방 안', <td>• 가열조리와 비가열조리 혼합음식은 배식 직전에 혼합<br />• 열장 음식의 57℃ 이상 유지 또는 조리완료부터 배식 완료까지 2시간 이내로 공정관리<br />• 배식하던 배식통(vat)에 남은 음식과 새로운 배식통의 음식 혼합 금지</td>],
        ['개 선 조 치', <td>• 오븐 또는 열장 설비 확보<br />• 오염 음식 재가열 혹은 폐기</td>],
      ]} />
      <ConfirmBlock names={names} />
    </div>
  )
}

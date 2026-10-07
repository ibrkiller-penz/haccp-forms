import { useState } from 'react'
import type { FormProps } from './types'
import CheckboxChar from '../components/CheckboxChar'
import { RecordTitle, MealDateHeader, ConfirmBlock, MgmtTable, RowControls, CellInput, type MealType } from './RecordParts'
import '../print.css'

interface Row { dish: string; ingredient: string; method: string; pre: string; kitchen: string; temp: string; disinfect: string; sign: string }
const emptyRow = (): Row => ({ dish: '', ingredient: '', method: '', pre: '', kitchen: '', temp: '', disinfect: '', sign: '' })
const KEYS: (keyof Row)[] = ['dish', 'ingredient', 'method', 'pre', 'kitchen', 'temp', 'disinfect', 'sign']
const MAX = 12

export default function CCP1A({ date, grayscale, names, onDateChange }: FormProps) {
  const [meal, setMeal] = useState<MealType>('중')
  const [rows, setRows] = useState<Row[]>(Array.from({ length: 8 }, emptyRow))
  const [toolCheck, setToolCheck] = useState(false)
  const [bigo, setBigo] = useState('')
  const set = (i: number, k: keyof Row, v: string) => setRows((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))

  return (
    <div className={`form-container${grayscale ? ' grayscale' : ''}`} data-printable>
      <RecordTitle>CCP1A. 식품취급 및 조리 <span style={{ fontWeight: 'normal', fontSize: '0.85rem' }}>(장소 구분이 될 경우)</span></RecordTitle>
      <MealDateHeader date={date} mealType={meal} onMealType={setMeal} onDateChange={onDateChange} />

      <table className="record-table">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: '12%' }}>요리명</th>
            <th rowSpan={2} style={{ width: '13%' }}>식재료명</th>
            <th rowSpan={2} style={{ width: '16%' }}>취급 및<br />조리 방법</th>
            <th colSpan={2}>취급장소</th>
            <th rowSpan={2} style={{ width: '10%' }}>식품<br />중심<br />온도(℃)</th>
            <th rowSpan={2} style={{ width: '14%' }}>소독제농도<br />및 시간 확인</th>
            <th rowSpan={2} style={{ width: '10%' }}>작업자<br />서명</th>
          </tr>
          <tr><th style={{ width: '9%' }}>전처리실</th><th style={{ width: '9%' }}>조리실</th></tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={8} style={{ textAlign: 'left', padding: '0.12rem 0.4rem', fontSize: '0.7rem' }}>
              <button type="button" className="check-btn-inline no-print" onClick={() => setToolCheck((v) => !v)}>{toolCheck ? '✓' : ''}</button>
              <CheckboxChar checked={toolCheck} className="print-only" /> 고무장갑·앞치마·도마·칼·용기 등 도구 구분 사용
            </td>
          </tr>
          {rows.map((row, i) => (
            <tr key={i} style={{ height: '7mm' }}>
              {KEYS.map((k) => <td key={k}><CellInput value={row[k]} onChange={(v) => set(i, k, v)} /></td>)}
            </tr>
          ))}
          <tr className="bigo-row" style={{ height: '7mm' }}>
            <td className="bigo-label" style={{ textAlign: 'center' }}>비 고</td>
            <td colSpan={7}><CellInput value={bigo} onChange={setBigo} left /></td>
          </tr>
        </tbody>
      </table>

      <RowControls count={rows.length} max={MAX} onAdd={() => setRows((p) => [...p, emptyRow()])} onRemove={() => setRows((p) => p.slice(0, -1))} />

      <MgmtTable
        head={<thead><tr className="mgmt-head"><td className="mgmt-label">구 분</td><td>장소·도구 구분</td><td>채소·과일 소독</td><td>가열 조리 온도</td></tr></thead>}
        rows={[
          ['한 계 기 준', <><td>• 취급 장소, 고무장갑·앞치마·도마·칼·용기 등 도구 구분</td><td>• 염소 농도 80~130ppm(mg/kg) 5분간 침지 혹은 이와 동등한 소독 효과를 가진 살균 소독제의 용법 준수</td><td>• 식품 중심온도 75℃ (패류 85℃) 1분 이상</td></>],
          ['관 리 방 안', <><td>• 전처리, 조리작업 구분<br />• 조리 전·후별 고무장갑·앞치마·도마·칼·용기 등 도구 구분(도마·칼은 식재료별로도 구분)</td><td>• Test paper, 농도측정기 등으로 소독제 희석농도 확인 및 기록<br />• 생으로 먹는 채소와 과일류 소독</td><td>• 기준 온도 이상 가열 및 기록<br />• 가공완제품 재가열 및 기록</td></>],
          ['개 선 조 치', <><td>• 장소 변경, 도구 변경<br />• 오염 식품 재가열 혹은 폐기</td><td>• 농도가 기준치 미달 시 소독제 농도 조정</td><td>• 계속 가열</td></>],
        ]}
      />
      <ConfirmBlock names={names} />
    </div>
  )
}

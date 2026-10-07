import { useState } from 'react'
import type { FormProps } from './types'
import CheckboxChar from '../components/CheckboxChar'
import { RecordTitle, MealDateHeader, ConfirmBlock, MgmtTable, CellInput, type MealType } from './RecordParts'
import '../print.css'

interface Row { method: string; time: string; temp: string; disinfect: string; sign: string }
const emptyRow = (): Row => ({ method: '', time: '', temp: '', disinfect: '', sign: '' })
const KEYS: (keyof Row)[] = ['method', 'time', 'temp', 'disinfect', 'sign']

export default function CCP1B({ date, grayscale, names }: FormProps) {
  const [meal, setMeal] = useState<MealType>('중')
  const [pre, setPre] = useState<Row[]>(Array.from({ length: 5 }, emptyRow))
  const [cook, setCook] = useState<Row[]>(Array.from({ length: 7 }, emptyRow))
  const [toolCheck, setToolCheck] = useState(false)
  const [tableClean, setTableClean] = useState('')
  const [bigo, setBigo] = useState('')

  const renderRows = (rows: Row[], setRows: React.Dispatch<React.SetStateAction<Row[]>>, label: string) =>
    rows.map((row, i) => (
      <tr key={i} style={{ height: '6.5mm' }}>
        {i === 0 && <td rowSpan={rows.length} style={{ fontWeight: 'bold' }}>{label}</td>}
        {KEYS.map((k) => (
          <td key={k}><CellInput value={row[k]} onChange={(v) => setRows((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))} /></td>
        ))}
      </tr>
    ))

  return (
    <div className={`form-container${grayscale ? ' grayscale' : ''}`} data-printable>
      <RecordTitle>CCP1B. 식품취급 및 조리 <span style={{ fontWeight: 'normal', fontSize: '0.85rem' }}>(장소 구분이 안 되는 경우)</span></RecordTitle>
      <MealDateHeader date={date} mealType={meal} onMealType={setMeal} />

      <table className="record-table">
        <thead>
          <tr>
            <th style={{ width: '9%' }}>구 분</th>
            <th style={{ width: '25%' }}>취급 및 조리<br />방법</th>
            <th style={{ width: '14%' }}>전처리<br />완료/조리<br />시작 시간</th>
            <th style={{ width: '12%' }}>식품<br />중심온도<br />(℃)</th>
            <th style={{ width: '20%' }}>소독제<br />농도 및 시간<br />확인</th>
            <th style={{ width: '12%' }}>작업자<br />서명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={6} style={{ textAlign: 'left', padding: '0.12rem 0.4rem', fontSize: '0.7rem' }}>
              <button type="button" className="check-btn-inline no-print" onClick={() => setToolCheck((v) => !v)}>{toolCheck ? '✓' : ''}</button>
              <CheckboxChar checked={toolCheck} className="print-only" /> 고무장갑·앞치마·도마·칼·용기 등 도구 구분 사용
            </td>
          </tr>
          {renderRows(pre, setPre, '전처리')}
          <tr style={{ background: '#fde8ea', height: '5.5mm' }}>
            <td colSpan={5} style={{ background: '#fde8ea' }}>작업대 세척, 소독 ( <input className="cell-input" style={{ width: 90 }} value={tableClean} onChange={(e) => setTableClean(e.target.value)} /> )</td>
            <td></td>
          </tr>
          {renderRows(cook, setCook, '조리')}
          <tr className="bigo-row" style={{ height: '6.5mm' }}>
            <td className="bigo-label" style={{ textAlign: 'center' }}>비 고</td>
            <td colSpan={5}><CellInput value={bigo} onChange={setBigo} left /></td>
          </tr>
        </tbody>
      </table>

      <div className="row-controls no-print">
        <button type="button" onClick={() => setPre((p) => [...p, emptyRow()])} disabled={pre.length >= 8}>+ 전처리 행</button>
        <button type="button" onClick={() => setPre((p) => (p.length > 1 ? p.slice(0, -1) : p))}>- 전처리 행</button>
        <button type="button" onClick={() => setCook((p) => [...p, emptyRow()])} disabled={cook.length >= 10}>+ 조리 행</button>
        <button type="button" onClick={() => setCook((p) => (p.length > 1 ? p.slice(0, -1) : p))}>- 조리 행</button>
        <span>전처리 {pre.length} / 조리 {cook.length} (최대 8 / 10)</span>
      </div>

      <MgmtTable
        head={<thead><tr className="mgmt-head"><td className="mgmt-label">구 분</td><td>장소·도구 구분</td><td>채소·과일 소독</td><td>가열 조리 온도</td></tr></thead>}
        rows={[
          ['한계기준', <><td>• 전처리 종료와 조리 시작 사이 작업대 세척·소독<br />• 도마·칼·고무장갑·용기·도구 구분</td><td>• 염소 농도 80~130ppm(mg/kg) 5분간 침지 혹은 이와 동등한 효과를 가진 살균 소독제의 용법 준수</td><td>• 식품 중심온도 75℃ (어패류 85℃) 1분 이상</td></>],
          ['관리방안', <><td>• 육안관찰<br />• 조리 전·후별 고무장갑·앞치마·도마·칼·용기 등 도구 구분(도마·칼은 식재료별로도 구분)</td><td>• Test paper, 농도측정기 등으로 소독제 희석농도 확인<br />• 생으로 먹는 채소와 과일류 소독</td><td>• 기준온도 이상 가열<br />• 가공완제품 재가열</td></>],
          ['개선조치', <><td>• 작업대 세척·소독<br />• 도마·칼·고무장갑·용기·도구 변경<br />• 오염식품 재가열 또는 폐기</td><td>• 농도와 기준치 미달 시 소독제 희석농도 조정</td><td>• 계속 가열</td></>],
        ]}
      />
      <div className="footnote">※ 예시 식단명 : 콩나물국, 닭강정, 오징어미나리초무침, 사과, 배추김치</div>
      <ConfirmBlock names={names} />
    </div>
  )
}

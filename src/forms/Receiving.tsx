import { useEffect, useState } from 'react'
import type { FormProps } from './types'
import DatePick from '../components/DatePick'
import '../print.css'
import './records-common.css'

interface ReceivingRow {
  foodName: string; detail: string; unit: string; qty: string; origin: string
  packaging: string; temp: string; expiry: string; quality: string; vendor: string; note: string
}

const emptyRow = (): ReceivingRow => ({
  foodName: '', detail: '', unit: '', qty: '', origin: '', packaging: '', temp: '', expiry: '', quality: '', vendor: '', note: '',
})

const FIELDS: { key: keyof ReceivingRow; label: string; width: string }[] = [
  { key: 'foodName', label: '식품명', width: '13%' },
  { key: 'detail', label: '식품\n상세\n설명', width: '11%' },
  { key: 'unit', label: '단위', width: '6%' },
  { key: 'qty', label: '수량', width: '6%' },
  { key: 'origin', label: '원산지', width: '8%' },
  { key: 'packaging', label: '포장\n상태', width: '7%' },
  { key: 'temp', label: '식품\n온도\n(℃)', width: '7%' },
  { key: 'expiry', label: '소비기한\n(또는\n제조일)', width: '11%' },
  { key: 'quality', label: '품질\n상태', width: '7%' },
  { key: 'vendor', label: '업체군', width: '9%' },
  { key: 'note', label: '비고', width: '11%' },
]

const DEFAULT_ROWS = 10
const MAX_ROWS = 16

export default function Receiving({ date, grayscale, names, onDateChange }: FormProps) {
  const [inspector, setInspector] = useState(names?.checker ?? '')
  const [inspector2, setInspector2] = useState('')
  const [rows, setRows] = useState<ReceivingRow[]>(Array.from({ length: DEFAULT_ROWS }, emptyRow))

  useEffect(() => setInspector(names?.checker ?? ''), [names])

  const dateStr = date
    ? `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`
    : '        년     월     일'

  const updateRow = (idx: number, key: keyof ReceivingRow, val: string) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: val } : r)))

  return (
    <div className={`form-container${grayscale ? ' grayscale' : ''}`} data-printable>
      <div className="record-title-wrap">
        <div className="line left" /><div className="record-title">검수서</div><div className="line right" />
      </div>

      <div className="record-header" style={{ textAlign: 'left' }}>
        검수일자 : <DatePick date={date} onChange={onDateChange}>{dateStr}</DatePick><br />
        검 수 자 : <input className="meta-input" value={inspector} onChange={(e) => setInspector(e.target.value)} /> (인)
        &nbsp;&nbsp;<input className="meta-input" value={inspector2} onChange={(e) => setInspector2(e.target.value)} /> (인)
      </div>

      <table className="record-table">
        <thead>
          <tr>
            <th style={{ width: '4%' }}>No</th>
            {FIELDS.map((f) => <th key={f.key} style={{ width: f.width, whiteSpace: 'pre-line' }}>{f.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} style={{ height: '7mm' }}>
              <td>{idx + 1}</td>
              {FIELDS.map((f) => (
                <td key={f.key}><input className="cell-input" value={row[f.key]} onChange={(e) => updateRow(idx, f.key, e.target.value)} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="row-controls no-print">
        <button type="button" onClick={() => setRows((p) => [...p, emptyRow()])} disabled={rows.length >= MAX_ROWS}>+ 행 추가</button>
        <button type="button" onClick={() => setRows((p) => (p.length > 1 ? p.slice(0, -1) : p))}>- 행 삭제</button>
        <span>{rows.length}행 (최대 {MAX_ROWS}행, A4 1쪽 기준)</span>
      </div>

      <table className="mgmt-box">
        <tbody>
          <tr><td className="mgmt-label">관 리 기 준</td><td>• 냉장식품 및 전처리 농산물 10℃ 이하, 생선 및 육류 5℃ 이하, 냉동식품은 냉동상태 유지</td></tr>
          <tr><td className="mgmt-label">관 리 방 안</td><td>
            • 냉장식품, 전처리 농산물, 생선 및 육류, 냉동식품의 온도를 측정, 기록지에 기록<br />
            • 포장상태, 소비기한, 품질상태(녹은 흔적, 이물질 혼입 유무, 이취 등) 확인<br />
            • 월 1회 이상 운반차량 내부의 청결 상태 확인
          </td></tr>
          <tr><td className="mgmt-label">비 고</td><td>• 기준 이탈 재료 반품 및 교환, 부적합 확인서 발급</td></tr>
        </tbody>
      </table>
    </div>
  )
}

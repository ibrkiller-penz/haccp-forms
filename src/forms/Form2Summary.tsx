import { useEffect } from 'react'
import { useRecordState } from '../store/records'
import type { FormProps } from './types'
import { getSettings } from '../store/settings'
import '../print.css'
import './records-common.css'

interface SummaryRow { category: string; result: string; improvement: string; note: string }

const CATEGORIES = [
  '식단검토', '검수', 'CCP1. 식품취급 및 조리', 'CCP2. 조리완료 및 배식',
  'CP1. 냉장·냉동고(실) 온도관리', 'CP2. 식품접촉 표면 세척 및 소독',
]

const ta = (h: number): React.CSSProperties => ({
  width: '100%', height: h, border: 'none', resize: 'none', fontSize: '0.72rem', background: 'transparent', outline: 'none', padding: '2px 4px', fontFamily: 'inherit', boxShadow: 'none',
})

export default function Form2Summary({ grayscale, names }: FormProps) {
  const cal = getSettings().calendar
  const [period, setPeriod] = useRecordState('period', cal ? `${cal.from.replace(/-/g, '. ')}.~${cal.to.replace(/-/g, '. ')}.` : '')
  const [writer, setWriter] = useRecordState('writer', names?.writer ?? '')
  const [rows, setRows] = useRecordState<SummaryRow[]>('rows', CATEGORIES.map((category) => ({ category, result: '', improvement: '', note: '' })))
  const [confirmText, setConfirmText] = useRecordState('confirmText', '')
  useEffect(() => { if (names) setWriter(names.writer) }, [names])
  const set = (i: number, k: keyof SummaryRow, v: string) => setRows((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))

  return (
    <div className={`form-container${grayscale ? ' grayscale' : ''}`} data-printable>
      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.2rem' }}>[양식 2]</div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.35rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>CCP 및 CP 점검결과 및 조치</div>
        <div style={{ fontSize: '0.85rem', marginTop: 2 }}>(학기별 1회 실시)</div>
      </div>

      <div style={{ fontSize: '0.8rem', lineHeight: 1.9, marginBottom: '0.6rem' }}>
        <div><strong>작성 시기</strong> : <input className="meta-input" style={{ width: 260 }} value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="20○○. 03. 01.~20○○. 07. 31." /></div>
        <div><strong>작성자</strong> : <input className="meta-input" style={{ width: 160 }} value={writer} onChange={(e) => setWriter(e.target.value)} /></div>
      </div>

      <table className="record-table summary-table">
        <thead>
          <tr style={{ background: '#c7d2e8' }}>
            <th style={{ width: '27%', background: '#c7d2e8' }}>구 분</th>
            <th style={{ width: '31%', background: '#c7d2e8' }}>점검결과</th>
            <th style={{ width: '31%', background: '#c7d2e8' }}>개선조치</th>
            <th style={{ width: '11%', background: '#c7d2e8' }}>비 고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ height: '16mm' }}>
              <td style={{ textAlign: 'left', paddingLeft: '0.5rem', fontSize: '0.78rem' }}>{row.category}</td>
              <td><textarea style={ta(52)} value={row.result} onChange={(e) => set(i, 'result', e.target.value)} /></td>
              <td><textarea style={ta(52)} value={row.improvement} onChange={(e) => set(i, 'improvement', e.target.value)} /></td>
              <td><textarea style={ta(52)} value={row.note} onChange={(e) => set(i, 'note', e.target.value)} /></td>
            </tr>
          ))}
          <tr style={{ height: '30mm' }}>
            <td style={{ fontSize: '0.8rem' }}>확인 내용</td>
            <td colSpan={3}><textarea style={ta(105)} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

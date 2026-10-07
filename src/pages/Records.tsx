import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useRecordList, deleteRecord, clearRecords, exportRecords, importRecords } from '../store/records'
import { getForm } from '../forms/registry'
import './Records.css'

function fmt(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function Records() {
  const list = useRecordList()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [filter, setFilter] = useState<number | 0>(0)

  const shown = list.filter((r) => !filter || r.formId === filter)
  const formIds = Array.from(new Set(list.map((r) => r.formId))).sort((a, b) => a - b)

  const doExport = () => {
    const blob = new Blob([exportRecords()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `haccp-forms-records-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const doImport = async (f: File | undefined) => {
    if (!f) return
    try { setMsg(`${importRecords(await f.text())}건 가져옴`) }
    catch (e) { setMsg(`가져오기 실패: ${(e as Error).message}`) }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="page">
      <AppHeader />
      <main className="page-content records-main">
        <div className="home-hero">
          <div>
            <h1>저장된 기록</h1>
            <p className="muted">서식에 입력한 내용은 서식+날짜별로 이 브라우저에 자동 저장됩니다. 열어서 수정하고 다시 인쇄할 수 있습니다.</p>
          </div>
          <div className="home-actions">
            <button type="button" onClick={doExport} disabled={list.length === 0}>기록 JSON 내보내기</button>
            <button type="button" onClick={() => fileRef.current?.click()}>JSON 가져오기</button>
            <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => doImport(e.target.files?.[0])} />
          </div>
        </div>
        {msg && <p className="muted">{msg}</p>}

        <section className="card">
          <div className="card-head">
            <span className="card-num-badge blue">{list.length}</span>
            기록 목록
            <div className="card-actions">
              <select value={filter} onChange={(e) => setFilter(Number(e.target.value))} style={{ padding: '4px 8px', fontSize: 14 }}>
                <option value={0}>모든 서식</option>
                {formIds.map((id) => <option key={id} value={id}>{getForm(id)?.title ?? id}</option>)}
              </select>
              <button type="button" className="btn-danger btn-sm" disabled={list.length === 0} onClick={() => confirm('저장된 기록을 모두 삭제할까요?') && clearRecords()}>전체 삭제</button>
            </div>
          </div>
          <div className="card-body">
            {shown.length === 0 ? (
              <p className="muted">저장된 기록이 없습니다. 서식을 열어 날짜를 고르고 내용을 입력하면 자동으로 저장됩니다.</p>
            ) : (
              <table className="data-table">
                <thead><tr><th>서식</th><th style={{ width: 130 }}>날짜</th><th style={{ width: 150 }}>저장 시각</th><th style={{ width: 150 }}></th></tr></thead>
                <tbody>
                  {shown.map((r) => {
                    const form = getForm(r.formId)
                    const href = `/form/${r.formId}${r.date !== 'nodate' ? `?d=${r.date}` : ''}`
                    return (
                      <tr key={r.key}>
                        <td><Link to={href} className="rec-link">{form?.title ?? `서식 ${r.formId}`}</Link></td>
                        <td>{r.date === 'nodate' ? <span className="muted">날짜 없음</span> : r.date}</td>
                        <td className="muted">{fmt(r.savedAt)}</td>
                        <td className="row" style={{ justifyContent: 'flex-end' }}>
                          <Link to={href} className="btn btn-sm btn-primary">열기</Link>
                          <button type="button" className="btn-sm btn-ghost" onClick={() => confirm('이 기록을 삭제할까요?') && deleteRecord(r.key)}>삭제</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

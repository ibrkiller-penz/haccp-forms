import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import PrintOptionsPanel, { type PrintOptions } from '../components/PrintOptionsPanel'
import { getForm } from '../forms/registry'
import { toKey } from '../forms/types'
import { useSettings, pushRecent, holidayMap } from '../store/settings'
import { RecordContext, recordKey, useRecordMeta, deleteRecord } from '../store/records'
import { addDays, nextWeekday, toMonday } from '../lib/dates'
import '../print.css'

function parseDate(v: string | null): Date | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null
  const [y, m, d] = v.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function FormPage() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const form = getForm(Number(id))
  const s = useSettings()

  const [options, setOptions] = useState<PrintOptions>(() => {
    const d = parseDate(params.get('d'))
    return {
      date: d && form?.dateMode === 'weekly' ? toMonday(d) : d,
      grayscale: false,
      autoFill: false,
      names: s.defaultNames,
      copies: 1,
    }
  })

  useEffect(() => {
    if (form) pushRecent(form.id)
  }, [form])

  // PDF로 저장 시 파일명 = 서식명 + 날짜
  useEffect(() => {
    if (!form) return
    const d = options.date ? ` ${toKey(options.date)}` : ''
    document.title = `${form.title}${d}`
    return () => { document.title = '급식 위생 점검표 출력' }
  }, [form, options.date])

  const mainKey = form ? recordKey(form.id, options.date) : null
  const meta = useRecordMeta(mainKey)
  const [resetTick, setResetTick] = useState(0)

  if (!form) {
    return (
      <div className="page">
        <AppHeader />
        <main className="page-content" style={{ textAlign: 'center' }}>
          <h1>서식 {id}</h1>
          <p>존재하지 않는 서식입니다.</p>
          <Link to="/">돌아가기</Link>
        </main>
      </div>
    )
  }

  const { Component, dateMode } = form
  const holidays = holidayMap(s)
  const isAllHolidayWeek = (monday: Date) =>
    Array.from({ length: 5 }, (_, i) => addDays(monday, i)).every((d) => holidays[toKey(d)])

  const copies = options.date && dateMode !== 'none' ? options.copies : 1
  const dates: (Date | null)[] = []
  if (!options.date) dates.push(null)
  else {
    let d = options.date
    let guard = 0
    while (dates.length < copies && guard++ < 60) {
      const skip = dateMode === 'weekly' ? isAllHolidayWeek(d) : !!holidays[toKey(d)]
      if (!skip || dates.length === 0) dates.push(d)
      d = dateMode === 'weekly' ? addDays(d, 7) : nextWeekday(d)
    }
  }

  const savedAt = meta?.savedAt ? new Date(meta.savedAt) : null
  const resetRecord = () => {
    if (!mainKey || !confirm('이 서식·날짜의 입력 내용을 지우고 빈 서식으로 되돌릴까요?')) return
    deleteRecord(mainKey)
    setResetTick((t) => t + 1)
  }

  return (
    <div className="page">
      <AppHeader />
      <PrintOptionsPanel
        options={options}
        onChange={(p) => setOptions((o) => ({ ...o, ...p }))}
        dateMode={dateMode}
        formId={form.id}
        title={form.title}
        onPrint={() => window.print()}
      >
        <span className="option-group" style={{ fontSize: 13 }}>
          {savedAt ? (
            <span className="tag tag-green" title="입력 내용은 서식+날짜별로 이 브라우저에 자동 저장됩니다">
              자동 저장 {String(savedAt.getHours()).padStart(2, '0')}:{String(savedAt.getMinutes()).padStart(2, '0')}
            </span>
          ) : (
            <span className="tag tag-gray">입력 시 자동 저장</span>
          )}
          {savedAt && <button type="button" className="btn-ghost btn-sm" onClick={resetRecord}>빈 서식으로</button>}
          <Link to="/records" className="hint-link">저장된 기록</Link>
        </span>
      </PrintOptionsPanel>
      <div className="form-page-wrapper">
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>}>
          {dates.map((d, i) => (
            <RecordContext.Provider key={`${i}-${resetTick}`} value={recordKey(form.id, d)}>
              <Component
                date={d}
                grayscale={options.grayscale}
                names={options.autoFill ? options.names : null}
                schoolName={s.schoolName}
                holidays={holidays}
                onDateChange={i === 0 ? (nd) => setOptions((o) => ({ ...o, date: dateMode === 'weekly' ? toMonday(nd) : nd })) : undefined}
              />
            </RecordContext.Provider>
          ))}
        </Suspense>
      </div>
    </div>
  )
}

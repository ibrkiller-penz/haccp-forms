import { useEffect, useState, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import PrintOptionsPanel, { type PrintOptions } from '../components/PrintOptionsPanel'
import { getForm } from '../forms/registry'
import { toKey } from '../forms/types'
import { useSettings, pushRecent, holidayMap } from '../store/settings'
import { addDays, nextWeekday, toMonday } from '../lib/dates'
import '../print.css'

export default function FormPage() {
  const { id } = useParams<{ id: string }>()
  const form = getForm(Number(id))
  const s = useSettings()

  const [options, setOptions] = useState<PrintOptions>({
    date: null,
    grayscale: false,
    autoFill: false,
    names: s.defaultNames,
    copies: 1,
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
      />
      <div className="form-page-wrapper">
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>}>
          {dates.map((d, i) => (
            <Component
              key={i}
              date={d}
              grayscale={options.grayscale}
              names={options.autoFill ? options.names : null}
              schoolName={s.schoolName}
              holidays={holidays}
              onDateChange={i === 0 ? (d) => setOptions((o) => ({ ...o, date: dateMode === 'weekly' ? toMonday(d) : d })) : undefined}
            />
          ))}
        </Suspense>
      </div>
    </div>
  )
}

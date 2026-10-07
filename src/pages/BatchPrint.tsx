import { useState, Suspense } from 'react'
import AppHeader from '../components/AppHeader'
import PrintOptionsPanel, { type PrintOptions } from '../components/PrintOptionsPanel'
import { FORMS, matchesSchoolType, weeklySetIds } from '../forms/registry'
import { useSettings, holidayMap } from '../store/settings'
import { RecordContext, recordKey } from '../store/records'
import { toMonday } from '../lib/dates'
import '../print.css'
import './BatchPrint.css'

export default function BatchPrint() {
  const s = useSettings()
  const [selected, setSelected] = useState<number[]>([])
  const [showAll, setShowAll] = useState(false)
  const [options, setOptions] = useState<PrintOptions>({
    date: null,
    grayscale: false,
    autoFill: false,
    names: s.defaultNames,
    copies: 1,
  })

  const visible = FORMS.filter((f) => showAll || matchesSchoolType(f, s.schoolType))
  const toggle = (id: number) => setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]))
  const ordered = FORMS.filter((f) => selected.includes(f.id))
  const holidays = holidayMap(s)

  return (
    <div className="page">
      <AppHeader />
      <PrintOptionsPanel
        options={options}
        onChange={(p) => setOptions((o) => ({ ...o, ...p }))}
        dateMode="daily"
        title="일괄 인쇄"
        showCopies={false}
        onPrint={() => window.print()}
      >
        <span className="muted" style={{ fontSize: 13 }}>(주간 서식은 선택한 날짜가 속한 주의 월~금)</span>
      </PrintOptionsPanel>

      <div className="form-page-wrapper">
        <div className="card batch-picker no-print">
          <div className="card-head">
            <span className="card-num-badge green">✓</span>
            서식 선택
            <div className="card-actions">
              <button type="button" className="btn-primary btn-sm" onClick={() => setSelected(weeklySetIds(s.schoolType))}>주간 세트 (일일위생 + 청소 + CP1 + CP2)</button>
              <button type="button" className="btn-sm" onClick={() => setSelected([])}>선택 해제</button>
            </div>
          </div>
          <div className="card-body">
            <div className="batch-list">
              {visible.map((f) => (
                <label key={f.id} className={`batch-item${selected.includes(f.id) ? ' on' : ''}`}>
                  <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggle(f.id)} />
                  <span>{f.title}</span>
                  {f.subtitle && <small>{f.subtitle}</small>}
                </label>
              ))}
            </div>
            <label className="option-check" style={{ marginTop: 10 }}>
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
              급식소 유형과 무관한 서식도 보기
            </label>
            {ordered.length === 0 && <p className="muted" style={{ marginTop: 8 }}>서식을 선택하면 아래에 미리보기가 쌓입니다. 인쇄 시 서식마다 새 쪽에 출력됩니다.</p>}
          </div>
        </div>

        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>}>
          {ordered.map((f) => {
            const date =
              !options.date || f.dateMode === 'none' ? null
              : f.dateMode === 'weekly' ? toMonday(options.date)
              : options.date
            return (
              <RecordContext.Provider key={f.id} value={recordKey(f.id, date)}>
                <f.Component
                  date={date}
                  grayscale={options.grayscale}
                  names={options.autoFill ? options.names : null}
                  schoolName={s.schoolName}
                  holidays={holidays}
                />
              </RecordContext.Provider>
            )
          })}
        </Suspense>
      </div>
    </div>
  )
}

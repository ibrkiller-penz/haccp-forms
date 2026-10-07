import { useRef, useState } from 'react'
import AppHeader from '../components/AppHeader'
import {
  useSettings, updateSettings, clearAllData, exportJSON, importJSON,
  type SchoolType, type RoleNames, type CalEvent, type CalEventType, type TermCalendar,
} from '../store/settings'
import { OFFICES, searchSchools, fetchSchedule, type SchoolHit } from '../lib/neis'
import { publicHolidaysBetween } from '../lib/holidays'
import './Settings.css'

const ROLE_LABEL: Record<keyof RoleNames, string> = { checker: '점검자·검수자', writer: '작성자', confirmer: '확인자' }
const EVENT_TYPES: CalEventType[] = ['휴업', '시험', '행사', '기타']
const KINDS = ['전체', '초등학교', '중학교', '고등학교']

function Card({ n, color, title, extra, children }: { n: number; color: string; title: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={`card card-theme-${color}`}>
      <div className="card-head">
        <span className={`card-num-badge ${color}`}>{n}</span>
        {title}
        {extra && <div className="card-actions">{extra}</div>}
      </div>
      <div className="card-body">{children}</div>
    </section>
  )
}

export default function Settings() {
  const s = useSettings()

  // ── 1. 학교 ──
  const [office, setOffice] = useState(s.school?.ofcdcCode ?? 'C10')
  const [kind, setKind] = useState('전체')
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SchoolHit[]>([])
  const [searching, setSearching] = useState(false)
  const [searchMsg, setSearchMsg] = useState('')

  const doSearch = async () => {
    if (!query.trim()) return
    setSearching(true); setSearchMsg('')
    try {
      let list = await searchSchools(query, office || undefined, s.neisKey || undefined)
      if (kind !== '전체') list = list.filter((h) => h.kind === kind)
      setHits(list)
      if (list.length === 0) setSearchMsg('검색 결과가 없습니다. 학교명 일부만 입력해 보세요. (예: "행복")')
    } catch (e) {
      setSearchMsg(`검색 실패: ${(e as Error).message}`)
    } finally { setSearching(false) }
  }

  const pickSchool = (h: SchoolHit) => {
    updateSettings({ school: { name: h.name, ofcdcCode: h.ofcdcCode, schulCode: h.schulCode }, schoolName: h.name })
    setHits([])
  }

  const setType = <K extends keyof SchoolType>(k: K, v: SchoolType[K]) =>
    updateSettings({ schoolType: { ...(s.schoolType ?? { kitchen: 'A', serving: 'A', dishwasher: 'B' }), [k]: v } })

  // ── 2. 이름 ──
  const [newName, setNewName] = useState('')
  const addName = () => {
    const n = newName.trim()
    if (!n || s.names.includes(n)) { setNewName(''); return }
    updateSettings({ names: [...s.names, n] })
    setNewName('')
  }
  const removeName = (n: string) =>
    updateSettings((p) => ({
      names: p.names.filter((x) => x !== n),
      defaultNames: Object.fromEntries(Object.entries(p.defaultNames).map(([k, v]) => [k, v === n ? '' : v])) as RoleNames,
    }))

  // ── 3. 학사일정 ──
  const thisYear = new Date().getFullYear()
  const cal: TermCalendar = s.calendar ?? { year: thisYear, termName: `${thisYear}학년도 1학기`, from: `${thisYear}-03-02`, to: `${thisYear}-07-31`, events: [] }
  const setCal = (patch: Partial<TermCalendar>) => updateSettings({ calendar: { ...cal, ...patch } })
  const preset = (term: 1 | 2) => {
    const y = cal.year
    if (term === 1) setCal({ termName: `${y}학년도 1학기`, from: `${y}-03-02`, to: `${y}-07-31` })
    else setCal({ termName: `${y}학년도 2학기`, from: `${y}-08-16`, to: `${y + 1}-02-28` })
  }
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState('')
  const [syncMsg, setSyncMsg] = useState('')

  const mergeEvents = (incoming: CalEvent[]) => {
    const key = (e: CalEvent) => `${e.date}|${e.name}`
    const existing = new Set(cal.events.map(key))
    const merged = [...cal.events, ...incoming.filter((e) => !existing.has(key(e)))]
    merged.sort((a, b) => a.date.localeCompare(b.date))
    return merged
  }

  const syncNeis = async () => {
    if (!s.school) { setSyncMsg('먼저 1번에서 학교를 검색해 선택하세요.'); return }
    setSyncing(true); setSyncMsg(''); setProgress('')
    try {
      const ev = await fetchSchedule(s.school, cal.from, cal.to, s.neisKey || undefined, (d, t) => setProgress(`${d}/${t}주 조회 중…`))
      const hol = publicHolidaysBetween(cal.from, cal.to).map<CalEvent>((h) => ({ date: h.date, name: h.name, type: '휴업' }))
      const merged = mergeEvents([...ev, ...hol])
      setCal({ events: merged, syncedAt: new Date().toISOString() })
      setSyncMsg(`나이스 ${ev.length}건 + 공휴일 ${hol.length}건 반영 (중복 제외). 아래 표에서 유형을 확인·수정하세요.`)
    } catch (e) {
      setSyncMsg(`가져오기 실패: ${(e as Error).message}`)
    } finally { setSyncing(false); setProgress('') }
  }

  const addHolidaysOnly = () => {
    const hol = publicHolidaysBetween(cal.from, cal.to).map<CalEvent>((h) => ({ date: h.date, name: h.name, type: '휴업' }))
    setCal({ events: mergeEvents(hol) })
    setSyncMsg(`공휴일 ${hol.length}건 반영`)
  }

  const updateEvent = (i: number, patch: Partial<CalEvent>) => {
    const events = cal.events.map((e, idx) => (idx === i ? { ...e, ...patch } : e))
    setCal({ events })
  }
  const removeEvent = (i: number) => setCal({ events: cal.events.filter((_, idx) => idx !== i) })
  const addEvent = () => setCal({ events: [...cal.events, { date: cal.from, name: '', type: '휴업' }] })
  const sortEvents = () => setCal({ events: [...cal.events].sort((a, b) => a.date.localeCompare(b.date)) })

  // ── 4. 백업 ──
  const fileRef = useRef<HTMLInputElement>(null)
  const [backupMsg, setBackupMsg] = useState('')
  const doExport = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `haccp-forms-settings-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const doImport = async (f: File | undefined) => {
    if (!f) return
    try { importJSON(await f.text()); setBackupMsg('복원 완료') }
    catch (e) { setBackupMsg(`복원 실패: ${(e as Error).message}`) }
    if (fileRef.current) fileRef.current.value = ''
  }
  const doClear = () => {
    if (confirm('저장된 모든 설정(학교·이름·학사일정·즐겨찾기·청소항목)을 삭제합니다. 되돌릴 수 없습니다. 계속할까요?')) {
      clearAllData()
      setBackupMsg('모든 데이터를 삭제했습니다.')
    }
  }

  const holidayCount = cal.events.filter((e) => e.type === '휴업').length
  const [onlyHoliday, setOnlyHoliday] = useState(false)
  const shownEvents = cal.events.map((e, i) => ({ e, i })).filter(({ e }) => !onlyHoliday || e.type === '휴업')

  return (
    <div className="page">
      <AppHeader />
      <main className="page-content settings-main">
        <div className="settings-intro">
          <h1>설정</h1>
          <p className="muted">입력한 정보는 <strong>이 브라우저(localStorage)에만</strong> 저장되며 서버로 전송되지 않습니다. 나이스 조회 시에만 학교 코드가 공공 API로 전달됩니다. 변경 사항은 자동 저장됩니다.</p>
        </div>

        <Card n={1} color="green" title="학교 선택 및 유형 설정" extra={s.school && <span className="tag tag-green">나이스 연동됨</span>}>
          <div className="card-inner-box">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>🏫 학교 검색 (나이스 공공 API)</strong>
            </div>
            <label className="field-label">1. 학교급</label>
            <div className="segmented">
              {KINDS.map((k) => <button key={k} type="button" className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{k}</button>)}
            </div>
            <label className="field-label">2. 관할 교육청</label>
            <select value={office} onChange={(e) => setOffice(e.target.value)} style={{ minWidth: 200 }}>
              <option value="">전체 교육청</option>
              {OFFICES.map((o) => <option key={o.code} value={o.code}>{o.name}교육청</option>)}
            </select>
            <label className="field-label">3. 학교명 검색</label>
            <div className="row">
              <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} placeholder="예: 행복고 / 행복" style={{ flex: 1, minWidth: 200 }} />
              <button type="button" className="btn-primary" onClick={doSearch} disabled={searching}>{searching ? '검색 중…' : '검색'}</button>
            </div>
            {searchMsg && <p className="muted" style={{ marginTop: 8 }}>{searchMsg}</p>}
            {hits.length > 0 && (
              <ul className="hit-list">
                {hits.map((h) => (
                  <li key={h.schulCode}>
                    <button type="button" className="btn-sm" onClick={() => pickSchool(h)}>선택</button>
                    <strong>{h.name}</strong> <span className="tag tag-gray">{h.kind}</span> <span className="muted">{h.address}</span>
                  </li>
                ))}
              </ul>
            )}
            <label className="field-label">4. 최종 학교명 (서식에 인쇄, 직접 수정 가능)</label>
            <input value={s.schoolName} onChange={(e) => updateSettings({ schoolName: e.target.value })} placeholder="OO고등학교" style={{ width: '100%', maxWidth: 360 }} />
            {s.school && <p className="muted" style={{ marginTop: 6 }}>나이스 코드: {s.school.ofcdcCode} / {s.school.schulCode}</p>}
          </div>

          <div className="card-inner-box">
            <strong>🍳 급식소 유형</strong>
            <p className="muted" style={{ margin: '4px 0 8px' }}>유형에 맞지 않는 서식 변형은 목록에서 자동으로 숨겨집니다.</p>
            <label className="field-label">조리장 장소 구분 → CCP1</label>
            <div className="segmented">
              <button type="button" className={s.schoolType?.kitchen === 'A' ? 'on' : ''} onClick={() => setType('kitchen', 'A')}>구분 가능 (CCP1A)</button>
              <button type="button" className={s.schoolType?.kitchen === 'B' ? 'on' : ''} onClick={() => setType('kitchen', 'B')}>구분 불가 (CCP1B)</button>
            </div>
            <label className="field-label">조리·배식 방식 → CCP2</label>
            <div className="segmented">
              <button type="button" className={s.schoolType?.serving === 'A' ? 'on' : ''} onClick={() => setType('serving', 'A')}>단독조리 · 식당 배식 (2A)</button>
              <button type="button" className={s.schoolType?.serving === 'B' ? 'on' : ''} onClick={() => setType('serving', 'B')}>단독조리 · 교실 배식 (2B)</button>
              <button type="button" className={s.schoolType?.serving === 'C' ? 'on' : ''} onClick={() => setType('serving', 'C')}>공동조리 (2C)</button>
            </div>
            <label className="field-label">식기세척기 → CP2</label>
            <div className="segmented">
              <button type="button" className={s.schoolType?.dishwasher === 'A' ? 'on' : ''} onClick={() => setType('dishwasher', 'A')}>식판 소독 안 됨 (2A)</button>
              <button type="button" className={s.schoolType?.dishwasher === 'B' ? 'on' : ''} onClick={() => setType('dishwasher', 'B')}>식판 소독 가능 (2B)</button>
              <button type="button" className={s.schoolType?.dishwasher === 'C' ? 'on' : ''} onClick={() => setType('dishwasher', 'C')}>세척기 없음 (2C)</button>
            </div>
            {!s.schoolType && <p className="muted" style={{ marginTop: 8 }}>아직 선택하지 않아 14종이 모두 표시됩니다.</p>}
          </div>
        </Card>

        <Card n={2} color="blue" title="점검자 · 작성자 · 확인자 이름" extra={<span className="tag tag-blue">{s.names.length}명</span>}>
          <div className="card-inner-box">
            <div className="row">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addName()} placeholder="이름 입력 후 Enter" style={{ flex: 1, minWidth: 180 }} />
              <button type="button" className="btn-blue" onClick={addName}>추가</button>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              {s.names.length === 0 && <span className="muted">등록된 이름이 없습니다.</span>}
              {s.names.map((n) => (
                <span key={n} className="tag name-tag">{n}<button type="button" className="tag-x" onClick={() => removeName(n)} title="삭제">×</button></span>
              ))}
            </div>
          </div>
          <div className="card-inner-box">
            <strong>기본값</strong>
            <p className="muted" style={{ margin: '4px 0 8px' }}>서식에서 "이름 자동 채움"을 켜면 아래 기본값이 들어갑니다. 서명은 항상 손으로 합니다.</p>
            <div className="role-grid">
              {(Object.keys(ROLE_LABEL) as (keyof RoleNames)[]).map((role) => (
                <label key={role} className="role-item">
                  <span>{ROLE_LABEL[role]}</span>
                  <select value={s.defaultNames[role]} onChange={(e) => updateSettings({ defaultNames: { ...s.defaultNames, [role]: e.target.value } })}>
                    <option value="">(빈칸)</option>
                    {s.names.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </div>
        </Card>

        <Card n={3} color="orange" title="학기 운영 기간 및 학사일정" extra={cal.syncedAt && <span className="tag tag-orange">동기화 {cal.syncedAt.slice(0, 10)}</span>}>
          <div className="card-inner-box">
            <strong>🗓️ 학년도 · 학기</strong>
            <div className="row" style={{ marginTop: 8 }}>
              <select value={cal.year} onChange={(e) => setCal({ year: Number(e.target.value) })}>
                {Array.from({ length: 6 }, (_, i) => thisYear - 1 + i).map((y) => <option key={y} value={y}>{y}학년도</option>)}
              </select>
              <button type="button" className="btn-sm" onClick={() => preset(1)}>🌸 1학기 (3~7월)</button>
              <button type="button" className="btn-sm" onClick={() => preset(2)}>🍂 2학기 (8~익년 2월)</button>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <label className="row">학기명 <input value={cal.termName} onChange={(e) => setCal({ termName: e.target.value })} style={{ width: 180 }} /></label>
              <label className="row">기간 <input type="date" value={cal.from} onChange={(e) => setCal({ from: e.target.value })} /> ~ <input type="date" value={cal.to} onChange={(e) => setCal({ to: e.target.value })} /></label>
            </div>
          </div>

          <div className="card-inner-box">
            <strong>🌐 나이스(NEIS) 학사일정 가져오기</strong>
            <p className="muted" style={{ margin: '4px 0 8px' }}>재량휴업일·방학·시험 등을 조회해 아래 표에 넣습니다. "휴업" 유형인 날은 주간 서식 날짜 칸에 <b>휴업</b>으로 표시되고 연속 인쇄에서 방학 주는 건너뜁니다.</p>
            <div className="row">
              <button type="button" className="btn-primary" onClick={syncNeis} disabled={syncing}>{syncing ? (progress || '조회 중…') : '나이스 학사일정 가져오기'}</button>
              <button type="button" onClick={addHolidaysOnly}>공휴일만 넣기</button>
              <label className="row muted" style={{ fontSize: 13 }}>
                API 키(선택, 없으면 7일 단위 조회)
                <input value={s.neisKey} onChange={(e) => updateSettings({ neisKey: e.target.value })} placeholder="open.neis.go.kr 인증키" style={{ width: 200, fontSize: 13 }} />
              </label>
            </div>
            {syncMsg && <p className="muted" style={{ marginTop: 8 }}>{syncMsg}</p>}
          </div>

          <div className="card-inner-box">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>📋 학사일정 목록 <span className="tag tag-red">휴업 {holidayCount}일</span> <span className="tag tag-gray">전체 {cal.events.length}건</span></strong>
              <div className="row">
                <label className="option-check" style={{ fontSize: 13 }}>
                  <input type="checkbox" checked={onlyHoliday} onChange={(e) => setOnlyHoliday(e.target.checked)} />휴업일만 보기
                </label>
                <button type="button" className="btn-sm" onClick={addEvent}>+ 직접 추가</button>
                <button type="button" className="btn-sm" onClick={sortEvents}>날짜순 정렬</button>
                <button type="button" className="btn-sm" onClick={() => confirm('학사일정 목록을 비울까요?') && setCal({ events: [] })}>비우기</button>
              </div>
            </div>
            {cal.events.length === 0 ? (
              <p className="muted" style={{ marginTop: 8 }}>아직 일정이 없습니다. 위에서 가져오거나 직접 추가하세요.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th style={{ width: 150 }}>날짜</th><th>일정명</th><th style={{ width: 100 }}>유형</th><th style={{ width: 60 }}></th></tr></thead>
                  <tbody>
                    {shownEvents.map(({ e, i }) => (
                      <tr key={i} className={e.type === '휴업' ? 'is-holiday' : ''}>
                        <td><input type="date" value={e.date} onChange={(ev) => updateEvent(i, { date: ev.target.value })} className="cell-edit" /></td>
                        <td><input value={e.name} onChange={(ev) => updateEvent(i, { name: ev.target.value })} className="cell-edit" style={{ width: '100%' }} /></td>
                        <td>
                          <select value={e.type} onChange={(ev) => updateEvent(i, { type: ev.target.value as CalEventType })} className="cell-edit">
                            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td><button type="button" className="btn-ghost btn-sm" onClick={() => removeEvent(i)}>삭제</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        <Card n={4} color="purple" title="백업 · 복원 · 삭제">
          <div className="row">
            <button type="button" onClick={doExport}>설정 JSON 내보내기</button>
            <button type="button" onClick={() => fileRef.current?.click()}>JSON 불러오기</button>
            <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => doImport(e.target.files?.[0])} />
            <button type="button" className="btn-danger" onClick={doClear} style={{ marginLeft: 'auto' }}>전체 삭제</button>
          </div>
          {backupMsg && <p className="muted" style={{ marginTop: 8 }}>{backupMsg}</p>}
        </Card>
      </main>
    </div>
  )
}

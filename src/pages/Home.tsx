import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { FORMS, matchesSchoolType, type FormMeta, type Category } from '../forms/registry'
import { useSettings, toggleFavorite } from '../store/settings'
import './Home.css'

const CATEGORIES: { key: Category; color: string; desc: string }[] = [
  { key: '점검표', color: 'green', desc: '주간(월~금) 점검표' },
  { key: '기록지', color: 'blue', desc: 'HACCP 기록지 (일별·주간)' },
  { key: '학기 서식', color: 'purple', desc: '학기별 1회' },
]

function FormCard({ form, fav }: { form: FormMeta; fav: boolean }) {
  return (
    <div className="form-card">
      <Link to={`/form/${form.id}`} className="form-card-link">
        <div className="form-card-top">
          <span className="form-id">{form.id}</span>
          <span className={`tag ${form.dateMode === 'weekly' ? 'tag-green' : form.dateMode === 'daily' ? 'tag-blue' : 'tag-gray'}`}>
            {form.dateMode === 'weekly' ? '주간' : form.dateMode === 'daily' ? '일별' : '학기'}
          </span>
        </div>
        <h3>{form.title}</h3>
        {form.subtitle && <p>{form.subtitle}</p>}
      </Link>
      <button type="button" className={`fav-toggle${fav ? ' on' : ''}`} title={fav ? '즐겨찾기 해제' : '즐겨찾기'} onClick={() => toggleFavorite(form.id)}>
        {fav ? '★' : '☆'}
      </button>
    </div>
  )
}

export default function Home() {
  const s = useSettings()
  const [showHidden, setShowHidden] = useState(false)

  const isFav = (id: number) => s.favorites.includes(id)
  const visible = FORMS.filter((f) => showHidden || matchesSchoolType(f, s.schoolType))
  const hiddenCount = FORMS.length - FORMS.filter((f) => matchesSchoolType(f, s.schoolType)).length
  const favorites = FORMS.filter((f) => isFav(f.id))
  const recent = s.recent.map((id) => FORMS.find((f) => f.id === id)).filter((f): f is FormMeta => !!f)

  return (
    <div className="page">
      <AppHeader />
      <main className="page-content">
        <div className="home-hero">
          <div>
            <h1>서식 선택 → 날짜·이름 채우기 → 인쇄</h1>
            <p className="muted">학교급식 위생관리 지침서(제6차 개정본) 점검표·기록지 14종. 인쇄 결과와 동일한 A4 미리보기를 제공합니다.</p>
          </div>
          <div className="home-actions">
            <Link to="/batch" className="btn btn-primary btn-lg">🖨️ 일괄 인쇄 · 주간 세트</Link>
            <Link to="/settings" className="btn btn-lg">⚙️ 설정</Link>
          </div>
        </div>

        {!s.schoolType && (
          <div className="card card-theme-orange">
            <div className="card-body row" style={{ justifyContent: 'space-between' }}>
              <span><strong>처음이신가요?</strong> 설정에서 학교·급식소 유형·이름·학사일정을 한 번만 넣어 두면 서식마다 자동으로 채워집니다.</span>
              <Link to="/settings" className="btn btn-sm">설정하러 가기 →</Link>
            </div>
          </div>
        )}

        {(favorites.length > 0 || recent.length > 0) && (
          <section className="card">
            <div className="card-head"><span className="card-num-badge orange">★</span>자주 쓰는 서식</div>
            <div className="card-body">
              {favorites.length > 0 && (
                <div className="form-grid">{favorites.map((f) => <FormCard key={f.id} form={f} fav />)}</div>
              )}
              {recent.length > 0 && (
                <div className="recent-row">
                  <span className="muted">최근 사용</span>
                  {recent.map((f) => <Link key={f.id} to={`/form/${f.id}`} className="tag recent-chip">{f.title}</Link>)}
                </div>
              )}
            </div>
          </section>
        )}

        {CATEGORIES.map((cat, i) => {
          const list = visible.filter((f) => f.category === cat.key)
          if (list.length === 0) return null
          return (
            <section className="card" key={cat.key}>
              <div className="card-head">
                <span className={`card-num-badge ${cat.color}`}>{i + 1}</span>
                {cat.key} <span className="muted" style={{ fontWeight: 500 }}>{cat.desc}</span>
                <div className="card-actions"><span className="tag">{list.length}종</span></div>
              </div>
              <div className="card-body">
                <div className="form-grid">{list.map((f) => <FormCard key={f.id} form={f} fav={isFav(f.id)} />)}</div>
              </div>
            </section>
          )
        })}

        {s.schoolType && hiddenCount > 0 && (
          <label className="show-hidden">
            <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
            급식소 유형에 해당 없는 서식 {hiddenCount}개도 보기
          </label>
        )}

        <p className="muted home-foot">이름·학교명 등은 이 브라우저에만 저장됩니다. 인쇄는 PC(Chrome/Edge) 기준이며, 모바일에서는 목록·설정만 권장합니다.</p>
      </main>
    </div>
  )
}

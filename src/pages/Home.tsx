import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <div className="home">
      <header className="header">
        <h1>급식 위생 점검표 출력</h1>
        <p>학교급식 위생관리 지침서(제6차 개정본)의 점검표·기록지 14종을 A4로 인쇄합니다.</p>
      </header>

      <main className="main">
        <section className="section">
          <h2>점검표</h2>
          <div className="form-grid">
            <Link to="/form/1" className="form-card">
              <h3>일일 위생관리 점검표</h3>
              <p>주간(월~금), 항목 17개</p>
            </Link>
            <Link to="/form/2" className="form-card">
              <h3>주(일)별 세척·청소 점검표</h3>
              <p>일별 항목 23 + 주별 6</p>
            </Link>
          </div>
        </section>

        <section className="section">
          <h2>기록지</h2>
          <div className="form-grid">
            <Link to="/form/3" className="form-card">
              <h3>식단검토</h3>
            </Link>
            <Link to="/form/4" className="form-card">
              <h3>검수서</h3>
            </Link>
            <Link to="/form/5" className="form-card">
              <h3>CCP1A 식품취급 및 조리</h3>
              <p>(장소 구분 가능)</p>
            </Link>
            <Link to="/form/6" className="form-card">
              <h3>CCP1B 식품취급 및 조리</h3>
              <p>(장소 구분 불가)</p>
            </Link>
            <Link to="/form/7" className="form-card">
              <h3>CCP2A 조리완료 및 배식</h3>
              <p>단독조리·식생활교육관(식당)</p>
            </Link>
            <Link to="/form/8" className="form-card">
              <h3>CCP2B 조리완료 및 배식</h3>
              <p>단독조리·교실배식</p>
            </Link>
            <Link to="/form/9" className="form-card">
              <h3>CCP2C 조리완료 및 배식</h3>
              <p>공동조리</p>
            </Link>
            <Link to="/form/10" className="form-card">
              <h3>CP1 냉장·냉동고 온도관리</h3>
            </Link>
            <Link to="/form/11" className="form-card">
              <h3>CP2A 식품 접촉표면 세척·소독</h3>
              <p>(식기세척기 불가)</p>
            </Link>
            <Link to="/form/12" className="form-card">
              <h3>CP2B 식품 접촉표면 세척·소독</h3>
              <p>(식기세척기 가능)</p>
            </Link>
            <Link to="/form/13" className="form-card">
              <h3>CP2C 식품 접촉표면 세척·소독</h3>
              <p>(식기세척기 없음)</p>
            </Link>
            <Link to="/form/14" className="form-card">
              <h3>[양식2] CCP 및 CP 점검결과 및 조치</h3>
              <p>학기별 1회</p>
            </Link>
          </div>
        </section>
      </main>

      <nav className="footer-nav">
        <Link to="/settings">설정</Link>
      </nav>
    </div>
  )
}

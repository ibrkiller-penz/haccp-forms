import { Link, NavLink } from 'react-router-dom'
import { useSettings } from '../store/settings'
import './AppHeader.css'

export default function AppHeader() {
  const { schoolName } = useSettings()
  return (
    <header className="app-header no-print">
      <Link to="/" className="app-brand">
        <img src="./logo.svg" alt="" className="app-logo" />
        <span className="app-title">급식 위생 <em>점검표 출력</em></span>
      </Link>
      {schoolName && <span className="tag tag-green app-school">{schoolName}</span>}
      <nav className="app-nav">
        <NavLink to="/" end>서식 목록</NavLink>
        <NavLink to="/batch">일괄 인쇄</NavLink>
        <NavLink to="/records">저장된 기록</NavLink>
        <NavLink to="/settings">설정</NavLink>
      </nav>
    </header>
  )
}

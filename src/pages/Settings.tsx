import { Link } from 'react-router-dom'
import './Settings.css'

export default function Settings() {
  return (
    <div className="settings">
      <header className="settings-header">
        <Link to="/">← 돌아가기</Link>
        <h1>설정</h1>
      </header>

      <main className="settings-main">
        <section className="settings-section">
          <h2>개인정보 알림</h2>
          <p>이 정보는 이 브라우저에만 저장됩니다. 서버에 전송되지 않습니다.</p>
        </section>

        <section className="settings-section">
          <h2>학교 유형</h2>
          <div className="form-group">
            <label>
              <input type="radio" name="kitchenType" value="separated" defaultChecked />
              조리장 장소 구분 가능
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="radio" name="kitchenType" value="mixed" />
              조리장 장소 구분 불가
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>이름 관리</h2>
          <p>점검자, 작성자, 확인자 이름을 저장하여 빠르게 입력할 수 있습니다.</p>
          <div className="form-group">
            <input type="text" placeholder="이름 추가" />
            <button>추가</button>
          </div>
        </section>

        <section className="settings-section">
          <h2>백업 및 복원</h2>
          <div className="button-group">
            <button>내보내기 (JSON)</button>
            <button>가져오기</button>
          </div>
        </section>

        <section className="settings-section settings-danger">
          <h2>데이터 삭제</h2>
          <p>모든 저장된 정보를 완전히 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
          <button className="danger-button">전체 삭제</button>
        </section>
      </main>
    </div>
  )
}

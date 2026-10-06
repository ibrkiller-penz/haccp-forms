import { useParams } from 'react-router-dom'

export default function FormPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="form-page">
      <h1>서식 {id}</h1>
      <p>개발 중입니다.</p>
    </div>
  )
}

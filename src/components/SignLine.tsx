import './SignLine.css'

interface SignLineProps {
  role: string
  name?: string
}

export default function SignLine({ role, name }: SignLineProps) {
  return (
    <div className="sign-line">
      <div className="sign-line-label">{role}</div>
      <div className="sign-line-input">{name ? `(${name})` : ''}</div>
    </div>
  )
}

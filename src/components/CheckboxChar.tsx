import './CheckboxChar.css'

interface CheckboxCharProps {
  checked?: boolean
  className?: string
}

export default function CheckboxChar({ checked, className = '' }: CheckboxCharProps) {
  return <span className={`checkbox-char ${checked ? 'checked' : ''} ${className}`} />
}

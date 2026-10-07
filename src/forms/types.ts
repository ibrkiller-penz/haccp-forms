import type { RoleNames } from '../store/settings'

export interface FormProps {
  /** 주간 서식은 월요일, 일별 서식은 해당 일자. null이면 빈칸 */
  date: Date | null
  grayscale: boolean
  /** null이면 이름 자동 채움 끔 (완전 빈 서식) */
  names: RoleNames | null
  schoolName: string
  /** 휴업일 맵 (YYYY-MM-DD → 명칭). 주간 서식의 날짜 칸에 표시 */
  holidays: Record<string, string>
  /** 서식 안의 날짜 칸에서 직접 날짜를 고를 때 (주간 서식은 상위에서 월요일로 보정) */
  onDateChange?: (d: Date) => void
}

export const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

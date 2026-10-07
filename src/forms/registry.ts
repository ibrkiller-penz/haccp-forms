import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { FormProps } from './types'
import type { SchoolType } from '../store/settings'

export type Category = '점검표' | '기록지' | '학기 서식'
export type DateMode = 'weekly' | 'daily' | 'none'

export interface FormMeta {
  id: number
  title: string
  subtitle?: string
  category: Category
  dateMode: DateMode
  variant?: { group: keyof SchoolType; key: string }
  Component: LazyExoticComponent<ComponentType<FormProps>>
}

export const FORMS: FormMeta[] = [
  { id: 1, title: '일일 위생관리 점검표', subtitle: '주간(월~금)', category: '점검표', dateMode: 'weekly', Component: lazy(() => import('./DailyHygiene')) },
  { id: 2, title: '주(일)별 세척·청소 점검표', subtitle: '일별 26 + 주별 6 항목 (편집 가능)', category: '점검표', dateMode: 'weekly', Component: lazy(() => import('./CleaningWeekly')) },
  { id: 3, title: '식단검토', subtitle: '주간, 조/중/석 소독·가열', category: '기록지', dateMode: 'weekly', Component: lazy(() => import('./MenuReview')) },
  { id: 4, title: '검수서', subtitle: '일별, 행 수 조절', category: '기록지', dateMode: 'daily', Component: lazy(() => import('./Receiving')) },
  { id: 5, title: 'CCP1A 식품취급 및 조리', subtitle: '장소 구분이 될 경우', category: '기록지', dateMode: 'daily', variant: { group: 'kitchen', key: 'A' }, Component: lazy(() => import('./CCP1A')) },
  { id: 6, title: 'CCP1B 식품취급 및 조리', subtitle: '장소 구분이 안 되는 경우', category: '기록지', dateMode: 'daily', variant: { group: 'kitchen', key: 'B' }, Component: lazy(() => import('./CCP1B')) },
  { id: 7, title: 'CCP2A 조리완료 및 배식', subtitle: '단독조리 · 식생활교육관(식당)', category: '기록지', dateMode: 'daily', variant: { group: 'serving', key: 'A' }, Component: lazy(() => import('./CCP2A')) },
  { id: 8, title: 'CCP2B 조리완료 및 배식', subtitle: '단독조리 · 교실배식', category: '기록지', dateMode: 'daily', variant: { group: 'serving', key: 'B' }, Component: lazy(() => import('./CCP2B')) },
  { id: 9, title: 'CCP2C 조리완료 및 배식', subtitle: '공동조리', category: '기록지', dateMode: 'daily', variant: { group: 'serving', key: 'C' }, Component: lazy(() => import('./CCP2C')) },
  { id: 10, title: 'CP1 냉장·냉동고(실) 온도관리', subtitle: '주간, 오전/오후/오후', category: '기록지', dateMode: 'weekly', Component: lazy(() => import('./CP1')) },
  { id: 11, title: 'CP2A 식품 접촉표면 세척·소독', subtitle: '식기세척기로 식판 소독이 안 되는 학교', category: '기록지', dateMode: 'weekly', variant: { group: 'dishwasher', key: 'A' }, Component: lazy(() => import('./CP2A')) },
  { id: 12, title: 'CP2B 식품 접촉표면 세척·소독', subtitle: '식기세척기로 식판 소독이 가능한 학교', category: '기록지', dateMode: 'weekly', variant: { group: 'dishwasher', key: 'B' }, Component: lazy(() => import('./CP2B')) },
  { id: 13, title: 'CP2C 식품 접촉표면 세척·소독', subtitle: '식기세척기가 없는 학교', category: '기록지', dateMode: 'weekly', variant: { group: 'dishwasher', key: 'C' }, Component: lazy(() => import('./CP2C')) },
  { id: 14, title: '[양식2] CCP 및 CP 점검결과 및 조치', subtitle: '학기별 1회', category: '학기 서식', dateMode: 'none', Component: lazy(() => import('./Form2Summary')) },
]

export function getForm(id: number): FormMeta | undefined {
  return FORMS.find((f) => f.id === id)
}

/** 학교 유형에 맞는 서식인지 (유형 미설정이면 모두 true) */
export function matchesSchoolType(form: FormMeta, type: SchoolType | null): boolean {
  if (!form.variant || !type) return true
  return type[form.variant.group] === form.variant.key
}

/** 주간 세트: 일일 위생 + 청소 + CP1 + CP2(유형) */
export function weeklySetIds(type: SchoolType | null): number[] {
  const cp2 = type ? { A: 11, B: 12, C: 13 }[type.dishwasher] : 11
  return [1, 2, 10, cp2]
}

import { useEffect, useMemo, useState } from 'react'
import SignLine from '../components/SignLine'
import type { FormProps } from './types'
import { toKey } from './types'
import { WEEKDAYS_KO, weekDays, fmtWeekPeriod, pad } from '../lib/dates'
import '../print.css'
import './DailyHygiene.css'

interface RowRecord {
  results: string[] // 월~금 5개
  action: string    // 조치사항
}

interface FormItem {
  subCategory: string
  content: string
  noSubCat?: boolean
  isRemark?: boolean
}

interface FormGroup {
  category: string
  rowSpan: number
  items: FormItem[]
}

// 원본 서식 구조 - 구분/소분류/점검사항 3단계 (지침서 50쪽 표9)
const FORM_GROUPS: FormGroup[] = [
  {
    category: '개인\n위생\n관리',
    rowSpan: 2,
    items: [
      { subCategory: '복장\n관리', content: '위생복, 위생모, 마스크, 앞치마 착용, 장신구 미착용 여부' },
      { subCategory: '건강\n상태', content: '식품취급자(조리종사자 포함) 건강상태' },
    ],
  },
  {
    category: '식재료\n검수\n및\n보관\n관리',
    rowSpan: 4,
    items: [
      { subCategory: '검수\n일지', content: '식재료 검수일지 작성, 보관 여부' },
      { subCategory: '소비\n기한', content: '식재료의 소비기한 경과 확인' },
      { subCategory: '구분\n보관', content: '식품, 비식품(세척제, 소독제 등)을 구분 보관 여부' },
      { subCategory: '냉장·\n냉동고', content: '냉장고·냉동고 적정온도 여부' },
    ],
  },
  {
    category: '조리\n관리',
    rowSpan: 4,
    items: [
      { subCategory: '세척 및\n소독', content: '가열하지 않고 생으로 제공하는 야채·과일을 소독할 경우에는 식품첨가물로 허용된 살균제 사용 및 충분한 헹굼 여부' },
      { subCategory: '조리 시\n주의\n사항', content: '육류, 어류 등 동물성원료(돈까스, 만두, 떡갈비 등 분쇄육 등)를 가열 조리하는 경우에는 식품의 중심부까지 충분히 익힘 여부' },
      { subCategory: '', content: '해동은 위생적인 방법으로 실시하고, 해동식품 재냉동 금지 확인', noSubCat: true },
      { subCategory: '구분\n사용', content: '칼·도마(어류·육류·채소류) 용도별 구분 사용 여부' },
    ],
  },
  {
    category: '배식 및\n보존식\n관리',
    rowSpan: 3,
    items: [
      { subCategory: '배식', content: '배식용 보관용기는 세척·소독·건조된 것을 사용하며 조리된 음식은 뚜껑 등을 덮어 교차오염 되지 않도록 관리' },
      { subCategory: '배식 후\n관리', content: '배식대에서 배식하고 남은 음식물을 다시 사용·조리 또는 보관 여부' },
      { subCategory: '보존식', content: '보존식 보관 및 관리기준(-18℃이하, 144시간 이상) 준수 여부' },
    ],
  },
  {
    category: '시설\n관리',
    rowSpan: 2,
    items: [
      { subCategory: '시설', content: '자외선 또는 전기살균소독기, 열탕세척 소독시설, 환기시설 정상 작동 확인' },
      { subCategory: '', content: '배수구 청결관리 여부\n(조리장 바닥에 배수구 있는 경우)', noSubCat: true },
    ],
  },
  {
    category: '기타 특이사항\n(불량 시\n시정조치 내용 등\n기재)',
    rowSpan: 1,
    items: [{ subCategory: '', content: '', isRemark: true, noSubCat: true }],
  },
]

const TOTAL_ROWS = FORM_GROUPS.reduce((sum, g) => sum + g.items.length, 0)
const EMPTY_RECORDS = (): RowRecord[] =>
  Array.from({ length: TOTAL_ROWS }, () => ({ results: ['', '', '', '', ''], action: '' }))

const SYMBOLS = ['○', '△', '×', '-']

export default function DailyHygiene({ date, grayscale, names, schoolName, holidays }: FormProps) {
  const [school, setSchool] = useState(schoolName)
  const [checker, setChecker] = useState(names?.checker ?? '')
  const [records, setRecords] = useState<RowRecord[]>(EMPTY_RECORDS())

  useEffect(() => setSchool(schoolName), [schoolName])
  useEffect(() => setChecker(names?.checker ?? ''), [names])

  const week = useMemo(() => (date ? weekDays(date) : null), [date])

  const setResult = (rowIdx: number, dayIdx: number, val: string) => {
    setRecords((prev) => {
      const next = prev.map((r) => ({ ...r, results: [...r.results] }))
      next[rowIdx].results[dayIdx] = next[rowIdx].results[dayIdx] === val ? '' : val
      return next
    })
  }

  const setAction = (rowIdx: number, val: string) => {
    setRecords((prev) => {
      const next = prev.map((r) => ({ ...r }))
      next[rowIdx].action = val
      return next
    })
  }

  let rowIdx = 0

  return (
    <div className={`form-container daily-hygiene${grayscale ? ' grayscale' : ''}`} data-printable>
      <div className="form-title">학교급식 일일 위생관리 점검표</div>

      <div className="form-meta-row">
        <span>
          점검일자:{' '}
          <span className="meta-value">{date ? fmtWeekPeriod(date) : '20    .    .    . ~ 20    .    .    .'}</span>
        </span>
        <span>
          점검자: <input className="meta-input" type="text" value={checker} onChange={(e) => setChecker(e.target.value)} />
        </span>
      </div>
      <div className="form-meta-row" style={{ marginTop: '0.2rem' }}>
        <span>
          학교명: <input className="meta-input wide" type="text" value={school} onChange={(e) => setSchool(e.target.value)} />
        </span>
      </div>

      <table className="hygiene-table">
        <thead>
          <tr className="form-header-row">
            <th rowSpan={2} className="col-category">구분</th>
            <th rowSpan={2} className="col-subcategory"></th>
            <th rowSpan={2} className="col-content">점검 사항</th>
            <th colSpan={5} className="col-results-group">점검결과</th>
            <th rowSpan={2} className="col-action">조치 사항</th>
          </tr>
          <tr className="form-header-row">
            {WEEKDAYS_KO.map((d, i) => {
              const day = week?.[i]
              const hol = day ? holidays[toKey(day)] : undefined
              return (
                <th key={d} className="col-day">
                  {d}<br />
                  <span className="day-date">{day ? `${pad(day.getMonth() + 1)} / ${pad(day.getDate())}` : '/'}</span>
                  {hol && <><br /><span className="day-holiday">휴업</span></>}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {FORM_GROUPS.map((group) =>
            group.items.map((item, itemIdx) => {
              const currentRowIdx = rowIdx++
              return (
                <tr key={currentRowIdx}>
                  {itemIdx === 0 && !item.isRemark && (
                    <td className="col-category cat-cell" rowSpan={group.rowSpan}>{group.category}</td>
                  )}
                  {itemIdx === 0 && item.isRemark && (
                    <td className="col-category cat-cell remark-cat" colSpan={2}>{group.category}</td>
                  )}
                  {!item.noSubCat && !item.isRemark && (
                    <td className="col-subcategory subcat-cell">{item.subCategory}</td>
                  )}
                  {item.noSubCat && itemIdx > 0 && <td className="col-subcategory"></td>}
                  <td className={`col-content content-cell${item.isRemark ? ' remark-cell' : ''}`}>
                    {item.isRemark ? (
                      <textarea
                        className="remark-input"
                        value={records[currentRowIdx].results[0]}
                        onChange={(e) => {
                          const val = e.target.value
                          setRecords((prev) => {
                            const next = prev.map((r) => ({ ...r, results: [...r.results] }))
                            next[currentRowIdx].results[0] = val
                            return next
                          })
                        }}
                      />
                    ) : (
                      <span style={{ whiteSpace: 'pre-wrap' }}>{item.content}</span>
                    )}
                  </td>
                  {!item.isRemark &&
                    WEEKDAYS_KO.map((_, dayIdx) => (
                      <td key={dayIdx} className="col-day result-cell">
                        <div className="symbol-btns">
                          {SYMBOLS.map((sym) => (
                            <button
                              key={sym}
                              type="button"
                              className={`sym-btn no-print${records[currentRowIdx].results[dayIdx] === sym ? ' selected' : ''}`}
                              onClick={() => setResult(currentRowIdx, dayIdx, sym)}
                            >
                              {sym}
                            </button>
                          ))}
                          <span className="sym-display">{records[currentRowIdx].results[dayIdx]}</span>
                        </div>
                      </td>
                    ))}
                  {item.isRemark && <td className="col-day" colSpan={5}></td>}
                  <td className="col-action">
                    {!item.isRemark && (
                      <input type="text" className="action-input" value={records[currentRowIdx].action} onChange={(e) => setAction(currentRowIdx, e.target.value)} />
                    )}
                  </td>
                </tr>
              )
            }),
          )}
        </tbody>
      </table>

      <div className="form-note">
        ※ 기록 방법 : 적합 ○, 미흡 △, 부적합 ×, 해당사항 없을 경우 - 표기, 부적합 시 조치 사항 기록
      </div>

      <div className="form-sign-row">
        <SignLine role="점검자" name={checker} />
        <SignLine role="확인자(팀장 이상)" name={names?.confirmer} />
      </div>
    </div>
  )
}

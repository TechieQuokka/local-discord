/**
 * TagCloud 컴포넌트 - 태그 목록/클라우드 표시
 *
 * React 패턴 학습 포인트:
 * 1. 조건부 렌더링: 태그가 있을 때만 표시
 * 2. 동적 스타일링: 빈도에 따른 태그 크기/색상 조절
 * 3. 이벤트 핸들러: 태그 클릭으로 필터링
 */

import { useAppStore, useSelectedTag } from '../store'
import './TagCloud.css'

export default function TagCloud() {
  const { getAllTags, selectTag } = useAppStore()
  const selectedTag = useSelectedTag()
  const tags = getAllTags()

  // 태그가 없으면 렌더링하지 않음
  if (tags.length === 0) return null

  // 태그 빈도에 따른 크기 계산 (최소 0.8em, 최대 1.4em)
  const maxCount = Math.max(...tags.map((t) => t.count))
  const getTagSize = (count: number) => {
    const ratio = count / maxCount
    return 0.8 + ratio * 0.6
  }

  // 태그 클릭 핸들러
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      selectTag(null) // 필터 해제
    } else {
      selectTag(tag) // 새 태그로 필터
    }
  }

  return (
    <div className="tag-cloud">
      <div className="tag-cloud-header">
        <span className="tag-icon">#</span>
        <span>태그</span>
        {selectedTag && (
          <button
            className="clear-all-tags"
            onClick={() => selectTag(null)}
            title="필터 해제"
          >
            초기화
          </button>
        )}
      </div>
      <div className="tag-cloud-list">
        {tags.slice(0, 20).map(({ tag, count }) => (
          <button
            key={tag}
            className={`tag-item ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => handleTagClick(tag)}
            style={{ fontSize: `${getTagSize(count)}em` }}
            title={`${count}개의 메시지`}
          >
            #{tag}
            <span className="tag-count">{count}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

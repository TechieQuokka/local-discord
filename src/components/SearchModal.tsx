/**
 * SearchModal 컴포넌트 - Discord 전체 검색 모달
 *
 * React 패턴 학습 포인트:
 * 1. 키보드 이벤트: Ctrl+F로 모달 토글
 * 2. 포커스 관리: 모달 열릴 때 자동 포커스
 * 3. 파생 데이터: getSearchResults()로 필터링된 결과
 * 4. 검색 결과 클릭 시 해당 위치로 이동
 */

import { useEffect, useRef } from 'react'
import { useAppStore, useSearch } from '../store'
import './SearchModal.css'

// 시간 포맷팅
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 검색어 하이라이트
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="highlight">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export default function SearchModal() {
  const { query, isOpen } = useSearch()
  const { setSearchQuery, toggleSearch, getSearchResults, selectServer, selectChannel } =
    useAppStore()

  const inputRef = useRef<HTMLInputElement>(null)
  const results = getSearchResults()

  // Ctrl+F로 검색 토글
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        toggleSearch()
      }
      if (e.key === 'Escape' && isOpen) {
        toggleSearch()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, toggleSearch])

  // 모달 열릴 때 포커스
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleResultClick = (serverId: string, channelId: string) => {
    selectServer(serverId)
    selectChannel(channelId)
    toggleSearch()
    setSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="search-modal-overlay" onClick={toggleSearch}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        {/* 검색 입력 */}
        <div className="search-input-container">
          <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.707 20.293L16.314 14.9C17.403 13.504 18 11.799 18 10C18 5.589 14.411 2 10 2C5.589 2 2 5.589 2 10C2 14.411 5.589 18 10 18C11.799 18 13.504 17.403 14.9 16.314L20.293 21.707L21.707 20.293ZM4 10C4 6.691 6.691 4 10 4C13.309 4 16 6.691 16 10C16 13.309 13.309 16 10 16C6.691 16 4 13.309 4 10Z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="메시지 검색..."
            value={query}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {query && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        {/* 검색 결과 */}
        <div className="search-results">
          {query.trim() === '' ? (
            <div className="search-empty">
              <p>검색어를 입력하세요</p>
              <span className="search-hint">모든 서버와 채널에서 메시지를 검색합니다</span>
            </div>
          ) : results.length === 0 ? (
            <div className="search-empty">
              <p>검색 결과가 없습니다</p>
              <span className="search-hint">다른 검색어를 시도해보세요</span>
            </div>
          ) : (
            <>
              <div className="results-header">
                {results.length}개의 결과
              </div>
              {results.map((result) => (
                <div
                  key={result.message.id}
                  className="search-result-item"
                  onClick={() =>
                    handleResultClick(result.server.id, result.channel.id)
                  }
                >
                  <div className="result-header">
                    <span className="result-server">{result.server.name}</span>
                    <span className="result-separator">›</span>
                    <span className="result-channel">#{result.channel.name}</span>
                    <span className="result-time">
                      {formatTime(result.message.createdAt)}
                    </span>
                  </div>
                  <div className="result-content">
                    {highlightText(result.message.content, query)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* 단축키 안내 */}
        <div className="search-footer">
          <span>Esc로 닫기</span>
          <span>•</span>
          <span>Ctrl+F로 검색</span>
        </div>
      </div>
    </div>
  )
}

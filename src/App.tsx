/**
 * App 컴포넌트 - 메인 레이아웃
 *
 * React 패턴 학습 포인트:
 * 1. useEffect 초기화: 앱 시작 시 데이터 로드
 * 2. 컴포넌트 구성: 레이아웃을 위한 컴포넌트 조합
 * 3. 조건부 렌더링: 설정 패널 토글
 */

import { useEffect, useState } from 'react'
import { useAppStore } from './store'
import ServerList from './components/ServerList'
import ChannelList from './components/ChannelList'
import MessageArea from './components/MessageArea'
import MessageInput from './components/MessageInput'
import SearchModal from './components/SearchModal'
import SettingsPanel from './components/SettingsPanel'
import BookmarkPanel from './components/BookmarkPanel'
import './App.css'

export default function App() {
  const { loadFromStorage, toggleBookmarkPanel } = useAppStore()
  const [showSettings, setShowSettings] = useState(false)

  // 앱 시작 시 localStorage에서 데이터 로드
  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  // 단축키 (Ctrl+, 설정, Ctrl+B 북마크)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        setShowSettings((prev) => !prev)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleBookmarkPanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleBookmarkPanel])

  return (
    <div className="app">
      {/* 3-Column 레이아웃 */}
      <ServerList />
      <ChannelList />
      <div className="main-content">
        <MessageArea />
        <MessageInput />
      </div>

      {/* 플로팅 버튼들 (우측 하단 고정) */}
      <div className="floating-buttons">
        <button
          className="bookmark-trigger"
          onClick={toggleBookmarkPanel}
          title="북마크 (Ctrl+B)"
        >
          ⭐
        </button>
        <button
          className="settings-trigger"
          onClick={() => setShowSettings(true)}
          title="설정 (Ctrl+,)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
            />
          </svg>
        </button>
      </div>

      {/* 모달들 */}
      <SearchModal />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <BookmarkPanel />
    </div>
  )
}

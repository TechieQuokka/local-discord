/**
 * BookmarkPanel 컴포넌트 - 북마크된 메시지 모아보기
 *
 * React 패턴 학습 포인트:
 * 1. 조건부 렌더링: 패널 열림/닫힘 상태
 * 2. 전역 상태 활용: 모든 북마크 메시지 접근
 * 3. 컴포넌트 재사용: 메시지 렌더링 로직
 */

import { useAppStore, useIsBookmarkPanelOpen, useChannels, useServers } from '../store'
import { parseContentWithTags } from '../utils/tags'
import './BookmarkPanel.css'

// 시간 포맷팅
const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function BookmarkPanel() {
  const isOpen = useIsBookmarkPanelOpen()
  const channels = useChannels()
  const servers = useServers()
  const { toggleBookmarkPanel, getBookmarkedMessages, toggleBookmark, selectServer, selectChannel } = useAppStore()

  const bookmarks = getBookmarkedMessages()

  if (!isOpen) return null

  // 채널 정보 찾기
  const getChannelInfo = (channelId: string) => {
    const channel = channels.find((c) => c.id === channelId)
    if (!channel) return null
    const server = servers.find((s) => s.id === channel.serverId)
    return { channel, server }
  }

  // 북마크 메시지로 이동
  const handleNavigate = (channelId: string) => {
    const info = getChannelInfo(channelId)
    if (info?.server && info?.channel) {
      selectServer(info.server.id)
      selectChannel(info.channel.id)
      toggleBookmarkPanel()
    }
  }

  return (
    <div className="bookmark-panel-overlay" onClick={toggleBookmarkPanel}>
      <div className="bookmark-panel" onClick={(e) => e.stopPropagation()}>
        <div className="bookmark-panel-header">
          <h2>⭐ 북마크</h2>
          <button className="close-btn" onClick={toggleBookmarkPanel}>×</button>
        </div>

        <div className="bookmark-panel-content">
          {bookmarks.length === 0 ? (
            <div className="bookmark-empty">
              <div className="bookmark-empty-icon">⭐</div>
              <p>북마크된 메시지가 없습니다</p>
              <span>메시지를 우클릭하여 북마크를 추가하세요</span>
            </div>
          ) : (
            <div className="bookmark-list">
              {bookmarks.map((message) => {
                const info = getChannelInfo(message.channelId)
                const parts = parseContentWithTags(message.content)

                return (
                  <div key={message.id} className="bookmark-item">
                    <div className="bookmark-item-header">
                      <span
                        className="bookmark-channel"
                        onClick={() => handleNavigate(message.channelId)}
                      >
                        {info?.server?.name} / #{info?.channel?.name}
                      </span>
                      <span className="bookmark-time">{formatDateTime(message.createdAt)}</span>
                    </div>
                    <div className="bookmark-item-content">
                      {parts.map((part, index) => (
                        part.type === 'tag' ? (
                          <span key={index} className="bookmark-tag">{part.content}</span>
                        ) : (
                          <span key={index}>{part.content}</span>
                        )
                      ))}
                    </div>
                    <div className="bookmark-item-actions">
                      <button
                        className="bookmark-action go"
                        onClick={() => handleNavigate(message.channelId)}
                      >
                        이동
                      </button>
                      <button
                        className="bookmark-action remove"
                        onClick={() => toggleBookmark(message.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

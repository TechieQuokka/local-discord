/**
 * MessageArea 컴포넌트 - Discord 메시지 표시 영역
 *
 * React 패턴 학습 포인트:
 * 1. useRef + useEffect: DOM 조작 (스크롤)
 * 2. useEffect 의존성 배열: 메시지 변경 시에만 스크롤
 * 3. 메모이제이션 고려: 큰 리스트에서의 성능 최적화
 * 4. 날짜 포맷팅: 유틸리티 함수 분리
 */

import { useEffect, useRef, useState } from 'react'
import { useAppStore, useCurrentMessages, useSelectedChannelId, useCurrentChannels, useSelectedTag } from '../store'
import { parseContentWithTags } from '../utils/tags'
import { Message } from '../types'
import './MessageArea.css'

// 시간 포맷팅 유틸리티
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '오늘'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '어제'
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}

// 같은 날짜인지 확인
const isSameDay = (t1: number, t2: number): boolean => {
  const d1 = new Date(t1)
  const d2 = new Date(t2)
  return d1.toDateString() === d2.toDateString()
}

// 태그 하이라이팅이 적용된 메시지 콘텐츠 렌더링
interface MessageContentProps {
  content: string
  onTagClick: (tag: string) => void
  selectedTag: string | null
}

function MessageContent({ content, onTagClick, selectedTag }: MessageContentProps) {
  const parts = parseContentWithTags(content)

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'tag') {
          const isActive = part.tag === selectedTag
          return (
            <span
              key={index}
              className={`message-tag ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onTagClick(part.tag!)
              }}
              title={`#${part.tag} 태그로 필터링`}
            >
              {part.content}
            </span>
          )
        }
        return <span key={index}>{part.content}</span>
      })}
    </>
  )
}

export default function MessageArea() {
  const messages = useCurrentMessages()
  const channels = useCurrentChannels()
  const selectedChannelId = useSelectedChannelId()
  const selectedTag = useSelectedTag()
  const { deleteMessage, updateMessage, selectTag, togglePin, toggleBookmark, getPinnedMessages } = useAppStore()

  // 핀된 메시지 (현재 채널)
  const pinnedMessages = getPinnedMessages()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    messageId: string
  } | null>(null)

  const currentChannel = channels.find((c) => c.id === selectedChannelId)

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleEdit = (id: string, content: string) => {
    setEditingId(id)
    setEditContent(content)
    setContextMenu(null)
  }

  const handleEditSave = () => {
    if (editingId && editContent.trim()) {
      updateMessage(editingId, editContent.trim())
      setEditingId(null)
      setEditContent('')
    }
  }

  const handleContextMenu = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, messageId })
  }

  const handleDelete = () => {
    if (contextMenu) {
      deleteMessage(contextMenu.messageId)
      setContextMenu(null)
    }
  }

  const handlePin = () => {
    if (contextMenu) {
      togglePin(contextMenu.messageId)
      setContextMenu(null)
    }
  }

  const handleBookmark = () => {
    if (contextMenu) {
      toggleBookmark(contextMenu.messageId)
      setContextMenu(null)
    }
  }

  // 현재 컨텍스트 메뉴 대상 메시지 찾기
  const getContextMessage = (): Message | undefined => {
    return messages.find((m) => m.id === contextMenu?.messageId)
  }

  // 태그 클릭 핸들러 - 같은 태그 클릭 시 필터 해제
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      selectTag(null)  // 필터 해제
    } else {
      selectTag(tag)   // 새 태그로 필터
    }
  }

  if (!selectedChannelId || !currentChannel) {
    return (
      <div className="message-area empty">
        <div className="empty-state">
          <div className="empty-icon">#</div>
          <h2>채널을 선택하세요</h2>
          <p>왼쪽 목록에서 채널을 선택하면 메시지가 표시됩니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="message-area" onClick={() => setContextMenu(null)}>
      {/* 채널 헤더 */}
      <div className="message-header">
        <span className="channel-hash">#</span>
        <span className="channel-title">{currentChannel.name}</span>
        {/* 태그 필터 표시 */}
        {selectedTag && (
          <div className="tag-filter-badge">
            <span>#{selectedTag}</span>
            <button
              className="clear-filter"
              onClick={() => selectTag(null)}
              title="필터 해제"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="messages-container">
        {/* 핀된 메시지 섹션 */}
        {pinnedMessages.length > 0 && (
          <div className="pinned-messages-section">
            <div className="pinned-header">
              <span>📌 고정된 메시지</span>
              <span className="pinned-count">{pinnedMessages.length}</span>
            </div>
            {pinnedMessages.map((message) => (
              <div
                key={`pinned-${message.id}`}
                className="pinned-message"
                onContextMenu={(e) => handleContextMenu(e, message.id)}
              >
                <div className="pinned-message-content">
                  <MessageContent
                    content={message.content}
                    onTagClick={handleTagClick}
                    selectedTag={selectedTag}
                  />
                </div>
                <span className="pinned-message-time">{formatTime(message.createdAt)}</span>
              </div>
            ))}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-icon">#</div>
            <h1>#{currentChannel.name}에 오신 것을 환영합니다!</h1>
            <p>이 채널의 시작입니다. 첫 메시지를 보내보세요.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const showDateDivider =
              index === 0 ||
              !isSameDay(message.createdAt, messages[index - 1].createdAt)

            return (
              <div key={message.id}>
                {/* 날짜 구분선 */}
                {showDateDivider && (
                  <div className="date-divider">
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                )}

                {/* 메시지 */}
                <div
                  className={`message ${message.isPinned ? 'pinned' : ''} ${message.isBookmarked ? 'bookmarked' : ''}`}
                  onContextMenu={(e) => handleContextMenu(e, message.id)}
                >
                  <div className="message-avatar">U</div>
                  <div className="message-content">
                    <div className="message-header-row">
                      <span className="message-author">사용자</span>
                      <span className="message-timestamp">
                        {formatTime(message.createdAt)}
                        {message.editedAt && ' (수정됨)'}
                      </span>
                      {/* 핀/북마크 아이콘 */}
                      {message.isPinned && <span className="message-badge pin" title="고정됨">📌</span>}
                      {message.isBookmarked && <span className="message-badge bookmark" title="북마크">⭐</span>}
                    </div>
                    {editingId === message.id ? (
                      <div className="message-edit">
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave()
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          autoFocus
                        />
                        <div className="edit-hint">
                          Enter로 저장 • Esc로 취소
                        </div>
                      </div>
                    ) : (
                      <div className="message-text">
                        <MessageContent
                          content={message.content}
                          onTagClick={handleTagClick}
                          selectedTag={selectedTag}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="context-menu-item" onClick={handlePin}>
            {getContextMessage()?.isPinned ? '📌 고정 해제' : '📌 채널에 고정'}
          </div>
          <div className="context-menu-item" onClick={handleBookmark}>
            {getContextMessage()?.isBookmarked ? '⭐ 북마크 해제' : '⭐ 북마크 추가'}
          </div>
          <div className="context-menu-divider" />
          <div
            className="context-menu-item"
            onClick={() => {
              const msg = messages.find((m) => m.id === contextMenu.messageId)
              if (msg) handleEdit(msg.id, msg.content)
            }}
          >
            메시지 수정
          </div>
          <div className="context-menu-item delete" onClick={handleDelete}>
            메시지 삭제
          </div>
        </div>
      )}
    </div>
  )
}

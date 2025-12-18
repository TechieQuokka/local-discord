/**
 * MessageInput 컴포넌트 - Discord 메시지 입력창
 *
 * React 패턴 학습 포인트:
 * 1. 제어 컴포넌트: value와 onChange로 입력 상태 관리
 * 2. 폼 제출 패턴: onSubmit 또는 onKeyDown으로 처리
 * 3. 조건부 비활성화: 채널 미선택 시 입력 차단
 */

import { useState, useRef, useEffect } from 'react'
import { useAppStore, useSelectedChannelId, useCurrentChannels } from '../store'
import './MessageInput.css'

export default function MessageInput() {
  const selectedChannelId = useSelectedChannelId()
  const channels = useCurrentChannels()
  const { addMessage } = useAppStore()

  const [content, setContent] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const currentChannel = channels.find((c) => c.id === selectedChannelId)

  // 채널 변경 시 포커스
  useEffect(() => {
    if (selectedChannelId) {
      inputRef.current?.focus()
    }
  }, [selectedChannelId])

  const handleSubmit = () => {
    if (content.trim() && selectedChannelId) {
      addMessage(selectedChannelId, content.trim())
      setContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter로 전송 (Shift+Enter는 줄바꿈)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // 텍스트 영역 자동 높이 조절
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    setContent(textarea.value)

    // 높이 자동 조절
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  if (!selectedChannelId || !currentChannel) {
    return null
  }

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        {/* 첨부 버튼 (비활성화 - UI만) */}
        <button className="attach-button" disabled title="파일 첨부 (미지원)">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2.00098C6.486 2.00098 2 6.48698 2 12.001C2 17.515 6.486 22.001 12 22.001C17.514 22.001 22 17.515 22 12.001C22 6.48698 17.514 2.00098 12 2.00098ZM17 13.001H13V17.001H11V13.001H7V11.001H11V7.00098H13V11.001H17V13.001Z"
            />
          </svg>
        </button>

        {/* 입력 영역 */}
        <textarea
          ref={inputRef}
          className="message-input"
          placeholder={`#${currentChannel.name}에 메시지 보내기`}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        {/* 이모지 버튼 (비활성화 - UI만) */}
        <button className="emoji-button" disabled title="이모지 (미지원)">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 20C7.582 20 4 16.418 4 12C4 7.582 7.582 4 12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20ZM15.5 11C16.328 11 17 10.328 17 9.5C17 8.672 16.328 8 15.5 8C14.672 8 14 8.672 14 9.5C14 10.328 14.672 11 15.5 11ZM8.5 11C9.328 11 10 10.328 10 9.5C10 8.672 9.328 8 8.5 8C7.672 8 7 8.672 7 9.5C7 10.328 7.672 11 8.5 11ZM12 17.5C14.33 17.5 16.32 16.05 17.12 14H6.88C7.68 16.05 9.67 17.5 12 17.5Z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

/**
 * ChannelList 컴포넌트 - Discord 채널 사이드바
 *
 * React 패턴 학습 포인트:
 * 1. 조건부 렌더링: 서버 선택 여부에 따른 표시
 * 2. 파생 상태: useCurrentChannels로 필터링된 데이터 사용
 * 3. 폼 제출 패턴: 입력값 검증 및 초기화
 */

import { useState } from 'react'
import { useAppStore, useServers, useSelectedServerId, useCurrentChannels, useSelectedChannelId } from '../store'
import TagCloud from './TagCloud'
import './ChannelList.css'

export default function ChannelList() {
  const servers = useServers()
  const selectedServerId = useSelectedServerId()
  const channels = useCurrentChannels()
  const selectedChannelId = useSelectedChannelId()
  const { selectChannel, addChannel, deleteChannel, updateServer } = useAppStore()

  const [showAddChannel, setShowAddChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [editingServer, setEditingServer] = useState(false)
  const [serverName, setServerName] = useState('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    channelId: string
  } | null>(null)

  const currentServer = servers.find((s) => s.id === selectedServerId)

  const handleAddChannel = () => {
    if (newChannelName.trim() && selectedServerId) {
      addChannel(selectedServerId, newChannelName.trim().toLowerCase().replace(/\s+/g, '-'))
      setNewChannelName('')
      setShowAddChannel(false)
    }
  }

  const handleServerNameEdit = () => {
    if (currentServer) {
      setServerName(currentServer.name)
      setEditingServer(true)
    }
  }

  const handleServerNameSave = () => {
    if (serverName.trim() && selectedServerId) {
      updateServer(selectedServerId, { name: serverName.trim() })
      setEditingServer(false)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, channelId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, channelId })
  }

  const handleDeleteChannel = () => {
    if (contextMenu) {
      deleteChannel(contextMenu.channelId)
      setContextMenu(null)
    }
  }

  if (!selectedServerId || !currentServer) {
    return (
      <div className="channel-list empty">
        <p>서버를 선택하세요</p>
      </div>
    )
  }

  return (
    <div className="channel-list" onClick={() => setContextMenu(null)}>
      {/* 서버 헤더 */}
      <div className="channel-header" onClick={handleServerNameEdit}>
        {editingServer ? (
          <input
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            onBlur={handleServerNameSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleServerNameSave()
              if (e.key === 'Escape') setEditingServer(false)
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{currentServer.name}</span>
        )}
      </div>

      {/* 채널 카테고리 */}
      <div className="channel-category">
        <div className="category-header">
          <span>텍스트 채널</span>
          <button
            className="add-channel-btn"
            onClick={() => setShowAddChannel(true)}
            title="채널 추가"
          >
            +
          </button>
        </div>

        {/* 채널 목록 */}
        <div className="channels">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`channel ${selectedChannelId === channel.id ? 'selected' : ''}`}
              onClick={() => selectChannel(channel.id)}
              onContextMenu={(e) => handleContextMenu(e, channel.id)}
            >
              <span className="channel-icon">#</span>
              <span className="channel-name">{channel.name}</span>
            </div>
          ))}

          {channels.length === 0 && (
            <div className="no-channels">
              채널이 없습니다. + 버튼으로 추가하세요.
            </div>
          )}
        </div>
      </div>

      {/* 태그 클라우드 */}
      <TagCloud />

      {/* 채널 추가 입력 */}
      {showAddChannel && (
        <div className="add-channel-form">
          <input
            type="text"
            placeholder="새 채널 이름"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddChannel()
              if (e.key === 'Escape') setShowAddChannel(false)
            }}
            autoFocus
          />
          <div className="add-channel-buttons">
            <button onClick={() => setShowAddChannel(false)}>취소</button>
            <button className="primary" onClick={handleAddChannel}>추가</button>
          </div>
        </div>
      )}

      {/* 사용자 정보 (하단) */}
      <div className="user-area">
        <div className="user-avatar">U</div>
        <div className="user-info">
          <div className="user-name">사용자</div>
          <div className="user-status">오프라인</div>
        </div>
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="context-menu-item delete" onClick={handleDeleteChannel}>
            채널 삭제
          </div>
        </div>
      )}
    </div>
  )
}

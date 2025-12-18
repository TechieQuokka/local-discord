/**
 * ServerList 컴포넌트 - Discord 왼쪽 세로 서버 아이콘 목록
 *
 * React 패턴 학습 포인트:
 * 1. 컴포넌트 분리: UI를 작은 단위로 나눔
 * 2. 조건부 렌더링: 선택 상태에 따른 스타일 변경
 * 3. 이벤트 핸들링: 클릭, 우클릭 처리
 * 4. 모달/입력 상태 관리: useState로 로컬 상태 관리
 */

import { useState } from 'react'
import { useAppStore, useServers, useSelectedServerId } from '../store'
import './ServerList.css'

export default function ServerList() {
  const servers = useServers()
  const selectedServerId = useSelectedServerId()
  const { selectServer, addServer, deleteServer } = useAppStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [newServerName, setNewServerName] = useState('')
  const [newServerIcon, setNewServerIcon] = useState('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    serverId: string
  } | null>(null)

  const handleAddServer = () => {
    if (newServerName.trim()) {
      addServer(newServerName.trim(), newServerIcon.trim() || undefined)
      setNewServerName('')
      setNewServerIcon('')
      setShowAddModal(false)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, serverId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, serverId })
  }

  const handleDeleteServer = () => {
    if (contextMenu) {
      deleteServer(contextMenu.serverId)
      setContextMenu(null)
    }
  }

  return (
    <div className="server-list" onClick={() => setContextMenu(null)}>
      {/* 서버 아이콘 목록 */}
      {servers.map((server) => (
        <div
          key={server.id}
          className={`server-icon ${selectedServerId === server.id ? 'selected' : ''}`}
          onClick={() => selectServer(server.id)}
          onContextMenu={(e) => handleContextMenu(e, server.id)}
          title={server.name}
        >
          <span>{server.icon || server.name.charAt(0)}</span>
        </div>
      ))}

      {/* 서버 추가 버튼 */}
      <div className="server-icon add-server" onClick={() => setShowAddModal(true)}>
        <span>+</span>
      </div>

      {/* 서버 추가 모달 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>새 서버 만들기</h3>
            <input
              type="text"
              placeholder="서버 이름"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddServer()}
              autoFocus
            />
            <input
              type="text"
              placeholder="아이콘 (이모지 또는 글자)"
              value={newServerIcon}
              onChange={(e) => setNewServerIcon(e.target.value)}
              maxLength={2}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowAddModal(false)}>취소</button>
              <button className="primary" onClick={handleAddServer}>
                만들기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 컨텍스트 메뉴 (우클릭) */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="context-menu-item delete" onClick={handleDeleteServer}>
            서버 삭제
          </div>
        </div>
      )}
    </div>
  )
}

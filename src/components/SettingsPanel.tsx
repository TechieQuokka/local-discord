/**
 * SettingsPanel 컴포넌트 - 설정 및 데이터 관리
 *
 * React 패턴 학습 포인트:
 * 1. 파일 입력 처리: useRef로 hidden input 제어
 * 2. 비동기 처리: async/await로 파일 읽기
 * 3. 에러 처리: try/catch로 사용자 피드백
 */

import { useRef, useState } from 'react'
import { useAppStore } from '../store'
import { exportData, importData, resetData } from '../utils/storage'
import './SettingsPanel.css'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { importFromData, loadFromStorage } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  const handleExport = () => {
    try {
      exportData()
      setMessage({ type: 'success', text: '데이터를 내보냈습니다!' })
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: '내보내기 실패' })
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await importData(file)
      importFromData(data)
      setMessage({ type: 'success', text: '데이터를 가져왔습니다!' })
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: '가져오기 실패: 잘못된 파일 형식' })
    }

    // 파일 입력 초기화
    e.target.value = ''
  }

  const handleReset = () => {
    if (window.confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      resetData()
      loadFromStorage()
      setMessage({ type: 'success', text: '데이터가 초기화되었습니다' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>설정</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          {/* 메시지 표시 */}
          {message && (
            <div className={`settings-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* 데이터 관리 */}
          <section className="settings-section">
            <h3>데이터 관리</h3>
            <p className="section-desc">
              데이터를 JSON 파일로 백업하거나 복원할 수 있습니다.
            </p>

            <div className="button-group">
              <button className="settings-btn" onClick={handleExport}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 16L6 10H9V4H15V10H18L12 16ZM20 18H4V20H20V18Z"
                  />
                </svg>
                데이터 내보내기
              </button>

              <button className="settings-btn" onClick={handleImportClick}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 8L18 14H15V20H9V14H6L12 8ZM20 4V6H4V4H20Z"
                  />
                </svg>
                데이터 가져오기
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                style={{ display: 'none' }}
              />
            </div>
          </section>

          {/* 위험 영역 */}
          <section className="settings-section danger">
            <h3>위험 영역</h3>
            <p className="section-desc">
              모든 서버, 채널, 메시지가 삭제되고 기본 상태로 돌아갑니다.
            </p>

            <button className="settings-btn danger" onClick={handleReset}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z"
                />
              </svg>
              데이터 초기화
            </button>
          </section>

          {/* 앱 정보 */}
          <section className="settings-section">
            <h3>앱 정보</h3>
            <div className="app-info">
              <div className="info-row">
                <span>버전</span>
                <span>1.0.0</span>
              </div>
              <div className="info-row">
                <span>저장소</span>
                <span>localStorage</span>
              </div>
              <div className="info-row">
                <span>프레임워크</span>
                <span>Electron + React</span>
              </div>
            </div>
          </section>

          {/* 단축키 */}
          <section className="settings-section">
            <h3>단축키</h3>
            <div className="shortcuts">
              <div className="shortcut-row">
                <span>검색</span>
                <kbd>Ctrl</kbd> + <kbd>F</kbd>
              </div>
              <div className="shortcut-row">
                <span>메시지 전송</span>
                <kbd>Enter</kbd>
              </div>
              <div className="shortcut-row">
                <span>줄바꿈</span>
                <kbd>Shift</kbd> + <kbd>Enter</kbd>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

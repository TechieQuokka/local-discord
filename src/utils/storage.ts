/**
 * localStorage 기반 데이터 저장 유틸리티
 *
 * React 패턴 학습 포인트:
 * - 순수 함수로 작성하여 재사용성 높임
 * - 타입 안전성을 위해 제네릭과 타입 가드 사용
 * - 에러 처리를 통한 안정성 확보
 */

import { StorageData, Server, Channel, Message } from '../types'

const STORAGE_KEY = 'local-discord-data'
const CURRENT_VERSION = 1

// 기본 데이터 (첫 실행 시)
const getDefaultData = (): StorageData => ({
  servers: [
    {
      id: 'default-server',
      name: '내 서버',
      icon: '🏠',
      createdAt: Date.now(),
    },
  ],
  channels: [
    {
      id: 'default-channel',
      serverId: 'default-server',
      name: 'general',
      createdAt: Date.now(),
    },
  ],
  messages: [
    {
      id: 'welcome-message',
      channelId: 'default-channel',
      content: '로컬 Discord에 오신 것을 환영합니다! 👋',
      createdAt: Date.now(),
    },
  ],
  version: CURRENT_VERSION,
})

// 데이터 로드
export const loadData = (): StorageData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const defaultData = getDefaultData()
      saveData(defaultData)
      return defaultData
    }

    const data = JSON.parse(raw) as StorageData

    // 버전 마이그레이션 (향후 확장용)
    if (data.version < CURRENT_VERSION) {
      // 마이그레이션 로직 추가 가능
      data.version = CURRENT_VERSION
      saveData(data)
    }

    return data
  } catch (error) {
    console.error('데이터 로드 실패:', error)
    return getDefaultData()
  }
}

// 데이터 저장
export const saveData = (data: StorageData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('데이터 저장 실패:', error)
  }
}

// 데이터 내보내기 (JSON 파일로 다운로드)
export const exportData = (): void => {
  const data = loadData()
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `local-discord-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 데이터 가져오기 (JSON 파일에서)
export const importData = (file: File): Promise<StorageData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as StorageData
        // 기본 유효성 검사
        if (!data.servers || !data.channels || !data.messages) {
          throw new Error('잘못된 데이터 형식')
        }
        saveData(data)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsText(file)
  })
}

// 모든 데이터 초기화
export const resetData = (): StorageData => {
  const defaultData = getDefaultData()
  saveData(defaultData)
  return defaultData
}

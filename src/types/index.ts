/**
 * Discord Clone 타입 정의
 *
 * 데이터 구조:
 * - Server (서버): Discord의 서버/길드에 해당, 여러 채널을 포함
 * - Channel (채널): 서버 내의 텍스트 채널
 * - Message (메시지): 채널 내의 개별 메시지
 */

// 서버 (Discord 서버 = 카테고리/폴더 개념)
export interface Server {
  id: string
  name: string
  icon?: string  // 이모지 또는 첫 글자 약어
  createdAt: number  // timestamp
}

// 채널 (서버 내 텍스트 채널)
export interface Channel {
  id: string
  serverId: string
  name: string
  createdAt: number
}

// 메시지
export interface Message {
  id: string
  channelId: string
  content: string
  createdAt: number
  editedAt?: number
  tags?: string[]  // #태그 배열 (자동 파싱됨)
  isPinned?: boolean  // 채널 상단에 고정
  isBookmarked?: boolean  // 즐겨찾기 (전역)
}

// 태그 통계 (태그 클라우드용)
export interface TagStats {
  tag: string
  count: number
}

// 앱 전체 상태 타입
export interface AppState {
  servers: Server[]
  channels: Channel[]
  messages: Message[]

  // 현재 선택된 항목
  selectedServerId: string | null
  selectedChannelId: string | null

  // 검색 상태
  searchQuery: string
  isSearchOpen: boolean

  // 태그 필터링 상태
  selectedTag: string | null  // 선택된 태그 (필터링용)

  // 북마크 패널 상태
  isBookmarkPanelOpen: boolean
}

// localStorage에 저장될 데이터 구조
export interface StorageData {
  servers: Server[]
  channels: Channel[]
  messages: Message[]
  version: number  // 데이터 마이그레이션용 버전
}

// 검색 결과 타입
export interface SearchResult {
  message: Message
  channel: Channel
  server: Server
}

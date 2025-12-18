/**
 * Zustand 스토어 - 앱 전체 상태 관리
 *
 * React 패턴 학습 포인트:
 * 1. Zustand: Redux보다 간단한 상태 관리 라이브러리
 * 2. 불변성(Immutability): 상태 업데이트 시 새 객체 생성
 * 3. 셀렉터 패턴: 필요한 상태만 구독하여 불필요한 리렌더링 방지
 * 4. 액션 분리: CRUD 작업을 개별 함수로 분리
 */

import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Server, Channel, Message, SearchResult, TagStats } from '../types'
import { loadData, saveData } from '../utils/storage'
import { parseTags } from '../utils/tags'

// 스토어 상태 타입
interface AppStore {
  // 데이터
  servers: Server[]
  channels: Channel[]
  messages: Message[]

  // UI 상태
  selectedServerId: string | null
  selectedChannelId: string | null
  searchQuery: string
  isSearchOpen: boolean

  // 서버 CRUD
  addServer: (name: string, icon?: string) => void
  updateServer: (id: string, updates: Partial<Server>) => void
  deleteServer: (id: string) => void

  // 채널 CRUD
  addChannel: (serverId: string, name: string) => void
  updateChannel: (id: string, updates: Partial<Channel>) => void
  deleteChannel: (id: string) => void

  // 메시지 CRUD
  addMessage: (channelId: string, content: string) => void
  updateMessage: (id: string, content: string) => void
  deleteMessage: (id: string) => void

  // 선택 액션
  selectServer: (id: string | null) => void
  selectChannel: (id: string | null) => void

  // 검색
  setSearchQuery: (query: string) => void
  toggleSearch: () => void
  getSearchResults: () => SearchResult[]

  // 태그 필터링
  selectedTag: string | null
  selectTag: (tag: string | null) => void
  getAllTags: () => TagStats[]

  // 핀/북마크
  isBookmarkPanelOpen: boolean
  toggleBookmarkPanel: () => void
  togglePin: (id: string) => void
  toggleBookmark: (id: string) => void
  getPinnedMessages: () => Message[]
  getBookmarkedMessages: () => Message[]

  // 데이터 관리
  loadFromStorage: () => void
  resetToDefault: () => void
  importFromData: (data: { servers: Server[]; channels: Channel[]; messages: Message[] }) => void
}

// 스토어 생성
export const useAppStore = create<AppStore>((set, get) => ({
  // 초기 상태
  servers: [],
  channels: [],
  messages: [],
  selectedServerId: null,
  selectedChannelId: null,
  searchQuery: '',
  isSearchOpen: false,
  selectedTag: null,
  isBookmarkPanelOpen: false,

  // 서버 CRUD
  addServer: (name, icon) => {
    const newServer: Server = {
      id: uuidv4(),
      name,
      icon: icon || name.charAt(0).toUpperCase(),
      createdAt: Date.now(),
    }

    set((state) => {
      const updated = { servers: [...state.servers, newServer] }
      saveData({
        servers: updated.servers,
        channels: state.channels,
        messages: state.messages,
        version: 1,
      })
      return updated
    })
  },

  updateServer: (id, updates) => {
    set((state) => {
      const updated = {
        servers: state.servers.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      }
      saveData({
        servers: updated.servers,
        channels: state.channels,
        messages: state.messages,
        version: 1,
      })
      return updated
    })
  },

  deleteServer: (id) => {
    set((state) => {
      // 서버 삭제 시 관련 채널과 메시지도 삭제
      const channelIds = state.channels
        .filter((c) => c.serverId === id)
        .map((c) => c.id)

      const updated = {
        servers: state.servers.filter((s) => s.id !== id),
        channels: state.channels.filter((c) => c.serverId !== id),
        messages: state.messages.filter((m) => !channelIds.includes(m.channelId)),
        selectedServerId:
          state.selectedServerId === id ? null : state.selectedServerId,
        selectedChannelId: channelIds.includes(state.selectedChannelId || '')
          ? null
          : state.selectedChannelId,
      }

      saveData({
        servers: updated.servers,
        channels: updated.channels,
        messages: updated.messages,
        version: 1,
      })
      return updated
    })
  },

  // 채널 CRUD
  addChannel: (serverId, name) => {
    const newChannel: Channel = {
      id: uuidv4(),
      serverId,
      name,
      createdAt: Date.now(),
    }

    set((state) => {
      const updated = { channels: [...state.channels, newChannel] }
      saveData({
        servers: state.servers,
        channels: updated.channels,
        messages: state.messages,
        version: 1,
      })
      return updated
    })
  },

  updateChannel: (id, updates) => {
    set((state) => {
      const updated = {
        channels: state.channels.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      }
      saveData({
        servers: state.servers,
        channels: updated.channels,
        messages: state.messages,
        version: 1,
      })
      return updated
    })
  },

  deleteChannel: (id) => {
    set((state) => {
      const updated = {
        channels: state.channels.filter((c) => c.id !== id),
        messages: state.messages.filter((m) => m.channelId !== id),
        selectedChannelId:
          state.selectedChannelId === id ? null : state.selectedChannelId,
      }
      saveData({
        servers: state.servers,
        channels: updated.channels,
        messages: updated.messages,
        version: 1,
      })
      return updated
    })
  },

  // 메시지 CRUD
  addMessage: (channelId, content) => {
    // 메시지 내용에서 태그 자동 추출
    const tags = parseTags(content)

    const newMessage: Message = {
      id: uuidv4(),
      channelId,
      content,
      createdAt: Date.now(),
      tags: tags.length > 0 ? tags : undefined,
    }

    set((state) => {
      const updated = { messages: [...state.messages, newMessage] }
      saveData({
        servers: state.servers,
        channels: state.channels,
        messages: updated.messages,
        version: 1,
      })
      return updated
    })
  },

  updateMessage: (id, content) => {
    // 수정된 내용에서 태그 재파싱
    const tags = parseTags(content)

    set((state) => {
      const updated = {
        messages: state.messages.map((m) =>
          m.id === id
            ? { ...m, content, editedAt: Date.now(), tags: tags.length > 0 ? tags : undefined }
            : m
        ),
      }
      saveData({
        servers: state.servers,
        channels: state.channels,
        messages: updated.messages,
        version: 1,
      })
      return updated
    })
  },

  deleteMessage: (id) => {
    set((state) => {
      const updated = { messages: state.messages.filter((m) => m.id !== id) }
      saveData({
        servers: state.servers,
        channels: state.channels,
        messages: updated.messages,
        version: 1,
      })
      return updated
    })
  },

  // 선택 액션
  selectServer: (id) => {
    set((state) => {
      // 서버 선택 시 해당 서버의 첫 번째 채널 자동 선택
      if (id) {
        const firstChannel = state.channels.find((c) => c.serverId === id)
        return {
          selectedServerId: id,
          selectedChannelId: firstChannel?.id || null,
        }
      }
      return { selectedServerId: null, selectedChannelId: null }
    })
  },

  selectChannel: (id) => set({ selectedChannelId: id }),

  // 검색
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  getSearchResults: () => {
    const state = get()
    const query = state.searchQuery.toLowerCase().trim()

    if (!query) return []

    const results: SearchResult[] = []

    state.messages.forEach((message) => {
      if (message.content.toLowerCase().includes(query)) {
        const channel = state.channels.find((c) => c.id === message.channelId)
        if (channel) {
          const server = state.servers.find((s) => s.id === channel.serverId)
          if (server) {
            results.push({ message, channel, server })
          }
        }
      }
    })

    // 최신 메시지 순으로 정렬
    return results.sort((a, b) => b.message.createdAt - a.message.createdAt)
  },

  // 태그 필터링
  selectTag: (tag) => set({ selectedTag: tag }),

  getAllTags: () => {
    const state = get()
    const tagCounts = new Map<string, number>()

    // 모든 메시지에서 태그 집계
    state.messages.forEach((message) => {
      if (message.tags) {
        message.tags.forEach((tag) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
      }
    })

    // TagStats 배열로 변환하고 빈도순 정렬
    const tagStats: TagStats[] = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)

    return tagStats
  },

  // 핀/북마크
  toggleBookmarkPanel: () => set((state) => ({ isBookmarkPanelOpen: !state.isBookmarkPanelOpen })),

  togglePin: (id) => {
    set((state) => {
      const updated = {
        messages: state.messages.map((m) =>
          m.id === id ? { ...m, isPinned: !m.isPinned } : m
        ),
      }
      saveData({
        servers: state.servers,
        channels: state.channels,
        messages: updated.messages,
        version: 1,
      })
      return updated
    })
  },

  toggleBookmark: (id) => {
    set((state) => {
      const updated = {
        messages: state.messages.map((m) =>
          m.id === id ? { ...m, isBookmarked: !m.isBookmarked } : m
        ),
      }
      saveData({
        servers: state.servers,
        channels: state.channels,
        messages: updated.messages,
        version: 1,
      })
      return updated
    })
  },

  getPinnedMessages: () => {
    const state = get()
    return state.messages
      .filter((m) => m.isPinned && m.channelId === state.selectedChannelId)
      .sort((a, b) => a.createdAt - b.createdAt)
  },

  getBookmarkedMessages: () => {
    const state = get()
    return state.messages
      .filter((m) => m.isBookmarked)
      .sort((a, b) => b.createdAt - a.createdAt)
  },

  // 데이터 관리
  loadFromStorage: () => {
    const data = loadData()
    set({
      servers: data.servers,
      channels: data.channels,
      messages: data.messages,
      selectedServerId: data.servers[0]?.id || null,
      selectedChannelId: data.channels[0]?.id || null,
    })
  },

  resetToDefault: () => {
    const data = loadData()
    set({
      servers: data.servers,
      channels: data.channels,
      messages: data.messages,
      selectedServerId: data.servers[0]?.id || null,
      selectedChannelId: data.channels[0]?.id || null,
    })
  },

  importFromData: (data) => {
    set({
      servers: data.servers,
      channels: data.channels,
      messages: data.messages,
      selectedServerId: data.servers[0]?.id || null,
      selectedChannelId: data.channels[0]?.id || null,
    })
    saveData({ ...data, version: 1 })
  },
}))

// 셀렉터 함수들 (성능 최적화용)
// 필요한 상태만 구독하여 불필요한 리렌더링 방지

export const useServers = () => useAppStore((state) => state.servers)
export const useSelectedServerId = () => useAppStore((state) => state.selectedServerId)

export const useChannels = () => useAppStore((state) => state.channels)
export const useSelectedChannelId = () => useAppStore((state) => state.selectedChannelId)

export const useMessages = () => useAppStore((state) => state.messages)

// 검색 상태 - 개별 셀렉터로 분리하여 무한 루프 방지
export const useSearchQuery = () => useAppStore((state) => state.searchQuery)
export const useIsSearchOpen = () => useAppStore((state) => state.isSearchOpen)
export const useSearch = () => {
  const query = useSearchQuery()
  const isOpen = useIsSearchOpen()
  return { query, isOpen }
}

// 현재 선택된 서버의 채널들만 반환
export const useCurrentChannels = () => {
  const channels = useChannels()
  const selectedServerId = useSelectedServerId()
  return channels.filter((c) => c.serverId === selectedServerId)
}

// 태그 상태 셀렉터
export const useSelectedTag = () => useAppStore((state) => state.selectedTag)

// 현재 선택된 채널의 메시지들만 반환 (태그 필터링 포함)
export const useCurrentMessages = () => {
  const messages = useMessages()
  const selectedChannelId = useSelectedChannelId()
  const selectedTag = useSelectedTag()

  return messages
    .filter((m) => {
      // 채널 필터
      if (m.channelId !== selectedChannelId) return false
      // 태그 필터 (선택된 태그가 있으면 해당 태그 포함 메시지만)
      if (selectedTag && (!m.tags || !m.tags.includes(selectedTag))) return false
      return true
    })
    .sort((a, b) => a.createdAt - b.createdAt)
}

// 전체 메시지에서 태그로 필터링 (채널 무관)
export const useMessagesByTag = (tag: string) => {
  const messages = useMessages()
  return messages
    .filter((m) => m.tags?.includes(tag))
    .sort((a, b) => b.createdAt - a.createdAt)
}

// 북마크 패널 상태 셀렉터
export const useIsBookmarkPanelOpen = () => useAppStore((state) => state.isBookmarkPanelOpen)

/**
 * 태그 관련 유틸리티 함수
 *
 * Obsidian 스타일 #태그 시스템
 * - 메시지 입력 시 #태그 자동 파싱
 * - 중첩 태그 지원 (예: #프로젝트/개발)
 * - 한글, 영문, 숫자, 언더스코어 지원
 */

// 태그 정규식 패턴
// #으로 시작, 한글/영문/숫자/언더스코어/슬래시 허용
// 공백이나 특수문자에서 끝남
const TAG_REGEX = /#([\w가-힣/]+)/g

/**
 * 메시지 내용에서 태그 추출
 * @param content 메시지 내용
 * @returns 태그 배열 (# 제외, 소문자로 정규화)
 */
export function parseTags(content: string): string[] {
  const matches = content.matchAll(TAG_REGEX)
  const tags = new Set<string>()

  for (const match of matches) {
    // 태그를 소문자로 정규화하여 중복 방지
    const tag = match[1].toLowerCase()
    tags.add(tag)
  }

  return Array.from(tags)
}

/**
 * 태그가 포함된지 확인
 * @param content 메시지 내용
 * @returns 태그 포함 여부
 */
export function hasTags(content: string): boolean {
  return TAG_REGEX.test(content)
}

/**
 * 메시지 내용에서 태그를 하이라이팅용 마크업으로 변환
 * React 컴포넌트에서 사용할 수 있도록 배열 반환
 * @param content 메시지 내용
 * @returns 텍스트와 태그 정보 배열
 */
export interface ContentPart {
  type: 'text' | 'tag'
  content: string
  tag?: string  // type이 'tag'일 때 태그 값 (# 제외)
}

export function parseContentWithTags(content: string): ContentPart[] {
  const parts: ContentPart[] = []
  let lastIndex = 0

  // 정규식을 새로 생성 (global 플래그로 인한 상태 초기화)
  const regex = /#([\w가-힣/]+)/g
  let match

  while ((match = regex.exec(content)) !== null) {
    // 태그 앞의 일반 텍스트 추가
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      })
    }

    // 태그 추가
    parts.push({
      type: 'tag',
      content: match[0],  // #포함 전체 텍스트
      tag: match[1].toLowerCase(),  // # 제외, 소문자
    })

    lastIndex = match.index + match[0].length
  }

  // 마지막 남은 텍스트 추가
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    })
  }

  return parts
}

/**
 * 태그 정규화 (일관된 형식으로 변환)
 * @param tag 원본 태그
 * @returns 정규화된 태그
 */
export function normalizeTag(tag: string): string {
  // # 제거 후 소문자로 변환
  return tag.replace(/^#/, '').toLowerCase().trim()
}

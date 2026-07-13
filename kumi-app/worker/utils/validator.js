// Input validation utilities

const BLOCKED_KEYWORDS = [
  '暴力', '暴行', '脅迫', '詐欺', 'ハラスメント',
  '暴力的', '性的', '違法', '犯罪', 'テロ'
]

export function validateTopic(topic) {
  // Check if topic exists
  if (!topic || typeof topic !== 'string') {
    return {
      valid: false,
      message: 'トピックを入力してください'
    }
  }

  // Trim and check length
  const trimmed = topic.trim()
  if (trimmed.length === 0) {
    return {
      valid: false,
      message: 'トピックを入力してください'
    }
  }

  if (trimmed.length > 100) {
    return {
      valid: false,
      message: 'トピックは100文字以内で入力してください'
    }
  }

  // Check for blocked content
  const lowerTopic = trimmed.toLowerCase()
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerTopic.includes(keyword.toLowerCase())) {
      return {
        valid: false,
        message: 'INVALID_TOPIC',
        detail: 'トピックに不適切な内容が含まれています'
      }
    }
  }

  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i
  ]

  for (const pattern of sqlPatterns) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        message: '無効な入力です'
      }
    }
  }

  // Check for XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i
  ]

  for (const pattern of xssPatterns) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        message: '無効な入力です'
      }
    }
  }

  return {
    valid: true,
    sanitized: trimmed
  }
}

export function sanitizeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

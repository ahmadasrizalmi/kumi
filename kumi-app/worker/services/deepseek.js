const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `You are a Japanese conversation generator for language learners.
Generate natural Japanese dialogues for shadowing practice.

RULES:
1. Generate exactly 4 lines of dialogue
2. Alternate between "partner" (AI/native speaker) and "user" (learner)
3. First line is ALWAYS partner
4. Include furigana in hiragana for all kanji
5. Include romaji (standard Hepburn)
6. Include Indonesian translation
7. Keep sentences natural and at JLPT N5-N3 level
8. Use polite form (desu/masu)

OUTPUT FORMAT (strict JSON):
{
  "dialogue": [
    {
      "role": "partner" or "user",
      "text_jp": "Japanese text in kanji/kana",
      "furigana": "hiragana reading",
      "romaji": "Latin transliteration",
      "id": "Indonesian translation"
    }
  ]
}`

export async function generateDialogue(topic, apiKey) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate a Japanese conversation about: ${topic}` }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error: ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content

  try {
    const parsed = JSON.parse(content)
    if (!parsed.dialogue || !Array.isArray(parsed.dialogue)) {
      throw new Error('Invalid response format')
    }
    return parsed.dialogue
  } catch (parseError) {
    throw new Error('Failed to parse DeepSeek response')
  }
}

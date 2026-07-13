import { generateDialogue } from '../services/deepseek.js'
import { generateAudio } from '../services/tts.js'
import { validateTopic } from '../utils/validator.js'

export async function handleGenerate(request, env) {
  const body = await request.json()
  const { topic } = body

  // Validate input
  const validation = validateTopic(topic)
  if (!validation.valid) {
    return new Response(JSON.stringify({
      success: false,
      error: 'INVALID_TOPIC',
      message: validation.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const topicKeyword = topic.trim().toLowerCase()

  try {
    // Check cache in D1
    const cached = await env.DB.prepare(
      'SELECT * FROM scenarios WHERE topic_keyword = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(topicKeyword).first()

    if (cached) {
      return new Response(JSON.stringify({
        success: true,
        scenario_id: cached.id,
        cached: true,
        dialogue: JSON.parse(cached.script_json),
        audio_partner: cached.audio_url
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generate new dialogue via DeepSeek
    const dialogue = await generateDialogue(topic, env.DEEPSEEK_API_KEY)

    // Generate audio for partner lines using Voicevox
    const partnerText = dialogue
      .filter(line => line.role === 'partner')
      .map(line => line.text_jp)
      .join('。')

    let audioUrl = null
    try {
      // Use Voicevox (free, no API key needed)
      audioUrl = await generateAudio(partnerText)
      console.log('TTS audio URL generated:', audioUrl)
    } catch (ttsError) {
      console.error('TTS generation failed:', ttsError)
      // Continue without audio - frontend will use demo mode
    }

    // Save to database
    const result = await env.DB.prepare(
      'INSERT INTO scenarios (topic_keyword, script_json, audio_url) VALUES (?, ?, ?)'
    ).bind(topicKeyword, JSON.stringify(dialogue), audioUrl).run()

    return new Response(JSON.stringify({
      success: true,
      scenario_id: result.meta.last_row_id,
      cached: false,
      dialogue,
      audio_partner: audioUrl
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Generate error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'GENERATION_FAILED',
      message: error.message || 'Failed to generate scenario'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

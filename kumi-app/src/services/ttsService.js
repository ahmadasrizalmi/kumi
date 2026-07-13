// ElevenLabs TTS Service - Suara paling natural
// Free tier: 10,000 characters/month
// Support streaming untuk live talk

const ELEVENLABS_API = 'https://api.elevenlabs.io/v1'

// Default API key (free tier, limited usage)
// User bisa pakai API key sendiri untuk lebih banyak quota
const DEFAULT_API_KEY = 'sk_d462913fb59d7c36c8bd29b13e3e2f0b012f203a21060706' // Demo key

// Japanese voices dari ElevenLabs
const JAPANESE_VOICES = {
  'rachel': '21m00Tcm4TlvDq8ikWAM',    // Rachel - Natural, warm
  'domi': 'AZnzlk1XvdvUeBnXmlld',     // Domi - Energetic
  'bella': 'EXAVITQu4vr4xnSDxMaL',    // Bella - Gentle
  'elli': 'MF3mGyEYCl7XYWbV9V6O',     // Elli - Young, clear
  'josh': 'TxGEqnHWrfWFTfGW9XjX',     // Josh - Deep, clear
  'arnold': 'VR6AewLTigWG4xSOukaG',   // Arnold - Strong
  'sam': 'yoZ06aMxZJJ28mfd3POQ',      // Sam - Raspy
  // Japanese-specific voices (if available)
  'default': '21m00Tcm4TlvDq8ikWAM'   // Default to Rachel
}

// Voice selection for different roles
const ROLE_VOICES = {
  'partner': '21m00Tcm4TlvDq8ikWAM',  // Rachel - Warm, friendly
  'user': 'MF3mGyEYCl7XYWbV9V6O'      // Elli - Clear, young
}

// Cache for audio URLs
const audioCache = new Map()

export class TTSService {
  constructor(apiKey = DEFAULT_API_KEY) {
    this.apiKey = apiKey
    this.audioContext = null
    this.currentAudio = null
    this.isPlaying = false
    this.onProgress = null
    this.onEnd = null
  }

  // Generate speech from text
  async generateSpeech(text, voiceId = JAPANESE_VOICES.default) {
    // Check cache first
    const cacheKey = `${text}_${voiceId}`
    if (audioCache.has(cacheKey)) {
      return audioCache.get(cacheKey)
    }

    try {
      const response = await fetch(`${ELEVENLABS_API}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2', // Best for Japanese
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail?.message || 'TTS generation failed')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Cache the result
      audioCache.set(cacheKey, audioUrl)

      return audioUrl
    } catch (error) {
      console.error('ElevenLabs TTS error:', error)
      throw error
    }
  }

  // Generate speech with streaming (for live talk)
  async generateSpeechStream(text, voiceId = JAPANESE_VOICES.default) {
    try {
      const response = await fetch(`${ELEVENLABS_API}/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        throw new Error('Stream generation failed')
      }

      return response.body // ReadableStream for live playback
    } catch (error) {
      console.error('ElevenLabs streaming error:', error)
      throw error
    }
  }

  // Play audio from URL
  async playAudio(audioUrl, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.currentAudio) {
        this.currentAudio.pause()
        this.currentAudio.src = ''
      }

      const audio = new Audio(audioUrl)
      this.currentAudio = audio
      this.isPlaying = true

      audio.playbackRate = options.rate || 1

      audio.addEventListener('timeupdate', () => {
        if (this.onProgress) {
          this.onProgress(audio.currentTime, audio.duration)
        }
      })

      audio.addEventListener('ended', () => {
        this.isPlaying = false
        this.currentAudio = null
        if (this.onEnd) this.onEnd()
        resolve()
      })

      audio.addEventListener('error', (e) => {
        this.isPlaying = false
        this.currentAudio = null
        reject(new Error('Audio playback failed'))
      })

      audio.play().catch(reject)
    })
  }

  // Stop current playback
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
    this.isPlaying = false
  }

  // Get available voices
  async getVoices() {
    try {
      const response = await fetch(`${ELEVENLABS_API}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch voices')
      }

      const data = await response.json()
      return data.voices || []
    } catch (error) {
      console.error('Failed to fetch voices:', error)
      return []
    }
  }

  // Check API quota
  async getQuota() {
    try {
      const response = await fetch(`${ELEVENLABS_API}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch quota')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch quota:', error)
      return null
    }
  }
}

// Singleton instance
let ttsInstance = null

export function getTTSService(apiKey) {
  if (!ttsInstance || apiKey) {
    ttsInstance = new TTSService(apiKey)
  }
  return ttsInstance
}

// Helper function to generate audio for dialogue
export async function generateDialogueAudio(dialogue, apiKey) {
  const tts = getTTSService(apiKey)
  const audioUrls = []

  for (const line of dialogue) {
    try {
      const voiceId = line.role === 'partner'
        ? ROLE_VOICES.partner
        : ROLE_VOICES.user

      const audioUrl = await tts.generateSpeech(line.text_jp, voiceId)
      audioUrls.push({
        ...line,
        audioUrl
      })
    } catch (error) {
      console.warn(`Failed to generate audio for line: ${line.text_jp}`, error)
      audioUrls.push({
        ...line,
        audioUrl: null
      })
    }
  }

  return audioUrls
}

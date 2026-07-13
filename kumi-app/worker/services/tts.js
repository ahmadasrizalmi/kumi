// TTS Service - Voicevox Public API (Free, no API key needed)
// https://api.tts.quest/v3/voicevox/speakers_array

const VOICEVOX_QUEST_API = 'https://api.tts.quest/v3/voicevox'

// Speaker IDs (index-based from speakers_array endpoint)
// Popular speakers for language learning:
const SPEAKERS = {
  'metan_amama': 0,       // 四国めたん（あまあま）
  'zundamon_amama': 1,    // ずんだもん（あまあま）
  'metan_normal': 2,      // 四国めたん（ノーマル）
  'zundamon_normal': 3,   // ずんだもん（ノーマル）- Most popular!
  'metan_sexy': 4,        // 四国めたん（セクシー）
  'zundamon_sexy': 5,     // ずんだもん（セクシー）
  'metan_tsuntsun': 6,    // 四国めたん（ツンツン）
  'zundamon_tsuntsun': 7, // ずんだもん（ツンツン）
  'tsumugi': 8,           // 春日部つむぎ（ノーマル）
  'ritsu': 9,             // 波音リツ（ノーマル）
  'hau': 10,              // 雨晴はう（ノーマル）
  'takehiro': 11,         // 玄野武宏（ノーマル）
  'kenta': 12,            // 白上虎太郎（ふつう）
  'ryusei': 13,           // 青山龍星（ノーマル）
  'himari': 14,           // 冥鳴ひまり（ノーマル）
  'sora': 15,             // 九州そら（あまあま）
  'sora_normal': 16,      // 九州そら（ノーマル）
  'sora_sexy': 17,        // 九州そら（セクシー）
  'sora_tsuntsun': 18,    // 九州そら（ツンツン）
  'sora_sasayaki': 19,    // 九州そら（ささやき）
  'mochiko': 20,          // もち子(cv 明日葉よもぎ)（ノーマル）
  'kennji': 21,           // 剣崎雌雄（ノーマル）
  'zundamon_sasayaki': 22, // ずんだもん（ささやき）
  'white_cul_normal': 23, // WhiteCUL（ノーマル）
  'white_cul_tanoshii': 24, // WhiteCUL（たのしい）
  'white_cul_kanashii': 25, // WhiteCUL（かなしい）
  'white_cul_bieen': 26,  // WhiteCUL（びえーん）
  'ushio_human': 27,      // 後鬼（人間ver.）
  'ushio_nui': 28,        // 後鬼（ぬいぐるみver.）
  'no7_normal': 29,       // No.7（ノーマル）
  'no7_announce': 30,     // No.7（アナウンス）
  'no7_yomikikase': 31,   // No.7（読み聞かせ）
}

// Default speaker - Zundamon Normal (most popular for learning)
const DEFAULT_SPEAKER = SPEAKERS.zundamon_normal

export async function generateAudio(text, apiKey = null, speakerId = DEFAULT_SPEAKER) {
  try {
    // Use Voicevox Quest API - synthesis endpoint
    const synthResponse = await fetch(`${VOICEVOX_QUEST_API}/synthesis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: text,
        speaker: speakerId.toString()
      })
    })

    if (!synthResponse.ok) {
      throw new Error(`Voicevox synthesis failed: ${synthResponse.status}`)
    }

    const synthData = await synthResponse.json()

    if (!synthData.success) {
      throw new Error(synthData.errorMessage || 'Synthesis failed')
    }

    // Get the MP3 download URL
    const audioUrl = synthData.mp3DownloadUrl

    if (audioUrl) {
      return audioUrl
    }

    // If URL not immediately available, poll for it
    if (synthData.isAudioReady === false && synthData.waitTime) {
      await new Promise(resolve => setTimeout(resolve, synthData.waitTime * 1000))
      // Retry to get the URL
      return await pollForAudio(text, speakerId)
    }

    throw new Error('No audio URL in response')
  } catch (error) {
    console.error('Voicevox API error:', error)
    throw error
  }
}

async function pollForAudio(text, speakerId, maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds

    const response = await fetch(`${VOICEVOX_QUEST_API}/synthesis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: text,
        speaker: speakerId.toString()
      })
    })

    const data = await response.json()

    if (data.success && data.mp3DownloadUrl) {
      return data.mp3DownloadUrl
    }

    if (data.errorMessage) {
      throw new Error(data.errorMessage)
    }
  }

  throw new Error('Audio generation timed out')
}

// Get available speakers list
export async function getSpeakers() {
  try {
    const response = await fetch(`${VOICEVOX_QUEST_API}/voicevox/speakers_array`)
    const data = await response.json()
    if (data.success) {
      return data.speakers || []
    }
    return []
  } catch (error) {
    console.error('Failed to fetch speakers:', error)
    return []
  }
}

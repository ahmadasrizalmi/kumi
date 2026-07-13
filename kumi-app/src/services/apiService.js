const API_BASE = '/api'

// Voicevox Public API for TTS
const VOICEVOX_API = 'https://api.tts.quest/v3/voicevox'

// Topic keyword mapping
const TOPIC_KEYWORDS = {
  'レストラン': ['レストラン', 'restoran', 'restaurant', '食堂', 'しょくどう', '食事', 'しょくじ', 'ラーメン', 'らーめん', 'ラーメン屋', 'うどん', 'そば', '寿司', 'すし', 'カフェ', 'かふぇ'],
  '買い物': ['買い物', 'かいもの', 'shopping', 'ショップ', 'しょっぷ', '服', 'ふく', 'Tシャツ', 'デパート', 'でぱーと', 'コンビに', 'スーパー', 'マート'],
  '駅': ['駅', 'えき', 'eki', 'station', '電車', 'でんしゃ', '切符', 'きっぷ', '新幹線', 'しんかんせん', '乗り換え', 'のりかえ'],
  '病院': ['病院', 'びょういん', 'hospital', '医者', 'いしゃ', '薬', 'くすり', '頭痛', 'ずつう', '熱', 'ねつ', '風邪', 'かぜ', '具合', 'ぐあい'],
  'ホテル': ['ホテル', 'ほてる', 'hotel', '旅館', 'りょかん', '宿', 'やど', '予約', 'よやく', 'チェックイン', '部屋', 'へや'],
  '友達': ['友達', 'ともだち', 'friend', '友人', 'ゆうじん', '遊び', 'あそび', '会う', 'あう', 'カフェ', '映画', 'えいが']
}

// Scenario data
const SCENARIO_DATA = {
  'レストラン': {
    partner: {
      greeting: 'いらっしゃいませ。ご注文はお決まりですか？',
      options: '本日は味噌ラーメンがおすすめです。味噌、醤油、塩から選べますよ。',
      confirm: 'かしこまりました。味噌ラーメンですね。少々お待ちください。',
      ending: 'お待たせしました。味噌ラーメンでございます。どうぞ召し上がれ。',
      farewell: 'ありがとうございました。またのご来店をお待ちしております。'
    },
    user: {
      greeting: 'すみません、ラーメンを一つお願いします。',
      order: '味噌ラーメンをお願いします。',
      thanks: 'ありがとうございます。',
      feedback: 'とても美味しかったです。',
      goodbye: 'お会計お願いします。'
    }
  },
  '買い物': {
    partner: {
      greeting: 'いらっしゃいませ。何かお探しですか？',
      options: 'こちらのTシャツは人気です。サイズはM、L、XLがございます。',
      confirm: 'Mサイズですね。お試しになりますか？',
      ending: 'お似合いですよ。レジへどうぞ。',
      farewell: 'ありがとうございました。またのお越しをお待ちしております。'
    },
    user: {
      greeting: 'このTシャツのサイズMはありますか？',
      request: '試着してもいいですか？',
      thanks: 'はい、これをください。',
      feedback: 'とても気に入りました。',
      goodbye: 'お会計お願いします。'
    }
  },
  '駅': {
    partner: {
      greeting: 'いらっしゃいませ。どちらまでですか？',
      options: '東京まで新幹線で約2時間です。指定席と自由席がございます。',
      confirm: '指定席ですね。お席はA列14番でございます。',
      ending: '切符でございます。どうぞお気をつけて。',
      farewell: '良いご旅行を。'
    },
    user: {
      greeting: '東京までお願いします。',
      request: '新幹線の切符を一枚お願いします。',
      thanks: 'ありがとうございます。',
      feedback: '何時に発車しますか？',
      goodbye: 'お先に失礼します。'
    }
  },
  '病院': {
    partner: {
      greeting: 'どうされましたか？',
      options: 'いつからですか？他に症状はありますか？',
      confirm: '風邪ですね。お薬を出しますので、しっかり休んでください。',
      ending: 'お大事にしてください。',
      farewell: 'また何かありましたらお越しください。'
    },
    user: {
      greeting: '頭が痛くて、熱があります。',
      details: '昨日の夜からです。喉も痛いです。',
      thanks: 'はい、分かりました。',
      feedback: 'お薬はどのくらい飲みますか？',
      goodbye: 'ありがとうございます。お邪魔しました。'
    }
  },
  'ホテル': {
    partner: {
      greeting: 'ご予約のお名前をお願いします。',
      options: '禁煙ルームと喫煙ルームがございます。どちらがよろしいですか？',
      confirm: '禁煙ルームですね。お部屋は501号室です。',
      ending: 'エレベーターは右手にございます。どうぞおゆっくり。',
      farewell: '良いご滞在を。'
    },
    user: {
      greeting: '田中です。一泊二日で予約しました。',
      request: '禁煙ルームをお願いします。',
      thanks: 'ありがとうございます。',
      feedback: 'チェックアウトは何時ですか？',
      goodbye: 'お世話になりました。'
    }
  },
  '友達': {
    partner: {
      greeting: '久しぶり！元気だった？',
      options: '今日天気いいね！どこか行かない？',
      confirm: 'カフェに行こう！新しいお店ができたんだ。',
      ending: '今日は楽しかった！また遊ぼうね。',
      farewell: 'じゃあね！また連絡してね！'
    },
    user: {
      greeting: '元気だよ！久しぶりだね！',
      request: 'いいね！カフェに行こう！',
      thanks: '楽しかった！',
      feedback: 'このケーキ美味しいね！',
      goodbye: 'またね！気をつけてね！'
    }
  }
}

// Generate dialogue based on topic
function generateDialogue(topic) {
  const normalizedTopic = topic.trim().toLowerCase()

  // Find matching scenario
  let scenarioKey = 'レストラン' // default

  for (const [key, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(k => normalizedTopic.includes(k))) {
      scenarioKey = key
      break
    }
  }

  const data = SCENARIO_DATA[scenarioKey]
  if (!data) {
    // Generate generic dialogue for unknown topics
    return generateGenericDialogue(topic)
  }

  // Generate dialogue array
  const dialogue = []

  // Partner greeting
  dialogue.push({
    role: 'partner',
    text_jp: data.partner.greeting,
    furigana: '',
    romaji: '',
    id: data.partner.greeting
  })

  // User response
  dialogue.push({
    role: 'user',
    text_jp: data.user.greeting,
    furigana: '',
    romaji: '',
    id: data.user.greeting
  })

  // Partner options
  dialogue.push({
    role: 'partner',
    text_jp: data.partner.options,
    furigana: '',
    romaji: '',
    id: data.partner.options
  })

  // User request
  dialogue.push({
    role: 'user',
    text_jp: data.user.request,
    furigana: '',
    romaji: '',
    id: data.user.request
  })

  // Partner confirm
  dialogue.push({
    role: 'partner',
    text_jp: data.partner.confirm,
    furigana: '',
    romaji: '',
    id: data.partner.confirm
  })

  // User thanks
  dialogue.push({
    role: 'user',
    text_jp: data.user.thanks,
    furigana: '',
    romaji: '',
    id: data.user.thanks
  })

  // Partner ending
  dialogue.push({
    role: 'partner',
    text_jp: data.partner.ending,
    furigana: '',
    romaji: '',
    id: data.partner.ending
  })

  // User feedback
  dialogue.push({
    role: 'user',
    text_jp: data.user.feedback,
    furigana: '',
    romaji: '',
    id: data.user.feedback
  })

  // Partner farewell
  dialogue.push({
    role: 'partner',
    text_jp: data.partner.farewell,
    furigana: '',
    romaji: '',
    id: data.partner.farewell
  })

  // User goodbye
  dialogue.push({
    role: 'user',
    text_jp: data.user.goodbye,
    furigana: '',
    romaji: '',
    id: data.user.goodbye
  })

  return dialogue
}

function generateGenericDialogue(topic) {
  return [
    {
      role: 'partner',
      text_jp: `こんにちは。${topic}について話しましょう。`,
      furigana: '',
      romaji: '',
      id: `Halo. Mari berbicara tentang ${topic}.`
    },
    {
      role: 'user',
      text_jp: `はい、${topic}について教えてください。`,
      furigana: '',
      romaji: '',
      id: `Ya, tolong ceritakan tentang ${topic}.`
    },
    {
      role: 'partner',
      text_jp: `${topic}はとても面白いですね。`,
      furigana: '',
      romaji: '',
      id: `${topic} sangat menarik ya.`
    },
    {
      role: 'user',
      text_jp: `そうですね。もっと知りたいです。`,
      furigana: '',
      romaji: '',
      id: `Benar. Saya ingin tahu lebih banyak.`
    },
    {
      role: 'partner',
      text_jp: `いつか${topic}を体験してみてください。`,
      furigana: '',
      romaji: '',
      id: `Kapan-kapan cobalah ${topic}.`
    },
    {
      role: 'user',
      text_jp: `いいですね！楽しみにしています。`,
      furigana: '',
      romaji: '',
      id: `Bagus! Saya menantikannya.`
    }
  ]
}

// Generate TTS audio using Voicevox Public API
async function generateTTSAudio(text) {
  try {
    console.log('Generating TTS for:', text.substring(0, 50) + '...')
    
    const response = await fetch(`${VOICEVOX_API}/synthesis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: text,
        speaker: '3' // Zundamon Normal
      })
    })

    const data = await response.json()
    console.log('Voicevox response:', data)

    if (data.success && data.mp3DownloadUrl) {
      console.log('TTS URL generated:', data.mp3DownloadUrl)
      return data.mp3DownloadUrl
    }

    // If needs waiting, poll for the result
    if (data.waitTime) {
      console.log('Waiting for TTS:', data.waitTime, 'seconds')
      await new Promise(resolve => setTimeout(resolve, data.waitTime * 1000))
      
      // Retry
      const retryResponse = await fetch(`${VOICEVOX_API}/synthesis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          text: text,
          speaker: '3'
        })
      })
      const retryData = await retryResponse.json()
      if (retryData.success && retryData.mp3DownloadUrl) {
        console.log('TTS URL generated (retry):', retryData.mp3DownloadUrl)
        return retryData.mp3DownloadUrl
      }
    }

    console.warn('TTS generation failed:', data)
    return null
  } catch (error) {
    console.error('TTS generation error:', error)
    return null
  }
}

export async function generateScenario(topic, onProgress) {
  console.log('Generating scenario for topic:', topic)

  // Generate dialogue based on topic
  const dialogue = generateDialogue(topic)

  // Return scenario immediately without audio (will be generated in background)
  const scenario = {
    success: true,
    scenario_id: Date.now(),
    cached: false,
    topic: topic,
    dialogue: dialogue,
    audio_partner: null
  }

  // Generate TTS audio in background
  generateTTSAudioForScenario(scenario, dialogue)

  console.log('Generated scenario:', scenario)
  return scenario
}

async function generateTTSAudioForScenario(scenario, dialogue) {
  try {
    // Generate TTS for first partner line
    const firstPartnerLine = dialogue.find(line => line.role === 'partner')
    if (firstPartnerLine) {
      console.log('Generating TTS for:', firstPartnerLine.text_jp)
      const audioUrl = await generateTTSAudio(firstPartnerLine.text_jp)
      if (audioUrl) {
        scenario.audio_partner = audioUrl
        console.log('TTS audio URL set:', audioUrl)
      }
    }
  } catch (error) {
    console.warn('TTS generation failed:', error)
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`)
    return await response.json()
  } catch {
    return { status: 'offline', version: 'mock' }
  }
}

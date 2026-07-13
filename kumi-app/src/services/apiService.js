// Kumi API Service - Direct DeepSeek API calls (no Worker needed!)

// DeepSeek API Key (stored in localStorage)
function getDeepSeekApiKey() {
  return localStorage.getItem('kumi_deepseek_api_key') || ''
}

function setDeepSeekApiKey(key) {
  localStorage.setItem('kumi_deepseek_api_key', key)
}

// ElevenLabs API Key (stored in localStorage)
function getElevenLabsApiKey() {
  return localStorage.getItem('kumi_elevenlabs_api_key') || ''
}

function setElevenLabsApiKey(key) {
  localStorage.setItem('kumi_elevenlabs_api_key', key)
}

// Generate dialogue via DeepSeek API
async function generateDialogueFromDeepSeek(topic) {
  const apiKey = getDeepSeekApiKey()
  
  if (!apiKey) {
    console.warn('No DeepSeek API key, using fallback dialogue')
    return generateFallbackDialogue(topic)
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a Japanese language teacher. Generate a dialogue for shadowing practice. Return ONLY a JSON array (no markdown, no explanation) with objects containing: role (partner/user), text_jp (Japanese), furigana (hiragana reading), romaji (romaji), id (Indonesian translation). Generate 8-10 lines of natural conversation.'
          },
          {
            role: 'user',
            content: 'Generate a Japanese dialogue about: ' + topic
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    
    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('DeepSeek API error:', error)
  }

  // Fallback if DeepSeek fails
  return generateFallbackDialogue(topic)
}

// Fallback dialogue generator
function generateFallbackDialogue(topic) {
  return [
    { role: 'partner', text_jp: 'こんにちは！' + topic + 'について話しましょう。', furigana: 'こんにちは！' + topic + 'についてはなしましょう。', romaji: 'Konnichiwa! ' + topic + ' ni tsuite hanashimashou.', id: 'Halo! Mari bicara tentang ' + topic + '.' },
    { role: 'user', text_jp: 'はい、お願いします。', furigana: 'はい、おねがいします。', romaji: 'Hai, onegaishimasu.', id: 'Ya, tolong.' },
    { role: 'partner', text_jp: 'まず、自己紹介をしてください。', furigana: 'まず、じこしょうかいをしてください。', romaji: 'Mazu, jiko shoukai wo shite kudasai.', id: 'Pertama, perkenalkan diri Anda.' },
    { role: 'user', text_jp: '田中です。よろしくお願いします。', furigana: 'たなかです。よろしくおねがいします。', romaji: 'Tanaka desu. Yoroshiku onegaishimasu.', id: 'Saya Tanaka. Senang berkenalan.' },
    { role: 'partner', text_jp: 'どこから来ましたか？', furigana: 'どこからきましたか？', romaji: 'Doko kara kimashita ka?', id: 'Dari mana Anda berasal?' },
    { role: 'user', text_jp: 'インドネシアから来ました。', furigana: 'いんどねしあからきました。', romaji: 'Indonesia kara kimashita.', id: 'Saya dari Indonesia.' },
    { role: 'partner', text_jp: '日本語はお上手ですね。', furigana: 'にほんごはおじょうずですね。', romaji: 'Nihongo wa ojouzu desu ne.', id: 'Bahasa Jepang Anda bagus ya.' },
    { role: 'user', text_jp: 'ありがとうございます。まだまだです。', furigana: 'ありがとうございます。まだまだです。', romaji: 'Arigatou gozaimasu. Mada mada desu.', id: 'Terima kasih. Masih kurang.' },
    { role: 'partner', text_jp: 'もっと練習しましょう！', furigana: 'もっとれんしゅうしましょう！', romaji: 'Motto renshuu shimashou!', id: 'Ayo latihan lebih banyak!' },
    { role: 'user', text_jp: 'はい、頑張ります！', furigana: 'はい、がんばります！', romaji: 'Hai, ganbarimasu!', id: 'Ya, saya akan berusaha!' }
  ]
}

// Main function to generate scenario
export async function generateScenario(topic, onProgress) {
  console.log('Generating scenario for topic:', topic)

  // Generate dialogue via DeepSeek
  const dialogue = await generateDialogueFromDeepSeek(topic)

  // Return scenario
  const scenario = {
    success: true,
    scenario_id: Date.now(),
    cached: false,
    topic: topic,
    dialogue: dialogue,
    audio_partner: null
  }

  console.log('Generated scenario:', scenario)
  return scenario
}

// Health check (always ok since we don't need backend)
export async function checkHealth() {
  return { status: 'ok', version: '2.0.0-direct', mode: 'frontend-direct' }
}

// Export API key functions
export { getDeepSeekApiKey, setDeepSeekApiKey, getElevenLabsApiKey, setElevenLabsApiKey }

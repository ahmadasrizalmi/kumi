// Web Speech API - Built-in browser TTS
// Tidak perlu API key, langsung jalan di semua browser modern
// Support Japanese (日本語)

import { ref, onUnmounted } from 'vue'

export function useTTS() {
  const isSpeaking = ref(false)
  const isPaused = ref(false)
  const currentUtterance = ref(null)

  // Check if browser supports Speech Synthesis
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Get available voices (including Japanese)
  function getVoices() {
    if (!isSupported) return []
    return window.speechSynthesis.getVoices()
  }

  // Get Japanese voice
  function getJapaneseVoice() {
    const voices = getVoices()
    // Try to find Japanese voice
    return voices.find(v => v.lang.startsWith('ja')) ||
           voices.find(v => v.lang.includes('JP')) ||
           voices[0] // Fallback to first available voice
  }

  // Speak text in Japanese
  function speak(text, options = {}) {
    if (!isSupported) {
      console.warn('Speech Synthesis not supported')
      return false
    }

    // Cancel any ongoing speech
    stop()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = getJapaneseVoice()

    if (voice) {
      utterance.voice = voice
    }

    // Set language to Japanese
    utterance.lang = 'ja-JP'

    // Options
    utterance.rate = options.rate || 1 // Speed: 0.1 to 10
    utterance.pitch = options.pitch || 1 // Pitch: 0 to 2
    utterance.volume = options.volume || 1 // Volume: 0 to 1

    // Event handlers
    utterance.onstart = () => {
      isSpeaking.value = true
      isPaused.value = false
      options.onStart?.()
    }

    utterance.onend = () => {
      isSpeaking.value = false
      isPaused.value = false
      currentUtterance.value = null
      options.onEnd?.()
    }

    utterance.onerror = (event) => {
      console.error('Speech error:', event.error)
      isSpeaking.value = false
      isPaused.value = false
      currentUtterance.value = null
      options.onError?.(event.error)
    }

    utterance.onpause = () => {
      isPaused.value = true
      options.onPause?.()
    }

    utterance.onresume = () => {
      isPaused.value = false
      options.onResume?.()
    }

    currentUtterance.value = utterance
    window.speechSynthesis.speak(utterance)
    return true
  }

  // Speak with word-by-word callback (for karaoke)
  function speakWithWordCallback(text, options = {}) {
    if (!isSupported) return false

    // Split text into words/sentences
    const words = text.split(/(?<=[。、！？\s])/g).filter(w => w.trim())
    let currentIndex = 0

    function speakNext() {
      if (currentIndex >= words.length) {
        options.onComplete?.()
        return
      }

      const word = words[currentIndex]
      options.onWord?.(currentIndex, word)

      speak(word, {
        rate: options.rate || 1,
        onEnd: () => {
          currentIndex++
          speakNext()
        },
        onError: options.onError
      })
    }

    speakNext()
    return true
  }

  // Pause speech
  function pause() {
    if (!isSupported) return
    window.speechSynthesis.pause()
    isPaused.value = true
  }

  // Resume speech
  function resume() {
    if (!isSupported) return
    window.speechSynthesis.resume()
    isPaused.value = false
  }

  // Stop speech
  function stop() {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    isSpeaking.value = false
    isPaused.value = false
    currentUtterance.value = null
  }

  // Set speech rate
  function setRate(rate) {
    if (currentUtterance.value) {
      currentUtterance.value.rate = rate
    }
  }

  // Wait for voices to be loaded
  function waitForVoices() {
    return new Promise((resolve) => {
      const voices = getVoices()
      if (voices.length > 0) {
        resolve(voices)
        return
      }

      window.speechSynthesis.onvoiceschanged = () => {
        resolve(getVoices())
      }

      // Timeout fallback
      setTimeout(() => resolve(getVoices()), 1000)
    })
  }

  onUnmounted(() => {
    stop()
  })

  return {
    isSpeaking,
    isPaused,
    isSupported,
    speak,
    speakWithWordCallback,
    pause,
    resume,
    stop,
    setRate,
    getVoices,
    getJapaneseVoice,
    waitForVoices
  }
}

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'
import { useTTS } from '../composables/useTTS.js'
import { getTTSService } from '../services/ttsService.js'

const props = defineProps({
  audioUrl: {
    type: String,
    default: ''
  },
  dialogue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['line-change', 'play', 'pause', 'ended'])

// ElevenLabs TTS
const elevenLabsKey = ref(localStorage.getItem('elevenlabs_api_key') || '')
const ttsService = computed(() => {
  if (elevenLabsKey.value) {
    return getTTSService(elevenLabsKey.value)
  }
  return null
})

// Web Speech API fallback
const { isSpeaking: isWebSpeechSpeaking, speak: webSpeechSpeak, stop: stopWebSpeech, waitForVoices, isSupported: isWebSpeechSupported } = useTTS()

// State
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref(1)
const currentLineIndex = ref(-1)
const isGeneratingTTS = ref(false)
const ttsMode = ref('auto') // 'elevenlabs', 'webspeech', 'simulation', 'auto'

// Simulation state
let simulationInterval = null
let simulationTime = 0

// Calculate estimated duration based on text length
const estimatedDuration = computed(() => {
  if (!props.dialogue.length) return 10
  const totalChars = props.dialogue.reduce((sum, line) => sum + line.text_jp.length, 0)
  return Math.max(totalChars * 0.3, 10)
})

// Calculate line timings for simulation
const lineTimings = computed(() => {
  if (!props.dialogue.length) return []
  const total = estimatedDuration.value
  const totalChars = props.dialogue.reduce((sum, line) => sum + line.text_jp.length, 0)

  let accumulated = 0
  return props.dialogue.map((line, index) => {
    const proportion = line.text_jp.length / totalChars
    const lineDuration = proportion * total
    const start = accumulated
    accumulated += lineDuration
    return { index, start, end: accumulated, duration: lineDuration }
  })
})

// Initialize
async function init() {
  if (isWebSpeechSupported) {
    await waitForVoices()
  }
}

init()

function togglePlay() {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

async function play() {
  isPlaying.value = true
  emit('play')

  // Determine TTS mode
  if (ttsMode.value === 'auto') {
    if (elevenLabsKey.value && ttsService.value) {
      ttsMode.value = 'elevenlabs'
    } else if (isWebSpeechSupported) {
      ttsMode.value = 'webspeech'
    } else {
      ttsMode.value = 'simulation'
    }
  }

  if (ttsMode.value === 'elevenlabs') {
    await playWithElevenLabs()
  } else if (ttsMode.value === 'webspeech') {
    await playWithWebSpeech()
  } else {
    startSimulation()
  }
}

async function playWithElevenLabs() {
  if (!ttsService.value) {
    startSimulation()
    return
  }

  isGeneratingTTS.value = true
  let lineIndex = 0

  async function playNextLine() {
    if (lineIndex >= props.dialogue.length) {
      isPlaying.value = false
      isGeneratingTTS.value = false
      currentLineIndex.value = props.dialogue.length
      emit('ended')
      return
    }

    const line = props.dialogue[lineIndex]
    currentLineIndex.value = lineIndex
    emit('line-change', lineIndex)

    // Skip user lines - user reads their own lines
    if (line.role === 'user') {
      // Pause for user to read (simulate reading time)
      const readTime = Math.max(line.text_jp.length * 0.15, 1.5) * (1 / playbackRate.value)
      await new Promise(resolve => setTimeout(resolve, readTime * 1000))
      lineIndex++
      await playNextLine()
      return
    }

    try {
      isGeneratingTTS.value = true
      const audioUrl = await ttsService.value.generateSpeech(line.text_jp)
      isGeneratingTTS.value = false

      // Play the audio
      await ttsService.value.playAudio(audioUrl, { rate: playbackRate.value })

      lineIndex++
      await playNextLine()
    } catch (error) {
      console.error('ElevenLabs playback failed:', error)
      // Fallback to Web Speech
      ttsMode.value = 'webspeech'
      await playWithWebSpeech()
    }
  }

  await playNextLine()
}

async function playWithWebSpeech() {
  if (!isWebSpeechSupported) {
    startSimulation()
    return
  }

  let lineIndex = 0

  function speakNextLine() {
    if (lineIndex >= props.dialogue.length) {
      isPlaying.value = false
      currentLineIndex.value = props.dialogue.length
      emit('ended')
      return
    }

    const line = props.dialogue[lineIndex]
    currentLineIndex.value = lineIndex
    emit('line-change', lineIndex)

    // Skip user lines - user reads their own lines
    if (line.role === 'user') {
      // Pause for user to read (simulate reading time)
      const readTime = Math.max(line.text_jp.length * 0.15, 1.5) * (1 / playbackRate.value)
      setTimeout(() => {
        lineIndex++
        speakNextLine()
      }, readTime * 1000)
      return
    }

    webSpeechSpeak(line.text_jp, {
      rate: playbackRate.value,
      onEnd: () => {
        lineIndex++
        speakNextLine()
      },
      onError: (error) => {
        console.error('Web Speech error:', error)
        lineIndex++
        speakNextLine()
      }
    })
  }

  speakNextLine()
}

function pause() {
  stopWebSpeech()
  if (ttsService.value) {
    ttsService.value.stop()
  }
  stopSimulation()
  isPlaying.value = false
  isGeneratingTTS.value = false
  emit('pause')
}

function startSimulation() {
  if (simulationInterval) {
    stopSimulation()
  }

  isPlaying.value = true
  simulationTime = 0
  duration.value = estimatedDuration.value
  currentLineIndex.value = 0
  emit('play')
  emit('line-change', 0)

  const step = 100

  simulationInterval = setInterval(() => {
    simulationTime += (step / 1000) * playbackRate.value
    currentTime.value = simulationTime

    const line = lineTimings.value.find(
      t => simulationTime >= t.start && simulationTime < t.end
    )
    if (line && line.index !== currentLineIndex.value) {
      currentLineIndex.value = line.index
      emit('line-change', line.index)
    }

    if (simulationTime >= estimatedDuration.value) {
      stopSimulation()
      isPlaying.value = false
      currentLineIndex.value = props.dialogue.length
      emit('ended')
    }
  }, step)
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval)
    simulationInterval = null
  }
}

function setSpeed(rate) {
  playbackRate.value = rate
}

function setTTSMode(mode) {
  ttsMode.value = mode
}

function setElevenLabsKey(key) {
  elevenLabsKey.value = key
  localStorage.setItem('elevenlabs_api_key', key)
  ttsMode.value = 'auto' // Reset to auto
}

function restart() {
  stopWebSpeech()
  if (ttsService.value) {
    ttsService.value.stop()
  }
  stopSimulation()
  simulationTime = 0
  currentTime.value = 0
  currentLineIndex.value = -1
  isPlaying.value = false
  isGeneratingTTS.value = false
}

onUnmounted(() => {
  stopWebSpeech()
  if (ttsService.value) {
    ttsService.value.stop()
  }
  stopSimulation()
})

defineExpose({
  isPlaying,
  currentLineIndex,
  currentTime,
  duration,
  playbackRate,
  isGeneratingTTS,
  ttsMode,
  togglePlay,
  play,
  pause,
  setSpeed,
  setTTSMode,
  setElevenLabsKey,
  restart
})
</script>

<template>
  <div>
    <slot
      :is-playing="isPlaying"
      :current-line-index="currentLineIndex"
      :current-time="currentTime"
      :duration="duration"
      :playback-rate="playbackRate"
      :is-generating-tts="isGeneratingTTS"
      :tts-mode="ttsMode"
      :toggle-play="togglePlay"
      :play="play"
      :pause="pause"
      :set-speed="setSpeed"
      :set-tts-mode="setTTSMode"
      :set-eleven-labs-key="setElevenLabsKey"
      :restart="restart"
    />
  </div>
</template>

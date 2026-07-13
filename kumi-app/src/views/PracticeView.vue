<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useScenarioStore } from '../stores/scenario.js'
import AudioEngine from '../components/AudioEngine.vue'
import ScriptViewer from '../components/ScriptViewer.vue'
import PlaybackControls from '../components/PlaybackControls.vue'
import ShadowRecorder from '../components/ShadowRecorder.vue'
import ApiKeyInput from '../components/ApiKeyInput.vue'

const router = useRouter()
const route = useRoute()
const store = useScenarioStore()

const audioEngine = ref(null)
const shadowRecorder = ref(null)
const currentLineIndex = ref(-1)
const isDuetMode = ref(false)
const duetRecordings = ref([])
const currentSpeed = ref(1)
const isPlaybackComplete = ref(false)
const showApiKeyInput = ref(false)

const scenario = computed(() => store.currentScenario)
const dialogue = computed(() => scenario.value?.dialogue || [])
const audioUrl = computed(() => scenario.value?.audio_partner || '')
const ttsMode = computed(() => audioEngine.value?.ttsMode || 'auto')
const isGeneratingTTS = computed(() => audioEngine.value?.isGeneratingTTS || false)

const currentLine = computed(() => {
  if (currentLineIndex.value >= 0 && currentLineIndex.value < dialogue.value.length) {
    return dialogue.value[currentLineIndex.value]
  }
  return null
})

const isUserTurn = computed(() => {
  return currentLine.value?.role === 'user'
})

const progressText = computed(() => {
  const current = Math.max(0, currentLineIndex.value + 1)
  return `${current} / ${dialogue.value.length}`
})

const progressPercent = computed(() => {
  if (dialogue.value.length === 0) return 0
  return ((currentLineIndex.value + 1) / dialogue.value.length) * 100
})

onMounted(() => {
  if (!scenario.value) {
    router.push('/')
  }
})

function handleLineChange(index) {
  currentLineIndex.value = index
  isPlaybackComplete.value = false
}

function handlePlay() {
  isPlaybackComplete.value = false
}

function handleEnded() {
  isPlaybackComplete.value = true
  currentLineIndex.value = dialogue.value.length
}

function handleTogglePlay() {
  if (audioEngine.value) {
    audioEngine.value.togglePlay()
  }
}

function handleSpeedChange(speed) {
  currentSpeed.value = speed
  if (audioEngine.value) {
    audioEngine.value.setSpeed(speed)
  }
}

function handleRestart() {
  currentLineIndex.value = -1
  isDuetMode.value = false
  duetRecordings.value = []
  isPlaybackComplete.value = false
  if (audioEngine.value) {
    audioEngine.value.restart()
  }
  if (shadowRecorder.value) {
    shadowRecorder.value.clearRecording()
  }
}

function handleRecordingStart() {
  console.log('Recording started')
}

function handleRecordingStop() {
  if (shadowRecorder.value?.audioUrl) {
    duetRecordings.value.push({
      lineIndex: currentLineIndex.value,
      audioUrl: shadowRecorder.value.audioUrl
    })
  }
}

function handleReplayDuet() {
  if (duetRecordings.value.length === 0) return
  isDuetMode.value = true
  playDuetSequence(0)
}

async function playDuetSequence(index) {
  if (index >= dialogue.value.length) {
    isDuetMode.value = false
    return
  }

  const line = dialogue.value[index]
  currentLineIndex.value = index

  if (line.role === 'partner') {
    const duration = line.text_jp.length * 180
    await new Promise(resolve => setTimeout(resolve, duration))
    playDuetSequence(index + 1)
  } else {
    const recording = duetRecordings.value.find(r => r.lineIndex === index)
    if (recording) {
      const audio = new Audio(recording.audioUrl)
      audio.play()
      audio.onended = () => {
        playDuetSequence(index + 1)
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500))
      playDuetSequence(index + 1)
    }
  }
}

function handleLineClick(index) {
  currentLineIndex.value = index
}

function handleApiKeySave(key) {
  if (audioEngine.value) {
    audioEngine.value.setElevenLabsKey(key)
  }
  showApiKeyInput.value = false
}

function goBack() {
  store.clearScenario()
  router.push('/')
}
</script>

<template>
  <div v-if="scenario" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <button
        @click="goBack"
        class="flex items-center gap-2 text-gray-600 hover:text-vermilion transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        戻る
      </button>
      <div class="flex items-center gap-2">
        <button
          @click="showApiKeyInput = true"
          class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd" />
          </svg>
          TTS設定
        </button>
        <span class="text-sm text-gray-400">
          {{ dialogue.length }}行の会話
        </span>
      </div>
    </div>

    <!-- TTS Mode Indicator -->
    <div class="flex items-center gap-2 text-sm">
      <span class="text-gray-500">音声モード:</span>
      <span
        class="px-2 py-0.5 rounded-full text-xs font-medium"
        :class="{
          'bg-purple-100 text-purple-700': ttsMode === 'elevenlabs',
          'bg-blue-100 text-blue-700': ttsMode === 'webspeech',
          'bg-gray-100 text-gray-700': ttsMode === 'simulation'
        }"
      >
        {{ ttsMode === 'elevenlabs' ? 'ElevenLabs (高品質)' : ttsMode === 'webspeech' ? 'Web Speech' : 'シミュレーション' }}
      </span>
      <span v-if="isGeneratingTTS" class="flex items-center gap-1 text-ai-blue">
        <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        生成中...
      </span>
    </div>

    <!-- Main Content Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      <!-- Topic Header -->
      <div class="bg-gradient-to-r from-vermilion to-red-600 px-6 py-4">
        <h2 class="text-white font-medium text-lg">
          {{ scenario.topic || '練習シナリオ' }}
        </h2>
        <p class="text-red-100 text-sm mt-1">
          シャドウイング練習 - 音声に合わせて読みましょう
        </p>
      </div>

      <!-- Karaoke Script with Audio Engine -->
      <AudioEngine
        ref="audioEngine"
        :audio-url="audioUrl"
        :dialogue="dialogue"
        @line-change="handleLineChange"
        @play="handlePlay"
        @ended="handleEnded"
      >
        <template #default>
          <div class="p-6">
            <!-- Script Viewer -->
            <ScriptViewer
              :dialogue="dialogue"
              :current-line-index="currentLineIndex"
              :is-recording="shadowRecorder?.isRecording || false"
              @line-click="handleLineClick"
            />

            <!-- Shadow Recorder -->
            <ShadowRecorder
              ref="shadowRecorder"
              :is-active="isUserTurn"
              :current-line="currentLine"
              @recording-start="handleRecordingStart"
              @recording-stop="handleRecordingStop"
            />

            <!-- Progress Bar -->
            <div class="mt-6 pt-4 border-t border-gray-100">
              <div class="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>進行状況</span>
                <span>{{ progressText }}</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-vermilion transition-all duration-300 rounded-full"
                  :style="{ width: `${progressPercent}%` }"
                ></div>
              </div>
            </div>
          </div>
        </template>
      </AudioEngine>

      <!-- Playback Controls -->
      <div class="border-t border-gray-100 px-6 py-4 bg-gray-50">
        <PlaybackControls
          :is-playing="audioEngine?.isPlaying || false"
          :current-speed="currentSpeed"
          @toggle-play="handleTogglePlay"
          @speed-change="handleSpeedChange"
          @restart="handleRestart"
          @replay-duet="handleReplayDuet"
        />
      </div>
    </div>

    <!-- Completion Message -->
    <div
      v-if="isPlaybackComplete"
      class="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3"
    >
      <div class="text-4xl">🎉</div>
      <h3 class="text-lg font-medium text-green-800">
        お疲れ様でした！
      </h3>
      <p class="text-green-600">
        練習が完了しました。デュエット再生でもう一度練習できます。
      </p>
      <div class="flex items-center justify-center gap-3">
        <button
          @click="handleRestart"
          class="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
        >
          もう一度練習
        </button>
        <button
          @click="handleReplayDuet"
          :disabled="duetRecordings.length === 0"
          class="px-4 py-2 bg-ai-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          デュエット再生
        </button>
        <button
          @click="goBack"
          class="px-4 py-2 bg-vermilion text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          新しいトピック
        </button>
      </div>
    </div>

    <!-- Tips Section -->
    <div class="bg-blue-50 rounded-xl p-5 border border-blue-100">
      <h4 class="font-medium text-ai-blue mb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        シャドウイングのコツ
      </h4>
      <ul class="text-sm text-blue-700 space-y-1">
        <li>• 最初は0.5x速度で聞いて、徐々に速くしましょう</li>
        <li>• パートナーの声を真似して、リズムとイントネーションに集中</li>
        <li>• A-Bループで苦手な部分を繰り返し練習</li>
        <li>• 録音して自分の声を聞いてみましょう</li>
      </ul>
    </div>

    <!-- API Key Input Modal -->
    <ApiKeyInput
      :visible="showApiKeyInput"
      @save="handleApiKeySave"
      @close="showApiKeyInput = false"
    />
  </div>
</template>

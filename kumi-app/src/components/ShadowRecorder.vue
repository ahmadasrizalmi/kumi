<script setup>
import { ref, computed, watch } from 'vue'
import { useRecorder } from '../composables/useRecorder.js'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  currentLine: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['recording-start', 'recording-stop'])

const {
  isRecording,
  audioUrl,
  hasRecording,
  startRecording,
  stopRecording,
  clearRecording,
  playRecording
} = useRecorder()

const permissionError = ref(null)

watch(() => props.isActive, async (newVal) => {
  if (newVal && props.currentLine?.role === 'user') {
    await start()
  } else if (!newVal && isRecording.value) {
    stop()
  }
})

async function start() {
  permissionError.value = null
  try {
    await startRecording()
    emit('recording-start')
  } catch (error) {
    permissionError.value = error.message
  }
}

function stop() {
  stopRecording()
  emit('recording-stop')
}

function clear() {
  clearRecording()
}

defineExpose({
  isRecording,
  audioUrl,
  hasRecording,
  playRecording,
  clearRecording: clear
})
</script>

<template>
  <div v-if="isActive && currentLine?.role === 'user'" class="mt-4">
    <div class="bg-red-50 border-2 border-red-200 rounded-xl p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-3 h-3 rounded-full"
            :class="isRecording ? 'bg-red-500 recording-indicator' : 'bg-gray-300'"
          ></div>
          <div>
            <p class="font-medium text-sumi">
              {{ isRecording ? '録音中...' : 'あなたの番です' }}
            </p>
            <p class="text-sm text-gray-500">
              {{ isRecording ? '話してください' : '上のテキストを読んでください' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="hasRecording"
            @click="playRecording"
            class="px-3 py-1.5 bg-ai-blue text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            再生
          </button>
          <button
            v-if="hasRecording"
            @click="clear"
            class="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-300 transition-colors"
          >
            消去
          </button>
        </div>
      </div>

      <!-- Permission Error -->
      <p v-if="permissionError" class="mt-2 text-sm text-red-500">
        {{ permissionError }}
      </p>
    </div>
  </div>
</template>

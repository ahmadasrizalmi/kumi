<script setup>
import { ref } from 'vue'

const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  },
  currentSpeed: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['toggle-play', 'speed-change', 'replay-duet', 'restart'])

const speeds = [1, 0.75, 0.5]

function cycleSpeed() {
  const currentIndex = speeds.indexOf(props.currentSpeed)
  const nextIndex = (currentIndex + 1) % speeds.length
  emit('speed-change', speeds[nextIndex])
}
</script>

<template>
  <div class="flex items-center justify-center gap-3 py-4">
    <!-- Restart -->
    <button
      @click="$emit('restart')"
      class="p-2 rounded-full hover:bg-gray-100 transition-colors"
      title="最初から"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </button>

    <!-- Play/Pause -->
    <button
      @click="$emit('toggle-play')"
      class="w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
      :class="isPlaying ? 'bg-vermilion shadow-lg shadow-red-200' : 'bg-ai-blue shadow-lg shadow-blue-200'"
    >
      <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Speed Control -->
    <button
      @click="cycleSpeed"
      class="px-3 py-1.5 rounded-full border-2 border-gray-200 hover:border-ai-blue transition-colors text-sm font-medium"
      :class="currentSpeed < 1 ? 'text-ai-blue border-ai-blue' : 'text-gray-600'"
    >
      {{ currentSpeed }}x
    </button>

    <!-- Replay Duet -->
    <button
      @click="$emit('replay-duet')"
      class="p-2 rounded-full hover:bg-gray-100 transition-colors"
      title="デュエット再生"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  line: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isFinished: {
    type: Boolean,
    default: false
  },
  isRecording: {
    type: Boolean,
    default: false
  }
})

const lineClass = computed(() => ({
  'karaoke-line': true,
  'partner': props.line.role === 'partner',
  'user': props.line.role === 'user',
  'active': props.isActive,
  'finished': props.isFinished && !props.isActive
}))

const roleLabel = computed(() => {
  return props.line.role === 'partner' ? 'パートナー' : 'あなた'
})

const roleIcon = computed(() => {
  return props.line.role === 'partner' ? '🤖' : '👤'
})
</script>

<template>
  <div :class="lineClass">
    <!-- Role Badge -->
    <div class="flex items-center gap-2 mb-2">
      <span class="text-sm">{{ roleIcon }}</span>
      <span
        class="text-xs font-medium px-2 py-0.5 rounded-full"
        :class="line.role === 'partner' ? 'bg-blue-100 text-ai-blue' : 'bg-red-100 text-vermilion'"
      >
        {{ roleLabel }}
      </span>
      <span v-if="isRecording && isActive" class="flex items-center gap-1 text-xs text-red-500 recording-indicator">
        <span class="w-2 h-2 bg-red-500 rounded-full"></span>
        録音中
      </span>
    </div>

    <!-- Furigana -->
    <ruby v-if="line.furigana" class="jp-text text-2xl font-medium block mb-1">
      {{ line.text_jp }}
      <rt>{{ line.furigana }}</rt>
    </ruby>
    <span v-else class="jp-text text-2xl font-medium block mb-1">
      {{ line.text_jp }}
    </span>

    <!-- Romaji -->
    <p class="text-base text-gray-500 mt-1 font-light italic">
      {{ line.romaji }}
    </p>

    <!-- Translation -->
    <p class="text-sm text-gray-600 mt-1">
      {{ line.id }}
    </p>
  </div>
</template>

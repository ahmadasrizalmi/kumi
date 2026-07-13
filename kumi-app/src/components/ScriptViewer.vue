<script setup>
import { computed } from 'vue'
import KaraokeLine from './KaraokeLine.vue'

const props = defineProps({
  dialogue: {
    type: Array,
    required: true
  },
  currentLineIndex: {
    type: Number,
    default: -1
  },
  isRecording: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['line-click'])

const linesWithState = computed(() => {
  return props.dialogue.map((line, index) => ({
    ...line,
    index,
    isActive: index === props.currentLineIndex,
    isFinished: index < props.currentLineIndex
  }))
})
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="line in linesWithState"
      :key="line.index"
      @click="$emit('line-click', line.index)"
      class="cursor-pointer"
    >
      <KaraokeLine
        :line="line"
        :index="line.index"
        :is-active="line.isActive"
        :is-finished="line.isFinished"
        :is-recording="isRecording"
      />
    </div>
  </div>
</template>

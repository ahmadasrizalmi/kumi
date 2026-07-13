<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

const topic = ref('')
const isLoading = ref(false)

const presetTopics = [
  { label: 'レストラン', sublabel: 'Restoran', icon: '🍽️' },
  { label: '買い物', sublabel: 'Belanja', icon: '🛍️' },
  { label: '駅', sublabel: 'Stasiun', icon: '🚉' },
  { label: '病院', sublabel: 'Rumah Sakit', icon: '🏥' },
  { label: 'ホテル', sublabel: 'Hotel', icon: '🏨' },
  { label: '友達', sublabel: 'Teman', icon: '👋' }
]

function handleSubmit() {
  if (topic.value.trim()) {
    emit('submit', topic.value.trim())
  }
}

function selectPreset(preset) {
  topic.value = preset.label
  handleSubmit()
}

function onSubmit() {
  handleSubmit()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Main Input -->
    <form @submit.prevent="onSubmit" class="relative">
      <div class="flex gap-3">
        <div class="flex-1 relative">
          <input
            v-model="topic"
            type="text"
            placeholder="トピックを入力... (Contoh: ラーメンを注文)"
            maxlength="100"
            class="w-full px-4 py-3 pl-12 text-lg border-2 border-border rounded-xl focus:border-vermilion focus:outline-none transition-colors bg-white"
            :disabled="isLoading"
          />
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </span>
        </div>
        <button
          type="submit"
          :disabled="!topic.trim() || isLoading"
          class="px-6 py-3 bg-vermilion text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            生成中...
          </span>
          <span v-else class="flex items-center gap-2">
            生成する
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
            </svg>
          </span>
        </button>
      </div>
      <p class="text-xs text-gray-400 mt-2 ml-1">
        {{ topic.length }}/100 文字
      </p>
    </form>

    <!-- Preset Topics -->
    <div>
      <p class="text-sm text-gray-500 mb-3">人気のトピック:</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in presetTopics"
          :key="preset.label"
          @click="selectPreset(preset)"
          :disabled="isLoading"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full hover:border-vermilion hover:bg-red-50 transition-all disabled:opacity-50"
        >
          <span>{{ preset.icon }}</span>
          <span class="text-sm font-medium">{{ preset.label }}</span>
          <span class="text-xs text-gray-400">{{ preset.sublabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

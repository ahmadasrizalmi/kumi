<template>
  <div class="space-y-4">
    <!-- DeepSeek API Key -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        DeepSeek API Key
      </label>
      <div class="flex gap-2">
        <input
          v-model="deepseekKey"
          :type="showKey ? 'text' : 'password'"
          placeholder="sk-..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
        <button
          @click="showKey = !showKey"
          class="px-3 py-2 text-gray-500 hover:text-gray-700"
        >
          {{ showKey ? '🙈' : '👁️' }}
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-1">
        Untuk generate dialog via AI. 
        <a href="https://platform.deepseek.com" target="_blank" class="text-indigo-500 hover:underline">Dapatkan API Key</a>
      </p>
    </div>

    <!-- ElevenLabs API Key -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        ElevenLabs API Key (Opsional)
      </label>
      <div class="flex gap-2">
        <input
          v-model="elevenlabsKey"
          :type="showKey ? 'text' : 'password'"
          placeholder="sk_..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>
      <p class="text-xs text-gray-500 mt-1">
        Untuk TTS berkualitas tinggi. 
        <a href="https://elevenlabs.io" target="_blank" class="text-indigo-500 hover:underline">Dapatkan API Key</a>
      </p>
    </div>

    <!-- Save Button -->
    <button
      @click="saveKeys"
      class="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
    >
      💾 Simpan API Keys
    </button>

    <!-- Status -->
    <div v-if="saved" class="text-center text-sm text-green-600">
      ✅ API Keys tersimpan!
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDeepSeekApiKey, setDeepSeekApiKey, getElevenLabsApiKey, setElevenLabsApiKey } from '../services/apiService'

const deepseekKey = ref('')
const elevenlabsKey = ref('')
const showKey = ref(false)
const saved = ref(false)

onMounted(() => {
  deepseekKey.value = getDeepSeekApiKey()
  elevenlabsKey.value = getElevenLabsApiKey()
})

function saveKeys() {
  setDeepSeekApiKey(deepseekKey.value)
  setElevenLabsApiKey(elevenlabsKey.value)
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2000)
}
</script>

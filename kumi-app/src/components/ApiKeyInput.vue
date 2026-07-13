<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'close'])

const apiKey = ref('')
const showKey = ref(false)
const savedKey = ref('')

onMounted(() => {
  // Load saved API key from localStorage
  const saved = localStorage.getItem('elevenlabs_api_key')
  if (saved) {
    savedKey.value = saved
    apiKey.value = saved
  }
})

function saveKey() {
  const key = apiKey.value.trim()
  if (key) {
    localStorage.setItem('elevenlabs_api_key', key)
    savedKey.value = key
    emit('save', key)
  }
}

function clearKey() {
  localStorage.removeItem('elevenlabs_api_key')
  savedKey.value = ''
  apiKey.value = ''
  emit('save', '')
}

function close() {
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-sumi">TTS API設定</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-3">
        <p class="text-sm text-gray-500">
          より自然な音声のために、ElevenLabs APIキーを入力してください。
          <a href="https://elevenlabs.io" target="_blank" class="text-ai-blue hover:underline">
            elevenlabs.io
          </a>
          で無料アカウントを作成できます。
        </p>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">API Key</label>
          <div class="relative">
            <input
              v-model="apiKey"
              :type="showKey ? 'text' : 'password'"
              placeholder="sk_xxxxxxxxxxxxxxxx"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ai-blue focus:border-transparent pr-10"
            />
            <button
              @click="showKey = !showKey"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="!showKey" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="savedKey" class="flex items-center gap-2 text-sm text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          APIキーが保存されています
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="saveKey"
          class="flex-1 px-4 py-2 bg-ai-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          保存
        </button>
        <button
          v-if="savedKey"
          @click="clearKey"
          class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          削除
        </button>
      </div>

      <p class="text-xs text-gray-400">
        ※ APIキーはブラウザにのみ保存され、サーバーには送信されません
      </p>
    </div>
  </div>
</template>

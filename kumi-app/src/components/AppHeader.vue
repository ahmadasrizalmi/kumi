<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ApiKeyInput from './ApiKeyInput.vue'

const router = useRouter()
const showSettings = ref(false)

function goHome() {
  router.push('/')
}
</script>

<template>
  <header class="bg-white shadow-sm border-b border-border sticky top-0 z-50">
    <div class="container mx-auto px-4 py-3 max-w-4xl flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer" @click="goHome">
        <div class="w-10 h-10 bg-vermilion rounded-lg flex items-center justify-center">
          <span class="text-white text-xl font-bold">久</span>
        </div>
        <div>
          <h1 class="text-xl font-bold text-sumi">Kumi</h1>
          <p class="text-xs text-gray-500">日本語シャドイング練習</p>
        </div>
      </div>
      <nav class="flex items-center gap-4">
        <button
          @click="showSettings = !showSettings"
          class="text-sm text-gray-600 hover:text-vermilion transition-colors"
        >
          ⚙️ API Keys
        </button>
        <button
          @click="goHome"
          class="text-sm text-gray-600 hover:text-vermilion transition-colors"
        >
          ホーム
        </button>
      </nav>
    </div>
  </header>

  <!-- Settings Modal -->
  <div
    v-if="showSettings"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="showSettings = false"
  >
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-sumi">⚙️ API Settings</h2>
        <button
          @click="showSettings = false"
          class="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      <ApiKeyInput />
      <p class="text-xs text-gray-500 mt-4 text-center">
        API Keys disimpan di browser Anda saja.
      </p>
    </div>
  </div>
</template>

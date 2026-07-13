<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

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
          @click="goHome"
          class="text-sm text-gray-600 hover:text-vermilion transition-colors"
        >
          ホーム
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useScenarioStore } from '../stores/scenario.js'
import TopicForm from '../components/TopicForm.vue'

const router = useRouter()
const store = useScenarioStore()

async function handleTopicSubmit(topic) {
  await store.fetchScenario(topic)
  if (store.currentScenario) {
    router.push(`/practice/${store.currentScenario.scenario_id}`)
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <div class="text-center space-y-4 pt-8">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full text-vermilion text-sm font-medium">
        <span>🎌</span>
        <span>日本語を話そう</span>
      </div>
      <h2 class="text-4xl font-bold text-sumi">
        Kumiで<span class="text-vermilion">シャドウイング</span>練習
      </h2>
      <p class="text-gray-500 max-w-md mx-auto">
        トピックを入力して、AIが生成した会話で日本語の発音とリズムを練習しましょう
      </p>
    </div>

    <!-- Topic Form -->
    <div class="bg-white rounded-2xl shadow-sm border border-border p-6">
      <TopicForm
        :is-loading="store.isLoading"
        @submit="handleTopicSubmit"
      />
    </div>

    <!-- Error Message -->
    <div
      v-if="store.error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm"
    >
      {{ store.error }}
    </div>

    <!-- Features Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-5 border border-border">
        <div class="text-2xl mb-3">🎤</div>
        <h3 class="font-medium text-sumi mb-2">ダイナミックシナリオ</h3>
        <p class="text-sm text-gray-500">
          任意のトピックで会話を自動生成。毎回新しい練習ができます。
        </p>
      </div>
      <div class="bg-white rounded-xl p-5 border border-border">
        <div class="text-2xl mb-3">🎵</div>
        <h3 class="font-medium text-sumi mb-2">カラオケモード</h3>
        <p class="text-sm text-gray-500">
          テキストがハイライトされ、音声に合わせて読みやすいです。
        </p>
      </div>
      <div class="bg-white rounded-xl p-5 border border-border">
        <div class="text-2xl mb-3">🎙️</div>
        <h3 class="font-medium text-sumi mb-2">デュエット録音</h3>
        <p class="text-sm text-gray-500">
          自分の声を録音して、AIと交互に再生できます。
        </p>
      </div>
    </div>

    <!-- History Section -->
    <div v-if="store.history.length > 0" class="space-y-3">
      <h3 class="text-sm font-medium text-gray-500">最近の練習</h3>
      <div class="space-y-2">
        <div
          v-for="item in store.history"
          :key="item.id"
          class="bg-white rounded-lg p-3 border border-border flex items-center justify-between hover:border-vermilion transition-colors cursor-pointer"
        >
          <div>
            <p class="font-medium text-sumi">{{ item.topic }}</p>
            <p class="text-xs text-gray-400">
              {{ new Date(item.timestamp).toLocaleDateString('ja-JP') }}
              <span v-if="item.cached" class="ml-2 text-ai-blue">キャッシュ</span>
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

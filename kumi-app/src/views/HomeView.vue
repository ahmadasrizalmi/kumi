<template>
  <div class="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50">
    <!-- Floating Characters -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <!-- Mascot - bottom right, bouncy -->
      <div class="absolute bottom-4 right-4 md:bottom-8 md:right-8 mascot-bounce">
        <img 
          :src="mascotImage" 
          alt="Kumi Mascot" 
          class="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-lg transition-all duration-500"
          :class="{ 'mascot-excited': isExcited }"
        />
      </div>

      <!-- Sensei - top left, subtle float -->
      <div class="absolute top-20 left-4 md:top-24 md:left-8 sensei-float opacity-80">
        <img 
          src="/stickers/sensei-teach.png" 
          alt="Sensei" 
          class="w-16 h-16 md:w-20 md:h-20 object-contain"
        />
      </div>

      <!-- Student - bottom left, peek -->
      <div class="absolute bottom-4 left-4 md:bottom-8 md:left-8 student-peek opacity-70">
        <img 
          src="/stickers/student-study.png" 
          alt="Student" 
          class="w-16 h-16 md:w-20 md:h-20 object-contain"
        />
      </div>

      <!-- Floating particles -->
      <div v-for="i in 6" :key="i" class="particle" :style="particleStyle(i)" />
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <!-- Logo & Title -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4 transform rotate-3 hover:rotate-0 transition-transform">
          <span class="text-white text-3xl font-bold">久</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          Kumi
        </h1>
        <p class="text-lg text-gray-500">
          日本語シャドイング練習 🇯🇵
        </p>
        <p class="text-sm text-gray-400 mt-1">
          Latihan speaking Jepang jadi lebih seru!
        </p>
      </div>

      <!-- Main Input Card -->
      <div class="w-full max-w-lg animate-slide-up">
        <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <!-- Input Field -->
          <div class="relative mb-4">
            <input
              v-model="topic"
              @keyup.enter="generateWithAI"
              type="text"
              placeholder="Mau ngobrol tentang apa? 🎯"
              class="w-full px-5 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:bg-white focus:outline-none transition-all"
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <span class="text-sm">Enter ↵</span>
            </div>
          </div>

          <!-- Quick Topic Chips -->
          <div class="flex flex-wrap gap-2 mb-5">
            <button
              v-for="chip in quickTopics"
              :key="chip.topic"
              @click="topic = chip.topic"
              class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 rounded-full transition-all"
            >
              {{ chip.emoji }} {{ chip.label }}
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <!-- AI Generate Button -->
            <button
              @click="generateWithAI"
              :disabled="!topic.trim() || isGenerating"
              class="group relative px-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all overflow-hidden"
            >
              <div class="relative z-10 flex items-center justify-center gap-2">
                <span v-if="isGenerating" class="animate-spin">⏳</span>
                <span v-else>🤖</span>
                <span>{{ isGenerating ? 'Generating...' : 'AI Buatkan' }}</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <!-- User Input Button -->
            <button
              @click="showUserInput = true"
              class="group relative px-5 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all overflow-hidden"
            >
              <div class="relative z-10 flex items-center justify-center gap-2">
                <span>✍️</span>
                <span>Input Sendiri</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          <!-- Divider -->
          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-gray-200" />
            <span class="text-xs text-gray-400">atau</span>
            <div class="flex-1 h-px bg-gray-200" />
          </div>

          <!-- Video URL Input -->
          <div class="flex gap-2">
            <input
              v-model="videoUrl"
              type="text"
              placeholder="🔗 Paste URL video YouTube..."
              class="flex-1 px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition-all"
            />
            <button
              @click="extractFromVideo"
              :disabled="!videoUrl.trim()"
              class="px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-all"
            >
              📺
            </button>
          </div>
        </div>

        <!-- API Key Status -->
        <div class="mt-4 text-center">
          <button
            @click="showSettings = true"
            class="text-sm text-gray-400 hover:text-indigo-500 transition-colors"
          >
            ⚙️ API Settings
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm animate-shake">
        {{ error }}
      </div>
    </div>

    <!-- User Input Modal -->
    <Teleport to="body">
      <div
        v-if="showUserInput"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showUserInput = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          <h2 class="text-xl font-bold mb-4">✍️ Input Dialog Sendiri</h2>
          
          <!-- Tab Navigation -->
          <div class="flex gap-2 mb-4">
            <button
              @click="inputTab = 'text'"
              :class="inputTab === 'text' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            >
              📝 Ketik Dialog
            </button>
            <button
              @click="inputTab = 'url'"
              :class="inputTab === 'url' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            >
              🔗 Dari URL
            </button>
          </div>

          <!-- Text Input Tab -->
          <div v-if="inputTab === 'text'">
            <textarea
              v-model="customDialog"
              placeholder="Paste atau ketik dialog Jepang di sini...&#10;&#10;Contoh:&#10;A: こんにちは&#10;B: こんにちは、元気ですか？"
              rows="8"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none resize-none text-sm"
            />
            <button
              @click="processCustomDialog"
              :disabled="!customDialog.trim()"
              class="w-full mt-3 px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-all"
            >
              ✨ Proses Dialog
            </button>
          </div>

          <!-- URL Input Tab -->
          <div v-if="inputTab === 'url'">
            <input
              v-model="extractUrl"
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none text-sm"
            />
            <p class="text-xs text-gray-500 mt-2">
              Sistem akan extract dialog Jepang dari video/subtitle
            </p>
            <button
              @click="extractDialogFromUrl"
              :disabled="!extractUrl.trim()"
              class="w-full mt-3 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-all"
            >
              📺 Extract Dialog
            </button>
          </div>

          <button
            @click="showUserInput = false"
            class="w-full mt-3 px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            Batal
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Settings Modal -->
    <Teleport to="body">
      <div
        v-if="showSettings"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showSettings = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">⚙️ API Settings</h2>
            <button @click="showSettings = false" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <ApiKeyInput />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { generateScenario, getDeepSeekApiKey } from '../services/apiService'
import ApiKeyInput from '../components/ApiKeyInput.vue'

const router = useRouter()

// State
const topic = ref('')
const videoUrl = ref('')
const isGenerating = ref(false)
const isExcited = ref(false)
const error = ref('')
const showUserInput = ref(false)
const showSettings = ref(false)
const inputTab = ref('text')
const customDialog = ref('')
const extractUrl = ref('')

// Mascot state
const mascotState = ref('idle') // idle, thinking, happy, surprise
const mascotImage = computed(() => {
  const images = {
    idle: '/stickers/mascot-wave.png',
    thinking: '/stickers/mascot-think.png',
    happy: '/stickers/mascot-happy.png',
    surprise: '/stickers/mascot-surprise.png'
  }
  return images[mascotState.value] || images.idle
})

// Quick topics
const quickTopics = [
  { topic: 'レストランで注文', label: 'Restoran', emoji: '🍜' },
  { topic: '買い物', label: 'Belanja', emoji: '🛍️' },
  { topic: '駅で道を聞く', label: 'Stasiun', emoji: '🚉' },
  { topic: '病院で診察', label: 'Rumah Sakit', emoji: '🏥' },
  { topic: '友達と遊ぶ', label: 'Teman', emoji: '👋' }
]

// Particle styles
function particleStyle(index) {
  const positions = [
    { left: '10%', animationDelay: '0s', animationDuration: '6s' },
    { left: '20%', animationDelay: '1s', animationDuration: '8s' },
    { left: '40%', animationDelay: '2s', animationDuration: '7s' },
    { left: '60%', animationDelay: '0.5s', animationDuration: '9s' },
    { left: '75%', animationDelay: '1.5s', animationDuration: '6.5s' },
    { left: '90%', animationDelay: '2.5s', animationDuration: '7.5s' }
  ]
  return {
    ...positions[index - 1],
    animationDelay: positions[index - 1].animationDelay,
    animationDuration: positions[index - 1].animationDuration
  }
}

// Generate with AI
async function generateWithAI() {
  if (!topic.value.trim() || isGenerating.value) return

  const apiKey = getDeepSeekApiKey()
  if (!apiKey) {
    error.value = 'Silakan masukkan DeepSeek API Key di Settings ⚙️'
    showSettings.value = true
    return
  }

  isGenerating.value = true
  mascotState.value = 'thinking'
  error.value = ''

  try {
    const scenario = await generateScenario(topic.value)
    
    // Excited animation
    mascotState.value = 'happy'
    isExcited.value = true
    setTimeout(() => {
      isExcited.value = false
    }, 1000)

    // Navigate to practice
    setTimeout(() => {
      router.push({
        path: '/practice',
        query: { topic: topic.value, scenario: JSON.stringify(scenario) }
      })
    }, 500)
  } catch (e) {
    error.value = 'Gagal generate dialog. Coba lagi!'
    mascotState.value = 'surprise'
    setTimeout(() => {
      mascotState.value = 'idle'
    }, 2000)
  } finally {
    isGenerating.value = false
  }
}

// Process custom dialog
function processCustomDialog() {
  if (!customDialog.value.trim()) return

  // Parse dialog (simple format: "A: text" or "B: text")
  const lines = customDialog.value.split('\n').filter(l => l.trim())
  const dialogue = []

  for (const line of lines) {
    const match = line.match(/^([AB])[：:]\s*(.+)/)
    if (match) {
      dialogue.push({
        role: match[1] === 'A' ? 'partner' : 'user',
        text_jp: match[2].trim(),
        furigana: '',
        romaji: '',
        id: match[2].trim()
      })
    }
  }

  if (dialogue.length === 0) {
    error.value = 'Format dialog tidak valid. Gunakan format "A: text" atau "B: text"'
    return
  }

  const scenario = {
    success: true,
    scenario_id: Date.now(),
    cached: false,
    topic: 'Custom Dialog',
    dialogue: dialogue
  }

  showUserInput.value = false
  router.push({
    path: '/practice',
    query: { topic: 'Custom Dialog', scenario: JSON.stringify(scenario) }
  })
}

// Extract from video URL
function extractFromVideo() {
  // TODO: Implement video subtitle extraction
  error.value = 'Fitur extract video coming soon! 🎬'
}

// Extract dialog from URL
function extractDialogFromUrl() {
  // TODO: Implement URL extraction
  error.value = 'Fitur extract URL coming soon! 🔗'
}

// Check for saved API key on mount
onMounted(() => {
  const apiKey = getDeepSeekApiKey()
  if (!apiKey) {
    // Show hint after 2 seconds
    setTimeout(() => {
      if (!getDeepSeekApiKey()) {
        // Silent hint, don't force
      }
    }, 2000)
  }
})
</script>

<style scoped>
/* Mascot animations */
.mascot-bounce {
  animation: bounce 2s ease-in-out infinite;
}

.mascot-excited {
  animation: excited 0.5s ease-in-out;
}

.sensei-float {
  animation: float 4s ease-in-out infinite;
}

.student-peek {
  animation: peek 3s ease-in-out infinite;
}

/* Fade in animation */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Floating particles */
.particle {
  position: absolute;
  bottom: -20px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(236, 72, 153, 0.3));
  border-radius: 50%;
  animation: floatUp linear infinite;
}

/* Keyframes */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes excited {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-8px) rotate(3deg); }
}

@keyframes peek {
  0%, 100% { transform: translateX(0); opacity: 0.7; }
  50% { transform: translateX(5px); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes floatUp {
  0% {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  20% {
    opacity: 0.6;
    transform: translateY(-20vh) scale(1);
  }
  80% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}
</style>

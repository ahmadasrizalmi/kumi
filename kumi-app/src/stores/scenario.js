import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { generateScenario } from '../services/apiService.js'

export const useScenarioStore = defineStore('scenario', () => {
  const currentScenario = ref(null)
  const isLoading = ref(false)
  const isAudioLoading = ref(false)
  const error = ref(null)
  const history = ref([])

  const dialogue = computed(() => currentScenario.value?.dialogue || [])
  const audioUrl = computed(() => currentScenario.value?.audio_partner || '')

  // Watch for audio URL changes
  watch(audioUrl, (newUrl) => {
    if (newUrl) {
      isAudioLoading.value = false
    }
  })

  async function fetchScenario(topic) {
    isLoading.value = true
    isAudioLoading.value = true
    error.value = null

    try {
      const data = await generateScenario(topic)
      if (data.success) {
        currentScenario.value = data
        // Add to history
        history.value.unshift({
          id: data.scenario_id,
          topic,
          timestamp: new Date().toISOString(),
          cached: data.cached
        })
        // Keep only last 20 items
        if (history.value.length > 20) {
          history.value = history.value.slice(0, 20)
        }
        // If audio is already available, set loading to false
        if (data.audio_partner) {
          isAudioLoading.value = false
        }
      } else {
        error.value = data.message || 'Gagal membuat skenario'
        isAudioLoading.value = false
      }
    } catch (err) {
      error.value = err.message || 'Terjadi kesalahan'
      isAudioLoading.value = false
    } finally {
      isLoading.value = false
    }
  }

  function clearScenario() {
    currentScenario.value = null
    error.value = null
    isAudioLoading.value = false
  }

  return {
    currentScenario,
    isLoading,
    isAudioLoading,
    error,
    history,
    dialogue,
    audioUrl,
    fetchScenario,
    clearScenario
  }
})

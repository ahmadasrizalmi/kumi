import { ref, onUnmounted } from 'vue'

export function useRecorder() {
  const isRecording = ref(false)
  const audioBlob = ref(null)
  const audioUrl = ref('')
  const mediaRecorder = ref(null)
  const recordedChunks = ref([])
  const hasRecording = ref(false)

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.value = new MediaRecorder(stream, {
        mimeType: getSupportedMimeType()
      })

      recordedChunks.value = []

      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.value.push(event.data)
        }
      }

      mediaRecorder.value.onstop = () => {
        const mimeType = mediaRecorder.value.mimeType
        audioBlob.value = new Blob(recordedChunks.value, { type: mimeType })
        audioUrl.value = URL.createObjectURL(audioBlob.value)
        hasRecording.value = true

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.value.start()
      isRecording.value = true
    } catch (error) {
      console.error('Error starting recording:', error)
      throw new Error('Tidak dapat mengakses mikrofon. Pastikan izin mikrofon diberikan.')
    }
  }

  function stopRecording() {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop()
      isRecording.value = false
    }
  }

  function getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'audio/webm' // fallback
  }

  function clearRecording() {
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
    }
    audioBlob.value = null
    audioUrl.value = ''
    hasRecording.value = false
    recordedChunks.value = []
  }

  function playRecording() {
    if (audioUrl.value) {
      const audio = new Audio(audioUrl.value)
      audio.play()
    }
  }

  onUnmounted(() => {
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
    }
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop()
    }
  })

  return {
    isRecording,
    audioBlob,
    audioUrl,
    hasRecording,
    startRecording,
    stopRecording,
    clearRecording,
    playRecording
  }
}

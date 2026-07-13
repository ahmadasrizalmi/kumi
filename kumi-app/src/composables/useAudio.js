import { ref, onUnmounted } from 'vue'

export function useAudio() {
  const audioElement = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const playbackRate = ref(1)
  const currentLineIndex = ref(-1)

  let animationFrame = null

  function initAudio(url) {
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value.src = ''
    }

    audioElement.value = new Audio(url)
    audioElement.value.playbackRate = playbackRate.value

    audioElement.value.addEventListener('loadedmetadata', () => {
      duration.value = audioElement.value.duration
    })

    audioElement.value.addEventListener('ended', () => {
      isPlaying.value = false
      currentLineIndex.value = -1
      cancelAnimationFrame(animationFrame)
    })

    audioElement.value.addEventListener('timeupdate', () => {
      currentTime.value = audioElement.value.currentTime
    })
  }

  function play() {
    if (audioElement.value) {
      audioElement.value.play()
      isPlaying.value = true
      updateTime()
    }
  }

  function pause() {
    if (audioElement.value) {
      audioElement.value.pause()
      isPlaying.value = false
      cancelAnimationFrame(animationFrame)
    }
  }

  function togglePlay() {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  function seekTo(time) {
    if (audioElement.value) {
      audioElement.value.currentTime = time
      currentTime.value = time
    }
  }

  function setSpeed(rate) {
    playbackRate.value = rate
    if (audioElement.value) {
      audioElement.value.playbackRate = rate
    }
  }

  function setLineIndex(index) {
    currentLineIndex.value = index
  }

  function updateTime() {
    if (audioElement.value && isPlaying.value) {
      currentTime.value = audioElement.value.currentTime
      animationFrame = requestAnimationFrame(updateTime)
    }
  }

  function playLine(lineStartTime, lineEndTime) {
    if (audioElement.value) {
      audioElement.value.currentTime = lineStartTime
      audioElement.value.play()
      isPlaying.value = true

      // Stop at line end
      const checkEnd = () => {
        if (audioElement.value.currentTime >= lineEndTime) {
          pause()
          audioElement.value.removeEventListener('timeupdate', checkEnd)
        }
      }
      audioElement.value.addEventListener('timeupdate', checkEnd)
    }
  }

  onUnmounted(() => {
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value.src = ''
    }
    cancelAnimationFrame(animationFrame)
  })

  return {
    audioElement,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    currentLineIndex,
    initAudio,
    play,
    pause,
    togglePlay,
    seekTo,
    setSpeed,
    setLineIndex,
    playLine
  }
}

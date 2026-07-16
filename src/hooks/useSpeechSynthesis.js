import { useCallback, useEffect, useRef, useState } from 'react'

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState([])
  const [speakingId, setSpeakingId] = useState(null)
  const [paused, setPaused] = useState(false)
  const utteranceRef = useRef(null)

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return undefined

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices())
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    // Some browsers return an empty list on the first call and never fire
    // `voiceschanged` if the voices were already cached — retry once shortly after.
    const retryTimer = setTimeout(loadVoices, 500)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      clearTimeout(retryTimer)
    }
  }, [supported])

  const speak = useCallback(
    (id, text, { voice, rate = 1, lang } = {}) => {
      if (!supported || !text) return
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      if (voice) utterance.voice = voice
      if (lang) utterance.lang = lang
      utterance.rate = rate
      utterance.onend = () => {
        setSpeakingId(null)
        setPaused(false)
      }
      utterance.onerror = () => {
        setSpeakingId(null)
        setPaused(false)
      }

      utteranceRef.current = utterance
      setSpeakingId(id)
      setPaused(false)
      window.speechSynthesis.speak(utterance)
    },
    [supported]
  )

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause()
    setPaused(true)
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
    setPaused(false)
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeakingId(null)
    setPaused(false)
  }, [supported])

  useEffect(
    () => () => {
      if (supported) window.speechSynthesis.cancel()
    },
    [supported]
  )

  return { supported, voices, speakingId, paused, speak, pause, resume, stop }
}

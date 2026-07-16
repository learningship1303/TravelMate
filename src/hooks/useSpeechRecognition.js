import { useCallback, useEffect, useRef, useState } from 'react'

const SpeechRecognitionImpl =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

export function useSpeechRecognition({ onResult, onError } = {}) {
  const [listening, setListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onResultRef.current = onResult
    onErrorRef.current = onError
  }, [onResult, onError])

  const supported = Boolean(SpeechRecognitionImpl)

  const start = useCallback(
    (lang = 'en-US') => {
      if (!supported) return
      const recognition = new SpeechRecognitionImpl()
      recognition.lang = lang
      recognition.interimResults = true
      recognition.continuous = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => setListening(true)
      recognition.onresult = (event) => {
        let finalText = ''
        let interimText = ''
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i]
          if (result.isFinal) {
            finalText += result[0].transcript
          } else {
            interimText += result[0].transcript
          }
        }
        if (interimText) setInterimTranscript(interimText)
        if (finalText) {
          setInterimTranscript('')
          onResultRef.current?.(finalText.trim())
        }
      }
      recognition.onerror = (event) => {
        onErrorRef.current?.(event.error)
        setListening(false)
      }
      recognition.onend = () => {
        setListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    },
    [supported]
  )

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  return { supported, listening, interimTranscript, start, stop }
}

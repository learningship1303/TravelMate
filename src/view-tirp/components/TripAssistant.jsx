import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Check, Copy, Mic, Pause, Play, Send, Square, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createAssistantSession } from '@/service/AIModal'
import { updateTrip } from '@/service/tripStorage'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

const LANGUAGES = [
  { label: 'English', code: 'en-US' },
  { label: 'German', code: 'de-DE' },
  { label: 'French', code: 'fr-FR' },
  { label: 'Spanish', code: 'es-ES' },
  { label: 'Italian', code: 'it-IT' },
  { label: 'Portuguese', code: 'pt-PT' },
  { label: 'Hindi', code: 'hi-IN' },
  { label: 'Tamil', code: 'ta-IN' },
  { label: 'Telugu', code: 'te-IN' },
  { label: 'Malayalam', code: 'ml-IN' },
  { label: 'Kannada', code: 'kn-IN' },
  { label: 'Marathi', code: 'mr-IN' },
  { label: 'Japanese', code: 'ja-JP' },
  { label: 'Korean', code: 'ko-KR' },
  { label: 'Chinese', code: 'zh-CN' },
]

const STARTER_PROMPTS = [
  { label: 'Trip Summary', prompt: 'Give me a concise summary of this whole trip.' },
  {
    label: 'Packing List',
    prompt: 'Create a practical packing checklist grouped by essentials, clothing, documents, health, and tech.',
  },
  { label: 'Travel Blog', prompt: 'Write a short, polished travel blog draft based on this itinerary.' },
  { label: 'Social Caption', prompt: 'Write three engaging social media captions for this trip.' },
  {
    label: 'Ops Checklist',
    prompt: 'Create an operational checklist for bookings, documents, transport, budget, and daily tasks.',
  },
]

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

function TripAssistant({ trip }) {
  const [messages, setMessages] = useState(trip?.assistant?.messages || [])
  const [language, setLanguage] = useState(trip?.assistant?.language || LANGUAGES[0].code)
  const [voiceOverride, setVoiceOverride] = useState('')
  const [rate, setRate] = useState(() => Number(localStorage.getItem('tm_tts_rate')) || 1)
  const [autoSpeak, setAutoSpeak] = useState(() => localStorage.getItem('tm_tts_autospeak') === 'true')
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [copiedId, setCopiedId] = useState('')

  const sessionRef = useRef(null)
  const sessionTripIdRef = useRef(null)
  const activeLanguageRef = useRef(language)
  const listRef = useRef(null)

  const currentLanguageMeta = LANGUAGES.find((entry) => entry.code === language) || LANGUAGES[0]

  const { supported: ttsSupported, voices, speakingId, paused, speak, pause, resume, stop } = useSpeechSynthesis()

  const voicesForLanguage = useMemo(() => {
    const prefix = language.split('-')[0]
    return voices.filter((voice) => voice.lang?.toLowerCase().startsWith(prefix))
  }, [voices, language])

  const speakMessage = (id, text) => {
    const chosen = voicesForLanguage.find((voice) => voice.voiceURI === voiceOverride) || voicesForLanguage[0] || null
    // Some browsers ignore an explicit `voice` if `lang` doesn't match it exactly,
    // silently falling back to their own default voice for that lang — so once a
    // specific voice is chosen, drive `lang` from the voice itself, not the UI language.
    speak(id, text, { voice: chosen, rate, lang: chosen?.lang || currentLanguageMeta.code })
  }

  const { supported: sttSupported, listening, interimTranscript, start: startListening, stop: stopListening } =
    useSpeechRecognition({
      onResult: (text) => {
        setInput('')
        sendMessage(text, { fromVoice: true })
      },
      onError: (err) => {
        if (err !== 'no-speech' && err !== 'aborted') {
          toast(`Voice input error: ${err}`)
        }
      },
    })

  useEffect(() => {
    setVoiceOverride('')
  }, [language])

  useEffect(() => {
    localStorage.setItem('tm_tts_rate', String(rate))
  }, [rate])

  useEffect(() => {
    localStorage.setItem('tm_tts_autospeak', String(autoSpeak))
  }, [autoSpeak])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, streamingText])

  useEffect(() => {
    if (!trip?.id) return
    if (sessionTripIdRef.current === trip.id && sessionRef.current) return
    sessionRef.current = createAssistantSession(trip, trip?.assistant?.messages || [], currentLanguageMeta.label)
    sessionTripIdRef.current = trip.id
    activeLanguageRef.current = language
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id])

  const persist = (nextMessages, nextLanguage) => {
    if (!trip?.id) return
    updateTrip(trip.id, (current) => ({
      assistant: { ...current.assistant, messages: nextMessages, language: nextLanguage },
    }))
  }

  const sendMessage = async (rawText, { fromVoice = false } = {}) => {
    const text = rawText.trim()
    if (!text || !trip?.tripData || !sessionRef.current || isStreaming) return

    setInput('')
    const userMessage = { id: createId(), role: 'user', text, fromVoice, timestamp: Date.now() }
    const withUserMessage = [...messages, userMessage]
    setMessages(withUserMessage)
    persist(withUserMessage, language)

    let outgoingText = text
    if (language !== activeLanguageRef.current) {
      outgoingText = `${text}\n\n(Please respond in ${currentLanguageMeta.label} from now on.)`
      activeLanguageRef.current = language
    }

    setIsStreaming(true)
    setStreamingText('')
    try {
      const result = await sessionRef.current.sendMessageStream(outgoingText)
      let full = ''
      for await (const chunk of result.stream) {
        full += chunk.text()
        setStreamingText(full)
      }
      const cleaned = full.replace(/[*#`]/g, '').trim()
      const assistantMessage = { id: createId(), role: 'model', text: cleaned, timestamp: Date.now() }
      const finalMessages = [...withUserMessage, assistantMessage]
      setMessages(finalMessages)
      persist(finalMessages, language)

      if (ttsSupported && (fromVoice || autoSpeak)) {
        speakMessage(assistantMessage.id, cleaned)
      }
    } catch (err) {
      console.error(err)
      toast(err.message || 'Unable to reach the assistant right now')
    } finally {
      setIsStreaming(false)
      setStreamingText('')
    }
  }

  const handleMicClick = () => {
    if (!sttSupported) {
      toast("Voice input isn't supported in this browser. Try Chrome or Edge.")
      return
    }
    if (listening) {
      stopListening()
    } else {
      startListening(currentLanguageMeta.code)
    }
  }

  const copyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message.text)
      setCopiedId(message.id)
      setTimeout(() => setCopiedId(''), 2000)
    } catch (err) {
      console.error(err)
      toast('Unable to copy to clipboard')
    }
  }

  return (
    <div className="border-border bg-card shadow-soft rounded-2xl border p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Trip Assistant</h2>
          <p className="text-muted-foreground text-sm">Ask follow-up questions, get suggestions, and hear replies aloud.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="bg-background rounded-full border px-3 py-2 text-sm"
            aria-label="Assistant language"
          >
            {LANGUAGES.map((entry) => (
              <option value={entry.code} key={entry.code}>
                {entry.label}
              </option>
            ))}
          </select>
          {ttsSupported && voicesForLanguage.length > 0 && (
            <select
              value={voiceOverride}
              onChange={(event) => setVoiceOverride(event.target.value)}
              className="bg-background rounded-full border px-3 py-2 text-sm"
              aria-label="Voice"
            >
              <option value="">Default voice</option>
              {voicesForLanguage.map((voice) => (
                <option value={voice.voiceURI} key={voice.voiceURI}>
                  {voice.name}
                </option>
              ))}
            </select>
          )}
          {ttsSupported && (
            <label className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex">
              Speed
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(event) => setRate(Number(event.target.value))}
                className="w-16"
              />
              <span className="w-7">{rate.toFixed(1)}x</span>
            </label>
          )}
          {ttsSupported && (
            <label className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(event) => setAutoSpeak(event.target.checked)}
              />
              Speak replies
            </label>
          )}
        </div>
      </div>

      <div ref={listRef} className="mt-4 max-h-[420px] min-h-[160px] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-wrap gap-2 py-2">
            {STARTER_PROMPTS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                onClick={() => sendMessage(starter.prompt)}
                className="focus-ring border-border hover:border-primary/50 hover:bg-accent/5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
              >
                {starter.label}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted/60 rounded-bl-sm'
                }`}
              >
                {message.text}
                {message.role === 'model' && (
                  <div className="mt-2 flex items-center gap-2 opacity-80">
                    {ttsSupported && (
                      <>
                        {speakingId === message.id && !paused ? (
                          <button type="button" onClick={pause} aria-label="Pause" className="focus-ring rounded hover:opacity-100">
                            <Pause className="size-3.5" />
                          </button>
                        ) : speakingId === message.id && paused ? (
                          <button type="button" onClick={resume} aria-label="Resume" className="focus-ring rounded hover:opacity-100">
                            <Play className="size-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => speakMessage(message.id, message.text)}
                            aria-label="Listen"
                            className="focus-ring rounded hover:opacity-100"
                          >
                            <Volume2 className="size-3.5" />
                          </button>
                        )}
                        {speakingId === message.id && (
                          <button type="button" onClick={stop} aria-label="Stop" className="focus-ring rounded hover:opacity-100">
                            <Square className="size-3.5" />
                          </button>
                        )}
                      </>
                    )}
                    <button type="button" onClick={() => copyMessage(message)} aria-label="Copy" className="focus-ring rounded hover:opacity-100">
                      {copiedId === message.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-muted/60 max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap">
              {streamingText || (
                <span className="inline-flex gap-1">
                  <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
                  <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
                  <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <button
          type="button"
          onClick={handleMicClick}
          aria-label={listening ? 'Stop listening' : 'Start voice input'}
          className={`focus-ring flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
            listening ? 'bg-destructive border-destructive text-white' : 'border-border hover:border-primary/50'
          } ${!sttSupported ? 'opacity-50' : ''}`}
        >
          <Mic className="size-4" />
        </button>
        <input
          type="text"
          value={listening && interimTranscript ? interimTranscript : input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              sendMessage(input)
            }
          }}
          placeholder={listening ? 'Listening…' : 'Ask about this trip…'}
          disabled={listening}
          className="border-input bg-background h-10 flex-1 rounded-full border px-4 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <Button
          size="icon"
          aria-label="Send message"
          className="size-10 shrink-0 rounded-full"
          disabled={isStreaming || !input.trim()}
          onClick={() => sendMessage(input)}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export default TripAssistant

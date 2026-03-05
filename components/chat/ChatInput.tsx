'use client'

import { useRef, useState } from 'react'

interface ChatInputProps {
  onSendText: (text: string) => Promise<void>
  onSendImage: (file: File, caption?: string) => Promise<void>
  onSendVoice: (blob: Blob) => Promise<void>
  disabled?: boolean
}

type InputMode = 'text' | 'recording'

export default function ChatInput({ onSendText, onSendImage, onSendVoice, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<InputMode>('text')
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ── SEND TEXT ─────────────────────────────────────────────
  const handleSendText = async () => {
    const t = text.trim()
    if ((!t && !imagePreview) || sending) return
    setSending(true)
    try {
      if (imagePreview) {
        await onSendImage(imagePreview.file, t || undefined)
        setImagePreview(null)
        setText('')
      } else {
        await onSendText(t)
        setText('')
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  // ── IMAGE FROM FILE ────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Hanya file gambar yang didukung'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran gambar maksimal 5MB'); return }
    const url = URL.createObjectURL(file)
    setImagePreview({ file, url })
    e.target.value = ''
  }

  // Kamera: pakai native capture (mobile) atau webcam (desktop)
  const openCamera = async () => {
    // Mobile: native camera
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    if (isMobile) {
      cameraInputRef.current?.click()
      return
    }
    // Desktop: getUserMedia webcam
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setCameraStream(stream)
      setShowCamera(true)
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      }, 100)
    } catch {
      // Fallback ke file input
      cameraInputRef.current?.click()
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImagePreview({ file, url })
    e.target.value = ''
  }

  const captureFromWebcam = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      setImagePreview({ file, url })
      closeCamera()
    }, 'image/jpeg', 0.9)
  }

  const closeCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop())
    setCameraStream(null)
    setShowCamera(false)
  }

  // ── VOICE RECORDING ───────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      audioChunksRef.current = []

      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setSending(true)
        try { await onSendVoice(blob) } finally { setSending(false) }
        setRecordSeconds(0)
      }

      mr.start()
      setRecording(true)
      setMode('recording')
      setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000)
    } catch {
      alert('Tidak dapat mengakses mikrofon')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
    setMode('text')
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.ondataavailable = null
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop())
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
    setMode('text')
    setRecordSeconds(0)
  }

  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col gap-2">
      {/* Image preview */}
      {imagePreview && (
        <div className="flex items-end gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl mx-0">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview.url} alt="preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-xs text-blue-700">
            <p className="font-medium">📎 Gambar terpilih</p>
            <p className="text-blue-400">{imagePreview.file.name}</p>
          </div>
          <button
            onClick={() => { setImagePreview(null); URL.revokeObjectURL(imagePreview.url) }}
            className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-xs flex items-center justify-center"
          >✕</button>
        </div>
      )}

      {/* Camera overlay */}
      {showCamera && (
        <div className="relative bg-black rounded-xl overflow-hidden">
          <video ref={videoRef} className="w-full max-h-48 object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-4">
            <button onClick={closeCamera} className="px-4 py-2 bg-black/60 text-white rounded-xl text-xs">Batal</button>
            <button onClick={captureFromWebcam} className="px-4 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold">📸 Ambil Foto</button>
          </div>
        </div>
      )}

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} />

      {/* Main input row */}
      <div className="flex items-end gap-2">

        {/* Action buttons (left) */}
        {mode === 'text' && !recording && (
          <div className="flex gap-1 shrink-0">
            {/* Galeri */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || sending}
              title="Kirim gambar dari galeri"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Kamera */}
            <button
              onClick={openCamera}
              disabled={disabled || sending}
              title="Ambil foto dengan kamera"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        )}

        {/* Recording indicator */}
        {recording && (
          <div className="flex items-center gap-2 flex-1 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shrink-0" />
            <span className="text-sm font-medium text-red-600">Merekam</span>
            <span className="text-sm text-red-500 font-mono">{fmtTime(recordSeconds)}</span>
            <button onClick={cancelRecording} className="ml-auto text-xs text-gray-500 hover:text-gray-700">Batal</button>
          </div>
        )}

        {/* Text input */}
        {!recording && (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imagePreview ? 'Tambahkan keterangan... (opsional)' : 'Ketik pesan...'}
            rows={1}
            disabled={disabled || sending}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 max-h-28 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
        )}

        {/* Right buttons */}
        <div className="flex gap-1 shrink-0">
          {/* Voice note button */}
          {!imagePreview && (
            recording ? (
              <button
                onClick={stopRecording}
                title="Kirim voice note"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={disabled || sending || !!text.trim()}
                title="Rekam voice note"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-30"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )
          )}

          {/* Send button */}
          {!recording && (
            <button
              onClick={handleSendText}
              disabled={disabled || sending || (!text.trim() && !imagePreview)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-40"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
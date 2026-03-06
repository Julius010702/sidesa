'use client'

import { useRef, useState } from 'react'

interface ChatInputProps {
  onSendText: (text: string) => Promise<void>
  onSendImage: (file: File, caption?: string) => Promise<void>
  onSendVoice: (blob: Blob) => Promise<void>
  disabled?: boolean
}

export default function ChatInput({ onSendText, onSendImage, onSendVoice, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [showCameraChoice, setShowCameraChoice] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)   // capture="camera" → kamera native
  const galleryInputRef = useRef<HTMLInputElement>(null)  // tanpa capture → galeri
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleSend = async () => {
    if (sending) return
    setUploadError(null)

    if (imagePreview) {
      setSending(true)
      try {
        await onSendImage(imagePreview.file, text.trim() || undefined)
        setImagePreview(null)
        setText('')
      } catch (e: unknown) {
        setUploadError(e instanceof Error ? e.message : 'Gagal mengirim gambar')
      } finally {
        setSending(false)
      }
      return
    }

    const t = text.trim()
    if (!t) return
    setSending(true)
    try {
      await onSendText(t)
      setText('')
    } catch {
      setUploadError('Gagal mengirim pesan')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Hanya file gambar yang didukung'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran gambar maksimal 5MB'); return }
    const url = URL.createObjectURL(file)
    setImagePreview({ file, url })
    e.target.value = ''
  }

  const openCamera = async () => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (isMobile) {
      setShowCameraChoice(true)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      setCameraStream(stream)
      setShowCamera(true)
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      }, 100)
    } catch {
      fileInputRef.current?.click()
    }
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
      setImagePreview({ file, url: URL.createObjectURL(blob) })
      closeWebcam()
    }, 'image/jpeg', 0.9)
  }

  const closeWebcam = () => {
    cameraStream?.getTracks().forEach(t => t.stop())
    setCameraStream(null)
    setShowCamera(false)
  }

  const startRecording = async () => {
    setUploadError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
      const supportedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || ''
      const mr = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : undefined)
      mediaRecorderRef.current = mr
      audioChunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' })
        if (blob.size === 0) { setUploadError('Rekaman kosong, coba lagi'); setRecording(false); setRecordSeconds(0); return }
        setSending(true)
        try { await onSendVoice(blob) }
        catch (e: unknown) { setUploadError(e instanceof Error ? e.message : 'Gagal mengirim voice note') }
        finally { setSending(false); setRecordSeconds(0) }
      }
      mr.start(250)
      setRecording(true)
      setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000)
    } catch {
      alert('Tidak dapat mengakses mikrofon. Pastikan izin mikrofon diberikan.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
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
    setRecordSeconds(0)
  }

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const canSend = !sending && (!!text.trim() || !!imagePreview)

  return (
    <div className="flex flex-col gap-2 w-full">

      {/* ── Popup pilihan: Ambil Foto / Pilih Galeri ── */}
      {showCameraChoice && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowCameraChoice(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-2xl p-4 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-gray-700 text-center mb-4">Pilih Sumber Gambar</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCameraChoice(false); cameraInputRef.current?.click() }}
                className="flex-1 flex flex-col items-center gap-2 py-5 bg-blue-50 rounded-2xl text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-semibold">Ambil Foto</span>
              </button>
              <button
                onClick={() => { setShowCameraChoice(false); galleryInputRef.current?.click() }}
                className="flex-1 flex flex-col items-center gap-2 py-5 bg-gray-50 rounded-2xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold">Pilih Galeri</span>
              </button>
            </div>
            <button
              onClick={() => setShowCameraChoice(false)}
              className="w-full mt-4 py-2.5 text-sm text-gray-400 hover:text-gray-600"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {uploadError && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          <span>⚠️</span>
          <span className="flex-1">{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview.url} alt="preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 text-xs text-blue-700">
            <p className="font-medium">📎 Gambar terpilih</p>
            <p className="text-blue-400 truncate">{imagePreview.file.name}</p>
          </div>
          <button
            onClick={() => { setImagePreview(null); URL.revokeObjectURL(imagePreview.url) }}
            className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-xs flex items-center justify-center shrink-0"
          >✕</button>
        </div>
      )}

      {/* Webcam overlay (desktop only) */}
      {showCamera && (
        <div className="relative bg-black rounded-xl overflow-hidden">
          <video ref={videoRef} className="w-full max-h-40 object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3">
            <button onClick={closeWebcam} className="px-3 py-1.5 bg-black/60 text-white rounded-xl text-xs">Batal</button>
            <button onClick={captureFromWebcam} className="px-3 py-1.5 bg-white text-gray-900 rounded-xl text-xs font-bold">📸 Ambil</button>
          </div>
        </div>
      )}

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {/* Tanpa capture — iOS akan munculkan dialog native: Take Photo / Photo Library */}
      <input ref={cameraInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Main input row */}
      <div className="flex items-end gap-1.5 w-full">
        {!recording && (
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || sending || recording}
              title="Kirim gambar"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={openCamera}
              disabled={disabled || sending || recording}
              title="Kamera"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        )}

        {recording && (
          <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-red-50 border border-red-200 rounded-xl min-w-0">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
            <span className="text-xs font-medium text-red-600 shrink-0">Merekam</span>
            <span className="text-xs text-red-500 font-mono">{fmtTime(recordSeconds)}</span>
            <button onClick={cancelRecording} className="ml-auto text-xs text-gray-500 hover:text-gray-700 shrink-0">Batal</button>
          </div>
        )}

        {!recording && (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imagePreview ? 'Keterangan (opsional)...' : 'Ketik pesan...'}
            rows={1}
            disabled={disabled || sending}
            className="flex-1 min-w-0 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 overflow-y-auto"
            style={{ maxHeight: '80px', lineHeight: '1.4' }}
          />
        )}

        <div className="flex gap-1 shrink-0">
          {!imagePreview && (
            recording ? (
              <button onClick={stopRecording} title="Kirim voice note"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button onClick={startRecording}
                disabled={disabled || sending || !!text.trim() || !!imagePreview}
                title="Rekam voice note"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )
          )}

          {!recording && (
            <button onClick={handleSend} disabled={!canSend}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-40">
              {sending ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
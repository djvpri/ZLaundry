'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type LoginMode = 'password' | 'face'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [faceStatus, setFaceStatus] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)
    if (res?.error) {
      setError('Email atau password salah')
    } else {
      router.push('/dashboard')
    }
  }

  const handleFaceLogin = async () => {
    setLoading(true)
    setError('')
    setFaceStatus('Mengaktifkan kamera...')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }

      await new Promise(r => setTimeout(r, 1500))
      setFaceStatus('Mendeteksi wajah...')
      await new Promise(r => setTimeout(r, 1500))

      const video = videoRef.current!
      const canvas = canvasRef.current!
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')!.drawImage(video, 0, 0)

      const blob = await new Promise<Blob>(r => {
        canvas.toBlob(b => r(b!), 'image/jpeg', 0.8)
      })

      stopCamera()
      setFaceStatus('Memverifikasi wajah...')

      const formData = new FormData()
      formData.append('file', blob, 'face.jpg')

      let zfaceData: any = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 30000)
          const res = await fetch('/api/auth/face-login', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          })
          clearTimeout(timeout)
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}))
            throw new Error(errData.detail || errData.error || 'Wajah tidak terdaftar')
          }
          zfaceData = await res.json()
          break
        } catch (err: any) {
          if (attempt < 3) {
            setFaceStatus(`Mencoba ulang... (${attempt}/3)`)
            await new Promise(r => setTimeout(r, 1000))
            continue
          }
          throw err
        }
      }

      if (!zfaceData) throw new Error('Gagal menghubungi ZFace')

      setFaceStatus(`✓ ${zfaceData.person.name} — Login...`)

      const verifyRes = await fetch('/api/auth/face-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceToken: zfaceData.access_token }),
      })

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}))
        throw new Error(errData.error || 'Verifikasi gagal')
      }

      const verifyData = await verifyRes.json()

      const signInRes = await signIn('credentials', {
        email: verifyData.email,
        password: `face:${verifyData.name}`,
        redirect: false,
      })

      if (signInRes?.ok) router.push('/dashboard')
      else throw new Error('Login gagal setelah verifikasi')
    } catch (err: any) {
      setError(err.message || 'Face login gagal')
      setFaceStatus('')
      stopCamera()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">ZLaundry</h1>
          <p className="text-sm text-gray-500 mt-1">Sistem Manajemen Laundry</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => { setMode('password'); stopCamera(); setFaceStatus(''); setError('') }}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition ${mode === 'password' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            🔑 Password
          </button>
          <button onClick={() => { setMode('face'); setError(''); setFaceStatus('') }}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition ${mode === 'face' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            📷 Wajah
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        {mode === 'password' ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@laundrykas.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 transition-colors text-sm">
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted
                className={`w-full h-full object-cover ${cameraActive ? '' : 'hidden'}`} />
              <canvas ref={canvasRef} className="hidden" />
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">📷</span>
                    <p className="text-gray-400 text-sm">Klik tombol di bawah</p>
                  </div>
                </div>
              )}
              {faceStatus && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 text-center">
                  {faceStatus}
                </div>
              )}
            </div>
            <button onClick={handleFaceLogin} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 transition-colors text-sm">
              {loading ? 'Memproses...' : '📷 Login dengan Wajah'}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">
          admin@laundrykas.com / admin123
        </p>
      </div>
    </div>
  )
}

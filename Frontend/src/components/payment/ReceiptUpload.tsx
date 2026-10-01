import { useRef, useState } from 'react'
import { UploadCloud, X, Receipt } from 'lucide-react'
import { Button } from '../ui/Button'

/** Downscales images to max 1024px JPEG so receipts stay small in storage. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 1024
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = () => reject(new Error('Could not read that image'))
      img.src = String(reader.result)
    }
    reader.onerror = () => reject(new Error('Could not read that file'))
    reader.readAsDataURL(file)
  })
}

export function ReceiptUpload({ value, onChange }: { value: string | null; onChange: (dataUrl: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const pick = async (file: File | undefined) => {
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/')) { setError('Please upload a photo of your receipt (JPG/PNG).'); return }
    if (file.size > 8 * 1024 * 1024) { setError('Image too large — max 8MB.'); return }
    setBusy(true)
    try {
      onChange(await fileToDataUrl(file))
    } catch {
      setError('Could not read that image — try another photo.')
    } finally {
      setBusy(false)
    }
  }

  if (value) {
    return (
      <div>
        <div className="relative rounded-xl overflow-hidden border-2 border-primary-600">
          <img src={value} alt="Payment receipt" className="w-full max-h-56 object-contain bg-gray-50" />
          <button
            type="button"
            onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = '' }}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/70 text-white flex items-center justify-center"
            aria-label="Remove receipt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-primary-700 font-semibold mt-1.5 flex items-center gap-1"><Receipt className="h-3.5 w-3.5" /> Receipt attached — admin will confirm shortly.</p>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-primary-300 rounded-xl p-5 text-center hover:border-primary-600 hover:bg-primary-50 transition-all"
      >
        <UploadCloud className="h-8 w-8 text-primary-600 mx-auto" />
        <div className="font-bold text-sm mt-1">{busy ? 'Reading receipt...' : 'Upload proof of payment / receipt'}</div>
        <div className="text-xs text-gray-500">Screenshot or photo of your transfer receipt (JPG/PNG)</div>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => pick(e.target.files?.[0])} />
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  )
}

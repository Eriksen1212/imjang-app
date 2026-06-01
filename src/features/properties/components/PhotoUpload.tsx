'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { addPhoto, deletePhoto } from '@/features/properties/actions'

type Photo = {
  id: string
  storage_path: string
}

type Props = {
  propertyId: string
  userId: string
  photos: Photo[]
}

export function PhotoUpload({ propertyId, userId, photos }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  function getPublicUrl(path: string) {
    return supabase.storage.from('property-photos').getPublicUrl(path).data.publicUrl
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= 5) {
      setError('사진은 최대 5장까지 저장할 수 있습니다')
      return
    }

    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `${userId}/${propertyId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('property-photos')
      .upload(path, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const result = await addPhoto(propertyId, path)
    if (result?.error) setError(result.error)

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDelete(photo: Photo) {
    await deletePhoto(photo.id, propertyId)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <img
              src={getPublicUrl(photo.storage_path)}
              alt="매물 사진"
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => handleDelete(photo)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < 5 && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition disabled:opacity-50"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs mt-1">{uploading ? '업로드 중' : '사진 추가'}</span>
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-400">{photos.length}/5장</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  )
}

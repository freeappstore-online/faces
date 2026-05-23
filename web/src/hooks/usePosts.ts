import { useCallback, useEffect, useRef, useState } from 'react'
import { fas } from '../lib/fas'
import { faceThumbUrl, faceFullUrl } from '../lib/cloudinary'
import type { Face } from '../lib/types'

const PAGE_SIZE = 100
const MAX_PAGES = 10

export function useFaces() {
  const [faces, setFaces] = useState<Face[]>([])
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const all: Face[] = []
    for (let page = 0; page < MAX_PAGES; page++) {
      const result = await fas.collections.collection('faces').query<Face>({
        orderBy: 'created_at',
        order: 'desc',
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      })
      all.push(...result.documents)
      if (result.documents.length < PAGE_SIZE) break
    }
    setFaces(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchAll()
    }
  }, [fetchAll])

  const addFace = useCallback(
    async (data: { imageId: string; locationName: string }) => {
      const doc = await fas.collections.collection('faces').create({
        ...data,
        imageUrl: faceFullUrl(data.imageId),
        thumbUrl: faceThumbUrl(data.imageId),
      })
      setFaces((prev) => [doc as Face, ...prev])
      return doc as Face
    },
    [],
  )

  return { faces, loading, addFace }
}

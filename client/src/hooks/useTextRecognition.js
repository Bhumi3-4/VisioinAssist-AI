import { useEffect, useRef, useState, useCallback } from 'react'
import { createWorker, PSM } from 'tesseract.js'

export function useTextRecognition() {
  const workerRef = useRef(null)
  const [ocrStatus, setOcrStatus] = useState('loading') 
  
  useEffect(() => {
    let cancelled = false

    async function loadWorker() {
      try {
        const worker = await createWorker('eng')
        // AUTO handles the mix of layouts this app sees (a single word
        // on a label vs. a full paragraph on a page) far better than
        // the previous default, which assumed one uniform text block.
        await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO })
        if (cancelled) {
          worker.terminate()
          return
        }
        workerRef.current = worker
        setOcrStatus('ready')
      } catch (err) {
        console.error('Failed to load OCR engine:', err)
        if (!cancelled) setOcrStatus('error')
      }
    }

    loadWorker()
    return () => {
      cancelled = true
      workerRef.current?.terminate()
    }
  }, [])

  const recognize = useCallback(async (imageSource) => {
    if (!workerRef.current || !imageSource) return { text: '', confidence: 0 }
    const { data } = await workerRef.current.recognize(imageSource)
    return { text: data.text.trim(), confidence: data.confidence }
  }, [])

  return { ocrStatus, recognize }
}
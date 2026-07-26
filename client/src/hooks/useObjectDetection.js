import { useEffect, useRef, useState, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

/**
 * useObjectDetection
 * Loads the COCO-SSD model once on mount (~15MB the first time, cached
 * by the browser after that). Exposes detect(videoElement) which the
 * "What's around me" button calls on-demand.
 */
export function useObjectDetection() {
  const modelRef = useRef(null)
  const [modelStatus, setModelStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    let cancelled = false

    async function loadModel() {
      try {
        await tf.ready()
        const model = await cocoSsd.load()
        if (cancelled) return
        modelRef.current = model
        setModelStatus('ready')
      } catch (err) {
        console.error('Failed to load detection model:', err)
        if (!cancelled) setModelStatus('error')
      }
    }

    loadModel()
    return () => {
      cancelled = true
    }
  }, [])

  const detect = useCallback(async (videoEl) => {
    if (!modelRef.current || !videoEl) return []
    // Returns: [{ class: 'chair', score: 0.93, bbox: [x, y, width, height] }, ...]
    return modelRef.current.detect(videoEl)
  }, [])

  return { modelStatus, detect }
}
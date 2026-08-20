import { useEffect, useRef, useState, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

export function useObjectDetection() {
  const modelRef = useRef(null)
  const [modelStatus, setModelStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    async function loadModel() {
      try {
        await tf.ready()
        // mobilenet_v2 is meaningfully more accurate than the default
        // lite_mobilenet_v2 base, at the cost of a larger download and
        // slightly slower inference -- worth it for detection quality.
        const model = await cocoSsd.load({ base: 'mobilenet_v2' })
        if (cancelled) return
        modelRef.current = model
        setModelStatus('ready')
      } catch (err) {
        console.error('Failed to load detection model:', err)
        if (!cancelled) setModelStatus('error')
      }
    }
    loadModel()
    return () => { cancelled = true }
  }, [])

  const detect = useCallback(async (videoEl) => {
    if (!modelRef.current || !videoEl) return []
    return modelRef.current.detect(videoEl)
  }, [])

  return { modelStatus, detect }
}

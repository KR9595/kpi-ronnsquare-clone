import { useEffect } from 'react'

import { getAboveFoldTimeline } from '@/lib/animation/entrance'
import { gsap } from '@/lib/animation/gsap'

import { buildHomeEntrance, killScrollShrink } from '@/components/intro/timeline/homeEntrance'

import BrandClone from './BrandClone'
import './intro.css'

/** Resolves after two animation frames, like the source's wait before its entrance. */
function nextFrames() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

/**
 * Homepage intro: renders the brand clone and, once the page's blocks have built their
 * timelines, runs the entrance (src/components/intro/timeline/homeEntrance.ts). Render it after the page
 * content: the hero registers its above-fold timeline once the webfonts are in, and this
 * waits for the same promise plus two frames, as the source waits for its blocks.
 */
function HomeEntrance() {
  useEffect(() => {
    let isCancelled = false
    let context: gsap.Context | null = null

    void document.fonts.ready.then(nextFrames).then(() => {
      if (isCancelled) return
      context = gsap.context(() => {
        const block = document.querySelector('[data-entrance="above-fold"]')
        buildHomeEntrance(block ? getAboveFoldTimeline(block) : null)
      })
    })

    // StrictMode's dev double-mount (and HMR) cancel or revert the first run.
    return () => {
      isCancelled = true
      context?.revert()
      killScrollShrink()
    }
  }, [])

  return <BrandClone />
}

export default HomeEntrance

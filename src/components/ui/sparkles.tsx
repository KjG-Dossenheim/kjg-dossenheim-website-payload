'use client'
import React, { useId } from 'react'
import { useState } from 'react'
import { NextParticles, NextParticlesProvider } from '@tsparticles/nextjs'
import type { Container, Engine, ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import { cn } from '@/lib/utils'
import { motion, useAnimation } from 'motion/react'

type ParticlesProps = {
  id?: string
  className?: string
  autoPlay?: ISourceOptions['autoPlay']
  background?: string
  speed?: number
  fpsLimit?: ISourceOptions['fpsLimit']
  particles?: ISourceOptions['particles']
  preset?: ISourceOptions['preset']
  palette?: ISourceOptions['palette']
}
export const SparklesCore = (props: ParticlesProps) => {
  const { id, className, background, particles, fpsLimit, autoPlay, preset, palette } = props
  const controls = useAnimation()

  const [engineReady, setEngineReady] = useState(false)

  const init = async (engine: Engine) => {
    await loadSlim(engine)
    setEngineReady(true)
  }

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 1,
        },
      })
    }
  }

  const generatedId = useId()
  return (
    <motion.div animate={controls} className={cn('opacity-0', className)}>
      <NextParticlesProvider init={init}>
        {engineReady && (
          <NextParticles
            id={id || generatedId}
            className={cn('h-full w-full')}
            particlesLoaded={particlesLoaded}
            options={
              {
                autoPlay: autoPlay ?? true,
                background: {
                  color: {
                    value: background || 'transparent',
                  },
                },
                preset: preset,
                fullScreen: {
                  enable: false,
                  zIndex: 1,
                },
                fpsLimit: fpsLimit || 120,
                particles: {
                  ...particles,
                },
                palette: palette,
                detectRetina: true,
              } satisfies ISourceOptions
            }
          />
        )}
      </NextParticlesProvider>
    </motion.div>
  )
}

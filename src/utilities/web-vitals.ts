'use client'

import { useReportWebVitals } from 'next/web-vitals'
import type { NextWebVitalsMetric } from 'next/app';

const logWebVitals = (metric: NextWebVitalsMetric): void => {
  console.log(metric)
}

export function WebVitals() {
  useReportWebVitals(logWebVitals)

  return null
}
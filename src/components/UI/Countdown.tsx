'use client'

import { useState, useEffect } from 'react'

interface CountdownProps {
  minutesFromNow: number
}

export default function Countdown({ minutesFromNow }: CountdownProps) {
  const [seconds, setSeconds] = useState(minutesFromNow * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) return minutesFromNow * 60
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [minutesFromNow])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <span className="countdown-text">
      Next round in{' '}
      <span className="countdown-number">
        {mins}m {secs.toString().padStart(2, '0')}s
      </span>
    </span>
  )
}

import { useEffect, useState } from 'react'

export default function ProgressSlider() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 2)), 60)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="mb-4">
      <div 
        className="h-1.5 bg-white/20 rounded-full overflow-hidden"
        style={{
          animation: 'progressLineReveal 0.8s ease-out 0.6s both'
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-300 to-cyan-300"
          style={{ width: `${progress}%`, transition: 'width 120ms linear' }}
        />
      </div>
      <div 
        className="mt-2 text-xs text-white/70"
        style={{
          animation: 'contentSlideUp 0.6s ease-out 0.8s both'
        }}
      >
      </div>
    </div>
  )
}
 

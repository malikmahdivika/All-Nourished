import { useEffect, useState } from 'react'

export default function CountdownScreen({ onDone }) {
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (count === 0) {
      onDone()
      return undefined
    }
    const timer = window.setTimeout(() => setCount((current) => current - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [count, onDone])

  return (
    <div className="screen countdown-screen">
      <div className="countdown-card">
        <p>shift starts in</p>
        <h1>{count}</h1>
      </div>
    </div>
  )
}

const COLORS = ['#f87171', '#fbbf24', '#4ade80', '#60a5fa', '#c084fc', '#f472b6', '#fde047']

/** Full-screen falling confetti, pure CSS animation. */
export function Confetti({ count = 60 }: { count?: number }) {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 97) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 12) * 0.25}s`,
            animationDuration: `${2.4 + (i % 5) * 0.5}s`,
            width: i % 3 === 0 ? 12 : 8,
            height: i % 4 === 0 ? 8 : 14,
          }}
        />
      ))}
    </div>
  )
}

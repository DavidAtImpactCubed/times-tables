/**
 * A base-ten "rod": one unbreakable bar of ten, drawn as ten segments with a
 * subtle five|five split. Used wherever a row of ten appears, so the tens
 * read as units ("3 tens = 30") instead of thirty loose stars to count.
 */
export function TenRod({ className = '' }: { className?: string }) {
  return (
    <span className={`ten-rod ${className}`} aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className={`rod-cell ${i === 5 ? 'rod-split' : ''}`} />
      ))}
    </span>
  )
}

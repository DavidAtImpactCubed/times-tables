/**
 * A base-ten "rod": one unbreakable bar of ten, drawn as ten segments with a
 * subtle five|five split. Used wherever a row of ten appears, so the tens
 * read as units ("3 tens = 30") instead of thirty loose stars to count.
 *
 * With `plusOne`, a single loose unit sits after the rod with a clear gap —
 * a row of eleven read as "a full ten and one more", which is both why
 * 11 × n = 10n + n and where the digit-twice pattern comes from.
 */
export function TenRod({ className = '', plusOne = false }: { className?: string; plusOne?: boolean }) {
  const cells = Array.from({ length: 10 }, (_, i) => (
    <span key={i} className={`rod-cell ${i === 5 ? 'rod-split' : ''}`} />
  ))
  if (!plusOne)
    return (
      <span className={`ten-rod ${className}`} aria-hidden>
        {cells}
      </span>
    )
  return (
    <span className={`rod-row ${className}`} aria-hidden>
      <span className="ten-rod">{cells}</span>
      <span className="rod-one">
        <span className="rod-cell" />
      </span>
    </span>
  )
}

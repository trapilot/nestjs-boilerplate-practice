export interface PaginationProps {
  page: number
  totalPage?: number
  onChange: (nextPage: number) => void
  maxButtons?: number
}

export function Pagination({ page, totalPage, onChange, maxButtons = 5 }: PaginationProps) {
  const canPrev = page > 1
  const canNext = totalPage ? page < totalPage : true

  const buildButtons = (): number[] => {
    if (!totalPage || totalPage <= 1) return []

    const half = Math.floor(maxButtons / 2)
    let start = Math.max(1, page - half)
    let end = Math.min(totalPage, start + maxButtons - 1)
    start = Math.max(1, end - maxButtons + 1)

    const arr: number[] = []
    for (let i = start; i <= end; i++) arr.push(i)
    return arr
  }

  const buttons = buildButtons()

  return (
    <div className="table-pagination">
      {buttons.length > 0 && (
        <>
          <button disabled={!canPrev} onClick={() => onChange(page - 1)}>
            Prev
          </button>
          {buttons[0] > 1 && (
            <>
              <button onClick={() => onChange(1)}>1</button>
              {buttons[0] > 2 && <span>…</span>}
            </>
          )}
          {buttons.map((p) => (
            <button
              key={p}
              onClick={() => onChange(p)}
              style={{
                fontWeight: p === page ? 700 : 400,
                textDecoration: p === page ? 'underline' : 'none',
              }}
            >
              {p}
            </button>
          ))}
          {buttons[buttons.length - 1] < (totalPage || 0) && (
            <>
              {buttons[buttons.length - 1] < totalPage! - 1 && <span>…</span>}
              <button onClick={() => onChange(totalPage!)}>{totalPage}</button>
            </>
          )}
          <button disabled={!canNext} onClick={() => onChange(page + 1)}>
            Next
          </button>
        </>
      )}
    </div>
  )
}

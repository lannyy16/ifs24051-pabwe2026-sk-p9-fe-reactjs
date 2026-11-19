/** 3 kartu statistik: Total Artikel, Total Terbit, Belum Selesai (Draf). */
export default function PostStats({ stats }) {
  const items = [
    { label: 'Total Artikel', value: stats.total },
    { label: 'Total Terbit', value: stats.published },
    { label: 'Belum Selesai (Draf)', value: stats.draft },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((i) => (
        <div key={i.label} className="card p-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">{i.label}</p>
          <p className="mt-1 text-3xl font-bold text-accent-ink">{i.value}</p>
        </div>
      ))}
    </div>
  )
}

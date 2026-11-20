/** Kartu statistik dengan ikon (dipakai dashboard penulis & admin). */
export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink" aria-hidden="true">
        <Icon size={24} />
      </span>
      <div>
        <p className="m-0 text-sm font-medium muted">{label}</p>
        <p className="m-0 text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}

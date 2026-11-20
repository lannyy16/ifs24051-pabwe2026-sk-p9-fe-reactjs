import { IconFileText, IconPencil, IconWorldUpload } from '@tabler/icons-react'
import StatCard from '../../../components/StatCard'

/** 3 kartu statistik: Total Artikel, Total Terbit, Belum Selesai (Draf). */
export default function PostStats({ stats }) {
  return (
    <section aria-label="Statistik artikel" className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Total Artikel" value={stats.total} icon={IconFileText} />
      <StatCard label="Total Terbit" value={stats.published} icon={IconWorldUpload} />
      <StatCard label="Belum Selesai (Draf)" value={stats.draft} icon={IconPencil} />
    </section>
  )
}

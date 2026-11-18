import { useState } from 'react'
import { IconSparkles, IconX } from '@tabler/icons-react'
import useInput from '../../../hooks/useInput'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { CATEGORIES, aiGenerate } from '../api/blogApi'
import { showError } from '../../../helpers/toolsHelper'

function AiForm({ onClose, onApply }) {
  const [topic, onTopic] = useInput('')
  const [category, onCategory] = useInput('')
  const [webSearch, setWebSearch] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const generate = async () => {
    if (topic.trim().length < 3) {
      showError('Topik minimal 3 karakter')
      return
    }
    setLoading(true)
    try {
      setResult(await aiGenerate({ topic, category, include_web_search: webSearch }))
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true">
      <div className="card flex max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden">
        <div className="flex items-center justify-between bg-accent px-5 py-3 text-white">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><IconSparkles size={20} /> AI Blog Generator</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="cursor-pointer"><IconX size={22} /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="ai-topic" className="mb-1 block text-sm font-medium">Topik Artikel</label>
              <input id="ai-topic" className="input" value={topic} onChange={onTopic} placeholder="mis. Tren AI di dunia pendidikan 2026" />
            </div>
            <div>
              <label htmlFor="ai-category" className="mb-1 block text-sm font-medium">Kategori</label>
              <select id="ai-category" className="input" value={category} onChange={onCategory}>
                <option value="">Otomatis</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={webSearch} onChange={(e) => setWebSearch(e.target.checked)} />
            Sertakan penelusuran Search Engine (fakta terkini + sumber rujukan)
          </label>

          {result && (
            <section className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-xl font-bold">{result.title}</h3>
              <p className="text-sm text-slate-500">{result.category} · {result.excerpt}</p>
              <MarkdownViewer content={result.content} />
              {result.used_web_search && (
                <div>
                  <h4 className="mb-1 text-sm font-semibold">Sumber Rujukan</h4>
                  <ol className="list-decimal space-y-1 pl-5 text-sm">
                    {result.sources.map((s) => (
                      <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">{s.title}</a></li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="flex justify-end gap-2 bg-slate-100 px-5 py-3 dark:bg-slate-700">
          <button type="button" className="btn-ghost" onClick={onClose}>Batal</button>
          <button type="button" className="btn-ghost" onClick={generate} disabled={loading}>
            {loading ? 'Menghasilkan...' : 'Generate'}
          </button>
          {result && (
            <button type="button" className="btn-primary" onClick={() => onApply(result)}>Gunakan Artikel</button>
          )}
        </div>
      </div>
    </div>
  )
}

/** Modal full screen AI generator dengan opsi penelusuran Search Engine. */
export default function AiPostGeneratorModal({ open, onClose, onApply }) {
  if (!open) return null
  return <AiForm onClose={onClose} onApply={onApply} />
}

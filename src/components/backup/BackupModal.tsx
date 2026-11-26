import { CheckCircle2, Download, Trash2, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useYunoStore } from '../../store/useYunoStore'

interface BackupModalProps {
  open: boolean
  onClose: () => void
}

export function BackupModal({ open, onClose }: BackupModalProps) {
  const { exportBackupJson, importBackupJson, resetAllProgress } = useYunoStore()
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!open) return null

  const handleDownload = () => {
    const json = exportBackupJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const dateStamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `yuno-2-backup-${dateStamp}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus({ type: 'ok', text: 'Backup-Datei erfolgreich heruntergeladen.' })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importBackupJson(String(reader.result ?? ''))
      if (result.ok) {
        setStatus({ type: 'ok', text: 'Backup erfolgreich wiederhergestellt!' })
      } else {
        setStatus({ type: 'err', text: result.error ?? 'Import fehlgeschlagen.' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="editorial-card w-full max-w-md space-y-5 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Lokaler Speicher & Backup</h2>
            <p className="text-xs text-slate-400">
              Fortschritt, Streak, XP & SM-2-Wiederholungsordner sichern.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            <Download className="h-4 w-4" />
            <span>JSON-Backup exportieren</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            <Upload className="h-4 w-4" />
            <span>JSON-Backup importieren</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {status && (
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs ${
              status.type === 'ok'
                ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/35 bg-rose-500/10 text-rose-200'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{status.text}</span>
          </div>
        )}

        <div className="border-t border-white/[0.08] pt-4">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Gesamten Lernstand zurücksetzen</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs">
              <span className="text-rose-200">Wirklich alles löschen?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg bg-white/10 px-2.5 py-1 text-slate-200"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAllProgress()
                    setConfirmReset(false)
                    setStatus({ type: 'ok', text: 'Lernstand wurde zurückgesetzt.' })
                  }}
                  className="rounded-lg bg-rose-500 px-2.5 py-1 font-semibold text-white"
                >
                  Ja, löschen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

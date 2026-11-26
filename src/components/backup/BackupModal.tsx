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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-md">
      <div className="apple-card w-full max-w-md space-y-5 rounded-[28px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-apple-display text-lg text-[#1D1D1F]">Speicher &amp; Backup</h2>
            <p className="text-xs text-[#6E6E73]">
              Fortschritt, Lernserie, XP &amp; Wiederholungsordner sichern.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] text-[#515154] hover:bg-[#E5E5EA]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0077ED]"
          >
            <Download className="h-4 w-4" />
            <span>JSON-Backup exportieren</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-full bg-[#F2F2F7] px-4 py-3 text-sm font-bold text-[#1D1D1F] transition hover:bg-[#E5E5EA]"
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
            className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-semibold ${
              status.type === 'ok'
                ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
                : 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{status.text}</span>
          </div>
        )}

        <div className="border-t border-black/[0.06] pt-4">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Gesamten Lernstand zurücksetzen</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#FEF2F2] p-3 text-xs">
              <span className="font-semibold text-[#7F1D1D]">Wirklich alles löschen?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-full bg-white px-3 py-1 font-bold text-[#1D1D1F]"
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
                  className="rounded-full bg-[#DC2626] px-3 py-1 font-bold text-white"
                >
                  Löschen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, Loader2, CheckCircle, AlertTriangle, X, FlaskConical } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface ExamFile {
  id: string
  file: File
  previewUrl: string
  isUploading: boolean
  uploadProgress: number
  uploadedUrl: string | null
  error: string | null
}

interface ExamUploadProps {
  onUploadComplete: (urls: string[]) => void
  uploadFile: (file: File, onProgress: (progress: number) => void) => Promise<string>
}

export function ExamUpload({ onUploadComplete, uploadFile }: ExamUploadProps) {
  const [examFiles, setExamFiles] = useState<ExamFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return

    const newFiles: ExamFile[] = selected.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isUploading: true,
      uploadProgress: 0,
      uploadedUrl: null,
      error: null,
    }))

    setExamFiles((prev) => [...prev, ...newFiles])

    // Reset input so the same file can be re-added if needed
    if (inputRef.current) inputRef.current.value = ""

    // Upload each file concurrently
    await Promise.all(
      newFiles.map(async (ef) => {
        try {
          const url = await uploadFile(ef.file, (progress) => {
            setExamFiles((prev) =>
              prev.map((f) => (f.id === ef.id ? { ...f, uploadProgress: progress } : f))
            )
          })
          setExamFiles((prev) =>
            prev.map((f) =>
              f.id === ef.id ? { ...f, uploadedUrl: url, isUploading: false } : f
            )
          )
        } catch {
          setExamFiles((prev) =>
            prev.map((f) =>
              f.id === ef.id
                ? { ...f, isUploading: false, error: "Erro no upload. Tente novamente." }
                : f
            )
          )
        }
      })
    )

    // Notify parent with all successfully uploaded URLs
    setExamFiles((prev) => {
      const urls = prev.filter((f) => f.uploadedUrl).map((f) => f.uploadedUrl!)
      onUploadComplete(urls)
      return prev
    })
  }

  const removeFile = (id: string) => {
    setExamFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id)
      onUploadComplete(updated.filter((f) => f.uploadedUrl).map((f) => f.uploadedUrl!))
      return updated
    })
  }

  const uploadedCount = examFiles.filter((f) => f.uploadedUrl).length
  const totalCount = examFiles.length

  return (
    <div className="space-y-4">
      {/* Drop zone / trigger */}
      <label
        htmlFor="exam-upload-input"
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <FlaskConical className="h-7 w-7" />
        </div>
        <div>
          <p className="font-semibold text-neutral-700">Clique para anexar exames</p>
          <p className="text-xs text-neutral-500 mt-1">
            PNG, JPG ou JPEG • até 10 MB por arquivo • múltiplos arquivos permitidos
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          <Upload className="h-4 w-4" />
          Selecionar arquivos
        </div>
        <input
          ref={inputRef}
          id="exam-upload-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />
      </label>

      {/* Overall progress */}
      {totalCount > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>{uploadedCount} de {totalCount} arquivo(s) enviado(s)</span>
            <span>{Math.round((uploadedCount / totalCount) * 100)}%</span>
          </div>
          <Progress value={(uploadedCount / totalCount) * 100} className="h-1.5" />
        </div>
      )}

      {/* File list */}
      {examFiles.length > 0 && (
        <ul className="space-y-2">
          {examFiles.map((ef) => (
            <li
              key={ef.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm"
            >
              {/* Thumbnail or PDF icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-100 bg-neutral-50">
                <img src={ef.previewUrl} alt={ef.file.name} className="h-full w-full object-cover" />
              </div>

              {/* Info + progress */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-800">{ef.file.name}</p>
                <p className="text-xs text-neutral-500">
                  {(ef.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {ef.isUploading && (
                  <div className="mt-1 flex items-center gap-2">
                    <Progress value={ef.uploadProgress} className="h-1.5 flex-1" />
                    <span className="text-xs text-neutral-500">{ef.uploadProgress}%</span>
                  </div>
                )}
                {ef.error && (
                  <p className="mt-1 text-xs text-red-600">{ef.error}</p>
                )}
              </div>

              {/* Status icon */}
              <div className="shrink-0">
                {ef.isUploading && (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                )}
                {ef.uploadedUrl && !ef.isUploading && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {ef.error && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeFile(ef.id)}
                className="shrink-0 rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                title="Remover arquivo"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

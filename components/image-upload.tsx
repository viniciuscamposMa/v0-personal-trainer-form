"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress" // Assuming you have a Progress component

interface ImageUploadProps {
  id: string
  icon: React.ReactNode
  label: string
  onFileChange: (file: File, onProgress: (progress: number) => void) => Promise<string>
  onUploadComplete: (url: string) => void
}

export function ImageUpload({ id, icon, label, onFileChange, onUploadComplete }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)
    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)
    setUploadProgress(0)

    try {
      const url = await onFileChange(selectedFile, setUploadProgress)
      onUploadComplete(url)
      setUploadSuccess(true)
    } catch (error) {
      console.error(`Error uploading ${id}:`, error)
      setUploadError("Erro no upload. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-100">
            {previewUrl ? (
              <img src={previewUrl} alt={label} className="h-full w-full rounded-lg object-cover" />
            ) : (
              icon
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-neutral-700">{label}</p>
            <p className="text-xs text-neutral-500">PNG, JPG até 10MB</p>
          </div>
          {!isUploading && !uploadSuccess && !uploadError && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
              <Upload className="h-5 w-5" />
            </div>
          )}
          {uploadSuccess && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
          {uploadError && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
        </div>
        <Input id={id} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </Label>

      {isUploading && (
        <div className="flex items-center gap-2">
          <Progress value={uploadProgress} className="w-full" />
          <span className="text-xs font-medium text-neutral-600">{uploadProgress}%</span>
        </div>
      )}
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
    </div>
  )
}

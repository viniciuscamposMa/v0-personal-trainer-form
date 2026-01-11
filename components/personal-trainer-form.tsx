"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Loader2,
  User,
  RotateCcw,
  PersonStanding,
  View,
} from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { Progress } from "@/components/ui/progress"

// Defina um tipo para o estado de cada upload de imagem
interface ImageUploadState {
  id: string
  label: string
  icon: React.ReactNode
  file: File | null
  uploadedUrl: string | null
}

interface FormData {
  nomeCompleto: string
  dataNascimento: string
  idade: string
  sexo: string
  pesoAtual: string
  altura: string
  profissao: string
  cidadeUf: string
  whatsapp: string
  objetivoPrincipal: string
  maiorDificuldade: string
  prazoRealista: string
  treinandoAtualmente: string
  tempoTreino: string
  vezesSemanaTreino: string
  tempoDisponivel: string
  localTreino: string
  gostaCadiovascular: string
  historicoClinico: string[]
  outrosHistorico: string
  lesoesOuDores: string
  medicamentosContinuos: string
  recursoErgogenico: string
  qualidadeSono: string
  horasSono: string
  nivelEstresse: string
  consumoAlcool: string
  fumante: string
  refeicoesporDia: string
  suplementacaoAtual: string
  alergias: string
  alimentoNaoGosta: string
  disturbios: string
  consumoAgua: string
}

export default function PersonalTrainerForm() {
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: "",
    dataNascimento: "",
    idade: "",
    sexo: "",
    pesoAtual: "",
    altura: "",
    profissao: "",
    cidadeUf: "",
    whatsapp: "",
    objetivoPrincipal: "",
    maiorDificuldade: "",
    prazoRealista: "",
    treinandoAtualmente: "",
    tempoTreino: "",
    vezesSemanaTreino: "",
    tempoDisponivel: "",
    localTreino: "",
    gostaCadiovascular: "",
    historicoClinico: [],
    outrosHistorico: "",
    lesoesOuDores: "",
    medicamentosContinuos: "",
    recursoErgogenico: "",
    qualidadeSono: "",
    horasSono: "",
    nivelEstresse: "",
    consumoAlcool: "",
    fumante: "",
    refeicoesporDia: "",
    suplementacaoAtual: "",
    alergias: "",
    alimentoNaoGosta: "",
    disturbios: "",
    consumoAgua: "",
  })

  // Estado para os 4 uploads de imagem
  const [imageUploads, setImageUploads] = useState<ImageUploadState[]>([
    {
      id: "front-image",
      label: "Foto de Frente",
      icon: <User className="h-8 w-8" />,
      file: null,
      uploadedUrl: null,
    },
    {
      id: "back-image",
      label: "Foto de Costas",
      icon: <img src="/costas.png" alt="Foto de Costas" className="h-16 w-16" />,
      file: null,
      uploadedUrl: null,
    },
    {
      id: "side-image-1",
      label: "Foto de Lado (Esquerdo com braço elevado)",
      icon: <img src="/esquerdo.png" alt="Foto de Lado (Esquerdo)" className="h-16 w-16" />,
      file: null,
      uploadedUrl: null,
    },
    {
      id: "side-image-2",
      label: "Foto de Lado (Direito com braços elevados)",
      icon: <img src="/direito.png" alt="Foto de Lado (direito)" className="h-14 w-14" />,
      file: null,
      uploadedUrl: null,
    },
  ])

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => {
      const historicoClinico = prev.historicoClinico.includes(value)
        ? prev.historicoClinico.filter(item => item !== value)
        : [...prev.historicoClinico, value]
      return { ...prev, historicoClinico }
    })
  }

  // Função genérica para upload de arquivo
  const uploadFile = async (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/upload", true)

      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          onProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          resolve(response.url)
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error("Upload failed due to a network error"))
      }

      xhr.send(formData)
    })
  }

  // Manipulador para quando um upload de imagem é concluído
  const handleUploadComplete = (id: string, url: string) => {
    setImageUploads(prev =>
      prev.map(upload => (upload.id === id ? { ...upload, uploadedUrl: url } : upload))
    )
  }

  // Verifica se todos os uploads foram concluídos
  const allImagesUploaded = imageUploads.every(upload => upload.uploadedUrl)
  const uploadProgress =
    (imageUploads.filter(u => u.uploadedUrl).length / imageUploads.length) * 100

  const handleGeneratePdf = async () => {
    if (!allImagesUploaded) {
      alert("Por favor, faça o upload de todas as 4 imagens antes de gerar o PDF.")
      return
    }

    setIsGeneratingPdf(true)
    try {
      // Coleta as URLs das imagens
      const imageUrls = imageUploads.map(upload => upload.uploadedUrl)

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          imageUrls, // Envia um array de URLs
        }),
      })

      if (!response.ok) throw new Error("PDF generation failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `avaliacao-${formData.nomeCompleto || "cliente"}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Erro ao gerar PDF. Tente novamente.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. IDENTIFICAÇÃO E BIOMETRIA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="nomeCompleto">Nome Completo</Label>
              <Input id="nomeCompleto" name="nomeCompleto" value={formData.nomeCompleto} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="idade">Idade</Label>
              <Input id="idade" name="idade" type="number" value={formData.idade} onChange={handleInputChange} />
            </div>
            <div>
              <Label>Sexo</Label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sexo"
                    value="M"
                    checked={formData.sexo === "M"}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  Masculino
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sexo"
                    value="F"
                    checked={formData.sexo === "F"}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  Feminino
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="pesoAtual">Peso Atual (kg)</Label>
              <Input
                id="pesoAtual"
                name="pesoAtual"
                type="number"
                step="0.1"
                value={formData.pesoAtual}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="altura">Altura (m)</Label>
              <Input
                id="altura"
                name="altura"
                type="number"
                step="0.01"
                value={formData.altura}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="profissao">Profissão</Label>
              <Input id="profissao" name="profissao" value={formData.profissao} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="cidadeUf">Cidade/UF</Label>
              <Input id="cidadeUf" name="cidadeUf" value={formData.cidadeUf} onChange={handleInputChange} />
            </div>
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={handleInputChange}
              placeholder="(00) 00000-0000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. OBJETIVOS E EXPECTATIVAS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Qual seu objetivo principal hoje?</Label>
            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              {["Emagrecimento", "Ganho de Massa", "Definição", "Performance Esportiva"].map((obj) => (
                <label key={obj} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="objetivoPrincipal"
                    value={obj}
                    checked={formData.objetivoPrincipal === obj}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  {obj}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="maiorDificuldade">Qual sua maior dificuldade atual para atingir esse objetivo?</Label>
            <Textarea
              id="maiorDificuldade"
              name="maiorDificuldade"
              value={formData.maiorDificuldade}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="prazoRealista">Qual prazo você considera realista para ver as primeiras mudanças?</Label>
            <Input
              id="prazoRealista"
              name="prazoRealista"
              value={formData.prazoRealista}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. HISTÓRICO DE ATIVIDADE FÍSICA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Está treinando atualmente?</Label>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="treinandoAtualmente"
                  value="Sim"
                  checked={formData.treinandoAtualmente === "Sim"}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                Sim
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="treinandoAtualmente"
                  value="Não"
                  checked={formData.treinandoAtualmente === "Não"}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                Não
              </label>
            </div>
          </div>

          {formData.treinandoAtualmente === "Sim" && (
            <div>
              <Label htmlFor="tempoTreino">Há quanto tempo sem interrupções?</Label>
              <Input id="tempoTreino" name="tempoTreino" value={formData.tempoTreino} onChange={handleInputChange} />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="vezesSemanaTreino">Quantas vezes por semana pretende treinar?</Label>
              <Input
                id="vezesSemanaTreino"
                name="vezesSemanaTreino"
                type="number"
                value={formData.vezesSemanaTreino}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="tempoDisponivel">Tempo disponível por sessão</Label>
              <Input
                id="tempoDisponivel"
                name="tempoDisponivel"
                value={formData.tempoDisponivel}
                onChange={handleInputChange}
                placeholder="Ex: 45 min, 1h"
              />
            </div>
          </div>

          <div>
            <Label>Local de Treino</Label>
            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              {["Academia", "Prédio/Condomínio", "Em casa", "Ar livre"].map((local) => (
                <label key={local} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="localTreino"
                    value={local}
                    checked={formData.localTreino === local}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  {local}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Gosta de fazer exercícios cardiovasculares?</Label>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gostaCadiovascular"
                  value="Sim"
                  checked={formData.gostaCadiovascular === "Sim"}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                Sim
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gostaCadiovascular"
                  value="Não"
                  checked={formData.gostaCadiovascular === "Não"}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                Não
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. SAÚDE, LESÕES E LIMITAÇÕES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Histórico Clínico</Label>
            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              {["Hipertensão", "Diabetes", "Cardiopatia", "Labirintite"].map((condition) => (
                <label key={condition} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.historicoClinico.includes(condition)}
                    onChange={() => handleCheckboxChange(condition)}
                    className="h-4 w-4"
                  />
                  {condition}
                </label>
              ))}
            </div>
            <div className="mt-2">
              <Input
                name="outrosHistorico"
                value={formData.outrosHistorico}
                onChange={handleInputChange}
                placeholder="Outros"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lesoesOuDores">Lesões ou Dores Osteoarticulares (Descreva o local e movimento)</Label>
            <Textarea
              id="lesoesOuDores"
              name="lesoesOuDores"
              value={formData.lesoesOuDores}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="medicamentosContinuos">Medicamentos de uso contínuo</Label>
            <Input
              id="medicamentosContinuos"
              name="medicamentosContinuos"
              value={formData.medicamentosContinuos}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label>Já fez uso de recursos ergogênicos (hormônios)?</Label>
            <div className="flex flex-wrap gap-4 pt-2">
              {["Sim", "Não", "Pretendo usar"].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recursoErgogenico"
                    value={option}
                    checked={formData.recursoErgogenico === option}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. ESTILO DE VIDA E ROTINA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Qualidade do Sono</Label>
              <div className="flex flex-col gap-2 pt-2">
                {["Ruim", "Regular", "Boa"].map((quality) => (
                  <label key={quality} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="qualidadeSono"
                      value={quality}
                      checked={formData.qualidadeSono === quality}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    {quality}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="horasSono">Média de horas por noite</Label>
              <Input
                id="horasSono"
                name="horasSono"
                type="number"
                step="0.5"
                value={formData.horasSono}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <Label>Nível de Estresse</Label>
            <div className="flex gap-4 pt-2">
              {["Baixo", "Moderado", "Alto"].map((level) => (
                <label key={level} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="nivelEstresse"
                    value={level}
                    checked={formData.nivelEstresse === level}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Consumo de Álcool</Label>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-4">
              {["Não fumo/bebo", "Socialmente", "Frequentemente"].map((freq) => (
                <label key={freq} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="consumoAlcool"
                    value={freq}
                    checked={formData.consumoAlcool === freq}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  {freq}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Fumante?</Label>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="fumante"
                  value="Sim"
                  checked={formData.fumante === "Sim"}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                Sim
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="fumante"
                  value="Não"
                  checked={formData.fumante === "Não"}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                Não
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. PERFIL ALIMENTAR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="refeicoesporDia">Quantas refeições faz por dia?</Label>
            <Input
              id="refeicoesporDia"
              name="refeicoesporDia"
              type="number"
              value={formData.refeicoesporDia}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="suplementacaoAtual">Suplementação atual</Label>
            <Input
              id="suplementacaoAtual"
              name="suplementacaoAtual"
              value={formData.suplementacaoAtual}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="alergias">Possui alergias (lactose, glúten, frutos do mar)?</Label>
            <Input id="alergias" name="alergias" value={formData.alergias} onChange={handleInputChange} />
          </div>

          <div>
            <Label htmlFor="alimentoNaoGosta">
              Existe algum alimento que você não come de jeito nenhum por paladar?
            </Label>
            <Input
              id="alimentoNaoGosta"
              name="alimentoNaoGosta"
              value={formData.alimentoNaoGosta}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="disturbios">Possui algum distúrbio diagnosticado (compulsão, gastrite, refluxo)?</Label>
            <Input id="disturbios" name="disturbios" value={formData.disturbios} onChange={handleInputChange} />
          </div>

          <div>
            <Label htmlFor="consumoAgua">Consumo de água por dia (litros)</Label>
            <Input
              id="consumoAgua"
              name="consumoAgua"
              type="number"
              step="0.5"
              value={formData.consumoAgua}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. AVALIAÇÃO VISUAL (Anexo)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-600">
            Para o sucesso da consultoria, anexe fotos (Frente, Costas e Perfil)
            em traje de banho ou roupas de treino curtas, com boa iluminação.
          </p>

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Progresso do Upload</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="space-y-4">
            {imageUploads.map(upload => (
              <ImageUpload
                key={upload.id}
                id={upload.id}
                icon={upload.icon}
                label={upload.label}
                onFileChange={uploadFile}
                onUploadComplete={url => handleUploadComplete(upload.id, url)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pb-8">
        <Button
          onClick={handleGeneratePdf}
          disabled={!allImagesUploaded || isGeneratingPdf}
          size="lg"
          className="gap-2"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5" />
              Gerar PDF
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

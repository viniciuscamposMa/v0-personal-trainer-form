"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Loader2 } from "lucide-react"

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

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => {
      const historicoClinico = prev.historicoClinico.includes(value)
        ? prev.historicoClinico.filter((item) => item !== value)
        : [...prev.historicoClinico, value]
      return { ...prev, historicoClinico }
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload to Vercel Blob
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      setUploadedImageUrl(data.url)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Erro ao fazer upload da imagem. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleGeneratePdf = async () => {
    if (!uploadedImageUrl) {
      alert("Por favor, faça upload da foto antes de gerar o PDF.")
      return
    }

    setIsGeneratingPdf(true)
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          imageUrl: uploadedImageUrl,
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
            Para o sucesso da consultoria, anexe fotos (Frente, Costas e Perfil) em traje de banho ou roupas de treino
            curtas, com boa iluminação.
          </p>

          <div className="space-y-4">
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 transition hover:border-neutral-400 hover:bg-neutral-100">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                  <p className="mt-2 text-sm font-medium text-neutral-700">Clique para fazer upload</p>
                  <p className="mt-1 text-xs text-neutral-500">PNG, JPG até 10MB</p>
                </div>
              </div>
              <Input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </Label>

            {isUploading && (
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fazendo upload...
              </div>
            )}

            {previewUrl && !isUploading && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-700">Pré-visualização:</p>
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="mx-auto max-h-64 rounded-lg object-contain"
                />
                <p className="text-center text-xs text-green-600">Upload realizado com sucesso!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pb-8">
        <Button onClick={handleGeneratePdf} disabled={!uploadedImageUrl || isGeneratingPdf} size="lg" className="gap-2">
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

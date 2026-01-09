import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { formData, imageUrl } = await request.json()

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const addLogoWatermark = () => {
      try {
        const logoPath = path.join(process.cwd(), "public", "images", "logo-clifton-personal-perfil-removebg-preview.png")
        console.log("[v0] Reading logo from:", logoPath)
        const logoImage = fs.readFileSync(logoPath)
        const logoBase64 = logoImage.toString("base64")
        console.log("[v0] Logo converted to base64")

        // Assume a 16:9 aspect ratio for the logo, as a common default for logos.
        // If the user wants a specific aspect ratio, they can provide it.
        const assumedImageAspectRatio = 16 / 9; // Width / Height

        let newWidth = pageWidth;
        let newHeight = newWidth / assumedImageAspectRatio;

        if (newHeight > pageHeight) {
          newHeight = pageHeight;
          newWidth = newHeight * assumedImageAspectRatio;
        }

        const logoX = (pageWidth - newWidth) / 2;
        const logoY = (pageHeight - newHeight) / 2;

        pdf.setGState(new pdf.GState({ opacity: 0.7 }))
        pdf.addImage(logoBase64, "PNG", logoX, logoY, newWidth, newHeight)
        pdf.setGState(new pdf.GState({ opacity: 1 }))
        console.log("[v0] Logo watermark added successfully")
      } catch (error) {
        console.error("[v0] Error adding logo:", error)
      }
    }

    addLogoWatermark()

    let yPosition = 20

    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("FICHA DE ANAMNESE - CONSULTORIA ONLINE", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 12

    // Section 1: Identification
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    pdf.text("1. IDENTIFICAÇÃO E BIOMETRIA", 15, yPosition)
    yPosition += 7

    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")

    const idade = formData.idade || "N/A"
    pdf.text(`Nome: ${formData.nomeCompleto}`, 15, yPosition)
    yPosition += 5
    pdf.text(
      `Data de Nascimento: ${formData.dataNascimento}    Idade: ${idade} anos    Sexo: ${formData.sexo}`,
      15,
      yPosition,
    )
    yPosition += 5

    let imc = "0.00"
    if (formData.pesoAtual && formData.altura) {
      const peso = Number.parseFloat(formData.pesoAtual)
      const alturaM = Number.parseFloat(formData.altura)
      if (!isNaN(peso) && !isNaN(alturaM) && alturaM > 0) {
        imc = (peso / (alturaM * alturaM)).toFixed(2)
      }
    }

    pdf.text(`Peso: ${formData.pesoAtual} kg    Altura: ${formData.altura} m    IMC: ${imc}`, 15, yPosition)
    yPosition += 5
    pdf.text(`Profissão: ${formData.profissao}    Cidade/UF: ${formData.cidadeUf}`, 15, yPosition)
    yPosition += 5
    pdf.text(`WhatsApp: ${formData.whatsapp}`, 15, yPosition)
    yPosition += 8

    // Section 2: Goals
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    pdf.text("2. OBJETIVOS E EXPECTATIVAS", 15, yPosition)
    yPosition += 7

    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")

    pdf.text(`Objetivo Principal: ${formData.objetivoPrincipal}`, 15, yPosition)
    yPosition += 5

    const difficulty = formData.maiorDificuldade || "Não informado"
    const difficultyLines = pdf.splitTextToSize(`Maior Dificuldade: ${difficulty}`, pageWidth - 30)
    pdf.text(difficultyLines, 15, yPosition)
    yPosition += difficultyLines.length * 5

    pdf.text(`Prazo Realista: ${formData.prazoRealista}`, 15, yPosition)
    yPosition += 8

    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      addLogoWatermark()
      yPosition = 20
    }

    // Section 3: Physical Activity History
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    pdf.text("3. HISTÓRICO DE ATIVIDADE FÍSICA", 15, yPosition)
    yPosition += 7

    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")

    pdf.text(`Treinando Atualmente: ${formData.treinandoAtualmente}`, 15, yPosition)
    yPosition += 5
    pdf.text(
      `Vezes por Semana: ${formData.vezesSemanaTreino}    Tempo por Sessão: ${formData.tempoDisponivel}`,
      15,
      yPosition,
    )
    yPosition += 5
    pdf.text(`Local de Treino: ${formData.localTreino}`, 15, yPosition)
    yPosition += 5
    pdf.text(`Gosta de Cardio: ${formData.gostaCadiovascular}`, 15, yPosition)
    yPosition += 8

    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      addLogoWatermark()
      yPosition = 20
    }

    // Section 4: Health
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    pdf.text("4. SAÚDE, LESÕES E LIMITAÇÕES", 15, yPosition)
    yPosition += 7

    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")

    const historicoText =
      formData.historicoClinico && formData.historicoClinico.length > 0
        ? formData.historicoClinico.join(", ")
        : "Nenhum"

    pdf.text(`Histórico Clínico: ${historicoText}`, 15, yPosition)
    yPosition += 5

    const lesoes = formData.lesoesOuDores || "Nenhuma"
    const lesoesLines = pdf.splitTextToSize(`Lesões/Dores: ${lesoes}`, pageWidth - 30)
    pdf.text(lesoesLines, 15, yPosition)
    yPosition += lesoesLines.length * 5

    pdf.text(`Medicamentos: ${formData.medicamentosContinuos || "Nenhum"}`, 15, yPosition)
    yPosition += 5

    pdf.text(`Uso de Ergogênicos: ${formData.recursoErgogenico || "Não"}`, 15, yPosition)
    yPosition += 8

    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      addLogoWatermark()
      yPosition = 20
    }

    // Section 5: Lifestyle
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    pdf.text("5. ESTILO DE VIDA E ROTINA", 15, yPosition)
    yPosition += 7

    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")

    pdf.text(`Qualidade do Sono: ${formData.qualidadeSono}    Horas de Sono: ${formData.horasSono}h`, 15, yPosition)
    yPosition += 5
    pdf.text(`Nível de Estresse: ${formData.nivelEstresse}`, 15, yPosition)
    yPosition += 5
    pdf.text(`Consumo de Álcool: ${formData.consumoAlcool}    Fumante: ${formData.fumante}`, 15, yPosition)
    yPosition += 8

    // Section 6: Nutrition
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    pdf.text("6. PERFIL ALIMENTAR", 15, yPosition)
    yPosition += 7

    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")

    pdf.text(
      `Refeições por Dia: ${formData.refeicoesporDia}    Consumo de Água: ${formData.consumoAgua}L`,
      15,
      yPosition,
    )
    yPosition += 5
    pdf.text(`Suplementação: ${formData.suplementacaoAtual || "Nenhuma"}`, 15, yPosition)
    yPosition += 5
    pdf.text(`Alergias: ${formData.alergias || "Nenhuma"}`, 15, yPosition)
    yPosition += 5
    pdf.text(`Alimentos que não gosta: ${formData.alimentoNaoGosta || "Nenhum"}`, 15, yPosition)
    yPosition += 5
    pdf.text(`Distúrbios: ${formData.disturbios || "Nenhum"}`, 15, yPosition)
    yPosition += 10

    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    pdf.text("7. AVALIAÇÃO VISUAL", 15, yPosition)
    yPosition += 7

    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 255)
    pdf.textWithLink("Clique aqui para ver a foto do aluno", 15, yPosition, { url: imageUrl })
    pdf.setTextColor(0, 0, 0)

    const hoje = new Date()
    const dia = String(hoje.getDate()).padStart(2, "0")
    const mes = String(hoje.getMonth() + 1).padStart(2, "0")
    const ano = hoje.getFullYear()
    const dataEmissao = `${dia}/${mes}/${ano}`

    yPosition = pageHeight - 15
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Data de emissão: ${dataEmissao}`, 15, yPosition)

    // Generate PDF
    const pdfBuffer = pdf.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="ficha-anamnese.pdf"',
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 })
  }
}

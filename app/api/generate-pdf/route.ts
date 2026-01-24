import { NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import fs from "fs"
import path from "path"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  try {
    const { formData, imageUrls } = await request.json()

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // ================================
    // BACKGROUND PROPORCIONAL
    // ================================
    const addBackground = async () => {
      const imagePath = path.join(
        process.cwd(),
        "public",
        "images",
        "logo-clifton-personal-perfil-removebg-preview.png"
      )

      const buffer = fs.readFileSync(imagePath)
      const meta = await sharp(buffer).metadata()

      if (!meta.width || !meta.height) return

      const imgRatio = meta.width / meta.height
      const pageRatio = pageWidth / pageHeight

      let w: number
      let h: number

      if (imgRatio > pageRatio) {
        h = pageHeight
        w = h * imgRatio
      } else {
        w = pageWidth
        h = w / imgRatio
      }

      const x = (pageWidth - w) / 2
      const y = (pageHeight - h) / 2

      pdf.setGState(new pdf.GState({ opacity: 0.12 }))
      pdf.addImage(buffer.toString("base64"), "PNG", x, y, w, h)
      pdf.setGState(new pdf.GState({ opacity: 1 }))
    }

    const checkPageBreak = async () => {
      if (y > pageHeight - 30) {
        pdf.addPage()
        await addBackground()
        y = 20
      }
    }

    // PRIMEIRA PÁGINA
    await addBackground()
    let y = 20

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.text("FICHA DE ANAMNESE - CONSULTORIA ONLINE", pageWidth / 2, y, { align: "center" })
    y += 12

    // ================================
    // 1. IDENTIFICAÇÃO
    // ================================
    pdf.setFontSize(11)
    pdf.text("1. IDENTIFICAÇÃO E BIOMETRIA", 15, y)
    y += 7

    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")

    pdf.text(`Nome: ${formData.nomeCompleto}`, 15, y)
    y += 5
    pdf.text(`CPF: ${formData.cpf}`, 15, y)
    y += 5
    pdf.text(`Email: ${formData.email}`, 15, y)
    y += 5

    pdf.text(
      `Data Nascimento: ${formData.dataNascimento}   Idade: ${formData.idade || "N/A"}   Sexo: ${formData.sexo}`,
      15,
      y
    )
    y += 5

    let imc = "0.00"
    if (formData.pesoAtual && formData.altura) {
      const p = parseFloat(formData.pesoAtual)
      const a = parseFloat(formData.altura)
      if (a > 0) imc = (p / (a * a)).toFixed(2)
    }

    pdf.text(`Peso: ${formData.pesoAtual}kg   Altura: ${formData.altura}m   IMC: ${imc}`, 15, y)
    y += 5

    pdf.text(`Profissão: ${formData.profissao}   Cidade/UF: ${formData.cidadeUf}`, 15, y)
    y += 5

    pdf.text(`WhatsApp: ${formData.whatsapp}`, 15, y)
    y += 8

    // ================================
    // 2. OBJETIVOS
    // ================================
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    pdf.text("2. OBJETIVOS E EXPECTATIVAS", 15, y)
    y += 7

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(9)

    pdf.text(`Objetivo Principal: ${formData.objetivoPrincipal}`, 15, y)
    y += 5

    const diffLines = pdf.splitTextToSize(
      `Maior Dificuldade: ${formData.maiorDificuldade || "Não informado"}`,
      pageWidth - 30
    )
    pdf.text(diffLines, 15, y)
    y += diffLines.length * 5

    pdf.text(`Prazo Realista: ${formData.prazoRealista}`, 15, y)
    y += 8
    await checkPageBreak()

    // ================================
    // 3. HISTÓRICO DE ATIVIDADE
    // ================================
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    pdf.text("3. HISTÓRICO DE ATIVIDADE FÍSICA", 15, y)
    y += 7

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(9)

    pdf.text(`Treinando Atualmente: ${formData.treinandoAtualmente}`, 15, y)
    y += 5

    pdf.text(
      `Vezes/Semana: ${formData.vezesSemanaTreino}   Tempo Sessão: ${formData.tempoDisponivel}`,
      15,
      y
    )
    y += 5

    pdf.text(`Local de Treino: ${formData.localTreino}`, 15, y)
    y += 5

    pdf.text(`Gosta de Cardio: ${formData.gostaCadiovascular}`, 15, y)
    y += 8
    await checkPageBreak()

    // ================================
    // 4. SAÚDE
    // ================================
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    pdf.text("4. SAÚDE, LESÕES E LIMITAÇÕES", 15, y)
    y += 7

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(9)

    const historico =
      formData.historicoClinico?.length > 0
        ? formData.historicoClinico.join(", ")
        : "Nenhum"

    pdf.text(`Histórico Clínico: ${historico}`, 15, y)
    y += 5

    const lesoesLines = pdf.splitTextToSize(
      `Lesões/Dores: ${formData.lesoesOuDores || "Nenhuma"}`,
      pageWidth - 30
    )
    pdf.text(lesoesLines, 15, y)
    y += lesoesLines.length * 5

    pdf.text(`Medicamentos: ${formData.medicamentosContinuos || "Nenhum"}`, 15, y)
    y += 5

    pdf.text(`Uso de Ergogênicos: ${formData.recursoErgogenico || "Não"}`, 15, y)
    y += 8
    await checkPageBreak()

    // ================================
    // 5. ESTILO DE VIDA
    // ================================
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    pdf.text("5. ESTILO DE VIDA E ROTINA", 15, y)
    y += 7

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(9)

    pdf.text(
      `Sono: ${formData.qualidadeSono}   Horas: ${formData.horasSono}h`,
      15,
      y
    )
    y += 5

    pdf.text(`Nível de Estresse: ${formData.nivelEstresse}`, 15, y)
    y += 5

    pdf.text(
      `Álcool: ${formData.consumoAlcool}   Fumante: ${formData.fumante}`,
      15,
      y
    )
    y += 8
    await checkPageBreak()

    // ================================
    // 6. PERFIL ALIMENTAR
    // ================================
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    pdf.text("6. PERFIL ALIMENTAR", 15, y)
    y += 7

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(9)

    pdf.text(
      `Refeições/dia: ${formData.refeicoesporDia}   Água: ${formData.consumoAgua}L`,
      15,
      y
    )
    y += 5

    pdf.text(`Suplementação: ${formData.suplementacaoAtual || "Nenhuma"}`, 15, y)
    y += 5

    pdf.text(`Alergias: ${formData.alergias || "Nenhuma"}`, 15, y)
    y += 5

    pdf.text(`Alimentos que não gosta: ${formData.alimentoNaoGosta || "Nenhum"}`, 15, y)
    y += 5

    pdf.text(`Distúrbios: ${formData.disturbios || "Nenhum"}`, 15, y)
    y += 10
    await checkPageBreak()

    // ================================
    // 7. AVALIAÇÃO VISUAL
    // ================================
    await checkPageBreak(40) // Check if there's enough space for the title and some image height
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    pdf.text("7. AVALIAÇÃO VISUAL", 15, y)
    y += 5

    if (imageUrls && imageUrls.length > 0) {
      const imageHeight = 30 // Fixed height for smaller images
      let x = 15
      const totalAvailableWidth = pageWidth - 30
      let totalImageWidth = 0
      const imageMetas = []

      // First pass: calculate total width to center the block
      for (const url of imageUrls) {
        try {
          const response = await fetch(url)
          if (!response.ok) continue
          const imageBuffer = await response.arrayBuffer()
          const imgMeta = await sharp(Buffer.from(imageBuffer)).metadata()
          if (!imgMeta.width || !imgMeta.height) continue
          const aspectRatio = imgMeta.width / imgMeta.height
          const imageWidth = imageHeight * aspectRatio
          totalImageWidth += imageWidth
          imageMetas.push({ url, imageBuffer, imageWidth, imageHeight, aspectRatio })
        } catch (error) {
          console.error("Error fetching image metadata:", error)
        }
      }

      const spacing = (imageUrls.length > 1) ? 5 : 0
      totalImageWidth += spacing * (imageUrls.length - 1)
      
      // Center the image block
      x = (pageWidth - totalImageWidth) / 2

      if (y + imageHeight + 20 > pageHeight - 15) {
         pdf.addPage()
         await addBackground()
         y = 20
      }

      for (const meta of imageMetas) {
        const { url, imageBuffer, imageWidth, imageHeight } = meta;
        const imageBase64 = Buffer.from(imageBuffer).toString("base64")

        pdf.addImage(imageBase64, "PNG", x, y, imageWidth, imageHeight)

        const buttonY = y + imageHeight + 3
        const buttonWidth = 20
        const buttonHeight = 6

        // Button
        pdf.setFillColor(0, 0, 0)
        pdf.roundedRect(x + (imageWidth - buttonWidth) / 2, buttonY, buttonWidth, buttonHeight, 2, 2, "F")
        
        // Button text
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(8)
        pdf.setTextColor(255, 255, 255)
        pdf.text("Abrir", x + imageWidth / 2, buttonY + 4, { align: "center" })

        // Invisible link over the button
        pdf.link(x + (imageWidth - buttonWidth) / 2, buttonY, buttonWidth, buttonHeight, { url })

        pdf.setTextColor(0, 0, 0)

        x += imageWidth + spacing
      }
      y += imageHeight + 20
    } else {
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(9)
      pdf.text("Nenhuma imagem enviada.", 15, y)
      y += 10
    }


    // ================================
    // RODAPÉ
    // ================================
    const pageCount = pdf.internal.pages.length
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(9)
      pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 25, pageHeight - 15)
      pdf.text(`Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`, 15, pageHeight - 15)
    }

    const buffer = pdf.output("arraybuffer")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="ficha-anamnese.pdf"',
      },
    })
  } catch (error) {
    console.error("Erro ao gerar PDF:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}

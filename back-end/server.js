import express from "express"
import multer from "multer"
import cors from "cors"
import dotenv from "dotenv"
import fs from "fs"
import OpenAI from "openai"
import ffmpeg from "fluent-ffmpeg"

dotenv.config()

const app = express()
app.use(cors())

const upload = multer({ dest: "uploads/" })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * 🧠 Quebra o texto em possíveis afirmações
 */
function extrairAfirmacoes(texto) {
  return texto
    .split(/[.!?]| e /i)
    .map(f => f.trim())
    .filter(f => f.length > 15)
}

/**
 * 🧠 Remove frases irrelevantes (introdução, conversa)
 */
function filtrarFatuais(frases) {
  const palavrasRuins = [
    "vou", "começar", "apresentação", "pessoal",
    "hoje", "agora", "bom dia", "boa tarde"
  ]

  return frases.filter(f => {
    const lower = f.toLowerCase()
    return !palavrasRuins.some(p => lower.includes(p))
  })
}

/**
 * 🔒 Limpa resposta do modelo
 */
function limparResposta(resposta) {
  if (!resposta) return ""

  let texto = resposta.trim().split("\n")[0]

  const invalido =
    texto.length > 80 ||
    /quer|posso|vou|ajudar|dica|sugest|boa|ótimo|\?/i.test(texto)

  return invalido ? "" : texto
}

/**
 * 🤖 Verifica UMA afirmação
 */
async function verificarAfirmacao(frase) {
  const resposta = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 40,
    messages: [
      {
        role: "system",
        content: `
Você recebe UMA afirmação factual.

Regras:
- Não converse
- Não explique
- Não sugira
- Não escreva mais de uma frase

Saída:
- Se estiver incorreta → escreva somente a correção factual
- Se estiver correta → responda vazio

Proibido:
- Comentários
- Ajuda
- Qualquer texto extra
        `,
      },
      {
        role: "user",
        content: frase,
      },
    ],
  })

  return limparResposta(resposta.choices[0].message.content)
}

/**
 * 🧹 Limpeza de arquivos
 */
function cleanup(audioPath, outputPath) {
  if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath)
  if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
}

app.post("/audio", upload.single("audio"), async (req, res) => {
  try {
    console.log("🎤 Áudio recebido")

    const audioPath = req.file.path
    const outputPath = audioPath + ".wav"

    // 🔁 Converter para WAV
    await new Promise((resolve, reject) => {
      ffmpeg(audioPath)
        .toFormat("wav")
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath)
    })

    // 🧠 TRANSCRIÇÃO
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: "gpt-4o-mini-transcribe",
    })

    const texto = transcription.text?.trim()

    console.log("📝 Texto completo:", texto)

    // ⚠️ Ignorar vazio
    if (!texto || texto.length < 10) {
      cleanup(audioPath, outputPath)
      return res.json({ texto: "", correcoes: "" })
    }

    // 🧠 Pipeline de processamento
    const afirmacoes = extrairAfirmacoes(texto)
    const fatuais = filtrarFatuais(afirmacoes)

    console.log("🎯 Afirmações detectadas:", fatuais)

    let correcoes = []

    for (const frase of fatuais) {
      const correcao = await verificarAfirmacao(frase)

      if (correcao) {
        correcoes.push(correcao)
      }
    }

    // 🧹 Limpeza
    cleanup(audioPath, outputPath)

    res.json({
      texto,
      correcoes: correcoes.join("\n"),
    })

  } catch (error) {
    console.error("❌ ERRO:", error)
    res.status(500).json({ error: "Erro no processamento" })
  }
})

app.listen(3001, () => {
  console.log("🔥 Backend rodando em http://localhost:3001")
})
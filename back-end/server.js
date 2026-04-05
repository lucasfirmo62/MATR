import express from "express"
import multer from "multer"
import cors from "cors"
import dotenv from "dotenv"
import fs from "fs"
import OpenAI from "openai"
import ffmpeg from "fluent-ffmpeg"

import connectDB, { Treino } from "./database.js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

connectDB()

const upload = multer({ dest: "uploads/" })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const limparArquivos = (p1, p2) => {
  if (p1 && fs.existsSync(p1)) fs.unlinkSync(p1)
  if (p2 && fs.existsSync(p2)) fs.unlinkSync(p2)
}

app.get("/treinos", async (req, res) => {
  try {
    // Busca todos os documentos na coleção 'treinos' e ordena pelos mais recentes
    const treinos = await Treino.find().sort({ data: -1 });
    res.json(treinos);
  } catch (error) {
    console.error("Erro ao buscar treinos:", error);
    res.status(500).json({ erro: "Erro ao buscar treinos no banco de dados" });
  }
});

// --- NOVA ROTA ADICIONADA: BUSCAR TREINO ESPECÍFICO POR ID ---
app.get("/treinos/:id", async (req, res) => {
  try {
    const treino = await Treino.findById(req.params.id);
    if (!treino) {
      return res.status(404).json({ erro: "Treino não encontrado" });
    }
    res.json(treino);
  } catch (error) {
    console.error("Erro ao buscar treino por ID:", error);
    res.status(500).json({ erro: "ID inválido ou erro no servidor" });
  }
});

app.post("/salvar-treino", async (req, res) => {
  try {
    const novoTreino = new Treino(req.body)
    await novoTreino.save()
    res.status(201).json({ mensagem: "Treino salvo com sucesso!" })
  } catch (error) {
    console.error("Erro ao salvar treino:", error)
    res.status(500).json({ erro: "Erro ao salvar no banco de dados" })
  }
})

app.post("/audio", upload.single("audio"), async (req, res) => {
  let caminhoOriginal = ""
  let caminhoWav = ""

  try {
    if (!req.file) return res.json({ correcoes: "" })

    caminhoOriginal = req.file.path
    caminhoWav = `${caminhoOriginal}.wav`

    await new Promise((resolve, reject) => {
      ffmpeg(caminhoOriginal).toFormat("wav").on("end", resolve).on("error", reject).save(caminhoWav)
    })

    const transcricao = await openai.audio.transcriptions.create({
      file: fs.createReadStream(caminhoWav),
      model: "whisper-1",
      language: "pt", 
    })

    const textoBase = transcricao.text.trim()

    if (!textoBase || textoBase.length < 3) {
      limparArquivos(caminhoOriginal, caminhoWav)
      return res.json({ correcoes: "" })
    }

    const contextoAdicional = req.body.contexto ? `Contexto da apresentação: ${req.body.contexto}` : "";

    const analise = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 60,
      temperature: 0, 
      messages: [
        {
          role: "system",
          content: `Você é um verificador de fatos ultra-rápido para transcrições de voz.
          ${contextoAdicional}
          REGRAS:
          - O texto vem de fala natural (pode haver gagueira ou falta de pontuação), foque APENAS no fato.
          - Se houver erro factual: Dê apenas a correção direta (máx 15 palavras).
          - Se o fato estiver certo ou não houver fato claro: Retorne uma string VAZIA.
          - IGNORE erros de gramática ou repetições.
          - PROIBIDO: "Não há erros", "No errors", "Correto", "Nenhum erro encontrado", "Erro:", "Correção:", "Faltou informação", "Vazio", "Vazia", "Fale de novo".
          - Se não entendeu, fique em silêncio.
          - Se não houver fato relevante, fique em silêncio.`
        },
        { role: "user", content: textoBase }
      ]
    })

    let respostaIA = analise.choices[0].message.content.trim()

    const frasesBanidas = ["no errors", "não há erros", "nenhum erro", "correto", "está certo", "found", "informação", "vazio"];
    if (frasesBanidas.some(f => respostaIA.toLowerCase().includes(f))) {
      respostaIA = "";
    }

    const respostaLimpa = respostaIA.replace(/[.\s]/g, '').toLowerCase();
    if (respostaLimpa === "vazia" || respostaIA.length < 2) {
      respostaIA = "";
    }

    limparArquivos(caminhoOriginal, caminhoWav)

    return res.json({
      textoOriginal: textoBase,
      correcoes: respostaIA
    })

  } catch (error) {
    limparArquivos(caminhoOriginal, caminhoWav)
    return res.json({ correcoes: "" })
  }
})

app.listen(3001, () => console.log("Backend run in http://localhost:3001"))
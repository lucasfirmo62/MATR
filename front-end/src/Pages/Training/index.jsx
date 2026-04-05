import { useState, useRef, useEffect } from "react"
import "./styles.css"

function TrainingMode({ titulo = "Apresentação sem Título", contexto = "" }) {
  const [errosDetectados, setErrosDetectados] = useState([])
  const [estaGravando, setEstaGravando] = useState(false)
  const [treinoFinalizado, setTreinoFinalizado] = useState(false)
  const [tempo, setTempo] = useState(0)
  
  const isRecording = useRef(false)
  const mediaRecorderRef = useRef(null)
  const timerRef = useRef(null)

  const formatarTempo = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60)
    const segundos = totalSegundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
  }

  const salvarNoBanco = async (dadosCompletos) => {
    try {
      const response = await fetch("http://localhost:3001/salvar-treino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosCompletos)
      });
      
      if (response.ok) {
        console.log("✅ Treino salvo no MongoDB Atlas!");
      } else {
        console.error("Erro ao salvar treino.");
      }
    } catch (err) {
      console.error("Erro de conexão com o servidor:", err);
    }
  }

  const startRecording = async () => {
    setErrosDetectados([])
    setTempo(0)
    setTreinoFinalizado(false)
    isRecording.current = true
    setEstaGravando(true)

    timerRef.current = setInterval(() => {
      setTempo((prev) => prev + 1)
    }, 1000)

    while (isRecording.current) {
      await recordOnce()
    }
  }

  const stopRecording = () => {
    isRecording.current = false
    setEstaGravando(false)
    setTreinoFinalizado(true)
    
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    const dadosParaSalvar = {
      titulo: titulo,
      contexto: contexto,
      tempoTotal: tempo,
      erros: errosDetectados, 
      feedbackGeral: gerarFeedback()
    };

    salvarNoBanco(dadosParaSalvar);
  }

  const recordOnce = async () => {
    if (!isRecording.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream) 
      mediaRecorderRef.current = mediaRecorder
      let chunks = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      return new Promise((resolve) => {
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" })
          const formData = new FormData()
          formData.append("audio", blob, "audio.webm")
          formData.append("contexto", contexto) 

          try {
            const res = await fetch("http://localhost:3001/audio", {
              method: "POST",
              body: formData,
            })
            const data = await res.json()

            // Filtro para não exibir a palavra "VAZIA" na tela
            if (data.correcoes && data.correcoes.trim() !== "" && data.correcoes.toLowerCase() !== "vazia") {
              setErrosDetectados((prev) => [
                { 
                  id: Date.now(), 
                  ouvi: data.textoOriginal, 
                  correcao: data.correcoes 
                },
                ...prev
              ])
            }
          } catch (err) { console.error(err) }
          
          stream.getTracks().forEach(t => t.stop())
          resolve()
        }
        mediaRecorder.start()
        setTimeout(() => {
          if (mediaRecorder.state === "recording") mediaRecorder.stop()
        }, 10000)
      })
    } catch (err) { stopRecording() }
  }

  const gerarFeedback = () => {
    const totalErros = errosDetectados.length
    if (totalErros === 0) return "Excelente! Sua precisão factual foi perfeita."
    if (totalErros < 3) return "Muito bom! Poucos ajustes de informação são necessários."
    return "Atenção: Muitos deslizes factuais. Tente revisar os pontos-chave da sua fala."
  }

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.2rem", color: "#666", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
        Treinando: {titulo}
      </h1>

      {!treinoFinalizado ? (
        <>
          <div className="header-presentation" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f4f4f4", padding: "15px", borderRadius: "8px" }}>
            <div className="title-presentation-content">
               Modo Treino 
               <span style={{ color: estaGravando ? "#00aa00" : "#ccc", marginLeft: "10px", fontWeight: "bold" }}>
                 {estaGravando ? "● Gravando" : "PRONTO"}
               </span>
            </div>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>{formatarTempo(tempo)}</p>
          </div>

          <section style={{ marginTop: "30px" }}>
            {errosDetectados.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#888", border: "2px dashed #eee", borderRadius: "10px" }}>
                    {estaGravando ? "Ouvindo seu treino..." : "Clique em começar para treinar esta apresentação."}
                </div>
            ) : (
                errosDetectados.map((erro) => (
                <div key={erro.id} style={{ background: "#fff5f5", borderLeft: "5px solid #ff4d4d", padding: "15px", marginBottom: "10px", borderRadius: "4px" }}>
                    <p style={{ margin: "0", fontSize: "11px", color: "#999", textTransform: "uppercase" }}>IA Detectou:</p>
                    <p style={{ margin: "5px 0 0 0", fontWeight: "bold", color: "#cc0000" }}>⚠️ {erro.correcao}</p>
                </div>
                ))
            )}
          </section>

          <footer style={{ marginTop: "40px", textAlign: "center" }}>
            {!estaGravando ? (
              <button onClick={startRecording} className="button" style={{ padding: "12px 30px", fontSize: "1rem", cursor: "pointer" }}>Iniciar Treino</button>
            ) : (
              <button onClick={stopRecording} className="button" style={{ backgroundColor: "#ff4d4d", color: "white", padding: "12px 30px", fontSize: "1rem", cursor: "pointer", border: "none", borderRadius: "5px" }}>Finalizar e Ver Relatório</button>
            )}
          </footer>
        </>
      ) : (
        <div style={{ animation: "fadeIn 0.5s" }}>
          <h2 style={{ textAlign: "center", color: "#333" }}>Relatório Final</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", margin: "30px 0" }}>
            <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
              <p style={{ color: "#666", margin: "0" }}>Duração</p>
              <h3 style={{ fontSize: "2rem", margin: "10px 0" }}>{formatarTempo(tempo)}</h3>
            </div>
            <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
              <p style={{ color: "#666", margin: "0" }}>Erros</p>
              <h3 style={{ fontSize: "2rem", margin: "10px 0", color: "#ff4d4d" }}>{errosDetectados.length}</h3>
            </div>
          </div>
          <div style={{ background: "#e7f3ff", padding: "20px", borderRadius: "10px", marginBottom: "30px" }}>
            <h4 style={{ margin: "0 0 5px 0", color: "#0056b3" }}>🎯 Feedback</h4>
            <p style={{ margin: 0 }}>{gerarFeedback()}</p>
          </div>
          <button onClick={() => setTreinoFinalizado(false)} className="button" style={{ width: "100%", padding: "15px" }}>Voltar</button>
        </div>
      )}
    </div>
  )
}

export default TrainingMode
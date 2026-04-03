import { useState, useRef, useEffect } from "react"
import "./styles.css"

function Presentation() {
  const [errosDetectados, setErrosDetectados] = useState([])
  const [estaGravando, setEstaGravando] = useState(false)
  const [tempo, setTempo] = useState(0) // Estado para o cronômetro
  const isRecording = useRef(false)
  const mediaRecorderRef = useRef(null)
  const timerRef = useRef(null) // Referência para o intervalo do cronômetro

  // Função para formatar segundos em MM:SS
  const formatarTempo = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60)
    const segundos = totalSegundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    setErrosDetectados([])
    setTempo(0) 
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
    
    // Para o cronômetro
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
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

          try {
            const res = await fetch("http://localhost:3001/audio", {
              method: "POST",
              body: formData,
            })

            const data = await res.json()

            if (data.correcoes && data.correcoes.trim() !== "") {
              const novoErro = {
                id: Date.now(),
                ouvi: data.textoOriginal,
                correcao: data.correcoes
              }
              setErrosDetectados((prev) => [novoErro, ...prev])
            }
          } catch (err) {
            console.error("Erro na conexão:", err)
          }
          
          stream.getTracks().forEach(t => t.stop())
          resolve()
        }

        mediaRecorder.start()

        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop()
          }
        }, 10000)
      })
    } catch (err) {
      console.error("Erro microfone:", err)
      stopRecording()
    }
  }

  // Limpeza ao desmontar o componente
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <div className="header-presentation">
        <div className="title-presentation-content">
           Apresentação 
           <span style={{ color: estaGravando ? "red" : "#ccc", fontWeight: "bold", marginLeft: "10px" }}>
             {estaGravando ? "● Ao Vivo" : "OFFLINE"}
           </span>
        </div>
        {/* EXIBIÇÃO DO CRONÔMETRO AQUI */}
        <p style={{ fontWeight: "mono", fontSize: "1.2rem" }}>
          {formatarTempo(tempo)}
        </p>
      </div>

      <section style={{ marginTop: "30px" }}>
        {errosDetectados.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#888", border: "2px dashed #eee", borderRadius: "10px" }}>
            {estaGravando ? "Ouvindo... estarei em silêncio se tudo estiver certo." : "Clique em começar para iniciar o monitoramento."}
          </div>
        ) : (
          errosDetectados.map((erro) => (
            <div key={erro.id} style={{ background: "#fff5f5", borderLeft: "5px solid #ff4d4d", padding: "15px", marginBottom: "15px", borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#666" }}>Você disse: "{erro.ouvi}"</p>
              <p style={{ margin: 0, fontWeight: "bold", color: "#cc0000" }}>⚠️ {erro.correcao}</p>
            </div>
          ))
        )}
      </section>

      <footer style={{ marginTop: "40px", textAlign: "center" }}>
        {!estaGravando ? (
          <button onClick={startRecording} className="button">
            Começar Apresentação
          </button>
        ) : (
          <button onClick={stopRecording} className="button" style={{ backgroundColor: "#333" }}>
            Encerrar Apresentação
          </button>
        )}
      </footer>
    </div>
  )
}

export default Presentation
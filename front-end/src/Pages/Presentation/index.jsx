import { useState, useRef } from "react"
import "./styles.css"

function Presentation() {
  const [texto, setTexto] = useState("Texto de saída")
  const isRecording = useRef(false)

  const startRecording = async () => {
    isRecording.current = true

    while (isRecording.current) {
      await recordOnce()
    }
  }

  const stopRecording = () => {
    isRecording.current = false
  }

  const recordOnce = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)

    let chunks = []

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data)
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

          if (data.texto && data.texto.trim() !== "") {
            setTexto(
                `${data.texto}\n\n🤖 ${data.resposta}`
            )
        }

        } catch (err) {
          console.error(err)
        }

        resolve()
      }

      mediaRecorder.start()

      setTimeout(() => {
        mediaRecorder.stop()
      }, 5000) // ⏱️ grava 5 segundos
    })
  }

  return (
    <div className="content-presentation">
      <div className="header-presentation">
        <p className="title-presentation-content">Titulo da apresentação</p>
        <p>TEMPO</p>
      </div>

      <div className="output-content">
        <p>{texto}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={startRecording}>
          ▶️ Começar
        </button>
      </div>
    </div>
  )
}

export default Presentation
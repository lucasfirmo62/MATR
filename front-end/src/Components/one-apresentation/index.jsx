import { useState } from "react"
import "./styles.css"

function OneApresentation({ nome, sobre }) {
  const [abrirTreino, setAbrirTreino] = useState(false)

  return (
    <div
      onClick={() => setAbrirTreino(!abrirTreino)}
      style={{ cursor: "pointer" }}
    >
      {/* Sempre aparece */}
      <h3>{nome}</h3>

      {/* Abre ao clicar */}
      {abrirTreino && (
        <div className="treino-box">
          <p>{sobre}</p>
          <button>Continuar apresentação</button>
        </div>
      )}
    </div>
  )
}

export default OneApresentation
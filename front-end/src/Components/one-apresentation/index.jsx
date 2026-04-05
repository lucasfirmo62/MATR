import { useState } from "react"
import "./styles.css"
import { Link } from "react-router-dom"

function OneApresentation({ nome, sobre, linkTreino }) {
  const [abrirTreino, setAbrirTreino] = useState(false)

  return (
    <div 
      className="contnet-one-apresentation"
      onClick={() => setAbrirTreino(!abrirTreino)}
    >
        <div className="treino-box">
          <h3>{nome}</h3>
          <p>{sobre}</p>
          <Link 
                  to={`/treino/${linkTreino}`} 
                  className="button" 
                >
                  <button>Ver detalhes desta apresentação</button>
                </Link>
        </div>
    </div>
  )
}

export default OneApresentation
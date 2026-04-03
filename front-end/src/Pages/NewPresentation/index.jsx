import React, { useState } from "react"
import "./styles.css";
import { Link } from "react-router-dom"
import TrainingMode from "../Training"; 

function NewPresentation() {
  const [abrirTreino, setAbrirTreino] = useState(false)
  
  const [titulo, setTitulo] = useState("")
  const [sobre, setSobre] = useState("")
  const [modoTreinoAtivo, setModoTreinoAtivo] = useState(false)

  // Se o modo treino estiver ativo, renderiza o componente de treino passando os dados
  if (modoTreinoAtivo) {
    return <TrainingMode titulo={titulo} contexto={sobre} />
  }

  return (
    <>
      <header>MATR</header>

      <div className="content"> 
        
        <div className="new-apresentation"
          onClick={() => setAbrirTreino(!abrirTreino)}
          style={{ cursor: "pointer" }}
        >
          Treinar apresentação
        </div>

        {abrirTreino && (
          <div className="treino-box">
            <h2>Treinar apresentação</h2>

            <div className="content-inside">
              <h3>Título da Apresentação</h3>
              <input
                type="text"
                placeholder="Meu título..."
                className="title-training-input"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)} 
              />
            </div>

            <div className="content-inside">
              <h3>Descreva um pouco sobre a apresentação</h3>
              <textarea
                placeholder="Minha apresentação é sobre..."
                className="about-training-input"
                value={sobre}
                onChange={(e) => setSobre(e.target.value)} 
              />
            </div>

            <div 
              className="content-inside" 
              onClick={() => {
                if(titulo.trim() !== "") {
                  setModoTreinoAtivo(true);
                } else {
                  alert("Por favor, insira um título.");
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="button">Iniciar treino</div>
            </div>
          </div>
        )}

        <Link className="new-apresentation" to="/presentation" style={{ textDecoration: "none" }}>
          Apresentar agora
        </Link>
      </div>

      <footer></footer>
    </>
  )
}

export default NewPresentation
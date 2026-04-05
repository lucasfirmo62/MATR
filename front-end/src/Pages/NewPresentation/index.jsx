import React, { useState } from "react"
import "./styles.css";
import { Link } from "react-router-dom"
import TrainingMode from "../Training";

function NewPresentation() {
  const [abrirTreino, setAbrirTreino] = useState(false)

  const [titulo, setTitulo] = useState("")
  const [sobre, setSobre] = useState("")
  const [modoTreinoAtivo, setModoTreinoAtivo] = useState(false)

  if (modoTreinoAtivo) {
    return <TrainingMode titulo={titulo} contexto={sobre} />
  }

  return (
    <>
      <header>MATR</header>
      <div className="content-new-apresentation" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", marginTop: "50px" }}>

        <button
          className="button"
          onClick={() => setAbrirTreino(!abrirTreino)}
          style={{
            cursor: "pointer",
            display: "inline-block",
            padding: "10px",
            fontFamily: "Arial, Helvetica, sans-serif",
            backgroundColor: "#212123",
            width: "410px",
            border: "1px solid transparent",
            fontSize: "17px",
            color: "white",
            textDecoration: "none",
            textAlign: "center",
            boxSizing: "border-box"
          }}
        >
          Treinar apresentação
        </button>

        {abrirTreino && (
          <div className="treino-box" style={{ width: "410px" }}>
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
              <h3>Objetivo da apresentação</h3>
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
                if (titulo.trim() !== "") {
                  setModoTreinoAtivo(true);
                } else {
                  alert("Por favor, insira um título.");
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <button>Iniciar treino</button>
            </div>
          </div>
        )}

        <Link className="button" to="/presentation"
          style={{
            display: "inline-block",
            padding: "10px",
            fontFamily: "Arial, Helvetica, sans-serif",
            backgroundColor: "#212123",
            width: "410px",
            border: "1px solid transparent",
            fontSize: "17px",
            cursor: "pointer",
            color: "white",
            textDecoration: "none",
            textAlign: "center",
            boxSizing: "border-box"
          }}
        >

          <button>Apresentar agora</button>
          <div>
            <a className="about-live-now">Sem treino, não haverá salvamento de feedback, nem restringirá sua apresentação a um objetivo.</a>
          </div>
        </Link>
      </div>

      <footer></footer>
    </>
  )
}

export default NewPresentation
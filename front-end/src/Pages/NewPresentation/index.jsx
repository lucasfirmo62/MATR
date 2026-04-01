import React from "react"
import { useState } from "react"
import "./styles.css";


function NewPresentation() {

  const [abrirTreino, setAbrirTreino] = useState(false)

  return <>

    <header>
      MATR
    </header>

    <content>

      <div className="new-apresentation"
        onClick={() => setAbrirTreino(!abrirTreino)}
        style={{ cursor: "pointer" }}
      >
        Treinar apresentação
      </div>

      {abrirTreino && (
        <div className="treino-box">
          <h2>Treinar apresetnação</h2>

          <div className="content-inside">
            <h3>Título da Apresentação</h3>
            <input
              type="text"
              placeholder="Meu título..."
              className="title-training-input"
            />
          </div>

          <div className="content-inside">
            <h3>Descreva um pouco sobre a apresentação</h3>
            <textarea
              type="text"
              placeholder="Minha apresentação é sobre..."
              className="about-training-input"
            />
          </div>

          <button className="content-inside">
            <div className="button">Iniciar treino</div>
          </button>


        </div>
      )}

      <div className="new-apresentation">
        Iniciar Apresentação
      </div>

      <div className="load-presentation">

      </div>

    </content>

    <footer>

    </footer>

  </>
}

export default NewPresentation
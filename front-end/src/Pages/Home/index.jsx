import { useEffect, useState } from "react"
import "./styles.css"
import OneApresentation from "../../Components/one-apresentation"
import { Link } from "react-router-dom"

function Home() {
  const [apresentacoes, setApresentacoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:3001/treinos")
      .then((res) => res.json())
      .then((data) => {
        setApresentacoes(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Erro ao carregar treinos do banco:", err)
        setLoading(false)
      })
  }, [])

  return (
    <>
      <header>MATR</header>

      <div className="home-container">
        <Link 
          to="/new-presentation"
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
          <button>Criar nova apresentação</button>
        </Link>

        <div className="load-presentation">
          <h2 className="title-home-load">Apresentações Salvas</h2>

          {loading ? (
            <p style={{ textAlign: "center", marginTop: "20px" }}>Carregando treinos...</p>
          ) : apresentacoes.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
              Nenhum treino encontrado. Comece um agora!
            </p>
          ) : (
            apresentacoes.map((item) => (
              <div key={item._id} className="card"> {/* MongoDB usa _id */}
                <OneApresentation
                  nome={item.titulo}    
                  sobre={item.contexto} 
                  linkTreino={item._id}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <footer></footer>
    </>
  )
}

export default Home
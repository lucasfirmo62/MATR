import { useEffect, useState } from "react"
import "./styles.css"
import OneApresentation from "../../Components/one-apresentation"
import { Link } from "react-router-dom"


function Home() {
  const [apresentacoes, setApresentacoes] = useState([])

  useEffect(() => {
    fetch("http://api.npoint.io/cabda546cdb7459384d7")
      .then((res) => res.json())
      .then((data) => {
        setApresentacoes(data.apresentacoes)
      })
      .catch((err) => {
        console.error("Erro ao carregar API:", err)
      })
  }, [])

  return (
    <>
      <header>
        MATR
      </header>

      <div>

        <Link className="new-apresentation" to="/new-presentation">
          Criar nova apresentação
        </Link>

        <div className="load-presentation">

          <h2 className="title-home-load">Apresentações Salvas</h2>

          {apresentacoes.map((item) => (
            <div key={item.id} className="card">
              <OneApresentation
                nome={item.nome}
                sobre={item.sobre}
              />
            </div>
          ))}

        </div>

      </div>

      <footer></footer>
    </>
  )
}

export default Home
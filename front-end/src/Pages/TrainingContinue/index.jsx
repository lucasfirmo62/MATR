import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import "./styles.css"

function TreinoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [treino, setTreino] = useState(null)
  const [loading, setLoading] = useState(true)

  const formatarTempo = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60)
    const segundos = totalSegundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    fetch(`http://localhost:3001/treinos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTreino(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Erro ao carregar detalhes:", err)
        setLoading(false)
      })
  }, [id])

  const continuarTreino = () => {
    navigate("/training", { 
      state: { 
        titulo: treino.titulo, 
        contexto: treino.contexto 
      } 
    })
  }

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Carregando dados da apresentação...</div>
  if (!treino) return <div style={{ padding: "40px", textAlign: "center" }}>Apresentação não encontrada.</div>

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      
      <Link to="/" style={{ textDecoration: "none", color: "#007bff", fontSize: "14px" }}>
        ← Voltar para a Lista
      </Link>

      <div style={{ animation: "fadeIn 0.5s", marginTop: "20px" }}>
        <h1 style={{ textAlign: "center", color: "#333", marginBottom: "5px" }}>{treino.titulo}</h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>Estude suas correções e melhore sua performance</p>
        
        {/* DASHBOARD DE RESULTADOS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
          <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #eee" }}>
            <p style={{ color: "#888", fontSize: "12px", margin: "0", textTransform: "uppercase" }}>Última Duração</p>
            <h3 style={{ fontSize: "1.8rem", margin: "10px 0" }}>{formatarTempo(treino.tempoTotal)}</h3>
          </div>
          <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #eee" }}>
            <p style={{ color: "#888", fontSize: "12px", margin: "0", textTransform: "uppercase" }}>Erros na última vez</p>
            <h3 style={{ fontSize: "1.8rem", margin: "10px 0", color: "#ff4d4d" }}>{treino.erros.length}</h3>
          </div>
        </div>

        <div style={{ background: "#fffbe6", padding: "20px", borderRadius: "10px", border: "1px solid #ffe58f", marginBottom: "30px" }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#856404", display: "flex", alignItems: "center" }}>
            💡 Ideias e Correções para Estudar:
          </h4>
          {treino.erros.length === 0 ? (
            <p>Nenhuma correção pendente. Você foi muito bem!</p>
          ) : (
            treino.erros.map((erro) => (
              <div key={erro.id} style={{ marginBottom: "15px", paddingBottom: "10px", borderBottom: "1px solid #fff1b8" }}>
                <p style={{ margin: "0", fontSize: "11px", color: "#999" }}>VOCÊ DISSE:</p>
                <p style={{ margin: "2px 0 8px 0", fontSize: "14px" }}>"{erro.ouvi}"</p>
                <p style={{ margin: "0", fontSize: "11px", color: "#d4380d", fontWeight: "bold" }}>SUGESTÃO/CORREÇÃO:</p>
                <p style={{ margin: "2px 0 0 0", fontWeight: "bold", color: "#333" }}>{erro.correcao}</p>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button 
            onClick={continuarTreino} 
            className="button" 
            style={{ width: "100%"}}
          >
            🔄 Continuar Apresentação (Treinar Novamente)
          </button>
          
          <button 
            onClick={() => window.print()} 
            className="button" 
            style={{ width: "100%"}}
          >
            Imprimir Guia de Estudo
          </button>
        </div>
      </div>
    </div>
  )
}

export default TreinoDetalhes
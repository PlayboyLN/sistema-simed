import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import "../styles/pages.css"

export default function Produtos() {

  const navigate = useNavigate()

  const [nome, setNome] = useState("")
  const [itens, setItens] = useState([])

  useEffect(() => {
    carregarItens()
  }, [])

  async function carregarItens() {

    const { data, error } = await supabase
      .from("itens_bau")
      .select("*")
      .order("nome")

    if (!error) {
      setItens(data || [])
    }

  }

  async function adicionarItem() {

    if (!nome.trim()) {
      alert("Digite o nome do item.")
      return
    }

    const { error } = await supabase
      .from("itens_bau")
      .insert({
        nome: nome.trim()
      })

    if (error) {
        console.log(error)
        alert(error.message)
        return
    }

    setNome("")
    carregarItens()

  }

  async function excluirItem(id) {

    const confirmar = window.confirm("Deseja realmente excluir este item?")

    if (!confirmar) return

    await supabase
      .from("itens_bau")
      .delete()
      .eq("id", id)

    carregarItens()

  }

  return (

    <div className="page">

      <button
        className="back-btn"
        onClick={() => navigate("/dashboard")}
      >
        ← Voltar Dashboard
      </button>

      <h1>Itens do Baú</h1>

      <div className="page-card">

        <input
          className="input"
          placeholder="Nome do Item"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <button
          className="primary-btn"
          onClick={adicionarItem}
        >
          + Adicionar Item
        </button>

      </div>

      <div style={{ marginTop: "30px" }}>

        {itens.length === 0 && (

          <div className="product-card">

            Nenhum item cadastrado.

          </div>

        )}

        {itens.map((item) => (

          <div
            key={item.id}
            className="product-card"
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >

              <strong>

                📦 {item.nome}

              </strong>

              <button
                onClick={() => excluirItem(item.id)}
                style={{
                  background: "#d32f2f",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Excluir
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}
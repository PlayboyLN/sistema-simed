import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import { Droplet, Trash2, Plus, User, Calculator, RotateCcw } from "lucide-react"
import { dinheiro } from "../utils/formatar"
import "../styles/pages.css"
import "../pages/Dashboard.css"

export default function Lavagem() {
  const navigate = useNavigate()
  const usuario = localStorage.getItem("usuario")

  useEffect(() => {
    if (usuario !== "playboy") {
      navigate("/dashboard")
    }
  }, [usuario, navigate])

  const [clientes, setClientes] = useState(() => {
    const salvas = localStorage.getItem("lavagens_clientes")
    return salvas ? JSON.parse(salvas) : []
  })

  const [nome, setNome] = useState("")
  const [valor, setValor] = useState("")

  useEffect(() => {
    localStorage.setItem("lavagens_clientes", JSON.stringify(clientes))
  }, [clientes])

  function adicionarCliente(e) {
    e.preventDefault()
    if (!nome.trim() || !valor) {
      alert("Por favor, preencha o nome e o valor!")
      return
    }

    const valorBruto = Number(valor)
    const valorLiquido = valorBruto * 0.8

    const novo = {
      id: Date.now().toString(),
      nome: nome.trim(),
      valorBruto,
      valorLiquido
    }

    setClientes([novo, ...clientes])
    setNome("")
    setValor("")
  }

  function removerCliente(id) {
    if (window.confirm("Deseja realmente remover este registro?")) {
      setClientes(clientes.filter(c => c.id !== id))
    }
  }

  function zerarLavagens() {
    if (window.confirm("Deseja realmente ZERAR todos os registros de lavagens do dia?\nEsta ação é irreversível.")) {
      setClientes([])
    }
  }

  const totalBruto = clientes.reduce((acc, c) => acc + c.valorBruto, 0)
  const totalLiquido = clientes.reduce((acc, c) => acc + c.valorLiquido, 0)

  if (usuario !== "playboy") {
    return null
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="content">
        <Topbar />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "10px", color: "#fff" }}>
              <Droplet color="#3b82f6" size={30} /> Controle de Lavagem
            </h1>
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>Gerencie os serviços de lavagem do dia e as comissões calculadas automaticamente</span>
          </div>

          {clientes.length > 0 && (
            <button
              onClick={zerarLavagens}
              className="danger-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: "700",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              <RotateCcw size={16} /> Zerar Lavagens
            </button>
          )}
        </div>

        {/* INDICADORES CHAVE (KPIs) */}
        <div className="cards-grid" style={{ marginBottom: "25px" }}>
          <div className="stat-card" style={{ borderTop: "4px solid #3b82f6" }}>
            <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "600" }}>Valor Lavado Total (Bruto)</span>
            <h1 style={{ color: "#3b82f6", fontSize: "32px", fontWeight: "900", marginTop: "8px", marginBottom: 0 }}>
              R$ {dinheiro(totalBruto)}
            </h1>
          </div>

          <div className="stat-card" style={{ borderTop: "4px solid #10b981" }}>
            <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "600" }}>Total a Pagar (Líquido -20%)</span>
            <h1 style={{ color: "#10b981", fontSize: "32px", fontWeight: "900", marginTop: "8px", marginBottom: 0 }}>
              R$ {dinheiro(totalLiquido)}
            </h1>
          </div>

          <div className="stat-card" style={{ borderTop: "4px solid #ffc107" }}>
            <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "600" }}>Lavagens Efetuadas</span>
            <h1 style={{ color: "#ffc107", fontSize: "32px", fontWeight: "900", marginTop: "8px", marginBottom: 0 }}>
              {clientes.length} <span style={{ fontSize: "16px", color: "#9ca3af", fontWeight: "normal" }}>serviços</span>
            </h1>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "25px", alignItems: "start" }}>
          {/* COLUNA ESQUERDA: CADASTRO */}
          <div className="card" style={{ padding: "25px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "#fff" }}>
              <Plus size={20} color="#3b82f6" /> Nova Lavagem
            </h2>

            <form onSubmit={adicionarCliente}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                  Nome do Cliente:
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Souza"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={{ fontSize: "15px", padding: "10px" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                  Valor da Lavagem (R$):
                </label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  placeholder="Ex: 100"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  style={{ fontSize: "15px", padding: "10px" }}
                />
                {valor && (
                  <div style={{ marginTop: "12px", background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: "13px", color: "#10b981", fontWeight: "bold" }}>
                    Valor a pagar (-20%): R$ {dinheiro(Number(valor) * 0.8)}
                  </div>
                )}
              </div>

              <button type="submit" className="primary-btn" style={{ width: "100%", padding: "14px", fontWeight: "bold" }}>
                Adicionar Registro
              </button>
            </form>
          </div>

          {/* COLUNA DIREITA: LISTAGEM */}
          <div className="card" style={{ padding: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px", color: "#fff", margin: 0 }}>
                <User size={20} color="#ffc107" /> Lavagens Registradas
              </h2>
            </div>

            <div style={{ maxHeight: "380px", overflowY: "auto", paddingRight: "5px" }}>
              {clientes.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 18px",
                    border: "1px solid #2a2a36",
                    background: "#101015",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                  }}
                >
                  <div>
                    <strong style={{ color: "#fff", fontSize: "16px" }}>{c.nome}</strong>
                    <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px", display: "flex", gap: "10px", alignItems: "center" }}>
                      <span>Bruto: R$ {dinheiro(c.valorBruto)}</span>
                      <span style={{ color: "#3b82f6" }}>•</span>
                      <span style={{ color: "#10b981", fontWeight: "bold" }}>A pagar: R$ {dinheiro(c.valorLiquido)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removerCliente(c.id)}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Remover Registro"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              {clientes.length === 0 && (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <Calculator size={40} style={{ opacity: 0.3 }} />
                  <p style={{ margin: 0 }}>Nenhuma lavagem registrada para hoje.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

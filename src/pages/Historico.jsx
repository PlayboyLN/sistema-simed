import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { dbService } from "../services/db"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import { dinheiro } from "../utils/formatar"
import { History, Search, Eye, RotateCcw, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import "../styles/pages.css"
import "../pages/Dashboard.css"

export default function Historico() {
  const navigate = useNavigate()
  const [vendas, setVendas] = useState([])
  const [busca, setBusca] = useState("")
  const [vendaSelecionada, setVendaSelecionada] = useState(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const list = await dbService.getVendas()
    setVendas(list)
  }

  const vendasFiltradas = vendas.filter(v =>
    String(v.id).toLowerCase().includes(busca.toLowerCase()) ||
    v.usuario.toLowerCase().includes(busca.toLowerCase()) ||
    (v.forma_pagamento && v.forma_pagamento.toLowerCase().includes(busca.toLowerCase()))
  )

  async function estornar(vendaId) {
    const confirmacao = window.confirm(
      "Deseja realmente ESTORNAR esta venda?\n\nEsta ação irá devolver os produtos ao estoque, subtrair da quantidade vendida e devolver o valor ao caixa."
    )

    if (!confirmacao) return

    const ok = await dbService.estornarVenda(vendaId)
    if (ok) {
      alert("Venda estornada com sucesso!")
      setVendaSelecionada(null)
      carregar()
    } else {
      alert("Não foi possível estornar esta venda ou ela já foi estornada anteriormente.")
    }
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="content">
        <Topbar />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <History color="#ffc107" size={28} /> Histórico de Vendas
            </h1>
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>Consulte vendas realizadas, comprovantes e faça estornos quando necessário</span>
          </div>
        </div>

        {/* BUSCA */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div style={{ position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "#9ca3af" }} />
            <input
              className="input"
              style={{ paddingLeft: "42px" }}
              placeholder="Buscar por código de venda, usuário ou forma de pagamento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {/* LISTA DE VENDAS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {vendasFiltradas.map((venda) => (
            <div
              key={venda.id}
              className="product-card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
                opacity: venda.estornada ? 0.6 : 1,
                borderLeft: venda.estornada ? "4px solid #ef4444" : "4px solid #10b981"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "17px", color: "#fff" }}>
                    Venda #{venda.id}
                  </strong>
                  <span className={`badge ${venda.estornada ? "badge-danger" : "badge-success"}`}>
                    {venda.estornada ? "Estornada" : "Concluída"}
                  </span>
                  <span className="badge badge-info">
                    {venda.forma_pagamento}
                  </span>
                </div>

                <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                  Operador: <strong style={{ color: "#fff" }}>{venda.usuario}</strong> • {new Date(venda.created_at).toLocaleString("pt-BR")}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", color: "#9ca3af", display: "block" }}>Itens:</span>
                  <strong style={{ fontSize: "16px", color: "#fff" }}>
                    {venda.itens ? venda.itens.reduce((a, b) => a + b.quantidade, 0) : 0} unidades
                  </strong>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", color: "#9ca3af", display: "block" }}>Valor Total:</span>
                  <strong style={{ fontSize: "20px", color: "#ffc107" }}>
                    R$ {dinheiro(venda.total)}
                  </strong>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="secondary-btn"
                    style={{ padding: "8px 14px", fontSize: "13px" }}
                    onClick={() => setVendaSelecionada(venda)}
                  >
                    <Eye size={16} /> Ver Itens
                  </button>

                  {!venda.estornada && (
                    <button
                      className="danger-btn"
                      style={{ padding: "8px 14px", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                      onClick={() => estornar(venda.id)}
                    >
                      <RotateCcw size={14} /> Estornar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {vendasFiltradas.length === 0 && (
            <div className="card" style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>
              Nenhuma venda encontrada no histórico.
            </div>
          )}
        </div>

        {/* MODAL DE DETALHES DA VENDA */}
        {vendaSelecionada && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #2a2a36", pb: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", color: "#fff" }}>
                  Detalhes da Venda #{vendaSelecionada.id}
                </h3>
                <span className={`badge ${vendaSelecionada.estornada ? "badge-danger" : "badge-success"}`}>
                  {vendaSelecionada.estornada ? "Estornada" : "Concluída"}
                </span>
              </div>

              <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "15px" }}>
                <div>Operador: <strong style={{ color: "#fff" }}>{vendaSelecionada.usuario}</strong></div>
                <div>Data/Hora: <strong style={{ color: "#fff" }}>{new Date(vendaSelecionada.created_at).toLocaleString("pt-BR")}</strong></div>
                <div>Forma de Pagamento: <strong style={{ color: "#ffc107" }}>{vendaSelecionada.forma_pagamento}</strong></div>
              </div>

              <div style={{ background: "#101015", padding: "14px", borderRadius: "10px", marginBottom: "20px" }}>
                <strong style={{ color: "#ffc107", display: "block", marginBottom: "8px", fontSize: "14px" }}>
                  Produtos Vendidos:
                </strong>
                {vendaSelecionada.itens && vendaSelecionada.itens.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #222", fontSize: "14px" }}>
                    <span>{item.quantidade}x {item.nome} (R$ {dinheiro(item.preco_unitario)})</span>
                    <strong style={{ color: "#fff" }}>R$ {dinheiro(item.preco_unitario * item.quantidade)}</strong>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #2a2a36", paddingTop: "10px", marginTop: "10px", fontSize: "16px", fontWeight: "bold" }}>
                  <span>Total:</span>
                  <span style={{ color: "#ffc107" }}>R$ {dinheiro(vendaSelecionada.total)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setVendaSelecionada(null)}>
                  Fechar
                </button>
                {!vendaSelecionada.estornada && (
                  <button className="danger-btn" style={{ flex: 1 }} onClick={() => estornar(vendaSelecionada.id)}>
                    Estornar Venda
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
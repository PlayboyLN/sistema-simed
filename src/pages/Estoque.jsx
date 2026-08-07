import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { dbService } from "../services/db"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import { dinheiro } from "../utils/formatar"
import { Boxes, Search, PlusCircle, AlertTriangle, TrendingUp, DollarSign, PackageCheck } from "lucide-react"
import "../styles/pages.css"
import "../pages/Dashboard.css"

export default function Estoque() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos") // 'todos', 'baixo', 'zerado'
  const [modalAjuste, setModalAjuste] = useState(null)
  const [qtdAdicionar, setQtdAdicionar] = useState("")

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const data = await dbService.getProdutos()
    setProdutos(data)
  }

  const produtosFiltrados = produtos.filter((p) => {
    const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.codigo_barras && p.codigo_barras.includes(busca))

    if (!bateBusca) return false

    if (filtroStatus === "baixo") return p.estoque > 0 && p.estoque <= 5
    if (filtroStatus === "zerado") return p.estoque <= 0
    return true
  })

  // Totais
  const totalUnidadesEstoque = produtos.reduce((acc, p) => acc + Number(p.estoque || 0), 0)
  const totalQuantidadeVendida = produtos.reduce((acc, p) => acc + Number(p.quantidade_vendida || 0), 0)
  const valorTotalCusto = produtos.reduce((acc, p) => acc + (Number(p.preco_compra || 0) * Number(p.estoque || 0)), 0)
  const valorTotalVenda = produtos.reduce((acc, p) => acc + (Number(p.preco_venda || 0) * Number(p.estoque || 0)), 0)

  async function salvarAjusteEstoque() {
    if (!qtdAdicionar || isNaN(Number(qtdAdicionar))) {
      alert("Informe uma quantidade válida.")
      return
    }

    const incremento = Number(qtdAdicionar)
    const novoEstoque = Math.max(0, (modalAjuste.estoque || 0) + incremento)

    await dbService.updateProduto(modalAjuste.id, { estoque: novoEstoque })
    alert(`Estoque do produto "${modalAjuste.nome}" atualizado para ${novoEstoque} unidades!`)
    setModalAjuste(null)
    setQtdAdicionar("")
    carregar()
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="content">
        <Topbar />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <Boxes color="#ffc107" size={28} /> Controle de Estoque
            </h1>
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>Acompanhe o estoque disponível, quantidade vendida e reposição de produtos</span>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/produtos")}
          >
            + Cadastrar Produto
          </button>
        </div>

        {/* ESTATÍSTICAS DO ESTOQUE */}
        <div className="cards-grid">
          <div className="stat-card">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <PackageCheck size={16} color="#10b981" /> Itens em Estoque
            </span>
            <h1 style={{ fontSize: "32px", fontWeight: "800", marginTop: "8px" }}>
              {totalUnidadesEstoque.toLocaleString("pt-BR")} <span style={{ fontSize: "16px", color: "#9ca3af" }}>unidades</span>
            </h1>
          </div>

          <div className="stat-card">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp size={16} color="#ffc107" /> Total Vendido (Acumulado)
            </span>
            <h1 style={{ fontSize: "32px", fontWeight: "800", marginTop: "8px", color: "#ffc107" }}>
              {totalQuantidadeVendida.toLocaleString("pt-BR")} <span style={{ fontSize: "16px", color: "#9ca3af" }}>vendidos</span>
            </h1>
          </div>

          <div className="stat-card">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <DollarSign size={16} color="#3b82f6" /> Valor em Estoque (Custo)
            </span>
            <h1 style={{ fontSize: "32px", fontWeight: "800", marginTop: "8px", color: "#3b82f6" }}>
              R$ {dinheiro(valorTotalCusto)}
            </h1>
          </div>

          <div className="stat-card">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <DollarSign size={16} color="#10b981" /> Potencial em Venda
            </span>
            <h1 style={{ fontSize: "32px", fontWeight: "800", marginTop: "8px", color: "#10b981" }}>
              R$ {dinheiro(valorTotalVenda)}
            </h1>
          </div>
        </div>

        {/* BARRA DE PESQUISA E FILTROS */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "#9ca3af" }} />
              <input
                className="input"
                style={{ paddingLeft: "42px" }}
                placeholder="Pesquisar produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { id: "todos", label: "Todos" },
                { id: "baixo", label: "Estoque Baixo (≤100)" },
                { id: "zerado", label: "Sem Estoque" }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="secondary-btn"
                  style={{
                    background: filtroStatus === f.id ? "#ffc107" : "#101015",
                    color: filtroStatus === f.id ? "#000" : "#fff",
                    border: filtroStatus === f.id ? "none" : "1px solid #2a2a36"
                  }}
                  onClick={() => setFiltroStatus(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LISTA DE PRODUTOS E ESTOQUE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {produtosFiltrados.map((produto) => {
            const semEstoque = produto.estoque <= 0
            const estoqueBaixo = produto.estoque > 0 && produto.estoque <= 5

            return (
              <div
                key={produto.id}
                className="product-card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "16px", color: "#fff" }}>{produto.nome}</strong>
                    <span className={`badge ${semEstoque ? "badge-danger" : estoqueBaixo ? "badge-warning" : "badge-success"}`}>
                      {semEstoque ? "Sem Estoque" : estoqueBaixo ? "Estoque Baixo" : "Normal"}
                    </span>
                  </div>

                  <div style={{ fontSize: "13px", color: "#9ca3af", display: "flex", gap: "15px" }}>
                    <span>Preço Custo: <strong style={{ color: "#fff" }}>R$ {dinheiro(produto.preco_compra)}</strong></span>
                    <span>Preço Venda: <strong style={{ color: "#ffc107" }}>R$ {dinheiro(produto.preco_venda)}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "#9ca3af", display: "block" }}>Estoque Atual:</span>
                    <strong style={{ fontSize: "20px", color: semEstoque ? "#ef4444" : "#fff" }}>
                      {produto.estoque || 0} un
                    </strong>
                  </div>

                  <div style={{ textAlign: "right", background: "rgba(255, 193, 7, 0.08)", padding: "8px 14px", borderRadius: "10px", border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                    <span style={{ fontSize: "12px", color: "#ffc107", display: "block", fontWeight: "600" }}>Quantidade Vendida:</span>
                    <strong style={{ fontSize: "20px", color: "#ffc107" }}>
                      {produto.quantidade_vendida || 0} un
                    </strong>
                  </div>

                  <button
                    className="secondary-btn"
                    style={{ padding: "8px 14px", fontSize: "13px" }}
                    onClick={() => setModalAjuste(produto)}
                  >
                    <PlusCircle size={16} color="#ffc107" /> Reabastecer
                  </button>
                </div>
              </div>
            )
          })}

          {produtosFiltrados.length === 0 && (
            <div className="card" style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>
              Nenhum produto encontrado no estoque com os filtros selecionados.
            </div>
          )}
        </div>

        {/* MODAL DE REABASTECIMENTO / AJUSTE RÁPIDO */}
        {modalAjuste && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ margin: "0 0 15px 0", fontSize: "20px", color: "#fff" }}>
                Reabastecer Estoque - {modalAjuste.nome}
              </h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "15px" }}>
                Estoque atual: <strong style={{ color: "#fff" }}>{modalAjuste.estoque} un</strong>
              </p>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "600" }}>Quantidade a Adicionar (ou subtrair se negativo):</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Ex: 10"
                  value={qtdAdicionar}
                  onChange={(e) => setQtdAdicionar(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="primary-btn"
                  style={{ flex: 1 }}
                  onClick={salvarAjusteEstoque}
                >
                  Salvar Estoque
                </button>
                <button
                  className="secondary-btn"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setModalAjuste(null)
                    setQtdAdicionar("")
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
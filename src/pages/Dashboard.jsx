import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { dbService } from "../services/db"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import { dinheiro } from "../utils/formatar"
import { ShoppingCart, Wallet, Boxes, TrendingUp, Plus, RefreshCw, AlertCircle } from "lucide-react"
import "./Dashboard.css"
import "../styles/pages.css"

export default function Dashboard() {
  const navigate = useNavigate()
  const usuario = localStorage.getItem("usuario") || "Operador"

  const [faturamentoTotal, setFaturamentoTotal] = useState(0)
  const [saldoCaixa, setSaldoCaixa] = useState(0)
  const [totalQtdVendida, setTotalQtdVendida] = useState(0)
  const [produtos, setProdutos] = useState([])
  const [ultimasVendas, setUltimasVendas] = useState([])
  const [ultimasMovs, setUltimasMovs] = useState([])

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const listaProdutos = await dbService.getProdutos()
    const listaVendas = await dbService.getVendas()
    const saldo = await dbService.getSaldoCaixa()
    const movs = await dbService.getMovimentacoesCaixa()

    setProdutos(listaProdutos)
    setSaldoCaixa(saldo)

    // Faturamento total (vendas não estornadas)
    const totalFat = listaVendas
      .filter(v => !v.estornada)
      .reduce((acc, v) => acc + Number(v.total || 0), 0)
    setFaturamentoTotal(totalFat)

    // Quantidade total vendida acumulada
    const totalQtd = listaProdutos.reduce((acc, p) => acc + Number(p.quantidade_vendida || 0), 0)
    setTotalQtdVendida(totalQtd)

    setUltimasVendas(listaVendas.slice(0, 5))
    setUltimasMovs(movs.slice(0, 5))
  }

  async function zerarSistema() {
    if (usuario !== "admin") return

    const confirmar = window.confirm(
      "Deseja realmente ZERAR as vendas, movimentações de caixa e contadores de quantidade vendida?\n\nEsta ação é irreversível."
    )

    if (!confirmar) return

    await dbService.zerarDados(usuario)
    alert("Sistema de vendas e caixa zerado com sucesso.")
    carregar()
  }

  // Top produtos mais vendidos
  const produtosOrdenadosPorVendas = [...produtos]
    .sort((a, b) => (b.quantidade_vendida || 0) - (a.quantidade_vendida || 0))
    .slice(0, 6)

  const maxVendas = Math.max(...produtos.map(p => p.quantidade_vendida || 0), 1)

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="content">
        <Topbar />

        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 5px 0", color: "#fff" }}>
            Visão Geral de Vendas & Caixa
          </h1>
          <p style={{ color: "#9ca3af", margin: 0 }}>
            Acompanhe o desempenho do seu negócio em tempo real
          </p>
        </div>

        {/* INDICADORES CHAVE (KPIs) */}
        <div className="cards-grid">
          <div className="stat-card" style={{ borderTop: "4px solid #10b981" }}>
            <span>Faturamento Total (Vendas)</span>
            <h1 style={{ color: "#10b981", fontSize: "34px", fontWeight: "900" }}>
              R$ {dinheiro(faturamentoTotal)}
            </h1>
          </div>

          <div className="stat-card" style={{ borderTop: "4px solid #ffc107" }}>
            <span>Saldo Atual no Caixa</span>
            <h1 style={{ color: "#ffc107", fontSize: "34px", fontWeight: "900" }}>
              R$ {dinheiro(saldoCaixa)}
            </h1>
          </div>

          <div className="stat-card" style={{ borderTop: "4px solid #3b82f6" }}>
            <span>Quantidade Total Vendida</span>
            <h1 style={{ color: "#3b82f6", fontSize: "34px", fontWeight: "900" }}>
              {totalQtdVendida.toLocaleString("pt-BR")} <span style={{ fontSize: "16px", color: "#9ca3af" }}>itens</span>
            </h1>
          </div>

          <div className="stat-card" style={{ borderTop: "4px solid #8b5cf6" }}>
            <span>Produtos Cadastrados</span>
            <h1 style={{ color: "#fff", fontSize: "34px", fontWeight: "900" }}>
              {produtos.length} <span style={{ fontSize: "16px", color: "#9ca3af" }}>produtos</span>
            </h1>
          </div>
        </div>

        {/* ATALHOS RÁPIDOS */}
        <div className="card" style={{ marginBottom: "25px" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#9ca3af" }}>Ações Rápidas</h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="primary-btn" onClick={() => navigate("/venda")}>
              <ShoppingCart size={18} /> Nova Venda (PDV)
            </button>
            <button className="secondary-btn" onClick={() => navigate("/caixa")}>
              <Wallet size={18} /> Acessar Caixa
            </button>
            <button className="secondary-btn" onClick={() => navigate("/estoque")}>
              <Boxes size={18} /> Repor Estoque
            </button>
            <button className="secondary-btn" onClick={() => navigate("/produtos")}>
              <Plus size={18} /> Cadastrar Produto
            </button>

            {usuario === "admin" && (
              <button
                className="danger-btn"
                style={{ marginLeft: "auto" }}
                onClick={zerarSistema}
              >
                🗑️ Zerar Vendas / Caixa
              </button>
            )}
          </div>
        </div>

        {/* GRÁFICO DE TOP PRODUTOS MAIS VENDIDOS */}
        <div className="grafico" style={{ marginBottom: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={22} color="#ffc107" /> Produtos Mais Vendidos (Quantidade Vendida)
            </h2>
            <button className="secondary-btn" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => navigate("/estoque")}>
              Ver Estoque Completo
            </button>
          </div>

          {produtosOrdenadosPorVendas.map((produto) => {
            const perc = Math.min(100, Math.round(((produto.quantidade_vendida || 0) / maxVendas) * 100))

            return (
              <div key={produto.id} className="grafico-item">
                <div className="produto-nome" title={produto.nome}>
                  {produto.nome}
                </div>
                <div className="barra">
                  <div className="fill" style={{ width: `${perc}%` }} />
                </div>
                <div style={{ textAlign: "right", fontWeight: "bold", color: "#ffc107" }}>
                  {produto.quantidade_vendida || 0} un
                </div>
              </div>
            )
          })}

          {produtos.length === 0 && (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>
              Nenhum produto cadastrado para exibir no gráfico.
            </div>
          )}
        </div>

        {/* ÚLTIMAS VENDAS E ATIVIDADE DO CAIXA */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="card">
            <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#fff" }}>
              Últimas Vendas Realizadas
            </h3>
            {ultimasVendas.map((v) => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #252533" }}>
                <div>
                  <strong style={{ color: "#fff" }}>Venda #{v.id}</strong> ({v.forma_pagamento})
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {v.usuario} • {new Date(v.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <strong style={{ color: v.estornada ? "#ef4444" : "#10b981", fontSize: "16px" }}>
                  {v.estornada ? "[Estornada]" : `R$ ${dinheiro(v.total)}`}
                </strong>
              </div>
            ))}
            {ultimasVendas.length === 0 && (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>Nenhuma venda realizada ainda.</div>
            )}
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#fff" }}>
              Últimas Movimentações do Caixa
            </h3>
            {ultimasMovs.map((m) => {
              const eEntrada = m.tipo === "venda" || m.tipo === "suprimento" || m.tipo === "entrada"
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #252533" }}>
                  <div>
                    <strong style={{ color: "#fff" }}>{m.descricao}</strong>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {m.usuario} • {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <strong style={{ color: eEntrada ? "#10b981" : "#ef4444", fontSize: "15px" }}>
                    {eEntrada ? "+" : "-"} R$ {dinheiro(m.valor)}
                  </strong>
                </div>
              )
            })}
            {ultimasMovs.length === 0 && (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>Nenhuma movimentação registrada.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
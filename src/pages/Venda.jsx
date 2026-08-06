import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { dbService } from "../services/db"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import { dinheiro } from "../utils/formatar"
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, Search, DollarSign, CreditCard, QrCode } from "lucide-react"
import "../styles/pages.css"
import "../pages/Dashboard.css"

export default function Venda() {
  const navigate = useNavigate()
  const usuario = localStorage.getItem("usuario") || "Operador"

  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState("")
  const [carrinho, setCarrinho] = useState([])
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro")
  const [valorRecebido, setValorRecebido] = useState("")
  const [desconto, setDesconto] = useState(0)
  const [vendaConcluida, setVendaConcluida] = useState(null)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    carregarProdutos()
  }, [])

  async function carregarProdutos() {
    const lista = await dbService.getProdutos()
    setProdutos(lista)
  }

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.codigo_barras && p.codigo_barras.includes(busca))
  )

  function adicionarAoCarrinho(produto) {
    if (produto.estoque <= 0) {
      alert(`O produto "${produto.nome}" está sem estoque!`)
      return
    }

    const itemExistente = carrinho.find(item => item.produto_id === produto.id)
    if (itemExistente) {
      if (itemExistente.quantidade >= produto.estoque) {
        alert(`Quantidade máxima em estoque atingida (${produto.estoque} un) para "${produto.nome}".`)
        return
      }
      setCarrinho(carrinho.map(item =>
        item.produto_id === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ))
    } else {
      setCarrinho([
        ...carrinho,
        {
          produto_id: produto.id,
          nome: produto.nome,
          preco_unitario: produto.preco_venda,
          quantidade: 1,
          estoque_disponivel: produto.estoque
        }
      ])
    }
  }

  function alterarQuantidade(produto_id, delta) {
    setCarrinho(carrinho.map(item => {
      if (item.produto_id === produto_id) {
        const novaQtd = item.quantidade + delta
        if (novaQtd > item.estoque_disponivel) {
          alert(`Quantidade disponível em estoque: ${item.estoque_disponivel}`)
          return item
        }
        return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null
      }
      return item
    }).filter(Boolean))
  }

  function removerItem(produto_id) {
    setCarrinho(carrinho.filter(item => item.produto_id !== produto_id))
  }

  const subtotal = carrinho.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0)
  const total = Math.max(0, subtotal - Number(desconto || 0))
  const valRecebidoNum = Number(valorRecebido || 0)
  const troco = formaPagamento === "Dinheiro" && valRecebidoNum > total ? valRecebidoNum - total : 0

  async function finalizarVenda() {
    if (carrinho.length === 0) {
      alert("O carrinho está vazio!")
      return
    }

    if (formaPagamento === "Dinheiro" && valRecebidoNum < total) {
      alert(`O valor recebido (R$ ${dinheiro(valRecebidoNum)}) é inferior ao total da venda (R$ ${dinheiro(total)}).`)
      return
    }

    setProcessando(true)
    try {
      const venda = await dbService.registrarVenda({
        usuario,
        itens: carrinho,
        formaPagamento,
        valorRecebido: valRecebidoNum || total,
        desconto: Number(desconto) || 0
      })

      setVendaConcluida(venda)
      setCarrinho([])
      setValorRecebido("")
      setDesconto(0)
      await carregarProdutos()
    } catch (e) {
      console.error(e)
      alert("Erro ao finalizar a venda. Tente novamente.")
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="content">
        <Topbar />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <ShoppingCart color="#ffc107" size={28} /> Ponto de Venda (PDV)
            </h1>
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>Registre vendas com atualização automática de estoque e quantidade vendida</span>
          </div>
        </div>

        <div className="pdv-container">
          {/* PAINEL ESQUERDO: LISTA DE PRODUTOS */}
          <div>
            <div className="card" style={{ marginBottom: "20px" }}>
              <div style={{ position: "relative" }}>
                <Search size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "#9ca3af" }} />
                <input
                  className="input"
                  style={{ paddingLeft: "42px" }}
                  placeholder="Pesquisar produto por nome ou código de barras..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            <div className="pdv-products-grid">
              {produtosFiltrados.map((produto) => {
                const semEstoque = produto.estoque <= 0
                return (
                  <div
                    key={produto.id}
                    className="pdv-item-card"
                    style={{
                      opacity: semEstoque ? 0.6 : 1,
                      border: semEstoque ? "1px solid #ef4444" : "1px solid #2a2a36"
                    }}
                    onClick={() => !semEstoque && adicionarAoCarrinho(produto)}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "700", fontSize: "15px", color: "#fff" }}>
                          {produto.nome}
                        </span>
                      </div>
                      <span className={`badge ${semEstoque ? "badge-danger" : produto.estoque <= 5 ? "badge-warning" : "badge-success"}`}>
                        {semEstoque ? "Esgotado" : `Estoque: ${produto.estoque}`}
                      </span>
                    </div>

                    <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "18px", fontWeight: "800", color: "#ffc107" }}>
                        R$ {dinheiro(produto.preco_venda)}
                      </span>
                      <button
                        className="qty-btn"
                        disabled={semEstoque}
                        title="Adicionar ao Carrinho"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}

              {produtosFiltrados.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                  Nenhum produto encontrado com a busca "{busca}".
                </div>
              )}
            </div>
          </div>

          {/* PAINEL DIREITO: CARRINHO E CHECKOUT */}
          <div className="pdv-cart">
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #2a2a36", pb: "10px" }}>
              <ShoppingCart size={22} color="#ffc107" /> Carrinho ({carrinho.reduce((a, c) => a + c.quantidade, 0)})
            </h2>

            {carrinho.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 10px", color: "#9ca3af" }}>
                <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: "10px" }} />
                <p style={{ margin: 0 }}>Selecione um produto ao lado para iniciar a venda.</p>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: "280px", overflowY: "auto", marginBottom: "15px" }}>
                  {carrinho.map((item) => (
                    <div key={item.produto_id} className="cart-item">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", fontSize: "14px", color: "#fff" }}>
                          {item.nome}
                        </div>
                        <div style={{ fontSize: "13px", color: "#ffc107" }}>
                          R$ {dinheiro(item.preco_unitario)} x {item.quantidade} = <strong>R$ {dinheiro(item.preco_unitario * item.quantidade)}</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button className="qty-btn" onClick={() => alterarQuantidade(item.produto_id, -1)}>-</button>
                        <span style={{ fontWeight: "bold", width: "20px", textAlign: "center" }}>{item.quantidade}</span>
                        <button className="qty-btn" onClick={() => alterarQuantidade(item.produto_id, 1)}>+</button>
                        <button
                          onClick={() => removerItem(item.produto_id)}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "6px" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#101015", padding: "16px", borderRadius: "12px", marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#9ca3af" }}>
                    <span>Subtotal:</span>
                    <span>R$ {dinheiro(subtotal)}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "14px", color: "#9ca3af" }}>Desconto (R$):</span>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      style={{ width: "100px", padding: "6px 10px", fontSize: "14px", textAlign: "right" }}
                      value={desconto}
                      onChange={(e) => setDesconto(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #2a2a36", paddingTop: "10px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>TOTAL:</span>
                    <span style={{ fontSize: "22px", fontWeight: "900", color: "#ffc107" }}>
                      R$ {dinheiro(total)}
                    </span>
                  </div>
                </div>

                {/* FORMA DE PAGAMENTO */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                    Forma de Pagamento:
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {[
                      { id: "Dinheiro", label: "Dinheiro", icon: DollarSign },
                      { id: "PIX", label: "PIX", icon: QrCode },
                      { id: "Cartao_Credito", label: "Crédito", icon: CreditCard },
                      { id: "Cartao_Debito", label: "Débito", icon: CreditCard }
                    ].map((pg) => {
                      const Icon = pg.icon
                      const selected = formaPagamento === pg.id
                      return (
                        <button
                          key={pg.id}
                          type="button"
                          onClick={() => setFormaPagamento(pg.id)}
                          style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: selected ? "2px solid #ffc107" : "1px solid #2a2a36",
                            background: selected ? "rgba(255, 193, 7, 0.1)" : "#101015",
                            color: selected ? "#ffc107" : "#fff",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          <Icon size={14} /> {pg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {formaPagamento === "Dinheiro" && (
                  <div style={{ marginBottom: "15px", background: "#101015", padding: "12px", borderRadius: "10px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#9ca3af", flex: 1 }}>Valor Recebido (R$):</span>
                      <input
                        type="number"
                        className="input"
                        style={{ width: "120px", padding: "6px 10px", textAlign: "right" }}
                        placeholder={total.toFixed(2)}
                        value={valorRecebido}
                        onChange={(e) => setValorRecebido(e.target.value)}
                      />
                    </div>
                    {valRecebidoNum > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold", color: troco > 0 ? "#10b981" : "#fff" }}>
                        <span>Troco:</span>
                        <span>R$ {dinheiro(troco)}</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="primary-btn"
                  style={{ width: "100%", padding: "16px", fontSize: "16px" }}
                  onClick={finalizarVenda}
                  disabled={processando}
                >
                  {processando ? "Processando..." : `Confirmar Venda R$ ${dinheiro(total)}`}
                </button>
              </>
            )}
          </div>
        </div>

        {/* MODAL DE VENDA CONCLUÍDA */}
        {vendaConcluida && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: "center" }}>
              <CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 15px auto" }} />
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", margin: "0 0 5px 0" }}>
                Venda Realizada com Sucesso!
              </h2>
              <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
                Comprovante #{vendaConcluida.id}
              </p>

              <div style={{ background: "#101015", padding: "16px", borderRadius: "12px", textAlign: "left", marginBottom: "20px", fontSize: "14px" }}>
                <div style={{ borderBottom: "1px solid #2a2a36", pb: "8px", marginBottom: "8px", fontWeight: "bold", color: "#ffc107" }}>
                  Itens da Venda:
                </div>
                {vendaConcluida.itens.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>{item.quantidade}x {item.nome}</span>
                    <span>R$ {dinheiro(item.preco_unitario * item.quantidade)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #2a2a36", pt: "8px", marginTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "16px" }}>
                  <span>Total Pago ({vendaConcluida.forma_pagamento}):</span>
                  <span style={{ color: "#10b981" }}>R$ {dinheiro(vendaConcluida.total)}</span>
                </div>
                {vendaConcluida.troco > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#ffc107", marginTop: "4px" }}>
                    <span>Troco:</span>
                    <span>R$ {dinheiro(vendaConcluida.troco)}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="primary-btn"
                  style={{ flex: 1 }}
                  onClick={() => setVendaConcluida(null)}
                >
                  Nova Venda
                </button>
                <button
                  className="secondary-btn"
                  style={{ flex: 1 }}
                  onClick={() => navigate("/historico")}
                >
                  Ver no Histórico
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
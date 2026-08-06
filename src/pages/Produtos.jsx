import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { dbService } from "../services/db"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import { dinheiro } from "../utils/formatar"
import { Package, Plus, Trash2, Edit3, Tag, Barcode } from "lucide-react"
import "../styles/pages.css"
import "../pages/Dashboard.css"

export default function Produtos() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState([])
  const [nome, setNome] = useState("")
  const [precoCompra, setPrecoCompra] = useState("")
  const [precoVenda, setPrecoVenda] = useState("")
  const [estoqueInicial, setEstoqueInicial] = useState("")
  const [codigoBarras, setCodigoBarras] = useState("")

  const [produtoEditando, setProdutoEditando] = useState(null)

  useEffect(() => {
    carregarProdutos()
  }, [])

  async function carregarProdutos() {
    const lista = await dbService.getProdutos()
    setProdutos(lista)
  }

  async function salvarProduto(e) {
    e.preventDefault()

    if (!nome.trim() || !precoVenda) {
      alert("Preencha o nome do produto e o preço de venda.")
      return
    }

    if (produtoEditando) {
      await dbService.updateProduto(produtoEditando.id, {
        nome: nome.trim(),
        preco_compra: Number(precoCompra) || 0,
        preco_venda: Number(precoVenda) || 0,
        estoque: Number(estoqueInicial) || 0,
        codigo_barras: codigoBarras.trim()
      })
      alert("Produto atualizado com sucesso!")
      setProdutoEditando(null)
    } else {
      await dbService.addProduto({
        nome: nome.trim(),
        preco_compra: Number(precoCompra) || 0,
        preco_venda: Number(precoVenda) || 0,
        estoque: Number(estoqueInicial) || 0,
        quantidade_vendida: 0,
        codigo_barras: codigoBarras.trim()
      })
      alert("Produto adicionado com sucesso!")
    }

    limparFormulario()
    carregarProdutos()
  }

  function limparFormulario() {
    setNome("")
    setPrecoCompra("")
    setPrecoVenda("")
    setEstoqueInicial("")
    setCodigoBarras("")
    setProdutoEditando(null)
  }

  function iniciarEdicao(produto) {
    setProdutoEditando(produto)
    setNome(produto.nome)
    setPrecoCompra(produto.preco_compra)
    setPrecoVenda(produto.preco_venda)
    setEstoqueInicial(produto.estoque)
    setCodigoBarras(produto.codigo_barras || "")
  }

  async function excluirProduto(id) {
    const confirmar = window.confirm("Deseja realmente excluir este produto?")
    if (!confirmar) return

    await dbService.deleteProduto(id)
    carregarProdutos()
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="content">
        <Topbar />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <Package color="#ffc107" size={28} /> Cadastro de Produtos
            </h1>
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>Cadastre e edite os produtos do seu catálogo de vendas</span>
          </div>
        </div>

        {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
        <div className="card" style={{ marginBottom: "30px" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#fff" }}>
            {produtoEditando ? `Editar Produto: ${produtoEditando.nome}` : "+ Novo Produto"}
          </h3>

          <form onSubmit={salvarProduto}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600" }}>Nome do Produto *</label>
                <input
                  className="input"
                  placeholder="Ex: Refrigerante Lata"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600" }}>Preço de Venda (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600" }}>Preço de Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                  value={precoCompra}
                  onChange={(e) => setPrecoCompra(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600" }}>Estoque Inicial (un)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  value={estoqueInicial}
                  onChange={(e) => setEstoqueInicial(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600" }}>Código de Barras</label>
                <input
                  className="input"
                  placeholder="789..."
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="primary-btn">
                {produtoEditando ? "Salvar Alterações" : "+ Cadastrar Produto"}
              </button>

              {produtoEditando && (
                <button type="button" className="secondary-btn" onClick={limparFormulario}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTA DE PRODUTOS */}
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "15px", color: "#fff" }}>
            Produtos Cadastrados ({produtos.length})
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {produtos.map((p) => {
              const margem = p.preco_venda > 0 ? (((p.preco_venda - (p.preco_compra || 0)) / p.preco_venda) * 100).toFixed(0) : 0

              return (
                <div key={p.id} className="product-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                  <div>
                    <strong style={{ fontSize: "17px", color: "#fff", display: "block", marginBottom: "4px" }}>
                      📦 {p.nome}
                    </strong>
                    <div style={{ fontSize: "13px", color: "#9ca3af", display: "flex", gap: "15px" }}>
                      <span>Preço Venda: <strong style={{ color: "#ffc107" }}>R$ {dinheiro(p.preco_venda)}</strong></span>
                      <span>Preço Custo: <strong style={{ color: "#fff" }}>R$ {dinheiro(p.preco_compra)}</strong></span>
                      <span>Margem Estimada: <strong style={{ color: "#10b981" }}>{margem}%</strong></span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "12px", color: "#9ca3af", display: "block" }}>Estoque:</span>
                      <strong style={{ fontSize: "18px", color: "#fff" }}>{p.estoque || 0} un</strong>
                    </div>

                    <div style={{ textAlign: "right", background: "rgba(255, 193, 7, 0.1)", padding: "6px 12px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#ffc107", display: "block", fontWeight: "bold" }}>Quantidade Vendida:</span>
                      <strong style={{ fontSize: "18px", color: "#ffc107" }}>{p.quantidade_vendida || 0} un</strong>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="secondary-btn"
                        style={{ padding: "8px 12px" }}
                        onClick={() => iniciarEdicao(p)}
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        className="danger-btn"
                        style={{ padding: "8px 12px" }}
                        onClick={() => excluirProduto(p.id)}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {produtos.length === 0 && (
              <div className="card" style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>
                Nenhum produto cadastrado. Utilize o formulário acima para adicionar produtos.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
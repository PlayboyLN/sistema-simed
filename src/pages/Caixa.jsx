import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { dbService } from "../services/db"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import { dinheiro } from "../utils/formatar"
import { Wallet, ArrowDownRight, ArrowUpRight, DollarSign, PlusCircle, MinusCircle, RefreshCw } from "lucide-react"
import "../styles/pages.css"
import "../pages/Dashboard.css"

export default function Caixa() {
  const navigate = useNavigate()
  const usuario = localStorage.getItem("usuario") || "Operador"

  const [movimentacoes, setMovimentacoes] = useState([])
  const [saldo, setSaldo] = useState(0)
  const [sessao, setSessao] = useState({ aberto: true, saldo_inicial: 100 })
  const [valor, setValor] = useState("")
  const [obs, setObs] = useState("")
  const [tipoMov, setTipoMov] = useState("suprimento") // 'suprimento' ou 'sangria'

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const list = await dbService.getMovimentacoesCaixa()
    const currentSaldo = await dbService.getSaldoCaixa()
    const currentSessao = await dbService.getSessaoCaixa()

    setMovimentacoes(list)
    setSaldo(currentSaldo)
    setSessao(currentSessao)
  }

  async function registrarMovimentacao() {
    if (!valor || Number(valor) <= 0) {
      alert("Informe um valor válido.")
      return
    }

    if (!obs.trim()) {
      alert("Informe uma observação ou motivo para a movimentação.")
      return
    }

    await dbService.registrarMovimentacaoCaixa({
      usuario,
      tipo: tipoMov,
      valor: Number(valor),
      descricao: obs.trim()
    })

    setValor("")
    setObs("")
    alert(`${tipoMov === "suprimento" ? "Suprimento" : "Sangria"} registrada com sucesso!`)
    carregar()
  }

  async function alternarCaixa() {
    const novoStatus = !sessao.aberto
    const confirmacao = window.confirm(
      `Deseja realmente ${novoStatus ? "ABRIR" : "FECHAR"} o caixa?`
    )
    if (!confirmacao) return

    const novaSessao = {
      ...sessao,
      aberto: novoStatus,
      fechado_em: novoStatus ? null : new Date().toISOString(),
      saldo_fechamento: novoStatus ? null : saldo
    }

    await dbService.setSessaoCaixa(novaSessao)
    setSessao(novaSessao)
    alert(`Caixa ${novoStatus ? "aberto" : "fechado"} com sucesso!`)
  }

  // Totais do caixa
  const totalVendas = movimentacoes
    .filter(m => m.tipo === "venda" || m.tipo === "entrada")
    .reduce((a, b) => a + Number(b.valor || 0), 0)

  const totalSuprimentos = movimentacoes
    .filter(m => m.tipo === "suprimento")
    .reduce((a, b) => a + Number(b.valor || 0), 0)

  const totalSangrias = movimentacoes
    .filter(m => m.tipo === "sangria" || m.tipo === "estorno" || m.tipo === "compra")
    .reduce((a, b) => a + Number(b.valor || 0), 0)

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="content">
        <Topbar />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <Wallet color="#ffc107" size={28} /> Controle de Caixa
            </h1>
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>Gerencie o saldo, suprimentos, sangrias e movimentações financeiras</span>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span className={`badge ${sessao.aberto ? "badge-success" : "badge-danger"}`} style={{ fontSize: "14px", padding: "8px 16px" }}>
              {sessao.aberto ? "Caixa ABERTO" : "Caixa FECHADO"}
            </span>

            <button
              className={sessao.aberto ? "danger-btn" : "primary-btn"}
              onClick={alternarCaixa}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <RefreshCw size={16} /> {sessao.aberto ? "Fechar Caixa" : "Abrir Caixa"}
            </button>
          </div>
        </div>

        {/* CARDS DE DESTAQUE DE SALDO E RESUMO */}
        <div className="cards-grid">
          <div className="stat-card" style={{ borderLeft: "4px solid #ffc107" }}>
            <span>Saldo Atual no Caixa</span>
            <h1 style={{ fontSize: "38px", fontWeight: "900", color: "#ffc107", marginTop: "5px" }}>
              R$ {dinheiro(saldo)}
            </h1>
          </div>

          <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
            <span>Entradas por Vendas</span>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", marginTop: "5px" }}>
              R$ {dinheiro(totalVendas)}
            </h1>
          </div>

          <div className="stat-card" style={{ borderLeft: "4px solid #3b82f6" }}>
            <span>Suprimentos (Entradas)</span>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#3b82f6", marginTop: "5px" }}>
              R$ {dinheiro(totalSuprimentos)}
            </h1>
          </div>

          <div className="stat-card" style={{ borderLeft: "4px solid #ef4444" }}>
            <span>Sangrias / Estornos</span>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#ef4444", marginTop: "5px" }}>
              R$ {dinheiro(totalSangrias)}
            </h1>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginTop: "25px" }}>
          {/* REGISTRO DE SUPRIMENTO OU SANGRIA */}
          <div className="card">
            <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <DollarSign size={20} color="#ffc107" /> Movimentação Manual do Caixa
            </h3>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <button
                type="button"
                className="secondary-btn"
                style={{
                  flex: 1,
                  background: tipoMov === "suprimento" ? "rgba(16, 185, 129, 0.2)" : "#101015",
                  border: tipoMov === "suprimento" ? "2px solid #10b981" : "1px solid #2a2a36",
                  color: tipoMov === "suprimento" ? "#10b981" : "#9ca3af"
                }}
                onClick={() => setTipoMov("suprimento")}
              >
                <PlusCircle size={16} /> Suprimento (Entrada)
              </button>

              <button
                type="button"
                className="secondary-btn"
                style={{
                  flex: 1,
                  background: tipoMov === "sangria" ? "rgba(239, 68, 68, 0.2)" : "#101015",
                  border: tipoMov === "sangria" ? "2px solid #ef4444" : "1px solid #2a2a36",
                  color: tipoMov === "sangria" ? "#ef4444" : "#9ca3af"
                }}
                onClick={() => setTipoMov("sangria")}
              >
                <MinusCircle size={16} /> Sangria (Retirada)
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600" }}>Valor (R$):</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600" }}>Observação / Motivo:</label>
                <input
                  type="text"
                  className="input"
                  placeholder={tipoMov === "suprimento" ? "Ex: Troco inicial extra" : "Ex: Pagamento de fornecedor local"}
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                />
              </div>

              <button
                className="primary-btn"
                style={{
                  marginTop: "10px",
                  background: tipoMov === "suprimento" ? "#10b981" : "#ef4444",
                  color: "#fff"
                }}
                onClick={registrarMovimentacao}
              >
                Confirmar {tipoMov === "suprimento" ? "Suprimento" : "Sangria"}
              </button>
            </div>
          </div>

          {/* ÚLTIMAS MOVIMENTAÇÕES */}
          <div className="card">
            <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#fff" }}>
              Histórico Recente de Movimentações
            </h3>

            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {movimentacoes.slice(0, 15).map((m) => {
                const eEntrada = m.tipo === "venda" || m.tipo === "suprimento" || m.tipo === "entrada"
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: "1px solid #252533"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {eEntrada ? (
                          <ArrowUpRight size={18} color="#10b981" />
                        ) : (
                          <ArrowDownRight size={18} color="#ef4444" />
                        )}
                        <strong style={{ fontSize: "14px", color: "#fff" }}>
                          {m.descricao}
                        </strong>
                      </div>
                      <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "26px" }}>
                        {m.usuario} • {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div style={{ fontWeight: "800", fontSize: "15px", color: eEntrada ? "#10b981" : "#ef4444" }}>
                      {eEntrada ? "+" : "-"} R$ {dinheiro(m.valor)}
                    </div>
                  </div>
                )
              })}

              {movimentacoes.length === 0 && (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "30px 0" }}>
                  Nenhuma movimentação registrada no caixa.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
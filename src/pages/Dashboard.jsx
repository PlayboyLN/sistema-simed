import "./Dashboard.css"
import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"

export default function Dashboard() {

    const usuario = localStorage.getItem("usuario")

    const [depositado, setDepositado] = useState(0)
    const [retiradas, setRetiradas] = useState(0)
    const [ultimasRetiradas, setUltimasRetiradas] = useState([])
    const [ultimosDepositos, setUltimosDepositos] = useState([])

    useEffect(() => {

        carregar()

    }, [])

    async function carregar() {

        const { data: dep } = await supabase
            .from("depositos")
            .select("*")

        const { data: ret } = await supabase
            .from("retiradas_bau")
            .select(`
                *,
                itens_bau(nome)
            `)

        const totalDepositos = (dep || []).reduce(
            (acc, x) => acc + Number(x.valor || 0),
            0
        )

        const totalRetiradas = (ret || []).reduce(
            (acc, x) => acc + Number(x.quantidade || 0),
            0
        )

        setDepositado(totalDepositos)

        setRetiradas(totalRetiradas)

        setUltimasRetiradas(
            (ret || [])
                .slice()
                .reverse()
                .slice(0, 5)
        )

        setUltimosDepositos(
            (dep || [])
                .slice()
                .reverse()
                .slice(0, 5)
        )

    }

    async function fecharSemana() {

        if (usuario !== "admin") return

        const confirmar = window.confirm(
            "Tem certeza que deseja apagar todas as retiradas e depósitos da semana?"
        )

        if (!confirmar) return

        await supabase
            .from("retiradas_bau")
            .delete()
            .neq("id", 0)

        await supabase
            .from("depositos")
            .delete()
            .neq("id", 0)

        alert("Semana encerrada com sucesso.")

        carregar()

    }

    return (

        <div className="dashboard">

            <Sidebar />

            <div className="content">

                <Topbar />

                <div className="cards-grid">

                    <div className="stat-card">

                        <span>Total Depositado</span>

                        <h1>

                            R$ {depositado.toLocaleString("pt-BR")}

                        </h1>

                    </div>

                    <div className="stat-card">

                        <span>Total Retirado</span>

                        <h1>

                            {retiradas.toLocaleString("pt-BR")}

                        </h1>

                    </div>

                    <div className="stat-card">

                        <span>Usuário</span>

                        <h1>

                            {usuario}

                        </h1>

                    </div>

                </div>

                {
                    usuario === "admin" &&

                    <button
                        className="primary-btn"
                        style={{
                            background: "#c62828",
                            color: "#fff",
                            marginTop: "20px",
                            marginBottom: "20px"
                        }}
                        onClick={fecharSemana}
                    >

                        🗑️ Fechar Semana

                    </button>

                }

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                        marginTop: "25px"
                    }}
                >

                    <div className="grafico">

                        <h2>Últimas Retiradas</h2>

                        {

                            ultimasRetiradas.map(r => (

                                <div
                                    key={r.id}
                                    className="product-card"
                                >

                                    <strong>{r.usuario}</strong>

                                    <br />

                                    📦 {r.itens_bau?.nome}

                                    <br />

                                    Quantidade: {r.quantidade}

                                </div>

                            ))

                        }

                    </div>

                    <div className="grafico">

                        <h2>Últimos Depósitos</h2>

                        {

                            ultimosDepositos.map(d => (

                                <div
                                    key={d.id}
                                    className="product-card"
                                >

                                    <strong>{d.usuario}</strong>

                                    <br />

                                    💰 R$ {Number(d.valor).toLocaleString("pt-BR")}

                                    <br />

                                    {d.observacao}

                                </div>

                            ))

                        }

                    </div>

                </div>

            </div>

        </div>

    )

}
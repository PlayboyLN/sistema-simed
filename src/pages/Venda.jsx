import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import "../styles/pages.css"

export default function Venda() {

    const navigate = useNavigate()

    const usuario = localStorage.getItem("usuario")

    const [valor, setValor] = useState("")
    const [observacao, setObservacao] = useState("")
    const [depositos, setDepositos] = useState([])

    useEffect(() => {
        carregar()
    }, [])

    async function carregar() {

        const { data } = await supabase
            .from("depositos")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10)

        setDepositos(data || [])

    }

    async function registrar() {

        if (!valor) {
            alert("Informe o valor.")
            return
        }

        const { error } = await supabase

            .from("depositos")

            .insert({

                usuario,

                valor: Number(valor),

                observacao

            })

        if (error) {

            alert("Erro ao registrar depósito.")

            return

        }

        alert("Depósito registrado.")

        setValor("")
        setObservacao("")

        carregar()

    }

    return (

        <div className="page">

            <button
                className="back-btn"
                onClick={() => navigate("/dashboard")}
            >
                ← Voltar Dashboard
            </button>

            <h1>Depósito</h1>

            <div className="page-card">

                <input
                    className="input"
                    value={usuario}
                    disabled
                />

                <input
                    className="input"
                    type="number"
                    placeholder="Valor Depositado"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                />

                <textarea
                    className="input"
                    rows="3"
                    placeholder="Observação"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                />

                <button
                    className="primary-btn"
                    onClick={registrar}
                >
                    Registrar Depósito
                </button>

            </div>

            <div style={{ marginTop: 40 }}>

                <h2>Últimos Depósitos</h2>

                <br />

                {

                    depositos.map((d) => (

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

    )

}
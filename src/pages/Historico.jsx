import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import "../styles/pages.css"

export default function Historico() {

    const navigate = useNavigate()

    const [historico, setHistorico] = useState([])

    useEffect(() => {

        carregar()

    }, [])

    async function carregar() {

        const { data: retiradas } = await supabase
            .from("retiradas_bau")
            .select(`
                *,
                itens_bau(nome)
            `)

        const { data: depositos } = await supabase
            .from("depositos")
            .select("*")

        const listaRetiradas = (retiradas || []).map(item => ({
            id: "R" + item.id,
            tipo: "Retirada",
            usuario: item.usuario,
            descricao: item.itens_bau?.nome || "-",
            quantidade: item.quantidade,
            valor: null,
            data: item.created_at
        }))

        const listaDepositos = (depositos || []).map(item => ({
            id: "D" + item.id,
            tipo: "Depósito",
            usuario: item.usuario,
            descricao: item.observacao,
            quantidade: null,
            valor: item.valor,
            data: item.created_at
        }))

        const lista = [...listaRetiradas, ...listaDepositos]

        lista.sort((a, b) => new Date(b.data) - new Date(a.data))

        setHistorico(lista)

    }

    return (

        <div className="page">

            <button
                className="back-btn"
                onClick={() => navigate("/dashboard")}
            >

                ← Voltar Dashboard

            </button>

            <h1>Histórico</h1>

            <div style={{ marginTop: 25 }}>

                {

                    historico.map(item => (

                        <div
                            key={item.id}
                            className="product-card"
                        >

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>

                                <div>

                                    <strong>

                                        {item.tipo == "Retirada" ? "📦 Retirada" : "💰 Depósito"}

                                    </strong>

                                    <br />

                                    Usuário: {item.usuario}

                                    <br />

                                    {

                                        item.tipo == "Retirada"

                                            ?

                                            <>Item: {item.descricao} | Quantidade: {item.quantidade}</>

                                            :

                                            <>Valor: R$ {Number(item.valor).toLocaleString("pt-BR")} | {item.descricao}</>

                                    }

                                </div>

                                <div>

                                    {new Date(item.data).toLocaleString("pt-BR")}

                                </div>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    )

}
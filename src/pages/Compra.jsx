import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import "../styles/pages.css"

export default function Compra() {

    const navigate = useNavigate()

    const usuario = localStorage.getItem("usuario")

    const [itens, setItens] = useState([])
    const [retiradas, setRetiradas] = useState([])

    const [item, setItem] = useState("")
    const [quantidade, setQuantidade] = useState("")
    const [observacao, setObservacao] = useState("")

    useEffect(() => {

        carregar()

    }, [])

    async function carregar() {

        const { data: itensBau } = await supabase
            .from("itens_bau")
            .select("*")
            .order("nome")

        setItens(itensBau || [])

        const { data: lista } = await supabase
            .from("retiradas_bau")
            .select(`
                *,
                itens_bau(nome)
            `)
            .order("created_at", { ascending: false })
            .limit(10)

        setRetiradas(lista || [])

    }

    async function registrar() {

        if (!item || !quantidade) {

            alert("Preencha todos os campos.")

            return

        }

        const { error } = await supabase

            .from("retiradas_bau")

            .insert({

                usuario,

                item_id: item,

                quantidade: Number(quantidade),

                observacao

            })

        if (error) {

             console.log(error)

            alert(error.message)

        return

        }

        alert("Retirada registrada com sucesso.")

        setItem("")
        setQuantidade("")
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

            <h1>Retirada do Baú</h1>

            <div className="page-card">

                <input
                    className="input"
                    value={usuario}
                    disabled
                />

                <select
                    className="input"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                >

                    <option value="">Selecione o Item</option>

                    {itens.map(i => (

                        <option
                            key={i.id}
                            value={i.id}
                        >

                            {i.nome}

                        </option>

                    ))}

                </select>

                <input
                    className="input"
                    type="number"
                    placeholder="Quantidade"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                />

                <textarea
                    className="input"
                    rows="3"
                    placeholder="Observação (opcional)"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                />

                <button
                    className="primary-btn"
                    onClick={registrar}
                >

                    Registrar Retirada

                </button>

            </div>

            <div style={{ marginTop: 40 }}>

                <h2>Últimas Retiradas</h2>

                <br />

                {

                    retiradas.map(r => (

                        <div
                            className="product-card"
                            key={r.id}
                        >

                            <strong>{r.usuario}</strong>

                            <br />

                            📦 {r.itens_bau?.nome}

                            <br />

                            Quantidade: {r.quantidade}

                            <br />

                            {r.observacao}

                        </div>

                    ))

                }

            </div>

        </div>

    )

}
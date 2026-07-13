import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import "../styles/pages.css"

export default function Estoque(){

const navigate = useNavigate()

const [produtos,setProdutos] = useState([])

const [busca,setBusca] = useState("")

async function carregarProdutos(){

const { data } =

await supabase

.from("produtos")

.select("*")

.order(
"nome"
)

setProdutos(
data || []
)

}

useEffect(()=>{

carregarProdutos()

},[])

const filtrados =

produtos.filter(

produto =>

produto.nome

.toLowerCase()

.includes(

busca.toLowerCase()

)

)

return(

<div className="page">

<button

className="back-btn"

onClick={()=>

navigate(
"/dashboard"
)

}

>

← Voltar Dashboard

</button>

<h1>

Estoque

</h1>

<div className="page-card">

<input

className="input"

placeholder="Pesquisar produto"

value={busca}

onChange={(e)=>

setBusca(
e.target.value
)

}

/>

</div>

<div
style={{
marginTop:"30px"
}}
>

{

filtrados.map(

(produto)=>(

<div

className="product-card"

key={produto.id}

style={{

display:"flex",

justifyContent:"space-between",

alignItems:"center"

}}

>

<div>

<strong>

{produto.nome}

</strong>

</div>

<div>

Estoque:

<strong>

{" "}

{produto.estoque || 0}

</strong>

</div>

</div>

)

)

}

</div>

</div>

)

}
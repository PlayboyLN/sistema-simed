import { useEffect,useState } from "react"

import { useNavigate }

from "react-router-dom"

import { supabase }

from "../services/supabase"

import "../styles/pages.css"

export default function Historico(){

const navigate=
useNavigate()

const [movs,setMovs]=
useState([])

useEffect(()=>{

carregar()

},[])

async function carregar(){

const {data}=

await supabase

.from("movimentacoes")

.select("*")

.order(
"id",
{ascending:false}
)

setMovs(
data||[]
)

}

return(

<div className="page">

<button

className="back-btn"

onClick={()=>navigate(
"/dashboard"
)}

>

← Voltar Dashboard

</button>

<h1>

Historico

</h1>

{

movs.map(

(m)=>(

<div

className="product-card"

key={m.id}

>

{m.usuario}

-

{m.tipo}

-

{m.produto}

-

Qtd:

{m.quantidade}

</div>

)

)

}

</div>

)

}
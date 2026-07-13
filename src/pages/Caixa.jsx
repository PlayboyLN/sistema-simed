import { useEffect,useState } from "react"

import { useNavigate }

from "react-router-dom"

import { supabase }

from "../services/supabase"

import "../styles/pages.css"

import { dinheiro } from "../utils/formatar"

export default function Caixa(){

const navigate=
useNavigate()

const [movs,setMovs]=
useState([])

const [valor,setValor]=
useState("")

const [obs,setObs]=
useState("")

const [saldo,setSaldo]=
useState(0)

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

const lista=
data||[]

setMovs(lista)

const total=

lista.reduce(

(acc,m)=>{

if(

m.tipo==="venda"

||

m.tipo==="entrada"

)

return acc+

(m.valor||0)

if(

m.tipo==="compra"

)

return acc-

(m.valor||0)

return acc

},

0

)

setSaldo(total)

}

async function adicionarDinheiro(){

if(

!valor ||

!obs

){

alert(
"Preencha tudo"
)

return

}

await supabase

.from("movimentacoes")

.insert({

usuario:

localStorage.getItem(
"usuario"
),

produto:

obs,

tipo:"entrada",

quantidade:1,

valor:

Number(valor)

})

setValor("")

setObs("")

carregar()

}

return(

<div className="page">

<button

className="back-btn"

onClick={()=>navigate("/dashboard")}

>

← Voltar Dashboard

</button>

<div className="page-header">

<h1 className="page-title">

Caixa

</h1>

</div>

<div
style={{

display:"grid",

gridTemplateColumns:

"1.5fr 1fr",

gap:"25px"

}}
>

<div className="card">

<h3>

Saldo Atual

</h3>

<h1
style={{
fontSize:"58px",
marginTop:"15px",
color:"#ffcc00"
}}
>

R$

{dinheiro(saldo)}

</h1>

</div>

<div className="card">

<h3>

Adicionar Dinheiro

</h3>

<div className="page-card">

<input

className="input"

type="number"

placeholder="Valor"

value={valor}

onChange={(e)=>

setValor(
e.target.value
)

}

/>

<input

className="input"

placeholder="Observação"

value={obs}

onChange={(e)=>

setObs(
e.target.value
)

}

/>

<button

className="primary-btn"

onClick={adicionarDinheiro}

>

Adicionar ao Caixa

</button>

</div>

</div>

</div>

<div
className="card"

style={{
marginTop:"25px"
}}
>

<h2>

Últimas Movimentações Financeiras

</h2>

<div
style={{
marginTop:"25px"
}}
>

{

movs.slice(0,10)

.map(

(m)=>(

<div

key={m.id}

className="row"

style={{

display:"flex",

justifyContent:"space-between"

}}

>

<div>

{m.tipo}

-

{m.produto}

</div>

<div>

R$

{dinheiro(m.valor)}

</div>

</div>

)

)

}

</div>

</div>

</div>

)

}
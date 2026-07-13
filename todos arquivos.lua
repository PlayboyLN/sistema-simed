app.jsx

import {

BrowserRouter,

Routes,

Route

}

from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Produtos from "./pages/Produtos"
import Compra from "./pages/Compra"
import Venda from "./pages/Venda"
import Estoque from "./pages/Estoque"
import Caixa from "./pages/Caixa"
import Historico from "./pages/Historico"

import ProtectedRoute from "./components/ProtectedRoute"

function App(){

const P=(c)=>

<ProtectedRoute>

{c}

</ProtectedRoute>

return(

<BrowserRouter>

<Routes>

<Route path="/" element={<Login/>}/>

<Route path="/dashboard" element={P(<Dashboard/>)} />

<Route path="/produtos" element={P(<Produtos/>)} />

<Route path="/compra" element={P(<Compra/>)} />

<Route path="/venda" element={P(<Venda/>)} />

<Route path="/estoque" element={P(<Estoque/>)} />

<Route path="/caixa" element={P(<Caixa/>)} />

<Route path="/historico" element={P(<Historico/>)} />

</Routes>

</BrowserRouter>

)

}

export default App

dashboard.jsx

import "./Dashboard.css"

import {

useEffect,
useState

}

from "react"

import {

useNavigate

}

from "react-router-dom"

import {

supabase

}

from "../services/supabase"

export default function Dashboard(){

const navigate =
useNavigate()

const usuario =
localStorage.getItem(
"usuario"
)

const [

produtos,

setProdutos

] = useState([])

const [

caixa,

setCaixa

] = useState(0)

function sair(){

localStorage.clear()

navigate("/")

}

useEffect(()=>{

carregar()

},[])

async function carregar(){

const {

data:p

}

=

await supabase

.from("produtos")

.select("*")

const {

data:m

}

=

await supabase

.from("movimentacoes")

.select("*")

setProdutos(
p||[]
)

const caixaTotal =

(m||[])

.reduce(

(acc,x)=>{

if(
x.tipo==="venda"
)

return acc+

(x.valor||0)

if(
x.tipo==="compra"
)

return acc-

(x.valor||0)

return acc

},

0

)

setCaixa(
caixaTotal
)

}

async function zerarSistema(){

const confirmar =

window.confirm(

"Zerar sistema?"

)

if(!confirmar)return

await supabase

.from("movimentacoes")

.delete()

.neq(
"id",
0
)

await supabase

.from("produtos")

.update({

estoque:0

})

.neq(
"id",
0
)

alert(
"Sistema zerado"
)

carregar()

}

return(

<div className="dashboard">

<div className="sidebar">

<div className="logo">

SIMED

</div>

<div className="menu">

<button onClick={()=>navigate("/dashboard")}>

Dashboard

</button>

<button onClick={()=>navigate("/produtos")}>

Produtos

</button>

<button onClick={()=>navigate("/compra")}>

Compra

</button>

<button onClick={()=>navigate("/venda")}>

Venda

</button>

<button onClick={()=>navigate("/estoque")}>

Estoque

</button>

<button onClick={()=>navigate("/caixa")}>

Caixa

</button>

<button onClick={()=>navigate("/historico")}>

Historico

</button>

</div>

<div className="user">

<p>

{usuario}

</p>

<button

className="logout-btn"

onClick={sair}

>

Logout

</button>

</div>

</div>

<div className="content">

<div className="hero">

<h1>

Bem vindo,

{usuario}

</h1>

<p>

Sistema de Estoque SIMED

</p>

</div>

<div className="top-cards">

<div className="caixa-card">

<h3>

CAIXA TOTAL

</h3>

<h1>

R$

{caixa.toFixed(2)}

</h1>

</div>

</div>

<div className="grafico">

<h2>

Estoque por Produto

</h2>

{

produtos.map(

(produto)=>(

<div

key={produto.id}

className="grafico-item"

>

<div>

{produto.nome}

</div>

<div className="barra">

<div

className="fill"

style={{

width:

`${Math.min(

produto.estoque*10,

100

)}%`

}}

>

</div>

</div>

<span>

{produto.estoque||0}

</span>

</div>

)

)

}

</div>

<div className="quick-actions">

<button
onClick={()=>navigate("/compra")}
>

+ Compra

</button>

<button
onClick={()=>navigate("/venda")}
>

+ Venda

</button>

<button
onClick={()=>navigate("/produtos")}
>

+ Produto

</button>

{

usuario==="admin"

&&

<button

onClick={zerarSistema}

style={{

background:"#cc2222",

color:"white"

}}

>

ZERAR SISTEMA

</button>

}

</div>

</div>

</div>

)

}

produto.jsx

import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import "../styles/pages.css"

export default function Produtos(){

const navigate = useNavigate()

const [nome,setNome] = useState("")

const [precoCompra,setPrecoCompra] = useState("")

const [precoVenda,setPrecoVenda] = useState("")

const [produtos,setProdutos] = useState([])

async function carregarProdutos(){

const { data } =

await supabase

.from("produtos")

.select("*")

.order(
"id",
{ascending:false}
)

setProdutos(
data || []
)

}

useEffect(()=>{

carregarProdutos()

},[])

async function criarProduto(){

if(

!nome ||

precoCompra === "" ||

precoVenda === ""

){

alert(
"Preencha todos campos"
)

return

}

const { error } =

await supabase

.from("produtos")

.insert({

nome:nome,

estoque:0,

preco_compra:

Number(
precoCompra
),

preco_venda:

Number(
precoVenda
)

})

if(error){

alert(
"Erro ao criar produto"
)

return

}

setNome("")

setPrecoCompra("")

setPrecoVenda("")

carregarProdutos()

}

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

Produtos

</h1>

<div className="page-card">

<input

className="input"

placeholder="Nome produto"

value={nome}

onChange={(e)=>

setNome(
e.target.value
)

}

/>

<input

className="input"

type="number"

placeholder="Preço Compra"

value={precoCompra}

onChange={(e)=>

setPrecoCompra(
e.target.value
)

}

/>

<input

className="input"

type="number"

placeholder="Preço Venda"

value={precoVenda}

onChange={(e)=>

setPrecoVenda(
e.target.value
)

}

/>

<button

className="primary-btn"

onClick={criarProduto}

>

Adicionar Produto

</button>

</div>

<div
style={{
marginTop:"30px"
}}
>

{

produtos.map(

(produto)=>(

<div

className="product-card"

key={produto.id}

>

<div
style={{
display:"flex",
justifyContent:"space-between"
}}
>

<div>

<strong>

{produto.nome}

</strong>

</div>

<div>

Compra:

R$

{produto.preco_compra || 0}

|

Venda:

R$

{produto.preco_venda || 0}

|

Estoque:

{produto.estoque || 0}

</div>

</div>

</div>

)

)

}

</div>

</div>

)

}

compra.jsx

import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import "../styles/pages.css"

export default function Compra(){

const navigate=useNavigate()

const [produtos,setProdutos]=useState([])

const [produto,setProduto]=useState("")

const [quantidade,setQuantidade]=useState("")

async function carregarProdutos(){

const {data}=

await supabase

.from("produtos")

.select("*")

.order("nome")

setProdutos(data||[])

}

useEffect(()=>{

carregarProdutos()

},[])

async function comprar(){

if(!produto||!quantidade){

alert("Preencha tudo")

return

}

const produtoSelecionado=

produtos.find(

p=>String(p.id)===produto

)

if(!produtoSelecionado)return

const qtd=

Number(quantidade)

const precoCompra=

Number(

produtoSelecionado.preco_compra||0

)

const valorTotal=

precoCompra*qtd

const novoEstoque=

(produtoSelecionado.estoque||0)

+

qtd

await supabase

.from("produtos")

.update({

estoque:novoEstoque

})

.eq(

"id",

produto

)

await supabase

.from("movimentacoes")

.insert({

usuario:

localStorage.getItem(
"usuario"
),

produto:

produtoSelecionado.nome,

tipo:"compra",

quantidade:qtd,

valor:valorTotal

})

alert(

`Compra registrada

Valor:

R$ ${valorTotal}`

)

setQuantidade("")

carregarProdutos()

}

return(

<div className="page">

<button

className="back-btn"

onClick={()=>navigate("/dashboard")}

>

← Voltar Dashboard

</button>

<h1>

Compra

</h1>

<div className="page-card">

<select

className="input"

value={produto}

onChange={(e)=>setProduto(e.target.value)}

>

<option value="">

Selecione produto

</option>

{

produtos.map(

p=>(

<option

key={p.id}

value={p.id}

>

{p.nome}

-

R$

{p.preco_compra||0}

</option>

)

)

}

</select>

<input

className="input"

type="number"

placeholder="Quantidade"

value={quantidade}

onChange={(e)=>setQuantidade(e.target.value)}

/>

<button

className="primary-btn"

onClick={comprar}

>

Registrar Compra

</button>

</div>

</div>

)

}

venda.jsx

import { useEffect,useState } from "react"

import { useNavigate }

from "react-router-dom"

import { supabase }

from "../services/supabase"

import "../styles/pages.css"

export default function Venda(){

const navigate=
useNavigate()

const [produtos,setProdutos]=
useState([])

const [produto,setProduto]=
useState("")

const [quantidade,setQuantidade]=
useState("")

async function carregarProdutos(){

const {data}=

await supabase

.from("produtos")

.select("*")

.order("nome")

setProdutos(data||[])

}

useEffect(()=>{

carregarProdutos()

},[])

async function vender(){

const produtoSelecionado=

produtos.find(

p=>String(p.id)===produto

)

if(!produtoSelecionado)return

const qtd=

Number(
quantidade
)

if(

qtd>

(produtoSelecionado.estoque||0)

){

alert(

"Estoque insuficiente"

)

return

}

const precoVenda=

Number(

produtoSelecionado.preco_venda||0

)

const valorTotal=

precoVenda*qtd

await supabase

.from("produtos")

.update({

estoque:

(produtoSelecionado.estoque||0)

-

qtd

})

.eq(
"id",
produto
)

await supabase

.from("movimentacoes")

.insert({

usuario:

localStorage.getItem(
"usuario"
),

produto:

produtoSelecionado.nome,

tipo:"venda",

quantidade:qtd,

valor:valorTotal

})

alert(

`Venda registrada

Valor:

R$ ${valorTotal}`

)

setQuantidade("")

carregarProdutos()

}

return(

<div className="page">

<button

className="back-btn"

onClick={()=>navigate("/dashboard")}

>

← Voltar Dashboard

</button>

<h1>

Venda

</h1>

<div className="page-card">

<select

className="input"

value={produto}

onChange={(e)=>setProduto(e.target.value)}

>

<option value="">

Selecione produto

</option>

{

produtos.map(

p=>(

<option

key={p.id}

value={p.id}

>

{p.nome}

|

Estoque:

{p.estoque}

|

R$

{p.preco_venda||0}

</option>

)

)

}

</select>

<input

className="input"

type="number"

placeholder="Quantidade"

value={quantidade}

onChange={(e)=>setQuantidade(e.target.value)}

/>

<button

className="primary-btn"

onClick={vender}

>

Registrar Venda

</button>

</div>

</div>

)

}

caixa.jsx

import { useEffect,useState } from "react"

import { useNavigate }

from "react-router-dom"

import { supabase }

from "../services/supabase"

import "../styles/pages.css"

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

{saldo.toFixed(2)}

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

{m.valor}

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

pages.css

*{

margin:0;

padding:0;

box-sizing:border-box;

}

.page{

background:#050505;

min-height:100vh;

padding:40px;

color:white;

width:100%;

}

.page-header{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:35px;

}

.page-title{

font-size:34px;

font-weight:700;

}

.back-btn{

background:#111;

border:1px solid #262626;

padding:12px 20px;

border-radius:12px;

color:white;

cursor:pointer;

transition:.2s;

font-weight:600;

}

.back-btn:hover{

background:#1a1a1a;

}

.page-grid{

display:grid;

grid-template-columns:

repeat(
auto-fit,
minmax(
350px,
1fr
)
);

gap:20px;

}

.card{

background:#111;

border:1px solid #1f1f1f;

padding:25px;

border-radius:18px;

width:100%;

}

.page-card{

display:flex;

flex-direction:column;

gap:15px;

width:100%;

}

.input{

width:100%;

padding:16px;

background:#0d0d0d;

border:1px solid #2a2a2a;

border-radius:12px;

color:white;

outline:none;

font-size:15px;

}

.input:focus{

border:1px solid #ffcc00;

}

.primary-btn{

padding:16px;

background:#ffcc00;

border:none;

border-radius:12px;

font-weight:700;

cursor:pointer;

font-size:15px;

transition:.2s;

}

.primary-btn:hover{

transform:

translateY(-2px);

}

.product-card{

background:#111;

border:1px solid #202020;

padding:18px;

border-radius:14px;

margin-bottom:12px;

width:100%;

}

Dashboard.css


.dashboard{

display:flex;

height:100vh;

background:#050505;

}

.sidebar{

width:280px;

background:#0d0d0d;

padding:30px;

display:flex;

flex-direction:column;

border-right:

1px solid #1f1f1f;

}

.logo{

font-size:34px;

font-weight:800;

color:#ffcc00;

margin-bottom:40px;

}

.menu{

display:flex;

flex-direction:column;

gap:12px;

}

.menu button{

padding:16px;

background:#111;

border:none;

border-radius:12px;

color:white;

cursor:pointer;

text-align:left;

}

.menu button:hover{

background:#ffcc00;

color:black;

}

.content{

flex:1;

padding:40px;

overflow:auto;

}

.hero{

background:#111;

padding:30px;

border-radius:20px;

margin-bottom:25px;

}

.top-cards{

display:grid;

grid-template-columns:

2fr 1fr;

gap:20px;

margin-bottom:30px;

}

.caixa-card{

background:#ffcc00;

padding:40px;

border-radius:20px;

color:black;

}

.caixa-card h1{

font-size:48px;

}

.estoque-card{

background:#111;

padding:40px;

border-radius:20px;

}

.grafico{

background:#111;

padding:30px;

border-radius:20px;

margin-bottom:30px;

}

.grafico-item{

margin-top:20px;

display:grid;

grid-template-columns:

150px

1fr

60px;

gap:20px;

align-items:center;

}

.barra{

height:18px;

background:#222;

border-radius:20px;

overflow:hidden;

}

.fill{

height:100%;

background:#ffcc00;

}

.quick-actions{

display:flex;

gap:20px;

}

.quick-actions button{

padding:18px 30px;

background:#ffcc00;

border:none;

border-radius:12px;

font-weight:bold;

cursor:pointer;

}

.user{

margin-top:auto;

}

.logout-btn{

width:100%;

padding:15px;

background:#111;

border:none;

border-radius:12px;

color:white;

cursor:pointer;

margin-top:10px;

}
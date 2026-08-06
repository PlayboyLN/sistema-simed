import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import "./Login.css"

export default function Login(){

const navigate = useNavigate()

const [nome,setNome] = useState("")
const [senha,setSenha] = useState("")

async function entrar(){

const { data,error } =

await supabase

.from("usuarios")

.select("*")

.eq("nome",nome)

.single()

if(error || !data){

alert("Usuário não encontrado")

return

}

if(data.senha !== senha){

alert("Senha incorreta")

return

}

localStorage.setItem(
"usuario",
data.nome
)

localStorage.setItem(
"usuarioId",
data.id
)

navigate("/dashboard")

}

return(

<div className="login-container">

<div className="login-card">

<h1>

Sistema SIMED

</h1>

<p>

Controle de estoque, venda e caixa

</p>

<input

placeholder="Nome"

value={nome}

onChange={(e)=>

setNome(
e.target.value
)

}

/>

<input

type="password"

placeholder="Senha"

value={senha}

onChange={(e)=>

setSenha(
e.target.value
)

}

/>

<button
onClick={entrar}
>

Entrar

</button>

</div>

</div>

)

}
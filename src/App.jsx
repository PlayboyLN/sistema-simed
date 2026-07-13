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
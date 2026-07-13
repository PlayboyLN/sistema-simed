import {
    LayoutDashboard,
    Package,
    Archive,
    DollarSign,
    History,
    LogOut
} from "lucide-react"

import { useNavigate } from "react-router-dom"

export default function Sidebar() {

    const navigate = useNavigate()

    const usuario = localStorage.getItem("usuario")

    function sair() {

        localStorage.clear()

        navigate("/")

    }

    return (

        <div className="sidebar">

            <div className="logo">

                SIMED CONTROLE

            </div>

            <div className="menu">

                <button onClick={() => navigate("/dashboard")}>

                    <LayoutDashboard size={18} />

                    <span>Dashboard</span>

                </button>

                <button onClick={() => navigate("/produtos")}>

                    <Package size={18} />

                    <span>Itens do Baú</span>

                </button>

                <button onClick={() => navigate("/compra")}>

                    <Archive size={18} />

                    <span>Retirada do Baú</span>

                </button>

                <button onClick={() => navigate("/venda")}>

                    <DollarSign size={18} />

                    <span>Depósito</span>

                </button>

                <button onClick={() => navigate("/historico")}>

                    <History size={18} />

                    <span>Histórico</span>

                </button>

            </div>

            <div className="user-box">

                <div className="user-name">

                    {usuario}

                </div>

                <button
                    className="logout-btn"
                    onClick={sair}
                >

                    <LogOut size={18} />

                    <span>Sair</span>

                </button>

            </div>

        </div>

    )

}
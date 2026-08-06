import {
    LayoutDashboard,
    ShoppingCart,
    Wallet,
    Boxes,
    Package,
    History,
    LogOut
} from "lucide-react"

import { useNavigate, useLocation } from "react-router-dom"

export default function Sidebar() {

    const navigate = useNavigate()
    const location = useLocation()

    const usuario = localStorage.getItem("usuario")

    function sair() {
        localStorage.clear()
        navigate("/")
    }

    const isActive = (path) => location.pathname === path

    return (

        <div className="sidebar">

            <div className="logo">
                SIMED VENDAS
            </div>

            <div className="menu">

                <button 
                    className={isActive("/dashboard") ? "active" : ""}
                    onClick={() => navigate("/dashboard")}
                >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </button>

                <button 
                    className={isActive("/venda") ? "active" : ""}
                    onClick={() => navigate("/venda")}
                >
                    <ShoppingCart size={18} />
                    <span>Nova Venda (PDV)</span>
                </button>

                <button 
                    className={isActive("/caixa") ? "active" : ""}
                    onClick={() => navigate("/caixa")}
                >
                    <Wallet size={18} />
                    <span>Caixa</span>
                </button>

                <button 
                    className={isActive("/estoque") ? "active" : ""}
                    onClick={() => navigate("/estoque")}
                >
                    <Boxes size={18} />
                    <span>Estoque</span>
                </button>

                <button 
                    className={isActive("/produtos") ? "active" : ""}
                    onClick={() => navigate("/produtos")}
                >
                    <Package size={18} />
                    <span>Produtos</span>
                </button>

                <button 
                    className={isActive("/historico") ? "active" : ""}
                    onClick={() => navigate("/historico")}
                >
                    <History size={18} />
                    <span>Histórico</span>
                </button>

            </div>

            <div className="user-box">

                <div className="user-name">
                    👤 {usuario || "Operador"}
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
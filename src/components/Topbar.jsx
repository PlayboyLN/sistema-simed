export default function Topbar(){

const data = new Date()

return(

<div className="topbar">

<div>

<h2>

Sistema SIMED

</h2>

</div>

<div className="topbar-right">

{data.toLocaleDateString("pt-BR")}

</div>

</div>

)

}
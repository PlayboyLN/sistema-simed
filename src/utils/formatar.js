export function dinheiro(valor){

return Number(valor || 0)

.toLocaleString(

"pt-BR",

{

style:"currency",

currency:"BRL",

minimumFractionDigits:0,

maximumFractionDigits:0

}

)

}

export function numero(valor){

return Number(valor || 0)

.toLocaleString(

"pt-BR",

{

minimumFractionDigits:0,

maximumFractionDigits:0

}

)

}
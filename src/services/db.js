import { supabase } from "./supabase.js"

const INITIAL_PRODUTOS = [
  {
    id: "1",
    nome: "Refrigerante Lata 350ml",
    preco_venda: 6.00,
    preco_compra: 3.20,
    estoque: 45,
    quantidade_vendida: 12,
    codigo_barras: "7891234567890",
    categoria: "Bebidas",
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    nome: "Salgado Assado Frango",
    preco_venda: 8.50,
    preco_compra: 4.00,
    estoque: 20,
    quantidade_vendida: 25,
    codigo_barras: "7891234567891",
    categoria: "Alimentos",
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    nome: "Água Mineral 500ml",
    preco_venda: 3.50,
    preco_compra: 1.20,
    estoque: 60,
    quantidade_vendida: 30,
    codigo_barras: "7891234567892",
    categoria: "Bebidas",
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    nome: "Café Expresso",
    preco_venda: 5.00,
    preco_compra: 1.50,
    estoque: 50,
    quantidade_vendida: 18,
    codigo_barras: "7891234567893",
    categoria: "Bebidas",
    created_at: new Date().toISOString()
  }
]

const STORAGE_KEYS = {
  PRODUTOS: "simed_produtos",
  VENDAS: "simed_vendas",
  MOVIMENTACOES_CAIXA: "simed_movimentacoes_caixa",
  CAIXA_SESSAO: "simed_caixa_sessao"
}

function getLocal(key, defaultValue) {
  try {
    if (typeof localStorage === "undefined") return defaultValue
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (e) {
    console.error("Erro ao ler localStorage", e)
    return defaultValue
  }
}

function setLocal(key, value) {
  try {
    if (typeof localStorage === "undefined") return
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error("Erro ao salvar no localStorage", e)
  }
}

function initLocalStorage() {
  if (typeof localStorage === "undefined") return
  if (!localStorage.getItem(STORAGE_KEYS.PRODUTOS)) {
    setLocal(STORAGE_KEYS.PRODUTOS, INITIAL_PRODUTOS)
  }
  if (!localStorage.getItem(STORAGE_KEYS.VENDAS)) {
    setLocal(STORAGE_KEYS.VENDAS, [])
  }
  if (!localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES_CAIXA)) {
    setLocal(STORAGE_KEYS.MOVIMENTACOES_CAIXA, [
      {
        id: "m_init",
        usuario: (typeof localStorage !== "undefined" && localStorage.getItem("usuario")) || "admin",
        tipo: "suprimento",
        valor: 100.00,
        descricao: "Fundo de Caixa Inicial",
        created_at: new Date().toISOString()
      }
    ])
  }
  if (!localStorage.getItem(STORAGE_KEYS.CAIXA_SESSAO)) {
    setLocal(STORAGE_KEYS.CAIXA_SESSAO, {
      aberto: true,
      saldo_inicial: 100.00,
      aberto_em: new Date().toISOString(),
      operador: (typeof localStorage !== "undefined" && localStorage.getItem("usuario")) || "admin"
    })
  }
}

initLocalStorage()

export const dbService = {
  // PRODUTOS
  async getProdutos() {
    try {
      const { data, error } = await supabase.from("produtos").select("*").order("nome")
      if (!error && data) {
        setLocal(STORAGE_KEYS.PRODUTOS, data)
        return data
      }
      if (error) console.warn("Supabase getProdutos aviso:", error.message)
    } catch (e) {
      console.warn("Usando localStorage para produtos:", e)
    }
    return getLocal(STORAGE_KEYS.PRODUTOS, INITIAL_PRODUTOS)
  },

  async addProduto(produto) {
    const newProduto = {
      id: Date.now().toString(),
      nome: produto.nome,
      preco_venda: Number(produto.preco_venda) || 0,
      preco_compra: Number(produto.preco_compra) || 0,
      estoque: Number(produto.estoque) || 0,
      quantidade_vendida: Number(produto.quantidade_vendida) || 0,
      codigo_barras: produto.codigo_barras || "",
      categoria: produto.categoria || "Geral",
      created_at: new Date().toISOString()
    }

    const local = getLocal(STORAGE_KEYS.PRODUTOS, [])
    local.unshift(newProduto)
    setLocal(STORAGE_KEYS.PRODUTOS, local)

    try {
      let payload = { ...newProduto }
      let { data, error } = await supabase.from("produtos").insert(payload).select()
      
      if (error && error.code === "PGRST204") {
        delete payload.quantidade_vendida
        delete payload.codigo_barras
        delete payload.categoria
        delete payload.id
        const res2 = await supabase.from("produtos").insert(payload).select()
        data = res2.data
        error = res2.error
      }

      if (!error && data && data[0]) {
        local[0] = { ...local[0], ...data[0] }
        setLocal(STORAGE_KEYS.PRODUTOS, local)
        return local[0]
      } else if (error) {
        console.error("Erro ao inserir produto no Supabase:", error.message)
      }
    } catch (e) {
      console.error("Erro ao salvar produto no Supabase", e)
    }

    return newProduto
  },

  async updateProduto(id, updates) {
    const local = getLocal(STORAGE_KEYS.PRODUTOS, [])
    const index = local.findIndex(p => String(p.id) === String(id))
    if (index !== -1) {
      local[index] = { ...local[index], ...updates }
      setLocal(STORAGE_KEYS.PRODUTOS, local)
    }

    try {
      let payload = { ...updates }
      let { error } = await supabase.from("produtos").update(payload).eq("id", id)

      if (error && error.code === "PGRST204") {
        delete payload.quantidade_vendida
        delete payload.codigo_barras
        delete payload.categoria
        await supabase.from("produtos").update(payload).eq("id", id)
      }
    } catch (e) {
      console.warn("Erro ao atualizar Supabase produto", e)
    }

    return local[index]
  },

  async deleteProduto(id) {
    const local = getLocal(STORAGE_KEYS.PRODUTOS, [])
    const filtered = local.filter(p => String(p.id) !== String(id))
    setLocal(STORAGE_KEYS.PRODUTOS, filtered)

    try {
      await supabase.from("produtos").delete().eq("id", id)
    } catch (e) {
      console.warn("Erro ao deletar produto no Supabase", e)
    }
    return true
  },

  // REGISTRO DE VENDA (PDV)
  async registrarVenda({ usuario, itens, formaPagamento, valorRecebido = 0, desconto = 0 }) {
    const totalSemDesconto = itens.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0)
    const total = Math.max(0, totalSemDesconto - Number(desconto))
    const troco = Math.max(0, Number(valorRecebido) - total)

    const novaVenda = {
      id: "V" + Date.now().toString().slice(-6),
      usuario: usuario || (typeof localStorage !== "undefined" && localStorage.getItem("usuario")) || "admin",
      total,
      desconto: Number(desconto) || 0,
      forma_pagamento: formaPagamento,
      valor_recebido: Number(valorRecebido) || total,
      troco,
      itens,
      created_at: new Date().toISOString()
    }

    // 1. Atualizar Produtos
    const produtos = getLocal(STORAGE_KEYS.PRODUTOS, [])
    for (const item of itens) {
      const prodIndex = produtos.findIndex(p => String(p.id) === String(item.produto_id))
      if (prodIndex !== -1) {
        produtos[prodIndex].estoque = Math.max(0, (produtos[prodIndex].estoque || 0) - item.quantidade)
        produtos[prodIndex].quantidade_vendida = (produtos[prodIndex].quantidade_vendida || 0) + item.quantidade
        
        try {
          let upd = { estoque: produtos[prodIndex].estoque, quantidade_vendida: produtos[prodIndex].quantidade_vendida }
          let { error } = await supabase.from("produtos").update(upd).eq("id", item.produto_id)
          if (error && error.code === "PGRST204") {
            await supabase.from("produtos").update({ estoque: produtos[prodIndex].estoque }).eq("id", item.produto_id)
          }
        } catch (e) {
          console.warn("Erro ao sincronizar estoque com Supabase", e)
        }
      }
    }
    setLocal(STORAGE_KEYS.PRODUTOS, produtos)

    // 2. Salvar Venda
    const vendas = getLocal(STORAGE_KEYS.VENDAS, [])
    vendas.unshift(novaVenda)
    setLocal(STORAGE_KEYS.VENDAS, vendas)

    try {
      const { error } = await supabase.from("vendas").insert({
        id: novaVenda.id,
        usuario: novaVenda.usuario,
        total: novaVenda.total,
        desconto: novaVenda.desconto,
        forma_pagamento: novaVenda.forma_pagamento,
        valor_recebido: novaVenda.valor_recebido,
        troco: novaVenda.troco,
        itens: JSON.stringify(novaVenda.itens),
        created_at: novaVenda.created_at
      })
      if (error) console.error("Erro insert venda no Supabase:", error.message)
    } catch (e) {
      console.warn("Erro ao enviar venda para o Supabase", e)
    }

    // 3. Registrar movimentação no Caixa (com quantidade: 1 para restrições do Supabase)
    const movCaixa = {
      id: "MC" + Date.now().toString().slice(-6),
      usuario: novaVenda.usuario,
      tipo: "venda",
      valor: total,
      descricao: `Venda #${novaVenda.id} (${formaPagamento})`,
      quantidade: 1,
      created_at: novaVenda.created_at
    }
    const movs = getLocal(STORAGE_KEYS.MOVIMENTACOES_CAIXA, [])
    movs.unshift(movCaixa)
    setLocal(STORAGE_KEYS.MOVIMENTACOES_CAIXA, movs)

    try {
      const { error } = await supabase.from("movimentacoes").insert({
        usuario: movCaixa.usuario,
        tipo: "venda",
        valor: total,
        produto: movCaixa.descricao,
        quantidade: 1,
        created_at: movCaixa.created_at
      })
      if (error) console.error("Erro insert movimentacao no Supabase:", error.message)
    } catch (e) {
      console.warn("Erro ao salvar movimentação no Supabase", e)
    }

    return novaVenda
  },

  // CANCELAR / ESTORNAR VENDA
  async estornarVenda(vendaId) {
    const vendas = getLocal(STORAGE_KEYS.VENDAS, [])
    const vendaIndex = vendas.findIndex(v => String(v.id) === String(vendaId))
    if (vendaIndex === -1) return false

    const venda = vendas[vendaIndex]
    if (venda.estornada) return false

    venda.estornada = true
    venda.estornada_em = new Date().toISOString()
    setLocal(STORAGE_KEYS.VENDAS, vendas)

    // Devolver produtos ao estoque
    const produtos = getLocal(STORAGE_KEYS.PRODUTOS, [])
    for (const item of venda.itens) {
      const prodIndex = produtos.findIndex(p => String(p.id) === String(item.produto_id))
      if (prodIndex !== -1) {
        produtos[prodIndex].estoque = (produtos[prodIndex].estoque || 0) + item.quantidade
        produtos[prodIndex].quantidade_vendida = Math.max(0, (produtos[prodIndex].quantidade_vendida || 0) - item.quantidade)
        
        try {
          await supabase.from("produtos").update({
            estoque: produtos[prodIndex].estoque
          }).eq("id", item.produto_id)
        } catch (e) {
          console.warn("Erro ao atualizar estoque no estorno Supabase", e)
        }
      }
    }
    setLocal(STORAGE_KEYS.PRODUTOS, produtos)

    // Registrar estorno no caixa
    const movCaixa = {
      id: "MC_EST_" + Date.now().toString().slice(-6),
      usuario: (typeof localStorage !== "undefined" && localStorage.getItem("usuario")) || "admin",
      tipo: "estorno",
      valor: venda.total,
      descricao: `Estorno Venda #${venda.id}`,
      quantidade: 1,
      created_at: new Date().toISOString()
    }
    const movs = getLocal(STORAGE_KEYS.MOVIMENTACOES_CAIXA, [])
    movs.unshift(movCaixa)
    setLocal(STORAGE_KEYS.MOVIMENTACOES_CAIXA, movs)

    try {
      await supabase.from("vendas").update({ estornada: true }).eq("id", vendaId)
      await supabase.from("movimentacoes").insert({
        usuario: movCaixa.usuario,
        tipo: "estorno",
        valor: movCaixa.valor,
        produto: movCaixa.descricao,
        quantidade: 1,
        created_at: movCaixa.created_at
      })
    } catch (e) {
      console.warn("Erro ao atualizar estorno no Supabase", e)
    }

    return true
  },

  // GESTÃO DO CAIXA
  async getMovimentacoesCaixa() {
    try {
      const { data, error } = await supabase.from("movimentacoes").select("*").order("created_at", { ascending: false })
      if (!error && data && data.length > 0) {
        const formatadas = data.map(m => ({
          id: m.id || "M" + Math.random(),
          usuario: m.usuario,
          tipo: m.tipo,
          valor: m.valor,
          descricao: m.produto || m.descricao || "Movimentação",
          created_at: m.created_at
        }))
        setLocal(STORAGE_KEYS.MOVIMENTACOES_CAIXA, formatadas)
        return formatadas
      }
    } catch (e) {
      console.warn("Erro ao buscar movimentacoes no Supabase", e)
    }
    return getLocal(STORAGE_KEYS.MOVIMENTACOES_CAIXA, [])
  },

  async registrarMovimentacaoCaixa({ usuario, tipo, valor, descricao }) {
    const mov = {
      id: "MC" + Date.now().toString().slice(-6),
      usuario: usuario || (typeof localStorage !== "undefined" && localStorage.getItem("usuario")) || "admin",
      tipo,
      valor: Number(valor) || 0,
      descricao: descricao || (tipo === "suprimento" ? "Suprimento de Caixa" : "Sangria de Caixa"),
      quantidade: 1,
      created_at: new Date().toISOString()
    }

    const movs = getLocal(STORAGE_KEYS.MOVIMENTACOES_CAIXA, [])
    movs.unshift(mov)
    setLocal(STORAGE_KEYS.MOVIMENTACOES_CAIXA, movs)

    try {
      const { error } = await supabase.from("movimentacoes").insert({
        usuario: mov.usuario,
        tipo: tipo,
        valor: mov.valor,
        produto: mov.descricao,
        quantidade: 1,
        created_at: mov.created_at
      })
      if (error) console.error("Erro insert movimentacao no Supabase:", error.message)
    } catch (e) {
      console.warn("Erro no Supabase ao registrar movimentação", e)
    }

    return mov
  },

  async getSaldoCaixa() {
    const movs = await this.getMovimentacoesCaixa()
    const total = movs.reduce((acc, m) => {
      if (m.tipo === "suprimento" || m.tipo === "venda" || m.tipo === "entrada") {
        return acc + Number(m.valor || 0)
      }
      if (m.tipo === "sangria" || m.tipo === "estorno" || m.tipo === "compra") {
        return acc - Number(m.valor || 0)
      }
      return acc
    }, 0)
    return total
  },

  async getSessaoCaixa() {
    return getLocal(STORAGE_KEYS.CAIXA_SESSAO, {
      aberto: true,
      saldo_inicial: 100.00,
      aberto_em: new Date().toISOString(),
      operador: "admin"
    })
  },

  async setSessaoCaixa(sessao) {
    setLocal(STORAGE_KEYS.CAIXA_SESSAO, sessao)
    return sessao
  },

  async getVendas() {
    try {
      const { data, error } = await supabase.from("vendas").select("*").order("created_at", { ascending: false })
      if (!error && data && data.length > 0) {
        const formatadas = data.map(v => ({
          ...v,
          itens: typeof v.itens === "string" ? JSON.parse(v.itens) : (v.itens || [])
        }))
        setLocal(STORAGE_KEYS.VENDAS, formatadas)
        return formatadas
      }
    } catch (e) {
      console.warn("Erro ao buscar vendas no Supabase", e)
    }
    return getLocal(STORAGE_KEYS.VENDAS, [])
  },

  async zerarDados(usuario) {
    if (usuario !== "admin") return false
    setLocal(STORAGE_KEYS.VENDAS, [])
    setLocal(STORAGE_KEYS.MOVIMENTACOES_CAIXA, [
      {
        id: "m_init_" + Date.now().toString().slice(-6),
        usuario: "admin",
        tipo: "suprimento",
        valor: 0,
        descricao: "Fundo de Caixa Zerado",
        quantidade: 1,
        created_at: new Date().toISOString()
      }
    ])
    
    const produtos = getLocal(STORAGE_KEYS.PRODUTOS, INITIAL_PRODUTOS)
    const resetProdutos = produtos.map(p => ({ ...p, quantidade_vendida: 0 }))
    setLocal(STORAGE_KEYS.PRODUTOS, resetProdutos)

    try {
      await supabase.from("vendas").delete().neq("id", "0")
      await supabase.from("movimentacoes").delete().neq("id", "0")
    } catch (e) {
      console.warn("Erro ao zerar no Supabase", e)
    }

    return true
  }
}

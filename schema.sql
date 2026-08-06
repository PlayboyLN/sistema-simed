-- ============================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- ============================================================

-- 1. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome TEXT NOT NULL,
  preco_venda NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_compra NUMERIC(10,2) NOT NULL DEFAULT 0,
  estoque INT NOT NULL DEFAULT 0,
  quantidade_vendida INT NOT NULL DEFAULT 0,
  codigo_barras TEXT,
  categoria TEXT DEFAULT 'Geral',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE VENDAS
CREATE TABLE IF NOT EXISTS vendas (
  id TEXT PRIMARY KEY,
  usuario TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  desconto NUMERIC(10,2) NOT NULL DEFAULT 0,
  forma_pagamento TEXT NOT NULL,
  valor_recebido NUMERIC(10,2) DEFAULT 0,
  troco NUMERIC(10,2) DEFAULT 0,
  itens JSONB NOT NULL,
  estornada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE MOVIMENTAÇÕES DO CAIXA
CREATE TABLE IF NOT EXISTS movimentacoes (
  id TEXT PRIMARY KEY,
  usuario TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'suprimento', 'sangria', 'venda', 'estorno'
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  produto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR PERMISSÕES DE LEITURA E ESCRITA PÚBLICAS (ROW LEVEL SECURITY)
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir Acesso Total em Produtos" ON produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir Acesso Total em Vendas" ON vendas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir Acesso Total em Movimentacoes" ON movimentacoes FOR ALL USING (true) WITH CHECK (true);

-- DADOS INICIAIS DE EXEMPLO
INSERT INTO produtos (nome, preco_venda, preco_compra, estoque, quantidade_vendida, codigo_barras, categoria)
VALUES 
  ('Refrigerante Lata 350ml', 6.00, 3.20, 45, 12, '7891234567890', 'Bebidas'),
  ('Salgado Assado Frango', 8.50, 4.00, 20, 25, '7891234567891', 'Alimentos'),
  ('Água Mineral 500ml', 3.50, 1.20, 60, 30, '7891234567892', 'Bebidas'),
  ('Café Expresso', 5.00, 1.50, 50, 18, '7891234567893', 'Bebidas');

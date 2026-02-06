# 🚀 FlowDash360 BETA

### Dashboard Inteligente de Gestão Empresarial com Visão 360°

---

## 📌 O que é o FlowDash360 BETA?

O **FlowDash360 BETA** é um painel de gestão empresarial (**ERP simplificado**) focado em **varejo e pequenas empresas**.  
Ele funciona como uma **Single Page Application (SPA)** totalmente executada no navegador, oferecendo controle integrado de **estoque, finanças, colaboradores** e **inteligência artificial** para análise estratégica do negócio.

O projeto foi pensado para ser:
- Rápido
- Visualmente moderno
- Fácil de usar
- Independente de backend complexo (persistência local)

É uma solução “local-first”, ideal para pequenos negócios que precisam de **controle e insights imediatos** sem infraestrutura pesada.

---

## 🎯 Objetivo do Projeto

- Centralizar a operação do negócio em um único painel
- Fornecer indicadores claros para tomada de decisão
- Automatizar análises com apoio de IA
- Demonstrar arquitetura moderna de aplicações Frontend

Este projeto faz parte do meu portfólio profissional.

---

## 🛠️ Tecnologias e Linguagens Utilizadas

### Frontend
- **TypeScript (TSX)** — tipagem estática e segurança
- **React 19** — arquitetura baseada em componentes
- **React Router DOM** — navegação SPA
- **Tailwind CSS** — estilização utility-first com Dark Mode
- **Lucide React** — ícones modernos
- **Recharts** — gráficos de área e pizza

### Inteligência Artificial
- **Google GenAI SDK**
  - Modelos: **Gemini 1.5 Flash / Pro**
  - Geração de insights estratégicos baseados em dados reais

### Outras Tecnologias
- **jsPDF** e **jspdf-autotable** — exportação de relatórios em PDF
- **localStorage** — persistência de dados no navegador
- **Context API** — temas, idioma e estados globais

---

## 📦 Módulos do Sistema

O FlowDash360 é estruturado em **5 pilares principais**, acessíveis pela barra lateral.

---

### 📊 Dashboard (Visão Geral)

- KPIs em tempo real:
  - Receita Total
  - Lucro Líquido
  - Valor total em estoque
  - Alertas de estoque baixo
- Gráfico de Área:
  - Comparativo de Receitas vs. Despesas
- Meta Mensal:
  - Definição e acompanhamento de metas de vendas
- Desempenho Individual:
  - Análise de vendas por colaborador
- Ranking de Produtos:
  - Top 3 produtos mais vendidos

---

### 📦 Estoque (Inventory)

- CRUD completo de produtos
- Upload de imagens (armazenadas em Base64)
- Indicadores visuais de status:
  - Em estoque
  - Baixo estoque
  - Sem estoque
- Filtros por categoria
- Barra de busca
- Edição inline direto na tabela para ajustes rápidos

---

### 💰 Financeiro (Finance)

- Registro de:
  - Entradas (vendas)
  - Saídas (despesas)
- Lógica inteligente:
  - Venda → baixa estoque automaticamente
  - Compra de insumo (tipo estoque) → aumenta estoque
- Gráfico de Pizza:
  - Distribuição de despesas por categoria
- Extrato financeiro detalhado
- Exportação de PDF:
  - Relatórios com cabeçalho, cores e assinatura

---

### 👥 Colaboradores (Team)

- Gestão de funcionários (Vendas, Administrativo, etc.)
- Geração automática de matrículas
- Upload de foto de perfil
- Histórico individual de vendas
- Visualização do total financeiro gerado por colaborador

---

### 🤖 Suporte com Inteligência Artificial (Insights)

Integração direta com o **Google Gemini**, analisando os dados reais do sistema:

- **Estoque**
  - Sugestões de reposição
  - Identificação de produtos parados
- **Financeiro**
  - Análise de margens
  - Sugestões de redução de custos
- **Marketing**
  - Ideias de campanhas baseadas no estoque disponível

---

## ⚙️ Funcionalidades-Chave

- 🌍 **Internacionalização (i18n)**
  - Português (PT)
  - Inglês (EN)
  - Espanhol (ES)
  - Troca instantânea via Context API

- 🌙 **Dark Mode**
  - Tema claro e escuro totalmente integrados

- 💾 **Persistência Local**
  - Todos os dados são salvos no navegador
  - Fechou a aba? Os dados continuam lá

- 📱 **Responsividade**
  - Layout adaptado para desktop e mobile
  - Menu hambúrguer e tabelas em formato de cards

- 🔗 **Vínculo Inteligente de Dados**
  - Transações vinculadas a produtos e colaboradores
  - Ecossistema relacional mesmo sem backend

---

## 🏗️ Arquitetura

- SPA (Single Page Application)
- Component-Based Architecture
- Estado global gerenciado via Context API e componentes raiz
- Persistência local simulando comportamento de banco de dados relacional

---

## 🚧 Limitações Atuais

- Não possui backend
- Não possui autenticação de usuários
- Dados restritos ao dispositivo do usuário
- Projeto em estágio **BETA**

---

## 🔮 Possíveis Evoluções Futuras

- Backend com API REST (Node.js)
- Autenticação e níveis de acesso
- Banco de dados em nuvem
- Multi-empresa / multi-usuário
- Exportação avançada de relatórios
- Deploy como SaaS

---

## ▶️ Como Executar o Projeto

```bash
# Instalar dependências
npm install

# Criar arquivo de ambiente
cp .env.example .env.local

# Adicionar sua chave da API Gemini
GEMINI_API_KEY=SUACHAVEAQUI

# Executar o projeto
npm run dev

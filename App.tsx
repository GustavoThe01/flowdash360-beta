
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { FinanceView } from './components/FinanceView';
import { InsightsView } from './components/InsightsView';
import { CollaboratorsView } from './components/CollaboratorsView';
import { AppData, Product, Transaction, Status, Category, Collaborator } from './types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_COLLABORATORS } from './constants';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  // ==========================================
  // ESTADO DO TEMA (DARK/LIGHT MODE)
  // ==========================================
  // Verifica se já existe uma preferência salva no navegador do usuário
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('nexus_theme');
    return savedTheme === 'dark';
  });

  // Efeito colateral: Toda vez que 'isDarkMode' mudar, atualiza a classe no HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nexus_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nexus_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // ==========================================
  // ESTADO GLOBAL DOS DADOS (STORE SIMPLIFICADA)
  // ==========================================
  // Aqui reside a "verdade" da aplicação. Produtos, Transações e Colaboradores.
  // Inicializa buscando do LocalStorage ou usa os dados iniciais (Mock Data).
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('nexus_dash_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migração: Garante que colaboradores existam se carregados de um backup antigo
      if (!parsed.collaborators) {
        return { ...parsed, collaborators: INITIAL_COLLABORATORS };
      }
      return parsed;
    }
    return { 
      products: INITIAL_PRODUCTS, 
      transactions: INITIAL_TRANSACTIONS,
      collaborators: INITIAL_COLLABORATORS 
    };
  });

  // Persistência: Salva no navegador toda vez que 'data' for alterado
  useEffect(() => {
    localStorage.setItem('nexus_dash_data', JSON.stringify(data));
  }, [data]);

  // ==========================================
  // FUNÇÕES DE CRUD - PRODUTOS
  // ==========================================
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: Date.now().toString() };
    setData(prev => ({ ...prev, products: [...prev.products, newProduct] }));
  };

  const updateProduct = (product: Product) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === product.id ? product : p)
    }));
  };

  const deleteProduct = (id: string) => {
    setData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  // ==========================================
  // FUNÇÕES DE CRUD - COLABORADORES
  // ==========================================
  const addCollaborator = (collaborator: Omit<Collaborator, 'id'>) => {
    const newCollaborator: Collaborator = { ...collaborator, id: 'col_' + Date.now().toString() };
    setData(prev => ({ ...prev, collaborators: [...prev.collaborators, newCollaborator] }));
  };

  const updateCollaborator = (collaborator: Collaborator) => {
    setData(prev => ({
      ...prev,
      collaborators: prev.collaborators.map(c => c.id === collaborator.id ? collaborator : c)
    }));
  };

  const deleteCollaborator = (id: string) => {
    setData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(c => c.id !== id)
    }));
  };

  // ==========================================
  // LÓGICA COMPLEXA: TRANSAÇÕES & ESTOQUE
  // ==========================================
  // Esta função não só adiciona dinheiro, mas também atualiza a quantidade de produtos no estoque
  const addTransaction = (transaction: Omit<Transaction, 'id'>, newProductName?: string) => {
    const newTransactionId = Date.now().toString();
    
    setData(prev => {
      let updatedProducts = [...prev.products];
      let finalTransaction = { ...transaction, id: newTransactionId };

      // Verifica se a transação envolve movimentação de itens
      if (transaction.quantity && transaction.quantity > 0) {
        
        // CENÁRIO 1: DESPESA (Compra) -> Aumentar Estoque ou Criar Produto Novo
        if (transaction.type === 'expense') {
          
          // Se for um NOVO produto (não tem ID ainda)
          if (newProductName) {
            const newProductId = 'prod_' + Date.now();
            const unitCost = transaction.amount / transaction.quantity;
            
            const newProduct: Product = {
              id: newProductId,
              name: newProductName,
              category: Category.OTHER, // Define padrão, usuário pode editar depois
              price: unitCost, // Preço inicial = custo
              stock: transaction.quantity,
              status: Status.IN_STOCK,
              imageUrl: ''
            };
            
            updatedProducts.push(newProduct);
            finalTransaction.productId = newProductId; // Vincula
          } 
          // Se for produto JÁ EXISTENTE
          else if (transaction.productId) {
            updatedProducts = updatedProducts.map(p => {
              if (p.id === transaction.productId) {
                const newStock = p.stock + (transaction.quantity || 0);
                return { 
                  ...p, 
                  stock: newStock, 
                  status: newStock > 0 ? Status.IN_STOCK : Status.OUT_OF_STOCK 
                };
              }
              return p;
            });
          }

        } 
        // CENÁRIO 2: RECEITA (Venda) -> Diminuir Estoque
        else if (transaction.type === 'income' && transaction.productId) {
          updatedProducts = updatedProducts.map(p => {
            if (p.id === transaction.productId) {
              const newStock = Math.max(0, p.stock - (transaction.quantity || 0));
              
              // Recalcula status do produto
              let newStatus = Status.IN_STOCK;
              if (newStock === 0) newStatus = Status.OUT_OF_STOCK;
              else if (newStock < 10) newStatus = Status.LOW_STOCK;

              return { ...p, stock: newStock, status: newStatus };
            }
            return p;
          });
        }
      }

      // Retorna o novo estado completo
      return {
        ...prev,
        products: updatedProducts,
        transactions: [...prev.transactions, finalTransaction]
      };
    });
  };

  // ==========================================
  // RENDERIZAÇÃO & ROTAS
  // ==========================================
  return (
    <LanguageProvider>
      <HashRouter>
        {/* Layout envolve todas as páginas (Sidebar + Conteúdo) */}
        <Layout isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
          <Routes>
            {/* Rota Principal: Dashboard */}
            <Route path="/" element={<DashboardView data={data} isDarkMode={isDarkMode} />} />
            
            {/* Rota: Estoque (Passa funções de manipulação de produto) */}
            <Route path="/inventory" element={
              <InventoryView 
                products={data.products} 
                onAddProduct={addProduct} 
                onUpdateProduct={updateProduct} 
                onDeleteProduct={deleteProduct} 
              />
            } />
            
            {/* Rota: Financeiro (Passa transações e produtos para vincular vendas) */}
            <Route path="/finance" element={
              <FinanceView 
                transactions={data.transactions} 
                products={data.products}
                collaborators={data.collaborators}
                onAddTransaction={addTransaction} 
              />
            } />
            
            {/* Rota: Colaboradores */}
            <Route path="/collaborators" element={
              <CollaboratorsView 
                collaborators={data.collaborators}
                transactions={data.transactions}
                onAddCollaborator={addCollaborator}
                onUpdateCollaborator={updateCollaborator}
                onDeleteCollaborator={deleteCollaborator}
              />
            } />
            
            {/* Rota: IA Insights */}
            <Route path="/insights" element={<InsightsView data={data} />} />
            
            {/* Rota Fallback: Redireciona para home se URL não existir */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;

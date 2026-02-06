
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.dashboard': { pt: 'Dashboard', en: 'Dashboard', es: 'Panel' },
  'nav.inventory': { pt: 'Estoque', en: 'Inventory', es: 'Inventario' },
  'nav.finance': { pt: 'Financeiro', en: 'Finance', es: 'Finanzas' },
  'nav.collaborators': { pt: 'Colaboradores', en: 'Collaborators', es: 'Colaboradores' },
  'nav.insights': { pt: 'Suporte IA', en: 'AI Support', es: 'Soporte IA' },
  'nav.darkMode': { pt: 'Modo Escuro', en: 'Dark Mode', es: 'Modo Oscuro' },
  'nav.lightMode': { pt: 'Modo Claro', en: 'Light Mode', es: 'Modo Claro' },

  // Dashboard
  'dash.title': { pt: 'Visão Geral', en: 'Overview', es: 'Visión General' },
  'dash.subtitle': { pt: 'Monitoramento em tempo real do seu negócio.', en: 'Real-time business monitoring.', es: 'Monitoreo en tiempo real de su negocio.' },
  'dash.systemStatus': { pt: 'Sistema Operante', en: 'System Operational', es: 'Sistema Operativo' },
  'dash.totalRevenue': { pt: 'Receita Total', en: 'Total Revenue', es: 'Ingresos Totales' },
  'dash.inflow': { pt: 'Fluxo de Entrada', en: 'Inflow', es: 'Flujo de Entrada' },
  'dash.netProfit': { pt: 'Lucro Líquido', en: 'Net Profit', es: 'Beneficio Neto' },
  'dash.margin': { pt: 'Margem', en: 'Margin', es: 'Margen' },
  'dash.inventoryValue': { pt: 'Valor em Estoque', en: 'Inventory Value', es: 'Valor en Inventario' },
  'dash.assets': { pt: 'Ativos em Produtos', en: 'Product Assets', es: 'Activos en Productos' },
  'dash.stockAlerts': { pt: 'Alertas de Estoque', en: 'Stock Alerts', es: 'Alertas de Stock' },
  'dash.attention': { pt: 'Atenção Necessária', en: 'Attention Needed', es: 'Atención Necesaria' },
  'dash.healthy': { pt: 'Estoque Saudável', en: 'Healthy Stock', es: 'Stock Saludable' },
  'dash.flowChart': { pt: 'Fluxo Financeiro', en: 'Financial Flow', es: 'Flujo Financiero' },
  'dash.topProducts': { pt: 'Mais Vendidos', en: 'Best Sellers', es: 'Más Vendidos' },
  'dash.recentActivity': { pt: 'Atividade Recente', en: 'Recent Activity', es: 'Actividad Reciente' },
  'dash.noSales': { pt: 'Sem vendas vinculadas ainda.', en: 'No linked sales yet.', es: 'Sin ventas vinculadas aún.' },
  'dash.clearHistory': { pt: 'Zerar Histórico', en: 'Clear History', es: 'Borrar Historial' },
  'dash.undo': { pt: 'Retroceder', en: 'Undo', es: 'Deshacer' },
  'dash.emptyHistory': { pt: 'Nenhuma atividade recente.', en: 'No recent activity.', es: 'Sin actividad reciente.' },
  
  // Dashboard - Individual Performance
  'dash.individualPerf': { pt: 'Desempenho Individual', en: 'Individual Performance', es: 'Rendimiento Individual' },
  'dash.selectSeller': { pt: 'Selecione um vendedor...', en: 'Select a seller...', es: 'Seleccione un vendedor...' },
  'dash.totalSold': { pt: 'Total Vendido', en: 'Total Sold', es: 'Total Vendido' },
  'dash.itemsSold': { pt: 'Vendas Realizadas', en: 'Sales Made', es: 'Ventas Realizadas' },
  'dash.recentSales': { pt: 'Últimas Vendas', en: 'Recent Sales', es: 'Últimas Ventas' },

  // Dashboard - Monthly Goal
  'dash.monthlyGoal': { pt: 'Meta Mensal', en: 'Monthly Goal', es: 'Meta Mensual' },
  'dash.goalReached': { pt: 'da meta atingida', en: 'of goal reached', es: 'de la meta alcanzada' },
  'dash.setGoal': { pt: 'Definir Meta', en: 'Set Goal', es: 'Definir Meta' },
  'dash.editGoal': { pt: 'Editar Meta', en: 'Edit Goal', es: 'Editar Meta' },
  'dash.remaining': { pt: 'Restante', en: 'Remaining', es: 'Restante' },

  // Inventory
  'inv.title': { pt: 'Estoque', en: 'Inventory', es: 'Inventario' },
  'inv.subtitle': { pt: 'Gerencie seu estoque e catálogo de produtos.', en: 'Manage your stock and product catalog.', es: 'Gestione su inventario y catálogo de productos.' },
  'inv.add': { pt: 'Adicionar Produto', en: 'Add Product', es: 'Añadir Producto' },
  'inv.search': { pt: 'Buscar produtos...', en: 'Search products...', es: 'Buscar productos...' },
  'inv.allCategories': { pt: 'Todas Categorias', en: 'All Categories', es: 'Todas las Categorías' },
  'inv.allStatus': { pt: 'Todos Status', en: 'All Status', es: 'Todos los Estados' },
  'inv.col.img': { pt: 'Img', en: 'Img', es: 'Img' },
  'inv.col.name': { pt: 'Nome do Produto', en: 'Product Name', es: 'Nombre del Producto' },
  'inv.col.category': { pt: 'Categoria', en: 'Category', es: 'Categoría' },
  'inv.col.price': { pt: 'Preço', en: 'Price', es: 'Precio' },
  'inv.col.qty': { pt: 'Qtd.', en: 'Qty.', es: 'Cant.' },
  'inv.col.status': { pt: 'Status', en: 'Status', es: 'Estado' },
  'inv.col.actions': { pt: 'Ações', en: 'Actions', es: 'Acciones' },
  'inv.empty': { pt: 'Nenhum produto encontrado.', en: 'No products found.', es: 'Ningún producto encontrado.' },
  'inv.showing': { pt: 'Mostrando', en: 'Showing', es: 'Mostrando' },
  'inv.of': { pt: 'de', en: 'of', es: 'de' },
  'inv.results': { pt: 'resultados', en: 'results', es: 'resultados' },
  'inv.newTitle': { pt: 'Novo Produto', en: 'New Product', es: 'Nuevo Producto' },
  'inv.image': { pt: 'Imagem do Produto', en: 'Product Image', es: 'Imagen del Producto' },
  'inv.upload': { pt: 'Cole a URL ou faça upload...', en: 'Paste URL or upload...', es: 'Pegue URL o suba...' },
  'inv.confirmDelete': { pt: 'Confirmar Exclusão', en: 'Confirm Deletion', es: 'Confirmar Eliminación' },
  'inv.deleteMsg': { pt: 'Tem certeza que deseja excluir este produto?', en: 'Are you sure you want to delete this product?', es: '¿Está seguro de que desea eliminar este producto?' },
  'common.cancel': { pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' },
  'common.delete': { pt: 'Excluir', en: 'Delete', es: 'Eliminar' },
  'common.save': { pt: 'Salvar', en: 'Save', es: 'Guardar' },
  'common.create': { pt: 'Criar', en: 'Create', es: 'Crear' },

  // Finance
  'fin.title': { pt: 'Gestão Financeira', en: 'Financial Management', es: 'Gestión Financiera' },
  'fin.subtitle': { pt: 'Controle completo de fluxo de caixa.', en: 'Complete cash flow control.', es: 'Control completo de flujo de caja.' },
  'fin.monthlyIncome': { pt: 'Receita Mensal', en: 'Monthly Revenue', es: 'Ingresos Mensuales' },
  'fin.monthlyExpense': { pt: 'Despesa Mensal', en: 'Monthly Expense', es: 'Gastos Mensuales' },
  'fin.balance': { pt: 'Balanço do Período', en: 'Period Balance', es: 'Balance del Período' },
  'fin.positive': { pt: 'Resultado positivo', en: 'Positive result', es: 'Resultado positivo' },
  'fin.negative': { pt: 'Gastos superam receitas', en: 'Expenses exceed income', es: 'Gastos superan ingresos' },
  'fin.newTransaction': { pt: 'Novo Lançamento', en: 'New Transaction', es: 'Nueva Transacción' },
  'fin.income': { pt: 'Receita', en: 'Income', es: 'Ingreso' },
  'fin.expense': { pt: 'Despesa', en: 'Expense', es: 'Gasto' },
  'fin.linkProduct': { pt: 'Vincular Venda a Produto', en: 'Link Sale to Product', es: 'Vincular Venta a Producto' },
  'fin.selectProduct': { pt: 'Selecione um produto...', en: 'Select a product...', es: 'Seleccione un producto...' },
  'fin.seller': { pt: 'Vendedor (Colaborador)', en: 'Seller (Collaborator)', es: 'Vendedor (Colaborador)' },
  'fin.selectCollab': { pt: 'Selecionar Colaborador', en: 'Select Collaborator', es: 'Seleccionar Colaborador' },
  'fin.directSale': { pt: 'Venda Direta / Sem vendedor', en: 'Direct Sale / No seller', es: 'Venta Directa / Sin vendedor' },
  'fin.qtySold': { pt: 'Quantidade Vendida', en: 'Quantity Sold', es: 'Cantidad Vendida' },
  'fin.isStock': { pt: 'É uma Compra / Reposição?', en: 'Is it a Purchase / Restock?', es: '¿Es una Compra / Reposición?' },
  'fin.existingProd': { pt: 'Produto Existente', en: 'Existing Product', es: 'Producto Existente' },
  'fin.newProd': { pt: 'Novo Produto', en: 'New Product', es: 'Nuevo Producto' },
  'fin.newProdName': { pt: 'Nome do Novo Produto', en: 'New Product Name', es: 'Nombre del Nuevo Producto' },
  'fin.qtyBought': { pt: 'Quantidade Comprada', en: 'Quantity Bought', es: 'Cantidad Comprada' },
  'fin.description': { pt: 'Descrição', en: 'Description', es: 'Descripción' },
  'fin.date': { pt: 'Data', en: 'Date', es: 'Fecha' },
  'fin.amount': { pt: 'Valor Total (R$)', en: 'Total Amount', es: 'Monto Total' },
  'fin.addBtn': { pt: 'Adicionar Lançamento', en: 'Add Transaction', es: 'Añadir Transacción' },
  'fin.chartTitle': { pt: 'Despesas por Categoria', en: 'Expenses by Category', es: 'Gastos por Categoría' },
  'fin.noExpenses': { pt: 'Sem despesas neste mês', en: 'No expenses this month', es: 'Sin gastos este mes' },
  'fin.extract': { pt: 'Extrato Detalhado', en: 'Detailed Statement', es: 'Estado Detallado' },
  'fin.entries': { pt: 'lançamentos', en: 'entries', es: 'entradas' },
  'fin.noTrans': { pt: 'Nenhuma transação encontrada para este mês.', en: 'No transactions found for this month.', es: 'No se encontraron transacciones para este mes.' },
  'fin.exportPDF': { pt: 'Exportar PDF', en: 'Export PDF', es: 'Exportar PDF' },
  'fin.generatedAt': { pt: 'Gerado em', en: 'Generated at', es: 'Generado en' },
  'fin.period': { pt: 'Período', en: 'Period', es: 'Período' },

  // Collaborators
  'col.title': { pt: 'Colaboradores', en: 'Collaborators', es: 'Colaboradores' },
  'col.subtitle': { pt: 'Gestão de equipe e desempenho.', en: 'Team management and performance.', es: 'Gestión de equipo y rendimiento.' },
  'col.add': { pt: 'Novo Colaborador', en: 'New Collaborator', es: 'Nuevo Colaborador' },
  'col.search': { pt: 'Buscar por nome ou matrícula...', en: 'Search by name or ID...', es: 'Buscar por nombre o ID...' },
  'col.allSectors': { pt: 'Todos os Setores', en: 'All Sectors', es: 'Todos los Sectores' },
  'col.matricula': { pt: 'Matrícula', en: 'ID Number', es: 'Matrícula' },
  'col.sector': { pt: 'Setor', en: 'Sector', es: 'Sector' },
  'col.totalSales': { pt: 'Total Vendas', en: 'Total Sales', es: 'Ventas Totales' },
  'col.transactions': { pt: 'Transações', en: 'Transactions', es: 'Transacciones' },
  'col.history': { pt: 'Histórico Completo', en: 'Full History', es: 'Historial Completo' },
  'col.adminProfile': { pt: 'Perfil Administrativo', en: 'Administrative Profile', es: 'Perfil Administrativo' },
  'col.editTitle': { pt: 'Editar Perfil', en: 'Edit Profile', es: 'Editar Perfil' },
  'col.newTitle': { pt: 'Novo Colaborador', en: 'New Collaborator', es: 'Nuevo Colaborador' },
  'col.photo': { pt: 'Foto de Perfil', en: 'Profile Photo', es: 'Foto de Perfil' },
  'col.firstName': { pt: 'Nome', en: 'First Name', es: 'Nombre' },
  'col.lastName': { pt: 'Sobrenome', en: 'Last Name', es: 'Apellido' },
  'col.role': { pt: 'Cargo', en: 'Role', es: 'Cargo' },
  'col.hiredDate': { pt: 'Data de Admissão', en: 'Hired Date', es: 'Fecha de Contratación' },
  'col.generate': { pt: 'Gerar', en: 'Generate', es: 'Generar' },
  'col.salesHistory': { pt: 'Histórico de Vendas', en: 'Sales History', es: 'Historial de Ventas' },
  'col.noSales': { pt: 'Nenhuma venda registrada.', en: 'No sales registered.', es: 'Ninguna venta registrada.' },

  // Insights (New AI Features)
  'ins.title': { pt: 'Suporte IA', en: 'AI Support', es: 'Soporte IA' },
  'ins.subtitle': { pt: 'Recomendações inteligentes baseadas nos seus dados.', en: 'Intelligent recommendations based on your data.', es: 'Recomendaciones inteligentes basadas en sus datos.' },
  'ins.hero.title': { pt: 'Como posso ajudar seu negócio hoje?', en: 'How can I help your business today?', es: '¿Cómo puedo ajudar a su negocio hoy?' },
  'ins.hero.subtitle': { pt: 'Selecione um foco de análise abaixo para receber recomendações personalizadas baseadas nos seus dados em tempo real.', en: 'Select an analysis focus below to receive personalized recommendations based on your real-time data.', es: 'Seleccione un enfoque de análisis a continuación para recibir recomendaciones personalizadas basadas en sus datos en tiempo real.' },
  
  'ins.mode.inventory': { pt: 'Otimização de Estoque', en: 'Inventory Optimization', es: 'Optimización de Inventario' },
  'ins.mode.inventoryDesc': { pt: 'Identificar itens parados e necessidade de reposição.', en: 'Identify stagnant items and restocking needs.', es: 'Identificar artículos estancados y necesidades de reposición.' },
  
  'ins.mode.finance': { pt: 'Auditoria Financeira', en: 'Financial Audit', es: 'Auditoría Financiera' },
  'ins.mode.financeDesc': { pt: 'Análise de margens, corte de custos e fluxo de caixa.', en: 'Margin analysis, cost cutting, and cash flow.', es: 'Análisis de márgenes, reducción de costos y flujo de caja.' },
  
  'ins.mode.marketing': { pt: 'Estratégias de Vendas', en: 'Sales Strategies', es: 'Estrategias de Ventas' },
  'ins.mode.marketingDesc': { pt: 'Ideias criativas de promoções e campanhas.', en: 'Creative ideas for promotions and campaigns.', es: 'Ideas creativas para promociones y campañas.' },

  'ins.results': { pt: 'Resultados da Análise', en: 'Analysis Results', es: 'Resultados del Análisis' },
  'ins.type.success': { pt: 'Oportunidade', en: 'Opportunity', es: 'Oportunidad' },
  'ins.type.warning': { pt: 'Atenção', en: 'Attention', es: 'Atención' },
  'ins.type.info': { pt: 'Dica', en: 'Tip', es: 'Consejo' },
  'ins.empty': { pt: 'Nenhum insight encontrado.', en: 'No insights found.', es: 'No se encontraron insights.' },

  // Data Translation (Values kept in PT in DB)
  'Em Estoque': { pt: 'Em Estoque', en: 'In Stock', es: 'En Stock' },
  'Estoque Baixo': { pt: 'Estoque Baixo', en: 'Low Stock', es: 'Low Stock' },
  'Sem Estoque': { pt: 'Sem Estoque', en: 'Out of Stock', es: 'Sin Stock' },
  'Eletrônicos': { pt: 'Eletrônicos', en: 'Electronics', es: 'Electrónica' },
  'Móveis': { pt: 'Móveis', en: 'Furniture', es: 'Muebles' },
  'Vestuário': { pt: 'Vestuário', en: 'Clothing', es: 'Ropa' },
  'Escritório': { pt: 'Escritório', en: 'Office', es: 'Oficina' },
  'Outros': { pt: 'Outros', en: 'Others', es: 'Otros' },
  'Comercial': { pt: 'Comercial', en: 'Commercial', es: 'Comercial' },
  'Administrativo': { pt: 'Administrativo', en: 'Administrative', es: 'Administrativo' },
  'Serviços Gerais': { pt: 'Serviços Gerais', en: 'General Services', es: 'Servicios Generales' },
  'Vendas': { pt: 'Vendas', en: 'Sales', es: 'Ventas' },
  'Compra / Estoque': { pt: 'Compra / Estoque', en: 'Purchase / Stock', es: 'Compra / Stock' },
  'Serviços': { pt: 'Serviços', en: 'Services', es: 'Servicios' },
  'Aluguel/Infra': { pt: 'Aluguel/Infra', en: 'Rent/Infra', es: 'Alquiler/Infra' },
  'Salários': { pt: 'Salários', en: 'Salaries', es: 'Salarios' },
  'Marketing': { pt: 'Marketing', en: 'Marketing', es: 'Marketing' },
  'Equipamentos': { pt: 'Equipamentos', en: 'Equipment', es: 'Equipos' },
  'Insumos': { pt: 'Insumos', en: 'Supplies', es: 'Insumos' }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string) => {
    // If it's a known key in dictionary
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    // Fallback: Check if the key itself is a value that needs translation (for Enums)
    // This allows t('Em Estoque') to work
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, TrendingUp, AlertTriangle, ArrowUpRight, ShoppingBag, Activity, User, Award, Calendar, Briefcase, Target, Edit3, CheckCircle2, X, Clock } from 'lucide-react';
import { AppData, Status, TransactionCategory, Sector } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardViewProps {
  data: AppData;
  isDarkMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, isDarkMode }) => {
  const { t } = useLanguage();
  const [selectedCollabId, setSelectedCollabId] = useState<string>('');
  
  // Estado para Meta Mensal (Persistido no LocalStorage)
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const saved = localStorage.getItem('nexus_monthly_goal');
    return saved ? Number(saved) : 50000; // Default 50k
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(monthlyGoal.toString());

  useEffect(() => {
    localStorage.setItem('nexus_monthly_goal', monthlyGoal.toString());
  }, [monthlyGoal]);

  const handleSaveGoal = () => {
    const val = Number(tempGoal);
    if (!isNaN(val) && val > 0) {
      setMonthlyGoal(val);
      setIsEditingGoal(false);
    }
  };

  // Helper simples para formatar dinheiro (R$)
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Cálculo de dias restantes no mês
  const daysRemaining = useMemo(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const diffTime = lastDayOfMonth.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return Math.max(0, diffDays);
  }, []);

  // ==========================================
  // CÁLCULOS ESTATÍSTICOS (MEMOIZED)
  // ==========================================
  // 'useMemo' serve para não refazer esses cálculos pesados toda vez que a tela piscar.
  // Só recalcula se 'data' mudar.
  const stats = useMemo(() => {
    // 1. Soma todas as entradas (Receita)
    const totalRevenue = data.transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    // 2. Soma todas as saídas (Despesas)
    const totalExpenses = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Lucro = Receita - Despesa
    const netProfit = totalRevenue - totalExpenses;
    
    // 4. Conta quantos produtos não estão "Em Estoque"
    const lowStockCount = data.products.filter(p => p.status !== Status.IN_STOCK).length;
    
    // 5. Calcula quanto dinheiro está parado em mercadoria (Preço * Quantidade)
    const inventoryValue = data.products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);

    return { totalRevenue, netProfit, lowStockCount, inventoryValue, totalExpenses };
  }, [data]);

  // Cálculo da Porcentagem da Meta
  const goalPercentage = Math.min((stats.totalRevenue / monthlyGoal) * 100, 100);

  // ==========================================
  // PREPARAÇÃO DE DADOS PARA GRÁFICOS
  // ==========================================
  const chartData = useMemo(() => {
    // Agrupa transações por data para o gráfico de área
    const grouped = data.transactions.reduce((acc, curr) => {
      const date = new Date(curr.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      // Se a data não existe no acumulador, cria
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
      
      // Soma no dia correspondente
      if (curr.type === 'income') acc[date].income += curr.amount;
      else acc[date].expense += curr.amount;
      return acc;
    }, {} as Record<string, any>);
    
    // Pega apenas os últimos 7 registros para o gráfico não ficar poluido
    return Object.values(grouped).slice(-7); 
  }, [data.transactions]);

  // ==========================================
  // CÁLCULO: TOP PRODUTOS (MAIS VENDIDOS)
  // ==========================================
  const topProducts = useMemo(() => {
    const productRevenue: Record<string, number> = {};
    
    // Itera transações para somar receita por produto
    data.transactions.forEach(t => {
      if (t.type === 'income' && t.productId) {
        productRevenue[t.productId] = (productRevenue[t.productId] || 0) + t.amount;
      }
    });

    // Ordena do maior para o menor e pega o Top 3
    return Object.entries(productRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id, total]) => {
        const product = data.products.find(p => p.id === id);
        return product ? { ...product, totalRevenue: total } : null;
      })
      .filter(Boolean);
  }, [data.transactions, data.products]);

  // Lista simples de atividade recente (últimas 5 transações)
  const recentActivity = useMemo(() => {
    return [...data.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [data.transactions]);

  // ==========================================
  // RELATÓRIO INDIVIDUAL (NOVA FUNÇÃO)
  // ==========================================
  const selectedCollabStats = useMemo(() => {
    if (!selectedCollabId) return null;
    
    const collab = data.collaborators.find(c => c.id === selectedCollabId);
    if (!collab) return null;

    // Filtra vendas deste colaborador
    const sales = data.transactions
      .filter(t => t.type === 'income' && t.collaboratorId === selectedCollabId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalRevenue = sales.reduce((acc, t) => acc + t.amount, 0);
    const totalCount = sales.length;

    // Pega últimas 4 vendas para resumo
    const recentSales = sales.slice(0, 4);

    return { collab, sales, totalRevenue, totalCount, recentSales };
  }, [selectedCollabId, data.transactions, data.collaborators]);

  // Definição de cores baseadas no tema
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipBg = isDarkMode ? '#1e293b' : '#fff';
  const tooltipText = isDarkMode ? '#fff' : '#0f172a';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dash.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('dash.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{t('dash.systemStatus')}</span>
        </div>
      </div>

      {/* GRID DE KPIs (CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Receita */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
            <DollarSign className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('dash.totalRevenue')}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</h3>
          <div className="flex items-center mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            <span>{t('dash.inflow')}</span>
          </div>
        </div>

        {/* Card: Lucro Líquido */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
            <TrendingUp className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('dash.netProfit')}</p>
          <h3 className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
            {formatCurrency(stats.netProfit)}
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            {t('dash.margin')}: {stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%
          </p>
        </div>

        {/* Card: Valor em Estoque */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
            <Package className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('dash.inventoryValue')}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.inventoryValue)}</h3>
          <div className="flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <ShoppingBag className="w-3 h-3 mr-1" />
            <span>{t('dash.assets')}</span>
          </div>
        </div>

        {/* Card: Alertas de Estoque */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
            <AlertTriangle className="w-16 h-16 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('dash.stockAlerts')}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lowStockCount}</h3>
          <div className={`flex items-center mt-2 text-xs font-medium ${stats.lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {stats.lowStockCount > 0 ? (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span>{t('dash.attention')}</span>
              </>
            ) : (
              <span>{t('dash.healthy')}</span>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: GRÁFICO E WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: GRÁFICO E META */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* GRÁFICO DE FLUXO */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                {t('dash.flowChart')}
              </h3>
              {/* Legenda do Gráfico */}
              <div className="flex gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {t('fin.income')}
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> {t('fin.expense')}
                </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis 
                    dataKey="date" 
                    stroke={isDarkMode ? '#64748b' : '#94a3b8'} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    width={70}
                    stroke={isDarkMode ? '#64748b' : '#94a3b8'} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => {
                      if (value === 0) return 'R$ 0';
                      if (value >= 1000) return `R$ ${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
                      return `R$ ${value}`;
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: tooltipText }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelStyle={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '8px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#f43f5e" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NOVO WIDGET: META MENSAL DE VENDAS */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="font-bold text-lg flex items-center gap-2">
                     <Target className="w-5 h-5" />
                     {t('dash.monthlyGoal')}
                   </h3>
                   <p className="text-indigo-100 text-sm opacity-90">Acompanhe o progresso de faturamento.</p>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    {/* Badge de Dias Restantes */}
                   <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 text-xs font-semibold" title="Dias restantes no mês">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{daysRemaining} dias rest.</span>
                   </div>

                   {isEditingGoal ? (
                     <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
                        <input 
                          type="number" 
                          value={tempGoal}
                          onChange={(e) => setTempGoal(e.target.value)}
                          className="w-24 px-2 py-1 text-sm bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                          autoFocus
                        />
                        <button onClick={handleSaveGoal} className="p-1 hover:bg-white/20 rounded text-green-300">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsEditingGoal(false)} className="p-1 hover:bg-white/20 rounded text-rose-300">
                          <X className="w-5 h-5" />
                        </button>
                     </div>
                   ) : (
                     <button 
                      onClick={() => { setTempGoal(monthlyGoal.toString()); setIsEditingGoal(true); }}
                      className="flex items-center gap-2 text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/10"
                     >
                       <Edit3 className="w-3.5 h-3.5" />
                       {t('dash.editGoal')}
                     </button>
                   )}
                 </div>
               </div>

               <div className="flex items-end justify-between mb-2">
                 <span className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</span>
                 <span className="text-sm font-medium opacity-80 mb-1">
                   Meta: {formatCurrency(monthlyGoal)}
                 </span>
               </div>

               {/* Barra de Progresso */}
               <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                 <div 
                   className="h-full bg-gradient-to-r from-emerald-300 to-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                   style={{ width: `${goalPercentage}%` }}
                 ></div>
               </div>
               
               <div className="flex justify-between mt-2 text-xs font-medium">
                  <span className="text-emerald-300">{goalPercentage.toFixed(1)}% {t('dash.goalReached')}</span>
                  {monthlyGoal > stats.totalRevenue && (
                    <span className="text-indigo-100">{t('dash.remaining')}: {formatCurrency(monthlyGoal - stats.totalRevenue)}</span>
                  )}
               </div>
            </div>
          </div>

        </div>

        {/* COLUNA LATERAL (WIDGETS) */}
        <div className="space-y-6">

          {/* WIDGET: DESEMPENHO INDIVIDUAL */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
               <Briefcase className="w-4 h-4 text-indigo-500" />
               {t('dash.individualPerf')}
             </h3>
             
             {/* Seletor de Colaborador */}
             <div className="relative mb-5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  value={selectedCollabId}
                  onChange={(e) => setSelectedCollabId(e.target.value)}
                >
                  <option value="">{t('dash.selectSeller')}</option>
                  {data.collaborators
                    .filter(c => c.sector === Sector.COMMERCIAL)
                    .map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
             </div>

             {/* Corpo do Relatório */}
             {selectedCollabStats ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                     <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center border-2 border-white dark:border-slate-600 shadow-md">
                        {selectedCollabStats.collab.avatarUrl ? (
                           <img src={selectedCollabStats.collab.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-slate-500">{selectedCollabStats.collab.firstName[0]}</span>
                        )}
                     </div>
                     <div>
                       <p className="font-bold text-slate-900 dark:text-white">{selectedCollabStats.collab.firstName} {selectedCollabStats.collab.lastName}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCollabStats.collab.role}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                        <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1">{t('dash.totalSold')}</p>
                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(selectedCollabStats.totalRevenue)}</p>
                     </div>
                     <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                        <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-1">{t('dash.itemsSold')}</p>
                        <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                          {selectedCollabStats.totalCount} <span className="text-xs font-normal opacity-70">transações</span>
                        </p>
                     </div>
                  </div>

                  <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                       <Award className="w-3 h-3" /> {t('dash.recentSales')}
                     </p>
                     <div className="space-y-2">
                       {selectedCollabStats.recentSales.length > 0 ? selectedCollabStats.recentSales.map(t => (
                         <div key={t.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <span className="truncate max-w-[120px] text-slate-700 dark:text-slate-300 font-medium">{t.description}</span>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                               <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(t.amount)}</span>
                            </div>
                         </div>
                       )) : (
                         <p className="text-xs text-slate-400 italic text-center py-2">Nenhuma venda recente.</p>
                       )}
                     </div>
                  </div>
                </div>
             ) : (
               <div className="text-center py-8 text-slate-400 text-sm italic border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
                  Selecione um vendedor para ver o relatório.
               </div>
             )}
          </div>
          
          {/* Widget: Top Produtos */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
               <ShoppingBag className="w-4 h-4 text-indigo-500" />
               {t('dash.topProducts')}
             </h3>
             <div className="space-y-4">
               {topProducts.length > 0 ? topProducts.map((product: any, idx) => (
                 <div key={product.id} className="flex items-center gap-3 group">
                   <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
                        ) : (
                          <Package className="w-5 h-5 m-2.5 text-slate-400" />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
                        {idx + 1}
                      </div>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">
                       {product.name}
                     </p>
                     <p className="text-xs text-slate-500 dark:text-slate-400">
                       {product.stock} un. {t('inv.of')} {t('inv.col.status')}
                     </p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                       {formatCurrency(product.totalRevenue)}
                     </p>
                   </div>
                 </div>
               )) : (
                 <div className="py-8 text-center text-slate-400 text-sm">
                   {t('dash.noSales')}
                 </div>
               )}
             </div>
          </div>

          {/* Widget: Atividade Recente */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              {t('dash.recentActivity')}
            </h3>
            <div className="space-y-4 relative">
               {/* Linha vertical conectando os pontos */}
               <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-100 dark:bg-slate-700"></div>

               {recentActivity.map((tData, idx) => (
                 <div key={tData.id} className="flex gap-3 relative z-10">
                   <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-800
                      ${tData.type === 'income' ? 'border-emerald-500' : 'border-rose-500'}
                   `}>
                      <div className={`w-1.5 h-1.5 rounded-full ${tData.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-start">
                       <p className="text-xs font-medium text-slate-900 dark:text-white line-clamp-1">
                         {tData.description}
                       </p>
                       <span className={`text-xs font-bold whitespace-nowrap ${tData.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {tData.type === 'income' ? '+' : '-'}{formatCurrency(tData.amount)}
                       </span>
                     </div>
                     <div className="flex justify-between items-center mt-0.5">
                       <span className="text-[10px] text-slate-400">
                         {new Date(tData.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                       </span>
                       <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                         {t(tData.category)}
                       </span>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

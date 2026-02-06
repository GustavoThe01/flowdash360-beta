
import React, { useState, useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, PieChart as PieIcon, BarChart3, Filter, Calendar, TrendingUp, TrendingDown, DollarSign, Package, AlertCircle, ShoppingCart, PlusCircle, User, Briefcase, FileDown } from 'lucide-react';
import { Transaction, TransactionCategory, Product, Collaborator, Sector } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
// @ts-ignore
import { jsPDF } from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

interface FinanceViewProps {
  transactions: Transaction[];
  products: Product[];
  collaborators: Collaborator[]; // Added prop
  onAddTransaction: (t: Omit<Transaction, 'id'>, newProductName?: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ transactions, products, collaborators, onAddTransaction }) => {
  const { t, language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Estado Estendido do Formulário
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: TransactionCategory.OTHER,
    type: 'income' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    productId: '',
    quantity: '1',
    collaboratorId: '', // Novo campo para vendedor/colaborador
    isStockPurchase: false, // Se é uma compra de estoque
    purchaseType: 'existing' as 'existing' | 'new', // Compra de produto existente ou novo
    newProductName: '' // Nome do novo produto se for criar
  });

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === formData.productId);
  }, [formData.productId, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    // Validação de Venda (Saída de Estoque)
    if (formData.type === 'income' && selectedProduct && Number(formData.quantity) > selectedProduct.stock) {
      alert(`Quantidade indisponível! Estoque atual: ${selectedProduct.stock}`);
      return;
    }

    // Configura os dados para envio
    let transactionData: Omit<Transaction, 'id'> = {
      amount: Number(formData.amount),
      description: formData.description,
      category: formData.isStockPurchase ? TransactionCategory.STOCK : formData.category,
      type: formData.type,
      date: formData.date,
      quantity: Number(formData.quantity),
      // Vincula colaborador se for VENDA (Income) OU se for DESPESA (Salário)
      collaboratorId: (formData.type === 'income' || (formData.type === 'expense' && formData.category === TransactionCategory.SALARY)) 
        ? formData.collaboratorId 
        : undefined
    };

    // Lógica de Vinculação de Produto
    if (formData.type === 'income') {
      // Venda
      transactionData.productId = formData.productId || undefined;
    } else if (formData.type === 'expense' && formData.isStockPurchase) {
      // Compra
      if (formData.purchaseType === 'existing') {
         transactionData.productId = formData.productId;
         transactionData.description = `Compra: ${selectedProduct?.name || 'Estoque'}`;
      } else {
         // Novo Produto
         transactionData.description = `Compra (Novo): ${formData.newProductName}`;
      }
    }

    onAddTransaction(transactionData, formData.type === 'expense' && formData.isStockPurchase && formData.purchaseType === 'new' ? formData.newProductName : undefined);
    
    // Reset Form
    setFormData({ 
      ...formData, 
      amount: '', 
      description: '', 
      category: TransactionCategory.OTHER, 
      productId: '', 
      quantity: '1',
      collaboratorId: '',
      isStockPurchase: false,
      purchaseType: 'existing',
      newProductName: ''
    });
  };

  // Handle Product Selection (Income) or Existing Purchase (Expense)
  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    const product = products.find(p => p.id === pId);
    
    if (product) {
      const updates: any = { productId: pId };
      
      if (formData.type === 'income') {
        updates.description = `Venda: ${product.name}`;
        updates.amount = (product.price * 1).toString();
        updates.quantity = '1';
        updates.category = TransactionCategory.SALES;
      }
      // Se for Despesa (Compra), não mudamos o valor automaticamente pois o custo pode variar

      setFormData({ ...formData, ...updates });
    } else {
      setFormData({ ...formData, productId: '', quantity: '1' });
    }
  };

  // Handle Quantity Change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = Number(e.target.value);
    const updates: any = { quantity: e.target.value };
    
    // Apenas em Vendas (Income) calculamos o total automaticamente baseado no preço de venda
    if (formData.type === 'income' && selectedProduct) {
      updates.amount = (selectedProduct.price * qty).toString();
    }
    
    setFormData({ ...formData, ...updates });
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Filter transactions by selected month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth.getMonth() && 
             tDate.getFullYear() === currentMonth.getFullYear();
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentMonth]);

  // Calculate KPIs
  const stats = useMemo(() => {
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense, balance: income - expense };
  }, [monthlyTransactions]);

  // Data for Charts
  const categoryData = useMemo(() => {
    const expenses = monthlyTransactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      const cat = curr.category || 'Outros'; 
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [monthlyTransactions]);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split('-').map(Number);
    setCurrentMonth(new Date(year, month - 1, day, 12, 0, 0));
  };

  const currentDateValue = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(currentMonth.getDate()).padStart(2, '0')}`;

  // ==========================================
  // EXPORT TO PDF
  // ==========================================
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Cores da Marca (Baseado no Tailwind do projeto)
    const colorPrimary = [79, 70, 229]; // Indigo 600
    const colorSlate900 = [15, 23, 42]; // Slate 900
    const colorGreen = [16, 185, 129]; // Emerald 500
    const colorRed = [244, 63, 94]; // Rose 500
    const colorGray = [100, 116, 139]; // Slate 500

    // --- CABEÇALHO (HEADER) ---
    // Fundo colorido no topo
    doc.setFillColor(...colorPrimary);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Nome do App (Branco)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("FlowDash360", 14, 25);

    // Subtítulo do Relatório (Branco com opacidade)
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(t('fin.extract'), pageWidth - 14, 25, { align: 'right' });

    // --- METADADOS ---
    const now = new Date();
    const timestamp = now.toLocaleString(language === 'en' ? 'en-US' : (language === 'es' ? 'es-ES' : 'pt-BR'));
    const period = currentMonth.toLocaleDateString(language === 'en' ? 'en-US' : (language === 'es' ? 'es-ES' : 'pt-BR'), { month: 'long', year: 'numeric' });

    doc.setTextColor(...colorSlate900);
    doc.setFontSize(10);
    doc.text(`${t('fin.period')}:`, 14, 50);
    doc.setFont("helvetica", "bold");
    doc.text(period.charAt(0).toUpperCase() + period.slice(1), 32, 50);

    doc.setFont("helvetica", "normal");
    doc.text(`${t('fin.generatedAt')}:`, pageWidth - 14 - doc.getTextWidth(timestamp), 50, { align: 'right' });
    doc.text(timestamp, pageWidth - 14, 50, { align: 'right' });

    // --- RESUMO FINANCEIRO (SUMMARY CARDS) ---
    const startYSummary = 60;
    const boxWidth = (pageWidth - 28 - 10) / 3; // 3 boxes with gap
    const boxHeight = 25;

    // Helper para desenhar caixa de resumo
    const drawSummaryBox = (x: number, title: string, value: number, color: number[]) => {
       doc.setDrawColor(226, 232, 240); // Borda cinza clara
       doc.setFillColor(248, 250, 252); // Fundo quase branco
       doc.roundedRect(x, startYSummary, boxWidth, boxHeight, 3, 3, 'FD');
       
       doc.setFontSize(9);
       doc.setTextColor(...colorGray);
       doc.setFont("helvetica", "bold");
       doc.text(title.toUpperCase(), x + 5, startYSummary + 8);
       
       doc.setFontSize(14);
       doc.setTextColor(...color);
       doc.text(formatCurrency(value), x + 5, startYSummary + 19);
    };

    drawSummaryBox(14, t('fin.income'), stats.income, colorGreen);
    drawSummaryBox(14 + boxWidth + 5, t('fin.expense'), stats.expense, colorRed);
    // Saldo
    const balanceColor = stats.balance >= 0 ? colorSlate900 : colorRed;
    drawSummaryBox(14 + (boxWidth + 5) * 2, t('fin.balance'), stats.balance, balanceColor);


    // --- TABELA DE TRANSAÇÕES ---
    const tableBody = monthlyTransactions.map(trans => [
      new Date(trans.date).toLocaleDateString(language === 'en' ? 'en-US' : (language === 'es' ? 'es-ES' : 'pt-BR')),
      trans.description,
      t(trans.category),
      t(trans.type === 'income' ? 'fin.income' : 'fin.expense'),
      formatCurrency(trans.amount)
    ]);

    // Linha de Rodapé da Tabela
    const totalRow = [
      '', 
      '', 
      '', 
      'SALDO FINAL', 
      formatCurrency(stats.balance)
    ];

    autoTable(doc, {
      startY: startYSummary + boxHeight + 15,
      head: [[t('fin.date'), t('fin.description'), t('inv.col.category'), 'Tipo', t('fin.amount')]],
      body: tableBody,
      foot: [totalRow],
      theme: 'striped',
      headStyles: { 
        fillColor: colorPrimary, 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Data
        1: { cellWidth: 'auto' }, // Descrição
        2: { cellWidth: 35 }, // Categoria
        3: { cellWidth: 25 }, // Tipo
        4: { halign: 'right', fontStyle: 'bold', cellWidth: 35 } // Valor
      },
      styles: { 
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak'
      },
      footStyles: {
        fillColor: [241, 245, 249], // slate-100
        textColor: stats.balance >= 0 ? colorGreen : colorRed,
        fontStyle: 'bold',
        halign: 'right'
      },
      // Coloração condicional dos valores
      didParseCell: function(data: any) {
        if (data.section === 'body' && data.column.index === 4) {
          const rowData = monthlyTransactions[data.row.index];
          if (rowData) {
            if (rowData.type === 'income') {
              data.cell.styles.textColor = colorGreen;
            } else {
              data.cell.styles.textColor = colorRed;
            }
          }
        }
        // Alinhamento do rodapé na última coluna
        if (data.section === 'foot' && data.column.index !== 4) {
           data.cell.styles.halign = 'right';
        }
      },
      // Rodapé da página (Paginação e Assinatura)
      didDrawPage: function (data: any) {
        // Numero da pagina
        const str = 'Página ' + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        
        doc.text(str, data.settings.margin.left, pageHeight - 10);
        
        // Crédito / Assinatura
        doc.text("FlowDash360 • gugaosterno@gmail.com", pageWidth - 14, pageHeight - 10, { align: 'right' });
      }
    });

    const safeFilename = period.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Extrato_${safeFilename}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('fin.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('fin.subtitle')}</p>
        </div>
        
        <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
            <ArrowDownLeft className="w-5 h-5 rotate-45" />
          </button>
          
          <div className="relative group mx-2">
            <div className="px-4 py-1.5 font-semibold text-slate-900 dark:text-white min-w-[180px] text-center flex items-center justify-center gap-2 pointer-events-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              {currentMonth.toLocaleDateString(useLanguage().language === 'en' ? 'en-US' : (useLanguage().language === 'es' ? 'es-ES' : 'pt-BR'), { month: 'long', year: 'numeric' })}
            </div>
            
            <input 
              type="date" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value={currentDateValue}
              onChange={handleDateSelect}
              title="Clique para selecionar uma data específica"
            />
          </div>

          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
            <ArrowUpRight className="w-5 h-5 rotate-45" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('fin.monthlyIncome')}</p>
              <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(stats.income)}</h3>
            </div>
            <div className="p-3.5 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm">
              <TrendingUp className="w-7 h-7" />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('fin.monthlyExpense')}</p>
              <h3 className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-2">{formatCurrency(stats.expense)}</h3>
            </div>
            <div className="p-3.5 bg-rose-100 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 shadow-sm">
              <TrendingDown className="w-7 h-7" />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-rose-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min((stats.expense / (stats.income || 1)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('fin.balance')}</p>
              <h3 className={`text-3xl font-bold mt-2 ${stats.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
                {formatCurrency(stats.balance)}
              </h3>
            </div>
            <div className="p-3.5 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm">
              <DollarSign className="w-7 h-7" />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 py-1.5 px-3 rounded-lg inline-block">
             {stats.balance >= 0 ? `👍 ${t('fin.positive')}` : `⚠️ ${t('fin.negative')}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form & Charts */}
        <div className="space-y-6 lg:col-span-1">
          {/* New Transaction Form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-500" />
              {t('fin.newTransaction')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', isStockPurchase: false, productId: '' })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200
                    ${formData.type === 'income' 
                      ? 'bg-white dark:bg-slate-600 text-emerald-600 shadow-md transform scale-100' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                  {t('fin.income')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', productId: '' })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200
                    ${formData.type === 'expense' 
                      ? 'bg-white dark:bg-slate-600 text-rose-600 shadow-md transform scale-100' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                  {t('fin.expense')}
                </button>
              </div>

              {/* INCOME: Product Selector (Sales) */}
              {formData.type === 'income' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                      {t('fin.linkProduct')}
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium"
                      value={formData.productId}
                      onChange={handleProductSelect}
                    >
                      <option value="">{t('fin.selectProduct')}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stock === 0}>
                          {p.name} (Estoque: {p.stock}) - {formatCurrency(p.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* VENDEDOR SELECTION (NEW) */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                      {t('fin.seller')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium"
                        value={formData.collaboratorId}
                        onChange={(e) => setFormData({...formData, collaboratorId: e.target.value})}
                      >
                        <option value="">{t('fin.directSale')}</option>
                        {collaborators
                          .filter(c => c.sector === Sector.COMMERCIAL)
                          .map(c => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {selectedProduct && (
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300">
                          {t('fin.qtySold')}
                        </label>
                        <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold bg-white dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                          Max: {selectedProduct.stock}
                        </span>
                      </div>
                      <input 
                        type="number"
                        min="1"
                        max={selectedProduct.stock}
                        required
                        value={formData.quantity}
                        onChange={handleQuantityChange}
                        className="w-full px-4 py-2.5 border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-bold" 
                      />
                    </div>
                  )}
                </div>
              )}

              {/* EXPENSE: Stock Purchase Logic */}
              {formData.type === 'expense' && (
                <div className="space-y-4">
                   <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                     <input 
                      type="checkbox" 
                      id="isStock" 
                      checked={formData.isStockPurchase}
                      onChange={(e) => setFormData({...formData, isStockPurchase: e.target.checked})}
                      className="rounded w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                     />
                     <label htmlFor="isStock" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer select-none">
                       <ShoppingCart className="w-4 h-4" />
                       {t('fin.isStock')}
                     </label>
                   </div>

                   {formData.isStockPurchase && (
                     <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600 space-y-4 animate-in fade-in slide-in-from-top-2">
                        {/* Toggle Existing vs New */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, purchaseType: 'existing', productId: '', newProductName: ''})}
                            className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-all ${formData.purchaseType === 'existing' ? 'bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300 shadow-sm' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'}`}
                          >
                            {t('fin.existingProd')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, purchaseType: 'new', productId: '', newProductName: ''})}
                            className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-all ${formData.purchaseType === 'new' ? 'bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300 shadow-sm' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'}`}
                          >
                            {t('fin.newProd')}
                          </button>
                        </div>

                        {formData.purchaseType === 'existing' ? (
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">{t('fin.selectProduct')}</label>
                            <select
                              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              value={formData.productId}
                              onChange={handleProductSelect}
                            >
                              <option value="">{t('fin.selectProduct')}</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Atual: {p.stock})</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">{t('fin.newProdName')}</label>
                            <div className="flex items-center gap-2">
                              <PlusCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                              <input 
                                type="text"
                                placeholder="Ex: Armário de Aço"
                                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={formData.newProductName}
                                onChange={(e) => setFormData({...formData, newProductName: e.target.value})}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1.5 ml-7">O produto será criado no estoque automaticamente.</p>
                          </div>
                        )}

                        <div>
                           <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">{t('fin.qtyBought')}</label>
                           <input 
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                           />
                        </div>
                     </div>
                   )}
                </div>
              )}

              {/* Only show Category if NOT a stock purchase (Stock automatically sets category) */}
              {!formData.isStockPurchase && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">{t('inv.col.category')}</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                  >
                    {Object.values(TransactionCategory).map(cat => (
                      <option key={cat} value={cat}>{t(cat)}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* SALARY: Select Collaborator Logic */}
              {formData.type === 'expense' && formData.category === TransactionCategory.SALARY && (
                <div className="animate-in fade-in slide-in-from-top-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">{t('fin.selectCollab')}</label>
                   <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium"
                        value={formData.collaboratorId}
                        onChange={(e) => setFormData({...formData, collaboratorId: e.target.value})}
                      >
                        <option value="">{t('fin.selectCollab')}</option>
                        {collaborators.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} - {c.role}
                          </option>
                        ))}
                      </select>
                    </div>
                </div>
              )}

              {/* Description is Auto-Filled for Stock Purchases, but editable */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">{t('fin.description')}</label>
                <input 
                  type="text"
                  required
                  placeholder={
                    formData.type === 'income' ? "Ex: Venda de Serviços" : 
                    formData.isStockPurchase ? (formData.newProductName ? `Compra: ${formData.newProductName}` : "Compra de Estoque") : 
                    formData.category === TransactionCategory.SALARY ? "Ex: Pagamento Mensal" :
                    "Ex: Conta de Luz"
                  }
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">{t('fin.date')}</label>
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium" 
                    />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">{t('fin.amount')}</label>
                  <input 
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 text-sm mt-2">
                {t('fin.addBtn')}
              </button>
            </form>
          </div>
          
          {/* Expenses Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
              <PieIcon className="w-4 h-4 text-slate-500" />
              {t('fin.chartTitle')}
            </h3>
            {categoryData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} stroke={localStorage.getItem('nexus_theme') === 'dark' ? '#1e293b' : '#fff'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm italic">
                {t('fin.noExpenses')}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Transaction List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('fin.extract')}</h3>
            <div className="flex items-center gap-2">
              {monthlyTransactions.length > 0 && (
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-500/30"
                  title={t('fin.exportPDF')}
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('fin.exportPDF')}</span>
                </button>
              )}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-600 shadow-sm">
                {monthlyTransactions.length} {t('fin.entries')}
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t('fin.date')}</th>
                  <th className="px-6 py-4">{t('fin.description')}</th>
                  <th className="px-6 py-4">{t('inv.col.category')}</th>
                  <th className="px-6 py-4 text-right">{t('fin.amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {monthlyTransactions.length > 0 ? monthlyTransactions.map((tItem) => {
                   // Try to find the linked product name if productId exists
                   const linkedProduct = tItem.productId ? products.find(p => p.id === tItem.productId) : null;
                   // Try to find linked collaborator
                   const linkedCollaborator = tItem.collaboratorId ? collaborators.find(c => c.id === tItem.collaboratorId) : null;
                   
                   return (
                    <tr key={tItem.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/50">
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                        {new Date(tItem.date).toLocaleDateString(useLanguage().language === 'en' ? 'en-US' : (useLanguage().language === 'es' ? 'es-ES' : 'pt-BR'))}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2">
                             {tItem.description}
                             {tItem.quantity && tItem.quantity > 1 && (
                               <span className="text-[10px] bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-bold">
                                 {tItem.quantity}x
                               </span>
                             )}
                          </span>
                          <div className="flex gap-2">
                            {linkedProduct && (
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-1 font-medium bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                <Package className="w-3 h-3" />
                                {linkedProduct.name}
                                </span>
                            )}
                            {linkedCollaborator && (
                                <span className={`text-[10px] flex items-center gap-1 mt-1 font-medium px-1.5 py-0.5 rounded
                                  ${tItem.type === 'income' 
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' 
                                    : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                                  }`}>
                                {tItem.type === 'income' ? <User className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                                {linkedCollaborator.firstName}
                                </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold
                          ${tItem.category === TransactionCategory.STOCK 
                            ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}
                        `}>
                          {t(tItem.category || 'Outros')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className={`font-bold text-base ${tItem.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {tItem.type === 'income' ? '+' : '-'}{formatCurrency(tItem.amount)}
                        </span>
                      </td>
                    </tr>
                   );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center opacity-60">
                        <Filter className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="font-medium">{t('fin.noTrans')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, User, Briefcase, Calendar, Award, X, Save, TrendingUp, Upload, Camera, RefreshCw, Layers, ShieldCheck, Wrench, BarChart3, ChevronDown } from 'lucide-react';
import { Collaborator, Transaction, AppData, Sector } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CollaboratorsViewProps {
  collaborators: Collaborator[];
  transactions: Transaction[];
  onAddCollaborator: (c: Omit<Collaborator, 'id'>) => void;
  onUpdateCollaborator: (c: Collaborator) => void;
  onDeleteCollaborator: (id: string) => void;
}

export const CollaboratorsView: React.FC<CollaboratorsViewProps> = ({ 
  collaborators, 
  transactions, 
  onAddCollaborator, 
  onUpdateCollaborator, 
  onDeleteCollaborator 
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State for Sales History Modal
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    matricula: '',
    sector: Sector.COMMERCIAL as Sector,
    role: '',
    hiredDate: new Date().toISOString().split('T')[0],
    avatarUrl: ''
  });

  const filteredCollaborators = collaborators.filter(c => {
    const matchesSearch = c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.matricula.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = filterSector === 'Todos' || c.sector === filterSector;

    return matchesSearch && matchesSector;
  });

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Calculate Total Sales per Collaborator
  const getSalesStats = (collabId: string) => {
    const userSales = transactions.filter(t => t.collaboratorId === collabId && t.type === 'income');
    const totalAmount = userSales.reduce((acc, t) => acc + t.amount, 0);
    const totalCount = userSales.length;
    return { totalAmount, totalCount, userSales };
  };

  // Helper for Sector Colors/Icons
  const getSectorStyle = (sector: Sector) => {
    switch (sector) {
      case Sector.COMMERCIAL:
        return { 
          bg: 'bg-indigo-100 dark:bg-indigo-500/10', 
          text: 'text-indigo-600 dark:text-indigo-400', 
          border: 'border-indigo-200 dark:border-indigo-500/30',
          gradient: 'from-indigo-500 to-violet-500',
          icon: BarChart3
        };
      case Sector.ADMIN:
        return { 
          bg: 'bg-emerald-100 dark:bg-emerald-500/10', 
          text: 'text-emerald-600 dark:text-emerald-400', 
          border: 'border-emerald-200 dark:border-emerald-500/30',
          gradient: 'from-emerald-500 to-teal-500',
          icon: ShieldCheck
        };
      case Sector.GENERAL_SERVICES:
        return { 
          bg: 'bg-amber-100 dark:bg-amber-500/10', 
          text: 'text-amber-600 dark:text-amber-400', 
          border: 'border-amber-200 dark:border-amber-500/30',
          gradient: 'from-amber-500 to-orange-500',
          icon: Wrench
        };
      default:
        return { 
          bg: 'bg-slate-100', 
          text: 'text-slate-600', 
          border: 'border-slate-200',
          gradient: 'from-slate-500 to-slate-600',
          icon: User
        };
    }
  };

  const handleOpenModal = (collaborator?: Collaborator) => {
    if (collaborator) {
      setEditingId(collaborator.id);
      setFormData({
        firstName: collaborator.firstName,
        lastName: collaborator.lastName,
        matricula: collaborator.matricula,
        sector: collaborator.sector || Sector.COMMERCIAL,
        role: collaborator.role,
        hiredDate: collaborator.hiredDate,
        avatarUrl: collaborator.avatarUrl || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        firstName: '',
        lastName: '',
        matricula: '',
        sector: Sector.COMMERCIAL,
        role: '',
        hiredDate: new Date().toISOString().split('T')[0],
        avatarUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Agora permitimos cargo personalizado para COMERCIAL e ADMINISTRATIVO
    const isCustomRole = formData.sector === Sector.COMMERCIAL || formData.sector === Sector.ADMIN;
    const finalRole = isCustomRole ? formData.role : formData.sector;

    const payload = {
      ...formData,
      role: finalRole
    };

    if (editingId) {
      onUpdateCollaborator({ ...payload, id: editingId });
    } else {
      onAddCollaborator(payload);
    }
    setIsModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMatricula = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let result = '';
    for (let i = 0; i < 2; i++) result += letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 4; i++) result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    setFormData(prev => ({ ...prev, matricula: result }));
  };

  const historyData = useMemo(() => {
    if (!selectedCollaborator) return null;
    return getSalesStats(selectedCollaborator.id);
  }, [selectedCollaborator, transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('col.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('col.subtitle')}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('col.add')}
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative group flex-1">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-200 blur"></div>
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-xl">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
             <input 
              type="text" 
              placeholder={t('col.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-none bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-0 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Sector Filter */}
        <div className="relative group md:w-64">
           <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-xl h-full border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-300 dark:hover:border-slate-600 transition-colors">
             <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <select
               value={filterSector}
               onChange={(e) => setFilterSector(e.target.value)}
               className="w-full pl-10 pr-8 py-3.5 rounded-xl border-none bg-transparent dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-0 appearance-none cursor-pointer text-sm font-medium"
             >
               <option value="Todos" className="dark:bg-slate-800">{t('col.allSectors')}</option>
               {Object.values(Sector).map(s => (
                 <option key={s} value={s} className="dark:bg-slate-800">{t(s)}</option>
               ))}
             </select>
             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
           </div>
        </div>
      </div>

      {/* Collaborators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollaborators.map(collaborator => {
          const stats = getSalesStats(collaborator.id);
          const isCommercial = collaborator.sector === Sector.COMMERCIAL;
          const style = getSectorStyle(collaborator.sector);
          const SectorIcon = style.icon;
          
          return (
            <div key={collaborator.id} className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              {/* Top Colored Bar */}
              <div className={`h-2 w-full bg-gradient-to-r ${style.gradient}`}></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-600 shadow-md overflow-hidden">
                        {collaborator.avatarUrl ? (
                           <img src={collaborator.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{collaborator.firstName[0]}{collaborator.lastName[0]}</span>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-slate-800 border shadow-sm ${style.text} ${style.border}`}>
                         <SectorIcon className="w-3 h-3" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{collaborator.firstName} {collaborator.lastName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${style.gradient}`}></span>
                        {collaborator.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(collaborator)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteCollaborator(collaborator.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">{t('col.matricula')}</p>
                    <p className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide">{collaborator.matricula}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">{t('col.sector')}</p>
                    <p className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block ${style.bg} ${style.text}`}>
                       {t(collaborator.sector)}
                    </p>
                  </div>
                </div>

                {/* Only show sales stats if Commercial */}
                {isCommercial ? (
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 mt-2 flex items-center justify-between border border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('col.totalSales')}</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('col.transactions')}</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{stats.totalCount}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 mt-2 text-center border border-slate-100 dark:border-slate-700 h-[74px] flex items-center justify-center">
                    <p className="text-xs text-slate-400 italic flex items-center gap-1">
                      <User className="w-3 h-3" /> {t('col.adminProfile')}
                    </p>
                  </div>
                )}
              </div>
              
              {isCommercial && (
                <button 
                  onClick={() => setSelectedCollaborator(collaborator)}
                  className="w-full py-3 bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border-t border-slate-100 dark:border-slate-700"
                >
                  <TrendingUp className="w-4 h-4" /> {t('col.history')}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-center">
               <h2 className="text-xl font-bold text-white">
                {editingId ? t('col.editTitle') : t('col.newTitle')}
              </h2>
              <p className="text-indigo-100 text-xs mt-1">Preencha os dados cadastrais abaixo</p>
            </div>
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Image Upload Section */}
                <div className="flex flex-col items-center justify-center -mt-12 mb-6">
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                         {formData.avatarUrl ? (
                           <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                         ) : (
                           <User className="w-10 h-10 text-slate-300" />
                         )}
                      </div>
                      <label className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 hover:scale-110 transition-all shadow-md">
                        <Camera className="w-4 h-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                   </div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('col.photo')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">{t('col.firstName')}</label>
                    <input required className="w-full px-4 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">{t('col.lastName')}</label>
                    <input required className="w-full px-4 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </div>

                {/* Setor Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">{t('col.sector')}</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      required 
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all"
                      value={formData.sector} 
                      onChange={e => setFormData({...formData, sector: e.target.value as Sector})}
                    >
                      {Object.values(Sector).map(s => (
                        <option key={s} value={s}>{t(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Cargo - Condicional (Comercial ou Administrativo) */}
                {(formData.sector === Sector.COMMERCIAL || formData.sector === Sector.ADMIN) && (
                   <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">{t('col.role')}</label>
                    <input required className="w-full px-4 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder={formData.sector === Sector.COMMERCIAL ? "Ex: Vendedor, Gerente..." : "Ex: Contador, Analista..."}
                      value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                  </div>
                )}

                {/* Matricula com Gerador Condicional */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    {t('col.matricula')} <span className="text-[10px] font-normal opacity-70 normal-case">(Max 6 chars)</span>
                  </label>
                  <div className="flex gap-2">
                    <input 
                      required 
                      maxLength={6}
                      className="flex-1 px-4 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white font-mono uppercase focus:ring-2 focus:ring-indigo-500 outline-none tracking-widest font-bold"
                      value={formData.matricula} 
                      onChange={e => setFormData({...formData, matricula: e.target.value.toUpperCase()})}
                      placeholder="EX: BR1234"
                      readOnly={!!editingId} 
                    />
                    {/* Botão Gerar só aparece se NÃO estiver editando */}
                    {!editingId && (
                      <button 
                        type="button" 
                        onClick={generateMatricula}
                        className="px-4 py-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors flex items-center gap-2 text-sm font-bold"
                        title="Gerar Matrícula Aleatória"
                      >
                        <RefreshCw className="w-4 h-4" /> {t('col.generate')}
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">{t('col.hiredDate')}</label>
                  <input 
                    required 
                    type="date" 
                    className={`w-full px-4 py-2.5 border rounded-lg dark:border-slate-600 dark:text-white outline-none transition-all ${editingId ? 'bg-slate-200 dark:bg-slate-800 cursor-not-allowed opacity-70' : 'bg-slate-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-indigo-500'}`}
                    value={formData.hiredDate} 
                    onChange={e => setFormData({...formData, hiredDate: e.target.value})}
                    readOnly={!!editingId} 
                  />
                </div>
                
                <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 dark:bg-slate-700 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">{t('common.cancel')}</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-500/30">{t('common.save')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* History Details Modal */}
      {selectedCollaborator && historyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-5">
                 <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
                    {selectedCollaborator.avatarUrl ? (
                         <img src={selectedCollaborator.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{selectedCollaborator.firstName[0]}{selectedCollaborator.lastName[0]}</span>
                      )}
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedCollaborator.firstName} {selectedCollaborator.lastName}</h2>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedCollaborator.role} • <span className="font-mono text-sm">{selectedCollaborator.matricula}</span></p>
                   <div className="flex gap-3 mt-3">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                        Total: {formatCurrency(historyData.totalAmount)}
                      </span>
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30">
                        {historyData.totalCount} vendas
                      </span>
                   </div>
                 </div>
              </div>
              <button onClick={() => setSelectedCollaborator(null)} className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 uppercase text-xs tracking-wider">
                <TrendingUp className="w-4 h-4 text-indigo-500" /> {t('col.salesHistory')}
              </h3>
              
              <div className="space-y-3">
                {historyData.userSales.length > 0 ? (
                  historyData.userSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(sale => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                       <div className="flex items-start gap-4">
                         <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                           <Award className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="font-semibold text-slate-900 dark:text-white">{sale.description}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                             <Calendar className="w-3 h-3" /> {new Date(sale.date).toLocaleDateString(useLanguage().language === 'en' ? 'en-US' : (useLanguage().language === 'es' ? 'es-ES' : 'pt-BR'))}
                           </p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">+{formatCurrency(sale.amount)}</p>
                         {sale.quantity && (
                           <p className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full inline-block mt-1">{sale.quantity} itens</p>
                         )}
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    {t('col.noSales')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

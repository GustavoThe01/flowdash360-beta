
import React, { useState } from 'react';
import { Sparkles, Loader2, Lightbulb, AlertTriangle, Info, Package, TrendingUp, Megaphone, BrainCircuit } from 'lucide-react';
import { AppData, AiInsight } from '../types';
import { generateBusinessInsights, AnalysisMode } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface InsightsViewProps {
  data: AppData;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ data }) => {
  const { t, language } = useLanguage();
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode | null>(null);

  const handleGenerate = async (mode: AnalysisMode) => {
    setLoading(true);
    setSelectedMode(mode);
    setInsights([]); // Limpa insights anteriores para efeito visual
    
    // Pequeno delay artificial para UX
    await new Promise(r => setTimeout(r, 500)); 

    const result = await generateBusinessInsights(data, mode, language);
    setInsights(result);
    setLoading(false);
  };

  const modes = [
    {
      id: 'inventory' as AnalysisMode,
      title: t('ins.mode.inventory'),
      desc: t('ins.mode.inventoryDesc'),
      icon: Package,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/20'
    },
    {
      id: 'finance' as AnalysisMode,
      title: t('ins.mode.finance'),
      desc: t('ins.mode.financeDesc'),
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-200 dark:border-emerald-500/20'
    },
    {
      id: 'marketing' as AnalysisMode,
      title: t('ins.mode.marketing'),
      desc: t('ins.mode.marketingDesc'),
      icon: Megaphone,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-500/10',
      border: 'border-violet-200 dark:border-violet-500/20'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {t('ins.title')} <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{t('ins.subtitle')}</p>
        </div>
      </div>

      {/* Hero Section / Mode Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
           {/* Background Decorativo */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
           
           <div className="relative z-10 max-w-xl">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                 <BrainCircuit className="w-6 h-6 text-white" />
               </div>
               <span className="font-semibold tracking-wider text-indigo-100 text-sm uppercase">Consultor Inteligente Gemini</span>
             </div>
             <h2 className="text-3xl font-bold mb-3">{t('ins.hero.title')}</h2>
             <p className="text-indigo-100 text-lg leading-relaxed opacity-90">
               {t('ins.hero.subtitle')}
             </p>
           </div>
        </div>

        {/* Selection Cards */}
        {modes.map((mode) => {
           const Icon = mode.icon;
           const isSelected = selectedMode === mode.id;
           return (
             <button
               key={mode.id}
               onClick={() => handleGenerate(mode.id)}
               disabled={loading}
               className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group hover:shadow-md
                 ${isSelected 
                    ? `border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 bg-white dark:bg-slate-800 scale-[1.02]` 
                    : `bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700`
                 }
               `}
             >
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${mode.bg} ${mode.color}`}>
                 {loading && isSelected ? <Loader2 className="w-6 h-6 animate-spin" /> : <Icon className="w-6 h-6" />}
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                 {mode.title}
               </h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">
                 {mode.desc}
               </p>
             </button>
           )
        })}
      </div>

      {/* Results Section */}
      {selectedMode && (
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">
               {t('ins.results')}
             </h3>
             <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                {modes.find(m => m.id === selectedMode)?.title}
             </span>
           </div>

           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
               ))}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
               {insights.length === 0 ? (
                  <div className="col-span-3 text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                     <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                     <p>{t('ins.empty')}</p>
                  </div>
               ) : (
                 insights.map((insight, index) => (
                   <div 
                     key={index}
                     className={`flex flex-col p-6 rounded-xl border-t-4 shadow-sm bg-white dark:bg-slate-800 hover:shadow-md transition-shadow
                       ${insight.type === 'success' ? 'border-emerald-500' : ''}
                       ${insight.type === 'warning' ? 'border-amber-500' : ''}
                       ${insight.type === 'info' ? 'border-indigo-500' : ''}
                     `}
                   >
                     <div className="flex items-center gap-3 mb-4">
                       <div className={`p-2 rounded-lg
                          ${insight.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''}
                          ${insight.type === 'warning' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : ''}
                          ${insight.type === 'info' ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : ''}
                       `}>
                         {insight.type === 'success' ? <Lightbulb className="w-5 h-5" /> : 
                          insight.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
                          <Info className="w-5 h-5" />}
                       </div>
                       <span className={`text-xs font-bold uppercase tracking-wider
                          ${insight.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                          ${insight.type === 'warning' ? 'text-amber-600 dark:text-amber-400' : ''}
                          ${insight.type === 'info' ? 'text-indigo-600 dark:text-indigo-400' : ''}
                       `}>
                         {insight.type === 'success' ? t('ins.type.success') : insight.type === 'warning' ? t('ins.type.warning') : t('ins.type.info')}
                       </span>
                     </div>
                     
                     <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 leading-tight">{insight.title}</h3>
                     <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-grow">{insight.message}</p>
                   </div>
                 ))
               )}
             </div>
           )}
        </div>
      )}
    </div>
  );
};

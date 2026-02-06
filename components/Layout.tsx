
import React from 'react';
import { LayoutDashboard, Package, DollarSign, BrainCircuit, Menu, X, Sun, Moon, Users, Github, Linkedin, Instagram, Mail } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode; // O conteúdo da página atual será renderizado aqui
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, isDarkMode, toggleTheme }) => {
  // Estado para controlar abertura/fechamento da Sidebar no Mobile
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { language, setLanguage, t } = useLanguage();

  // Definição dos itens do menu de navegação
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/inventory', icon: Package, label: t('nav.inventory') },
    { to: '/finance', icon: DollarSign, label: t('nav.finance') },
    { to: '/collaborators', icon: Users, label: t('nav.collaborators') },
    { to: '/insights', icon: BrainCircuit, label: t('nav.insights') },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Overlay Escuro (Apenas Mobile) - Fecha o menu ao clicar fora */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ==========================================
          BARRA LATERAL (SIDEBAR)
         ========================================== */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} // Lógica de esconder/mostrar
      `}>
        {/* Logo e Título */}
        <div className="flex flex-col px-6 py-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 flex-shrink-0 group cursor-pointer">
              <LayoutDashboard className="w-6 h-6 text-white group-hover:rotate-3 transition-transform" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                FlowDash360
              </span>
              <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">
                BETA
              </span>
            </div>
            {/* Botão X para fechar no Mobile */}
            <button className="ml-auto lg:hidden" onClick={toggleSidebar}>
              <X className="w-6 h-6 text-slate-400 hover:text-indigo-500" />
            </button>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="p-4 space-y-2 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              // Lógica de classe condicional: Se estiver ativo (isActive), muda a cor
              className={({ isActive }) => `
                flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'opacity-70'}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé da Sidebar (Configurações) */}
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-100 dark:border-slate-800 space-y-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          
          {/* Seletor de Idioma */}
          <div className="flex items-center justify-center gap-3">
             <button onClick={() => setLanguage('pt')} className={`p-1.5 rounded-lg transition-all ${language === 'pt' ? 'bg-indigo-50 dark:bg-indigo-900/30 scale-110 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`} title="Português">
               <span className="text-xl">🇧🇷</span>
             </button>
             <button onClick={() => setLanguage('en')} className={`p-1.5 rounded-lg transition-all ${language === 'en' ? 'bg-indigo-50 dark:bg-indigo-900/30 scale-110 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`} title="English">
               <span className="text-xl">🇺🇸</span>
             </button>
             <button onClick={() => setLanguage('es')} className={`p-1.5 rounded-lg transition-all ${language === 'es' ? 'bg-indigo-50 dark:bg-indigo-900/30 scale-110 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`} title="Español">
               <span className="text-xl">🇪🇸</span>
             </button>
          </div>

          {/* Botão de Tema (Dark/Light) */}
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <span className="flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              {isDarkMode ? t('nav.darkMode') : t('nav.lightMode')}
            </span>
          </button>
        </div>
      </aside>

      {/* ==========================================
          CONTEÚDO PRINCIPAL (MAIN)
         ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Cabeçalho Mobile (Só aparece em telas pequenas) */}
        <header className="h-16 lg:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between sticky top-0 z-10">
          <button onClick={toggleSidebar} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg shadow-sm flex items-center justify-center">
               <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white text-sm leading-none">FlowDash360</span>
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">BETA</span>
            </div>
          </div>
          
          <div className="w-8"></div>
        </header>

        {/* Área de rolagem do conteúdo */}
        <div className="flex-1 overflow-auto flex flex-col scroll-smooth">
          <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 pt-2 lg:pt-0">
              {children} {/* Aqui é onde as páginas (Dashboard, Estoque, etc) são injetadas */}
            </div>
          </div>
          
          {/* Rodapé da Aplicação (Footer) */}
          <footer className="py-6 px-8 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 text-sm mt-auto">
            <div className="flex flex-col md:flex-row items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
              <span>Desenvolvido com <span className="text-indigo-500 font-bold mx-1">&lt;/&gt;</span> por <strong className="text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">Gustavo Osterno Thé</strong></span>
              <span className="hidden md:inline text-slate-300 dark:text-slate-600 mx-2">|</span>
              <a href="mailto:gugaosterno@gmail.com" className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                gugaosterno@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-6">
               <a href="https://www.linkedin.com/in/gustavoosterno/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0A66C2] transition-all transform hover:scale-110" title="LinkedIn">
                 <Linkedin className="w-5 h-5" />
               </a>
               <a href="https://github.com/GustavoThe01" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all transform hover:scale-110" title="GitHub">
                 <Github className="w-5 h-5" />
               </a>
               <a href="https://www.instagram.com/gustavo.osterno/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E4405F] transition-all transform hover:scale-110" title="Instagram">
                 <Instagram className="w-5 h-5" />
               </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

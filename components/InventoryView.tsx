
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, AlertCircle, ChevronLeft, ChevronRight, Save, X, ImageIcon, Upload } from 'lucide-react';
import { Product, Category, Status } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const ITEMS_PER_PAGE = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const InventoryView: React.FC<InventoryViewProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal States for Add/Edit (Full Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  // Inline Edit State
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineData, setInlineData] = useState<Partial<Product>>({});

  // Form State for Modal
  const [formData, setFormData] = useState({
    name: '',
    category: Category.OTHER,
    price: 0,
    stock: 0,
    imageUrl: '',
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todas' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'Todos' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Modal Handlers
  const handleOpenAdd = () => {
    setInlineEditId(null); // Cancel any inline edit
    setFormData({ name: '', category: Category.OTHER, price: 0, stock: 0, imageUrl: '' });
    setIsModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    let status = Status.IN_STOCK;
    if (Number(formData.stock) === 0) status = Status.OUT_OF_STOCK;
    else if (Number(formData.stock) < 10) status = Status.LOW_STOCK;

    const productData = {
      name: formData.name,
      category: formData.category as Category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      imageUrl: formData.imageUrl,
      status
    };

    onAddProduct(productData);
    setIsModalOpen(false);
    setFormData({ name: '', category: Category.OTHER, price: 0, stock: 0, imageUrl: '' });
  };

  // Inline Edit Handlers
  const handleStartInlineEdit = (product: Product) => {
    setInlineEditId(product.id);
    setInlineData({ ...product });
  };

  const handleCancelInlineEdit = () => {
    setInlineEditId(null);
    setInlineData({});
  };

  const handleSaveInlineEdit = (originalProduct: Product) => {
    if (!inlineData) return;

    // Merge original with updates
    const updatedName = inlineData.name ?? originalProduct.name;
    const updatedPrice = inlineData.price ?? originalProduct.price;
    const updatedStock = inlineData.stock ?? originalProduct.stock;
    const updatedImageUrl = inlineData.imageUrl ?? originalProduct.imageUrl;
    
    // Auto-update status based on stock
    let newStatus = Status.IN_STOCK;
    if (Number(updatedStock) === 0) newStatus = Status.OUT_OF_STOCK;
    else if (Number(updatedStock) < 10) newStatus = Status.LOW_STOCK;

    onUpdateProduct({
      ...originalProduct,
      name: updatedName,
      price: Number(updatedPrice),
      stock: Number(updatedStock),
      imageUrl: updatedImageUrl,
      status: newStatus,
    });
    
    setInlineEditId(null);
    setInlineData({});
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isInline: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação de Tipo
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert("Formato de arquivo inválido. Por favor, use JPEG, PNG ou WebP.");
        e.target.value = ''; // Reset input
        return;
      }

      // Validação de Tamanho
      if (file.size > MAX_FILE_SIZE) {
        alert("O arquivo excede o limite de 5MB. Por favor, escolha uma imagem menor.");
        e.target.value = ''; // Reset input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isInline) {
          setInlineData(prev => ({ ...prev, imageUrl: base64String }));
        } else {
          setFormData(prev => ({ ...prev, imageUrl: base64String }));
        }
      };
      
      reader.onerror = () => {
        alert("Erro ao ler o arquivo. Tente novamente.");
      };

      reader.readAsDataURL(file);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('inv.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('inv.subtitle')}</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('inv.add')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('inv.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
        
        {/* Category Filter */}
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            <option value="Todas">{t('inv.allCategories')}</option>
            {Object.values(Category).map(c => <option key={c} value={c}>{t(c)}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative w-full sm:w-48">
          <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            <option value="Todos">{t('inv.allStatus')}</option>
            {Object.values(Status).map(s => <option key={s} value={s}>{t(s)}</option>)}
          </select>
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4 w-32">{t('inv.col.img')}</th>
                <th className="px-6 py-4">{t('inv.col.name')}</th>
                <th className="px-6 py-4">{t('inv.col.category')}</th>
                <th className="px-6 py-4">{t('inv.col.price')}</th>
                <th className="px-6 py-4">{t('inv.col.qty')}</th>
                <th className="px-6 py-4">{t('inv.col.status')}</th>
                <th className="px-6 py-4 text-right">{t('inv.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedProducts.length > 0 ? paginatedProducts.map((product) => {
                const isEditing = inlineEditId === product.id;
                
                return (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    {/* Image Column */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            <input 
                              type="text" 
                              placeholder="URL..."
                              value={inlineData.imageUrl || ''} 
                              onChange={(e) => setInlineData({...inlineData, imageUrl: e.target.value})}
                              className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <label className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-600 rounded cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors" title="Upload Imagem">
                              <Upload className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                              <input 
                                type="file" 
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden" 
                                onChange={(e) => handleFileUpload(e, true)}
                              />
                            </label>
                          </div>
                          <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-600 overflow-hidden flex-shrink-0 mx-auto">
                             {inlineData.imageUrl ? (
                               <img src={inlineData.imageUrl} className="w-full h-full object-cover" alt="Preview" onError={(e) => (e.currentTarget.style.display = 'none')} />
                             ) : <ImageIcon className="w-4 h-4 m-auto mt-3 text-slate-400"/>}
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      )}
                    </td>

                    {/* Name Column */}
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={inlineData.name || ''} 
                          onChange={(e) => setInlineData({...inlineData, name: e.target.value})}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        product.name
                      )}
                    </td>

                    {/* Category Column */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                        {t(product.category)}
                      </span>
                    </td>

                    {/* Price Column */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {isEditing ? (
                         <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          value={inlineData.price || 0} 
                          onChange={(e) => setInlineData({...inlineData, price: Number(e.target.value)})}
                          className="w-24 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        formatCurrency(product.price)
                      )}
                    </td>

                    {/* Stock Column */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {isEditing ? (
                         <input 
                          type="number" 
                          min="0"
                          value={inlineData.stock || 0} 
                          onChange={(e) => setInlineData({...inlineData, stock: Number(e.target.value)})}
                          className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        product.stock
                      )}
                    </td>

                    {/* Status Column (Auto-calculated, not editable directly inline) */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                        ${product.status === Status.IN_STOCK ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : ''}
                        ${product.status === Status.LOW_STOCK ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : ''}
                        ${product.status === Status.OUT_OF_STOCK ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : ''}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full 
                           ${product.status === Status.IN_STOCK ? 'bg-emerald-500' : ''}
                           ${product.status === Status.LOW_STOCK ? 'bg-amber-500' : ''}
                           ${product.status === Status.OUT_OF_STOCK ? 'bg-rose-500' : ''}
                        `}></span>
                        {t(product.status)}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                         <div className="flex items-center justify-end gap-2">
                           <button 
                            onClick={() => handleSaveInlineEdit(product)}
                            className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                            title={t('common.save')}
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={handleCancelInlineEdit}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title={t('common.cancel')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                         </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleStartInlineEdit(product)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setProductToDelete(product.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      <p>{t('inv.empty')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Visible on mobile) */}
      <div className="md:hidden space-y-4">
        {paginatedProducts.length > 0 ? paginatedProducts.map(product => (
          <div key={product.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-start gap-4">
              {/* Image */}
              <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                 {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">{product.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t(product.category)}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(product.price)}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{product.stock} un.</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border
                    ${product.status === Status.IN_STOCK ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : ''}
                    ${product.status === Status.LOW_STOCK ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : ''}
                    ${product.status === Status.OUT_OF_STOCK ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : ''}
                  `}>
                  <span className={`w-1.5 h-1.5 rounded-full 
                      ${product.status === Status.IN_STOCK ? 'bg-emerald-500' : ''}
                      ${product.status === Status.LOW_STOCK ? 'bg-amber-500' : ''}
                      ${product.status === Status.OUT_OF_STOCK ? 'bg-rose-500' : ''}
                  `}></span>
                  {t(product.status)}
                </span>
              </div>
            </div>
            
            {/* Mobile Actions */}
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
              <button 
                onClick={() => handleStartInlineEdit(product)}
                className="flex items-center justify-center p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setProductToDelete(product.id)}
                className="flex items-center justify-center p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile Inline Edit - Simplified fallback */}
            {inlineEditId === product.id && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
                <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('inv.col.name')}</label>
                   <input type="text" className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                    value={inlineData.name || ''} onChange={e => setInlineData({...inlineData, name: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('inv.image')}</label>
                   <div className="flex gap-2">
                     <input type="text" className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                      value={inlineData.imageUrl || ''} onChange={e => setInlineData({...inlineData, imageUrl: e.target.value})} />
                      <label className="flex items-center justify-center px-3 py-1.5 bg-slate-200 dark:bg-slate-600 rounded cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                        <Upload className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, true)}
                        />
                      </label>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('inv.col.price')}</label>
                    <input type="number" className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                      value={inlineData.price || 0} onChange={e => setInlineData({...inlineData, price: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('inv.col.qty')}</label>
                    <input type="number" className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                      value={inlineData.stock || 0} onChange={e => setInlineData({...inlineData, stock: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleSaveInlineEdit(product)} className="flex-1 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700">{t('common.save')}</button>
                   <button onClick={handleCancelInlineEdit} className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded hover:bg-slate-300">{t('common.cancel')}</button>
                </div>
              </div>
            )}
          </div>
        )) : (
           <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center justify-center">
                <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p>{t('inv.empty')}</p>
              </div>
           </div>
        )}
      </div>
        
      {/* Pagination Controls (Shared) */}
      {filteredProducts.length > ITEMS_PER_PAGE && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 rounded-b-xl">
          <div className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
            {t('inv.showing')} <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> {t('inv.of')} <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> {t('inv.of')} <span className="font-medium">{filteredProducts.length}</span> {t('inv.results')}
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (For New Products) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {t('inv.newTitle')}
            </h2>
            <form onSubmit={handleSubmitModal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('inv.col.name')}</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              {/* Image URL Input with Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('inv.image')}</label>
                <div className="flex gap-2">
                  <input type="url" placeholder={t('inv.upload')} className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400" 
                    value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                  <label className="flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <Upload className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, false)}
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-1">Max 5MB (JPG, PNG)</p>
                {formData.imageUrl && (
                  <div className="mt-2 w-full h-32 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-700 flex justify-center items-center">
                    <img src={formData.imageUrl} alt="Preview" className="h-full w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('inv.col.category')}</label>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                  {Object.values(Category).map(c => <option key={c} value={c}>{t(c)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('inv.col.price')} (R$)</label>
                  <input required type="number" min="0" step="0.01" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('inv.col.qty')}</label>
                  <input required type="number" min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors">{t('common.cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors">
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">{t('inv.confirmDelete')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
              {t('inv.deleteMsg')}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg font-medium transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

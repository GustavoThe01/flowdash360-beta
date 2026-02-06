import { Product, Transaction, Status, Category, TransactionCategory, Collaborator, Sector } from './types';

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: '1',
    firstName: 'Ana',
    lastName: 'Silva',
    matricula: 'BR001',
    sector: Sector.COMMERCIAL,
    role: 'Vendedora Sênior',
    hiredDate: '2022-03-15',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: '2',
    firstName: 'Carlos',
    lastName: 'Mendes',
    matricula: 'BR002',
    sector: Sector.COMMERCIAL,
    role: 'Gerente de Vendas',
    hiredDate: '2021-06-10',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: '3',
    firstName: 'Mariana',
    lastName: 'Costa',
    matricula: 'BR003',
    sector: Sector.COMMERCIAL,
    role: 'Vendedora Jr',
    hiredDate: '2023-01-20',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: '4',
    firstName: 'Julia',
    lastName: 'Pereira',
    matricula: 'BR004',
    sector: Sector.ADMIN,
    role: 'Contadora',
    hiredDate: '2023-05-10',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: '5',
    firstName: 'Roberto',
    lastName: 'Santos',
    matricula: 'BR005',
    sector: Sector.GENERAL_SERVICES,
    role: 'Auxiliar de Limpeza',
    hiredDate: '2022-11-05',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Cadeira de Escritório Ergonômica', 
    category: Category.FURNITURE, 
    price: 850, 
    stock: 12, 
    status: Status.IN_STOCK,
    imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=200'
  },
  { 
    id: '2', 
    name: 'Teclado Sem Fio', 
    category: Category.ELECTRONICS, 
    price: 185, 
    stock: 4, 
    status: Status.LOW_STOCK,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b91add1?auto=format&fit=crop&q=80&w=200'
  },
  { 
    id: '3', 
    name: 'Mesa com Regulagem de Altura', 
    category: Category.FURNITURE, 
    price: 1450, 
    stock: 0, 
    status: Status.OUT_OF_STOCK,
    imageUrl: 'https://images.unsplash.com/photo-1595515106967-1b072e27dd8d?auto=format&fit=crop&q=80&w=200'
  },
  { 
    id: '4', 
    name: 'Fone com Cancelamento de Ruído', 
    category: Category.ELECTRONICS, 
    price: 599, 
    stock: 25, 
    status: Status.IN_STOCK,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200'
  },
  { 
    id: '5', 
    name: 'Dock Station USB-C', 
    category: Category.OFFICE, 
    price: 320, 
    stock: 8, 
    status: Status.LOW_STOCK,
    imageUrl: 'https://images.unsplash.com/photo-1574614995393-4e45e7f09337?auto=format&fit=crop&q=80&w=200'
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-01', type: 'income', category: TransactionCategory.SALES, amount: 4250, description: 'Venda: 5x Cadeiras', collaboratorId: '1' },
  { id: '2', date: '2023-10-02', type: 'expense', category: TransactionCategory.SUPPLIES, amount: 400, description: 'Materiais de Escritório' },
  { id: '3', date: '2023-10-03', type: 'income', category: TransactionCategory.SALES, amount: 5990, description: 'Venda: 10x Fones', collaboratorId: '2' },
  { id: '4', date: '2023-10-05', type: 'expense', category: TransactionCategory.EQUIPMENT, amount: 9500, description: 'Reposição de Estoque: Eletrônicos' },
  { id: '5', date: '2023-10-06', type: 'income', category: TransactionCategory.SALES, amount: 1850, description: 'Venda: 10x Teclados', collaboratorId: '3' },
  { id: '6', date: '2023-10-10', type: 'expense', category: TransactionCategory.MARKETING, amount: 1200, description: 'Anúncios Google Ads' },
  { id: '7', date: '2023-10-15', type: 'expense', category: TransactionCategory.RENT, amount: 2500, description: 'Aluguel do Escritório' },
];
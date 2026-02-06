
// ==========================================
// DEFINIÇÃO DE TIPOS E DADOS (DATA MODELS)
// ==========================================
// Este arquivo serve como um contrato. Ele define o formato exato
// que os objetos (Produtos, Transações, Colaboradores) devem ter.

// Enums: Listas fixas de opções para garantir consistência
export enum Status {
  IN_STOCK = 'Em Estoque',
  LOW_STOCK = 'Estoque Baixo',
  OUT_OF_STOCK = 'Sem Estoque',
}

export enum Category {
  ELECTRONICS = 'Eletrônicos',
  FURNITURE = 'Móveis',
  CLOTHING = 'Vestuário',
  OFFICE = 'Escritório',
  OTHER = 'Outros'
}

export enum TransactionCategory {
  SALES = 'Vendas',
  STOCK = 'Compra / Estoque', // Categoria específica para reposição
  SERVICES = 'Serviços',
  RENT = 'Aluguel/Infra',
  SALARY = 'Salários',
  MARKETING = 'Marketing',
  EQUIPMENT = 'Equipamentos',
  SUPPLIES = 'Insumos',
  OTHER = 'Outros'
}

export enum Sector {
  COMMERCIAL = 'Comercial',
  ADMIN = 'Administrativo',
  GENERAL_SERVICES = 'Serviços Gerais'
}

// Interfaces: Define a "forma" dos objetos
export interface Collaborator {
  id: string;
  firstName: string;
  lastName: string;
  matricula: string;
  sector: Sector;
  role: string;
  avatarUrl?: string; // O '?' indica que é opcional
  hiredDate: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  status: Status;
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense'; // Apenas 'entrada' ou 'saída'
  category: TransactionCategory;
  amount: number;
  description: string;
  productId?: string; // ID para vincular transação ao produto
  quantity?: number;
  collaboratorId?: string; // ID para vincular venda ao vendedor
}

// AppData: O objeto principal que segura todo o estado da aplicação
export interface AppData {
  products: Product[];
  transactions: Transaction[];
  collaborators: Collaborator[];
}

export interface AiInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
}


import { GoogleGenAI, Type } from "@google/genai";
import { AppData, AiInsight } from "../types";

// Recupera a chave de API das variáveis de ambiente
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export type AnalysisMode = 'general' | 'inventory' | 'finance' | 'marketing';

// ==========================================
// SERVIÇO DE INTELIGÊNCIA ARTIFICIAL
// ==========================================
export const generateBusinessInsights = async (data: AppData, mode: AnalysisMode = 'general', language: string = 'pt'): Promise<AiInsight[]> => {
  // Validação: Se não tiver chave, avisa o usuário
  if (!apiKey) {
    return [{
      type: 'info',
      title: 'Chave de API Ausente',
      message: 'Por favor, configure sua chave de API do Gemini para receber insights inteligentes.'
    }];
  }

  try {
    // Mapeamento de idioma para instrução do prompt
    const langMap: Record<string, string> = {
      'pt': 'Português',
      'en': 'Inglês',
      'es': 'Espanhol'
    };
    const langName = langMap[language] || 'Português';

    // 1. Definição do Foco do Prompt baseado no Modo
    let focusInstruction = "";
    
    switch (mode) {
      case 'inventory':
        focusInstruction = "Foque EXCLUSIVAMENTE em otimização de estoque. Sugira reposições urgentes, identifique produtos encalhados (sem vendas recentes) e sugira kits para produtos com estoque alto. Ignore questões puramente financeiras.";
        break;
      case 'finance':
        focusInstruction = "Foque EXCLUSIVAMENTE em saúde financeira. Analise despesas que podem ser cortadas, calcule se a margem de lucro aparente está saudável e sugira ações para aumentar o fluxo de caixa imediato.";
        break;
      case 'marketing':
        focusInstruction = "Aja como um Diretor de Marketing. Sugira campanhas criativas para vender os produtos atuais. Crie slogans curtos ou ideias de promoções 'relâmpago' baseadas nos itens que precisam sair do estoque.";
        break;
      default:
        focusInstruction = "Forneça uma visão geral equilibrada entre alertas de estoque e saúde financeira.";
    }

    // 2. Construção do Prompt
    const prompt = `
      Atue como um consultor de negócios sênior especializado em varejo.
      ${focusInstruction}
      
      Resumo dos Dados da Empresa:
      - Catálogo: ${data.products.length} produtos cadastrados.
      - Produtos Críticos (Estoque Baixo): ${data.products.filter(p => p.stock < 5 && p.stock > 0).map(p => `${p.name} (${p.stock} un)`).join(', ') || 'Nenhum'}.
      - Produtos Esgotados: ${data.products.filter(p => p.stock === 0).map(p => p.name).join(', ') || 'Nenhum'}.
      - Produtos com Estoque Alto (>20): ${data.products.filter(p => p.stock > 20).map(p => p.name).join(', ') || 'Nenhum'}.
      - Últimas 10 Transações: ${JSON.stringify(data.transactions.slice(-10).map(t => ({ tipo: t.type, valor: t.amount, desc: t.description })))}
      
      IMPORTANTE: Responda em ${langName}.

      Retorne a resposta estritamente como um array JSON de objetos. 
      Cada objeto deve ter:
      - "type": "success" (oportunidade/bom), "warning" (risco/atenção) ou "info" (dica estratégica).
      - "title": título curto e impactante em ${langName} (máx 5 palavras).
      - "message": explicação acionável e direta em ${langName} (máx 30 palavras). Evite obviedades.
    `;

    // 3. Chamada à API (Modelo Gemini Flash)
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json', // Força a resposta em JSON
        // Define o esquema exato da resposta esperada (Tipagem Forte)
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['success', 'warning', 'info'] },
              title: { type: Type.STRING },
              message: { type: Type.STRING }
            }
          }
        }
      }
    });

    // 4. Processamento da Resposta
    const text = response.text;
    if (!text) return [];
    
    // Converte o texto JSON em objetos JavaScript reais
    return JSON.parse(text) as AiInsight[];

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Tratamento de Erro Graceful (não quebra a app)
    return [{
      type: 'warning',
      title: 'Falha na Análise',
      message: 'Não foi possível gerar insights no momento. Tente novamente mais tarde.'
    }];
  }
};

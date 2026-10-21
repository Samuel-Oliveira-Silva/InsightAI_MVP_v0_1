import { demoCalls, type Call, type Outcome, type Stage, type Strategy } from './data.ts';

export type Screen = 'dashboard' | 'calls' | 'detail' | 'simulation' | 'result' | 'history' | 'learning';
export type Speaker = 'cliente' | 'vendedor';
export interface ChatMessage { id: string; role: Speaker; text: string; }
export interface SimulationSession {
  id: string;
  callId: string;
  momentId: string;
  strategy: Strategy;
  createdAt: string;
  finishedAt?: string;
  status: 'active' | 'completed';
  messages: ChatMessage[];
  conclusion?: string;
}
export interface CallFilters { search: string; outcome: Outcome | 'Todos'; stage: Stage | 'Todas'; }
export const STORAGE_KEY = 'insightai-demo-sessions-v1';

export function filterCalls(calls: Call[], filters: CallFilters): Call[] {
  const query = filters.search.toLocaleLowerCase('pt-BR').trim();
  return calls.filter((call) => {
    const matchesQuery = !query || [call.id, call.client, call.company, call.product].some(v => v.toLocaleLowerCase('pt-BR').includes(query));
    return matchesQuery && (filters.outcome === 'Todos' || call.outcome === filters.outcome) && (filters.stage === 'Todas' || call.stage === filters.stage);
  });
}

export function getCall(id: string): Call | undefined { return demoCalls.find(call => call.id === id); }

const openings: Record<Strategy, string> = {
  explorar: 'Entendo sua preocupação. Qual parte da proposta pesa mais para você neste momento?',
  valor: 'Podemos avaliar juntos os ganhos operacionais e os custos que a solução ajudaria a reduzir?',
  desconto: 'Posso verificar uma condição comercial diferente. Que faixa de investimento seria viável?',
  implantacao: 'Podemos dividir a implantação em fases para reduzir o impacto inicial. Isso ajudaria?'
};
const reactions: Record<Strategy, string> = {
  explorar: 'O maior receio é investir agora e não ter retorno rápido. Vocês conseguem mostrar esse impacto na prática?',
  valor: 'Entendo o potencial, mas preciso demonstrar esses benefícios para a diretoria. Tem um exemplo mais concreto?',
  desconto: 'Uma condição melhor ajuda, mas ainda fico preocupado com o custo total e o esforço de implementação.',
  implantacao: 'Essa possibilidade parece interessante. Como funcionariam as etapas e o acompanhamento da equipe?'
};

export function startSimulation(call: Call, momentId: string, strategy: Strategy, now = new Date()): SimulationSession {
  const moment = call.moments.find(x => x.id === momentId);
  if (!moment) throw new Error('Momento decisivo não encontrado.');
  if (!openings[strategy]) throw new Error('Estratégia inválida.');
  return {
    id: `SIM-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
    callId: call.id, momentId, strategy, createdAt: now.toISOString(), status: 'active',
    messages: [
      { id: 'opening-customer', role: 'cliente', text: moment.customer },
      { id: 'opening-salesperson', role: 'vendedor', text: openings[strategy] },
      { id: 'opening-reaction', role: 'cliente', text: reactions[strategy] }
    ]
  };
}

export function generateDemonstrativeResponse(message: string, strategy: Strategy, turn: number): string {
  const normalized = message.toLocaleLowerCase('pt-BR');
  if (/retorno|roi|resultado|ganho|econom|benef[ií]cio/.test(normalized)) {
    return 'Isso ajuda a visualizar o valor. Você pode me enviar uma estimativa de ganhos para avaliarmos internamente?';
  }
  if (/prazo|fase|etapa|implanta|treinamento/.test(normalized)) {
    return 'Dividir a implantação em etapas reduziria nosso risco. Qual seria o cronograma inicial?';
  }
  if (/desconto|pre[çc]o|valor|custo|mensalid/.test(normalized)) {
    return 'Preciso entender o custo total, não apenas o desconto. Conseguimos detalhar as condições?';
  }
  if (/reuni[aã]o|diretoria|retorno|agenda|pr[oó]xim/.test(normalized)) {
    return 'Podemos marcar uma conversa com as pessoas responsáveis pela decisão e revisar essas informações.';
  }
  const fallback: Record<Strategy, string[]> = {
    explorar: ['Entendi. Minha preocupação continua sendo o risco financeiro. O que vocês sugerem?', 'Esse ponto é relevante. Quero compartilhar com a equipe antes de decidir.'],
    valor: ['Os benefícios parecem interessantes. Precisamos confirmar se se aplicam ao nosso cenário.', 'Pode enviar os indicadores que usamos para avaliar essa proposta?'],
    desconto: ['Obrigado pela proposta. Ainda preciso comparar o custo total com as outras opções.', 'Precisamos analisar os impactos além do investimento inicial.'],
    implantacao: ['Uma implantação gradual nos daria mais confiança.', 'Podemos avaliar um piloto antes de ampliar para toda a operação?']
  };
  return fallback[strategy][turn % 2];
}

export function addSimulationMessage(session: SimulationSession, rawMessage: string): SimulationSession {
  if (session.status !== 'active') throw new Error('A simulação já foi encerrada.');
  const message = rawMessage.trim();
  if (!message) throw new Error('Digite uma resposta para continuar.');
  if (message.length > 600) throw new Error('A resposta deve ter até 600 caracteres.');
  const nextTurn = session.messages.filter(x => x.role === 'vendedor').length;
  const response = generateDemonstrativeResponse(message, session.strategy, nextTurn);
  const id = `${session.id}-${session.messages.length}`;
  return { ...session, messages: [...session.messages,
    { id, role: 'vendedor', text: message },
    { id: `${id}-reply`, role: 'cliente', text: response }
  ] };
}

export function finishSimulation(session: SimulationSession, now = new Date()): SimulationSession {
  if (session.status !== 'active') return session;
  const conclusions: Record<Strategy, string> = {
    explorar: 'A conversa simulada abriu espaço para compreender melhor a objeção antes de apresentar uma proposta.',
    valor: 'A conversa simulada deu prioridade à demonstração de valor e à avaliação conjunta dos benefícios.',
    desconto: 'A conversa simulada explorou a negociação comercial, mantendo em aberto outras preocupações do cliente.',
    implantacao: 'A conversa simulada considerou reduzir riscos por meio de uma implantação progressiva.'
  };
  return { ...session, status: 'completed', finishedAt: now.toISOString(), conclusion: conclusions[session.strategy] };
}

export function loadSessions(storage: Pick<Storage, 'getItem'> | undefined): SimulationSession[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SimulationSession =>
      item && typeof item === 'object' && typeof item.id === 'string' && typeof item.callId === 'string' &&
      ['active', 'completed'].includes(item.status) && Array.isArray(item.messages));
  } catch { return []; }
}

export function saveSessions(storage: Pick<Storage, 'setItem'> | undefined, sessions: SimulationSession[]): void {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

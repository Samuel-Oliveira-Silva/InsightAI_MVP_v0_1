export type Outcome = 'Ganha' | 'Perdida' | 'Em andamento';
export type Stage = 'Proposta' | 'Negociação' | 'Diagnóstico';
export type Strategy = 'explorar' | 'valor' | 'desconto' | 'implantacao';
export interface DecisionPoint {
  id: string;
  minute: string;
  title: string;
  customer: string;
  originalAnswer: string;
}
export interface Call {
  id: string;
  client: string;
  company: string;
  product: string;
  date: string;
  duration: string;
  stage: Stage;
  outcome: Outcome;
  originalResult: string;
  description: string;
  objection: string;
  sentiment: string;
  transcript: { time: string; speaker: 'Vendedor' | 'Cliente'; text: string }[];
  moments: DecisionPoint[];
}

// Casos fictícios para demonstração e testes de interface. NÃO são calls reais.
export const demoCalls: Call[] = [
  {
    id: 'CALL-1042', client: 'Ricardo Almeida', company: 'Grupo Solaris', product: 'TOTVS Protheus',
    date: '2026-10-16', duration: '18 min', stage: 'Negociação', outcome: 'Perdida',
    originalResult: 'O cliente adiou a contratação após receber uma proposta de desconto sem esclarecimento sobre o retorno do investimento.',
    description: 'Negociação de implantação de ERP para integração de estoque e financeiro em unidades da empresa.',
    objection: 'Custo inicial de implementação', sentiment: 'Cauteloso',
    transcript: [
      { time: '02:15', speaker: 'Cliente', text: 'A integração entre nossas unidades está ficando cada vez mais difícil.' },
      { time: '07:30', speaker: 'Vendedor', text: 'O Protheus pode centralizar as informações financeiras e de estoque.' },
      { time: '12:40', speaker: 'Cliente', text: 'O investimento inicial está acima do que tínhamos planejado.' },
      { time: '13:02', speaker: 'Vendedor', text: 'Talvez eu consiga um desconto para fechar hoje.' },
      { time: '17:10', speaker: 'Cliente', text: 'Vou precisar adiar essa decisão e conversar com a diretoria.' }
    ],
    moments: [
      { id: 'M1', minute: '12:40', title: 'Objeção sobre investimento', customer: 'O investimento inicial está acima do que tínhamos planejado.', originalAnswer: 'Talvez eu consiga um desconto para fechar hoje.' },
      { id: 'M2', minute: '17:10', title: 'Decisão adiada', customer: 'Vou precisar adiar essa decisão e conversar com a diretoria.', originalAnswer: 'Tudo bem, aguardo seu contato.' }
    ]
  },
  {
    id: 'CALL-1039', client: 'Mariana Costa', company: 'Nova Rota Logística', product: 'TOTVS Logística',
    date: '2026-10-14', duration: '24 min', stage: 'Proposta', outcome: 'Ganha',
    originalResult: 'A cliente aceitou prosseguir para a formalização depois da demonstração de ganhos operacionais.',
    description: 'Proposta para gestão de transporte, indicadores e rastreabilidade de entregas.',
    objection: 'Prazo de adaptação da equipe', sentiment: 'Interessado',
    transcript: [
      { time: '04:10', speaker: 'Cliente', text: 'Estamos perdendo tempo com processos manuais.' },
      { time: '11:30', speaker: 'Cliente', text: 'Como a equipe vai aprender a utilizar o sistema?' },
      { time: '12:00', speaker: 'Vendedor', text: 'Podemos estruturar um treinamento por etapas.' },
      { time: '21:15', speaker: 'Cliente', text: 'Podemos dar andamento à proposta.' }
    ],
    moments: [
      { id: 'M1', minute: '11:30', title: 'Receio sobre a adoção', customer: 'Como a equipe vai aprender a utilizar o sistema?', originalAnswer: 'Podemos estruturar um treinamento por etapas.' }
    ]
  },
  {
    id: 'CALL-1035', client: 'André Lima', company: 'Indústria Horizonte', product: 'TOTVS Manufatura',
    date: '2026-10-09', duration: '31 min', stage: 'Diagnóstico', outcome: 'Em andamento',
    originalResult: 'O cliente solicitou um estudo de viabilidade antes de tomar uma decisão.',
    description: 'Mapeamento dos processos de produção e desafios para consolidação de dados.',
    objection: 'Integração com sistemas antigos', sentiment: 'Neutro',
    transcript: [
      { time: '06:45', speaker: 'Cliente', text: 'Temos sistemas antigos que não podemos desligar agora.' },
      { time: '07:30', speaker: 'Vendedor', text: 'Vamos elaborar um estudo técnico de integração.' },
      { time: '27:50', speaker: 'Cliente', text: 'Envie um plano para avaliarmos a viabilidade.' }
    ],
    moments: [
      { id: 'M1', minute: '06:45', title: 'Integração legada', customer: 'Temos sistemas antigos que não podemos desligar agora.', originalAnswer: 'Vamos elaborar um estudo técnico de integração.' }
    ]
  },
  {
    id: 'CALL-1031', client: 'Camila Pereira', company: 'Vértice Varejo', product: 'TOTVS Varejo',
    date: '2026-10-03', duration: '16 min', stage: 'Negociação', outcome: 'Perdida',
    originalResult: 'A cliente considerou a proposta interessante, mas não avançou por dúvidas sobre os custos recorrentes.',
    description: 'Otimização da gestão de lojas e integração de vendas e inventário.',
    objection: 'Mensalidade e custos recorrentes', sentiment: 'Resistente',
    transcript: [
      { time: '05:55', speaker: 'Cliente', text: 'Não sabemos se a mensalidade cabe no nosso orçamento.' },
      { time: '06:20', speaker: 'Vendedor', text: 'O valor é competitivo quando comparado ao mercado.' },
      { time: '14:05', speaker: 'Cliente', text: 'Vamos esperar mais um trimestre.' }
    ],
    moments: [
      { id: 'M1', minute: '05:55', title: 'Resistência sobre mensalidade', customer: 'Não sabemos se a mensalidade cabe no nosso orçamento.', originalAnswer: 'O valor é competitivo quando comparado ao mercado.' }
    ]
  },
  {
    id: 'CALL-1027', client: 'Felipe Santos', company: 'Horizonte Saúde', product: 'TOTVS Saúde',
    date: '2026-09-29', duration: '22 min', stage: 'Proposta', outcome: 'Ganha',
    originalResult: 'O cliente aceitou dar andamento à contratação após entender o plano de implantação.',
    description: 'Proposta de integração administrativa para clínica com múltiplas unidades.',
    objection: 'Interrupção de processos na implantação', sentiment: 'Interessado',
    transcript: [
      { time: '08:10', speaker: 'Cliente', text: 'Temos receio de interromper a operação durante a implantação.' },
      { time: '09:00', speaker: 'Vendedor', text: 'Nossa equipe pode implementar por etapas.' },
      { time: '20:20', speaker: 'Cliente', text: 'Podemos seguir com o planejamento.' }
    ],
    moments: [
      { id: 'M1', minute: '08:10', title: 'Risco na implantação', customer: 'Temos receio de interromper a operação durante a implantação.', originalAnswer: 'Nossa equipe pode implementar por etapas.' }
    ]
  }
];

export const strategies: { id: Strategy; title: string; description: string }[] = [
  { id: 'explorar', title: 'Explorar a objeção', description: 'Entender o que realmente impede o avanço.' },
  { id: 'valor', title: 'Demonstrar valor', description: 'Explicar ganhos e retorno esperado.' },
  { id: 'desconto', title: 'Oferecer desconto', description: 'Negociar condições financeiras.' },
  { id: 'implantacao', title: 'Implantação gradual', description: 'Propor uma execução por etapas.' }
];

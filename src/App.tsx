import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoCalls, strategies, type Call, type Outcome, type Strategy } from './data.ts';
import {
  addSimulationMessage, filterCalls, finishSimulation, getCall, loadSessions,
  saveSessions, startSimulation, type CallFilters, type Screen, type SimulationSession
} from './domain.ts';

type DetailsTab = 'overview' | 'transcript';
const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR');
const labelFor = (strategy: Strategy) => strategies.find(s => s.id === strategy)?.title ?? strategy;
const niceDate = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'green' | 'red' | 'orange' | 'blue' | 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
function CallStatus({ status }: { status: Outcome }) {
  return <Badge tone={status === 'Ganha' ? 'green' : status === 'Perdida' ? 'red' : 'orange'}>{status}</Badge>;
}
function Empty({ icon, title, description, action }: { icon: string; title: string; description: string; action?: ReactNode }) {
  return <div className="empty"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export default function App() {
  const [view, setView] = useState<Screen>('dashboard');
  const [callId, setCallId] = useState(demoCalls[0].id);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SimulationSession[]>(() => loadSessions(typeof window !== 'undefined' ? window.localStorage : undefined));
  const [filters, setFilters] = useState<CallFilters>({ search: '', outcome: 'Todos', stage: 'Todas' });
  const [momentId, setMomentId] = useState(demoCalls[0].moments[0].id);
  const [strategy, setStrategy] = useState<Strategy>('explorar');
  const [tab, setTab] = useState<DetailsTab>('overview');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeCall = getCall(callId) ?? demoCalls[0];
  const session = sessions.find(s => s.id === sessionId);
  const sessionCall = session ? getCall(session.callId) : undefined;
  const sessionMoment = sessionCall?.moments.find(m => m.id === session?.momentId);
  const filteredCalls = useMemo(() => filterCalls(demoCalls, filters), [filters]);
  const completedSessions = useMemo(() => sessions.filter(s => s.status === 'completed'), [sessions]);

  useEffect(() => { saveSessions(window.localStorage, sessions); }, [sessions]);
  useEffect(() => { setError(''); window.scrollTo(0, 0); }, [view]);

  const navigate = (next: Screen) => { setView(next); setSidebarOpen(false); };
  const openCall = (call: Call) => {
    setCallId(call.id); setMomentId(call.moments[0].id); setStrategy('explorar'); setTab('overview'); navigate('detail');
  };
  const handleStart = () => {
    try {
      const created = startSimulation(activeCall, momentId, strategy);
      setSessions(prev => [created, ...prev]); setSessionId(created.id); setMessage(''); navigate('simulation');
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível iniciar.'); }
  };
  const handleSend = () => {
    if (!session) return;
    try {
      const next = addSimulationMessage(session, message);
      setSessions(prev => prev.map(s => s.id === next.id ? next : s)); setMessage(''); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível continuar a simulação.'); }
  };
  const handleFinish = () => {
    if (!session) return;
    const done = finishSimulation(session);
    setSessions(prev => prev.map(s => s.id === done.id ? done : s)); navigate('result');
  };
  const openSession = (s: SimulationSession) => {
    setSessionId(s.id); navigate(s.status === 'completed' ? 'result' : 'simulation');
  };
  const pageTitle: Record<Screen, string> = {
    dashboard: 'Visão geral', calls: 'Minhas Calls', detail: 'Detalhes da negociação',
    simulation: 'Simulação de negociação', result: 'Realidade × Possibilidade',
    history: 'Histórico de simulações', learning: 'Meu aprendizado'
  };
  const navigation: { screen: Screen; symbol: string; text: string }[] = [
    { screen: 'dashboard', symbol: '▦', text: 'Visão geral' },
    { screen: 'calls', symbol: '☷', text: 'Minhas Calls' },
    { screen: 'history', symbol: '◷', text: 'Simulações' },
    { screen: 'learning', symbol: '▥', text: 'Meu aprendizado' }
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
      <button className="brand" onClick={() => navigate('dashboard')} aria-label="Ir para a visão geral">
        <span className="brand-logo">◈</span><span><strong>insight<span>AI</span></strong><small>inteligência comercial</small></span>
      </button>
      <div className="sidebar-label">ESPAÇO DE TRABALHO</div>
      <nav aria-label="Menu principal">
        {navigation.map(n => <button key={n.screen} className={`nav-item ${view === n.screen || (view === 'detail' && n.screen === 'calls') || ((view === 'simulation' || view === 'result') && n.screen === 'history') ? 'nav-active' : ''}`} onClick={() => navigate(n.screen)}><span className="nav-symbol">{n.symbol}</span>{n.text}</button>)}
      </nav>
      <div className="sidebar-spacer" />
      <div className="side-notice"><span className="side-notice-dot" /> MVP de demonstração <p>Casos fictícios • armazenamento local</p></div>
      <div className="side-person"><span className="avatar">VD</span><span>Vendedor Demo <small>Acesso local</small></span></div>
    </aside>
    {sidebarOpen && <button aria-label="Fechar menu" className="mobile-shade" onClick={() => setSidebarOpen(false)} />}
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">☰</button><div className="breadcrumb">InsightAI <span>/</span> {pageTitle[view]}</div><div className="topbar-right"><Badge tone="blue">Versão 0.1 • demo</Badge><span className="avatar avatar-top">VD</span></div></header>
      <div className="page-body">
        {view === 'dashboard' && <>
          <div className="page-heading"><div><div className="eyebrow">PAINEL DO VENDEDOR</div><h1>Seu espaço de negociação</h1><p>Revise conversas, teste abordagens e acompanhe seu desenvolvimento.</p></div><button className="button primary" onClick={() => navigate('calls')}>Ver minhas calls <span>→</span></button></div>
          <div className="metrics-grid">
            <div className="metric-card"><div className="metric-icon blue-bg">☷</div><span>Calls disponíveis</span><strong>{demoCalls.length}</strong><small>Registros fictícios de demonstração</small></div>
            <div className="metric-card"><div className="metric-icon violet-bg">◈</div><span>Simulações realizadas</span><strong>{completedSessions.length}</strong><small>Concluídas neste navegador</small></div>
            <div className="metric-card"><div className="metric-icon green-bg">✓</div><span>Negociações ganhas</span><strong>{demoCalls.filter(c => c.outcome === 'Ganha').length}</strong><small>Do conjunto demonstrativo</small></div>
            <div className="metric-card"><div className="metric-icon orange-bg">◎</div><span>Estratégias experimentadas</span><strong>{new Set(completedSessions.map(s => s.strategy)).size}</strong><small>Entre as simulações concluídas</small></div>
          </div>
          <div className="layout-2"><section className="panel"><div className="panel-heading"><div><h2>Calls recentes</h2><p>Escolha uma negociação para analisar</p></div><button className="text-button" onClick={() => navigate('calls')}>Ver todas →</button></div><div className="compact-list">{demoCalls.slice(0,4).map(call => <button className="compact-item" key={call.id} onClick={() => openCall(call)}><span className="client-avatar">{call.client.split(' ').map(s=>s[0]).slice(0,2).join('')}</span><span className="compact-item-main"><b>{call.client}</b><small>{call.company} • {formatDate(call.date)}</small></span><CallStatus status={call.outcome} /><span className="chevron">›</span></button>)}</div></section>
          <section className="panel getting-started"><div className="eyebrow">COMO FUNCIONA</div><h2>Uma negociação. Novas possibilidades.</h2><div className="step"><span>1</span><div><b>Revise uma call real</b><p>Consulte informações e momentos decisivos.</p></div></div><div className="step"><span>2</span><div><b>Teste outra estratégia</b><p>Interaja com um cliente demonstrativo.</p></div></div><div className="step"><span>3</span><div><b>Compare os cenários</b><p>Veja diferenças sem alterar a negociação original.</p></div></div><div className="demo-warning">Esta versão usa respostas programadas por regras, não uma IA generativa conectada.</div></section></div>
        </>}

        {view === 'calls' && <>
          <div className="page-heading"><div><div className="eyebrow">HISTÓRICO DE NEGOCIAÇÕES</div><h1>Minhas Calls</h1><p>Encontre uma conversa para analisar ou simular uma abordagem diferente.</p></div><Badge tone="blue">{filteredCalls.length} de {demoCalls.length} calls</Badge></div>
          <section className="panel"><div className="filters"><label className="search-wrap"><span>⌕</span><input aria-label="Buscar calls" placeholder="Buscar por cliente, empresa ou produto..." value={filters.search} onChange={e=>setFilters(prev=>({...prev,search:e.target.value}))}/></label><label className="filter-wrap">Resultado <select aria-label="Filtrar por resultado" value={filters.outcome} onChange={e=>setFilters(prev=>({...prev,outcome:e.target.value as CallFilters['outcome']}))}><option>Todos</option><option>Ganha</option><option>Perdida</option><option>Em andamento</option></select></label><label className="filter-wrap">Etapa <select aria-label="Filtrar por etapa" value={filters.stage} onChange={e=>setFilters(prev=>({...prev,stage:e.target.value as CallFilters['stage']}))}><option>Todas</option><option>Diagnóstico</option><option>Proposta</option><option>Negociação</option></select></label><button className="button subtle" onClick={() => setFilters({search:'',outcome:'Todos',stage:'Todas'})}>Limpar</button></div>
          {filteredCalls.length ? <div className="table-scroll"><table className="calls-table"><thead><tr><th>Cliente / empresa</th><th>Data</th><th>Etapa</th><th>Resultado</th><th>Produto</th><th>Ações</th></tr></thead><tbody>{filteredCalls.map(call => <tr key={call.id}><td><div className="table-client"><span className="client-avatar">{call.client.split(' ').map(s=>s[0]).slice(0,2).join('')}</span><div><b>{call.client}</b><small>{call.company}</small></div></div></td><td>{formatDate(call.date)}</td><td><Badge tone="blue">{call.stage}</Badge></td><td><CallStatus status={call.outcome}/></td><td className="muted">{call.product}</td><td><button className="button button-small outline" onClick={()=>openCall(call)}>Ver detalhes →</button></td></tr>)}</tbody></table></div> : <Empty icon="⌕" title="Nenhuma call encontrada" description="Tente ajustar os filtros ou limpar a busca." action={<button className="button outline" onClick={() => setFilters({search:'',outcome:'Todos',stage:'Todas'})}>Limpar filtros</button>}/>}</section>
        </>}

        {view === 'detail' && <>
          <button className="back-link" onClick={() => navigate('calls')}>← Voltar para Minhas Calls</button>
          <div className="page-heading"><div><div className="eyebrow">{activeCall.id} • {formatDate(activeCall.date)}</div><h1>{activeCall.client}</h1><p>{activeCall.company} · {activeCall.product}</p></div><CallStatus status={activeCall.outcome}/></div>
          <div className="details-stats"><div><span>Etapa da negociação</span><b>{activeCall.stage}</b></div><div><span>Duração da call</span><b>{activeCall.duration}</b></div><div><span>Objeção principal</span><b>{activeCall.objection}</b></div><div><span>Sentimento observado</span><b>{activeCall.sentiment}</b></div></div>
          <div className="layout-2-detail"><section className="panel"><div className="tabs"><button className={tab==='overview' ? 'tab active-tab' : 'tab'} onClick={()=>setTab('overview')}>Visão geral</button><button className={tab==='transcript' ? 'tab active-tab' : 'tab'} onClick={()=>setTab('transcript')}>Transcrição</button></div>
            {tab==='overview' ? <div className="panel-inner"><div className="section-tag">RESUMO DA NEGOCIAÇÃO</div><p className="descriptive">{activeCall.description}</p><h3>Resultado da call original</h3><div className="context-note">{activeCall.originalResult}</div><h3>Momentos decisivos</h3><div className="moments-list">{activeCall.moments.map(moment => <div className="moment" key={moment.id}><span className="moment-time">{moment.minute}</span><div><b>{moment.title}</b><p>“{moment.customer}”</p><small>Resposta original: {moment.originalAnswer}</small></div></div>)}</div></div> : <div className="panel-inner"><div className="section-tag">TRECHOS DE TRANSCRIÇÃO • DADOS DEMONSTRATIVOS</div><div className="transcript">{activeCall.transcript.map((item,i)=><div key={i} className="transcript-row"><span className="moment-time">{item.time}</span><div><b>{item.speaker}</b><p>{item.text}</p></div></div>)}</div></div>}
          </section><section className="panel simulation-setup"><div className="section-tag">O QUE PODERIA TER ACONTECIDO?</div><h2>Simular esta negociação</h2><p>Escolha o ponto de partida e uma abordagem para testar um cenário alternativo.</p><div className="form-label">1. Momento da conversa</div><div className="choice-list">{activeCall.moments.map(moment=><label key={moment.id} className={`choice ${momentId===moment.id?'chosen':''}`}><input type="radio" name="moment" checked={momentId===moment.id} onChange={()=>setMomentId(moment.id)}/><span><b>{moment.minute} — {moment.title}</b><small>{moment.customer}</small></span></label>)}</div><div className="form-label">2. Abordagem alternativa</div><div className="choice-list">{strategies.map(s=><label key={s.id} className={`choice ${strategy===s.id?'chosen':''}`}><input type="radio" name="strategy" checked={strategy===s.id} onChange={()=>setStrategy(s.id)}/><span><b>{s.title}</b><small>{s.description}</small></span></label>)}</div>{error && <div className="form-error" role="alert">{error}</div>}<button className="button primary wide" onClick={handleStart}>Iniciar simulação demonstrativa →</button><small className="subtle-text">A call original não será modificada.</small></section></div>
        </>}

        {view === 'simulation' && session && sessionCall && <>
          <div className="page-heading"><div><div className="eyebrow">TREINAMENTO DE NEGOCIAÇÃO • {sessionCall.id}</div><h1>Simulação de Negociação</h1><p>{sessionCall.client} · {sessionCall.company}</p></div><Badge tone={session.status === 'completed' ? 'green' : 'blue'}>{session.status === 'active' ? 'Em andamento' : 'Concluída'}</Badge></div>
          <div className="demo-warning sim-banner">SIMULADOR DEMONSTRATIVO: respostas geradas por regras. Não há serviço de IA real conectado nesta versão.</div>
          <div className="simulation-layout"><aside className="panel context-panel"><div className="section-tag">CONTEXTO DA CALL</div><h3>{sessionMoment?.title ?? 'Momento decisivo'}</h3><div className="context-quote">“{sessionMoment?.customer}”</div><div className="form-label">Resposta utilizada originalmente</div><p className="descriptive">{sessionMoment?.originalAnswer}</p><div className="form-label">Nova estratégia</div><Badge tone="blue">{labelFor(session.strategy)}</Badge><div className="context-footer">Os dados e os resultados são fictícios e servem apenas para demonstração.</div></aside>
          <section className="panel chat-panel"><div className="chat-top"><div className="chat-avatar">AI</div><div><h3>Cliente simulado</h3><p>Conversa interativa com respostas programadas</p></div><span className="chat-online" /></div><div className="messages" aria-live="polite">{session.messages.map(m=><div key={m.id} className={`message-line ${m.role === 'vendedor' ? 'self' : ''}`}><span className={`message-icon ${m.role === 'vendedor' ? 'me' : ''}`}>{m.role === 'vendedor' ? 'VD' : 'C'}</span><div className="message-group"><span>{m.role === 'vendedor' ? 'Você' : 'Cliente simulado'}</span><div className={`bubble ${m.role === 'vendedor' ? 'mine' : ''}`}>{m.text}</div></div></div>)}</div>
          {session.status==='active' ? <div className="chat-controls"><form onSubmit={e=>{e.preventDefault();handleSend();}}><input value={message} maxLength={600} onChange={e=>setMessage(e.target.value)} placeholder="Escreva sua próxima resposta..." aria-label="Resposta ao cliente"/><button className="button primary" type="submit" disabled={!message.trim()}>Enviar ↗</button></form>{error && <div className="form-error" role="alert">{error}</div>}<div className="chat-footer"><span>{message.length}/600 caracteres</span><button className="text-button" onClick={handleFinish}>Encerrar simulação →</button></div></div> : <div className="chat-controls"><button className="button primary wide" onClick={()=>navigate('result')}>Ver resultado →</button></div>}</section></div>
        </>}

        {view === 'result' && session && sessionCall && <>
          <div className="page-heading"><div><div className="eyebrow">RESULTADO DA SIMULAÇÃO • {sessionCall.id}</div><h1>Realidade × Possibilidade</h1><p>Compare decisões e reações sem alterar a negociação original.</p></div><button className="button outline" onClick={()=>navigate('history')}>Ver histórico →</button></div>
          <div className="demo-warning sim-banner">Cenário hipotético gerado por regras. Não é uma previsão de fechamento nem resultado real de uma negociação.</div>
          <div className="comparison-grid"><section className="panel comparison-card"><div className="comparison-label old">CENÁRIO ORIGINAL</div><h2>Call real (registro fictício)</h2><div className="form-label">Decisão tomada</div><p>“{sessionMoment?.originalAnswer}”</p><div className="form-label">Resultado registrado</div><p>{sessionCall.originalResult}</p><CallStatus status={sessionCall.outcome}/></section><section className="panel comparison-card"><div className="comparison-label new">CENÁRIO SIMULADO</div><h2>Possibilidade explorada</h2><div className="form-label">Nova estratégia</div><p>{labelFor(session.strategy)}</p><div className="form-label">Resultado demonstrativo</div><p>{session.conclusion ?? 'A simulação ainda está em andamento.'}</p><Badge tone="blue">Hipótese, não previsão</Badge></section></div>
          <div className="layout-2"><section className="panel"><div className="panel-inner"><h2>O que mudou?</h2><div className="learning-point"><span>✓</span><div><b>Abordagem</b><p>Você experimentou “{labelFor(session.strategy)}” em vez da decisão original.</p></div></div><div className="learning-point"><span>✓</span><div><b>Interação</b><p>Foram registradas {session.messages.filter(x=>x.role==='vendedor').length} mensagens do vendedor neste cenário.</p></div></div><div className="learning-point"><span>✓</span><div><b>Preservação do histórico</b><p>A negociação original permanece inalterada.</p></div></div></div></section><section className="panel"><div className="panel-inner"><h2>Aprendizado da simulação</h2><p className="descriptive">{session.conclusion ?? 'Finalize a simulação para obter o resumo.'}</p><p className="descriptive">Teste outras estratégias na mesma call para comparar as conversas. As respostas ainda são programadas, portanto não representam evidência estatística de sucesso.</p><button className="button primary" onClick={()=>openCall(sessionCall)}>Simular outra abordagem →</button></div></section></div>
        </>}

        {view === 'history' && <><div className="page-heading"><div><div className="eyebrow">TREINAMENTO CONTÍNUO</div><h1>Histórico de Simulações</h1><p>Continue simulações abertas ou consulte os resultados anteriores.</p></div><button className="button primary" onClick={()=>navigate('calls')}>Nova simulação →</button></div><section className="panel">{sessions.length ? <div className="table-scroll"><table className="calls-table"><thead><tr><th>Negociação</th><th>Estratégia</th><th>Data</th><th>Status</th><th>Ação</th></tr></thead><tbody>{sessions.map(s=><tr key={s.id}><td><b>{getCall(s.callId)?.client ?? 'Call indisponível'}</b><small className="block">{s.callId}</small></td><td>{labelFor(s.strategy)}</td><td>{niceDate(s.createdAt)}</td><td><Badge tone={s.status==='completed'?'green':'orange'}>{s.status==='completed'?'Concluída':'Em andamento'}</Badge></td><td><button className="button button-small outline" onClick={()=>openSession(s)}>{s.status==='completed'?'Ver resultado':'Continuar'} →</button></td></tr>)}</tbody></table></div> : <Empty icon="◷" title="Nenhuma simulação registrada" description="Escolha uma call e teste uma nova estratégia. Seus resultados aparecerão aqui." action={<button className="button primary" onClick={()=>navigate('calls')}>Explorar calls →</button>}/>}</section></>}

        {view === 'learning' && <><div className="page-heading"><div><div className="eyebrow">MINHA EVOLUÇÃO</div><h1>Meu Aprendizado</h1><p>Resumo das experiências demonstrativas registradas neste navegador.</p></div><Badge tone="blue">Sem probabilidades inventadas</Badge></div><div className="metrics-grid"><div className="metric-card"><span>Simulações concluídas</span><strong>{completedSessions.length}</strong><small>Histórico local</small></div><div className="metric-card"><span>Calls exploradas</span><strong>{new Set(completedSessions.map(s=>s.callId)).size}</strong><small>Negociações diferentes</small></div><div className="metric-card"><span>Estratégias testadas</span><strong>{new Set(completedSessions.map(s=>s.strategy)).size}</strong><small>Tipos de abordagem</small></div><div className="metric-card"><span>Interações do vendedor</span><strong>{completedSessions.reduce((n,s)=>n+s.messages.filter(m=>m.role==='vendedor').length,0)}</strong><small>Mensagens registradas</small></div></div><section className="panel"><div className="panel-inner"><h2>Estratégias utilizadas</h2>{completedSessions.length===0?<Empty icon="▥" title="Seus gráficos começam após uma simulação" description="Faça uma simulação e encerre a conversa para registrar sua primeira experiência." action={<button className="button primary" onClick={()=>navigate('calls')}>Começar →</button>}/>:<div className="bars">{strategies.map(s=>{const count=completedSessions.filter(x=>x.strategy===s.id).length;return <div key={s.id} className="bar-row"><div className="bar-caption"><span>{s.title}</span><b>{count}</b></div><div className="bar-track"><div className="bar-fill" style={{width:`${100*count/completedSessions.length}%`}} /></div></div>;})}</div>}<p className="info-footnote">Os dados acima representam somente frequência de uso. Não medem eficácia comercial nem probabilidade de sucesso.</p></div></section></>}
      </div>
    </main>
  </div>;
}

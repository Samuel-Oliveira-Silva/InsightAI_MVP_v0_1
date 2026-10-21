import test from 'node:test';
import assert from 'node:assert/strict';
import { demoCalls } from '../src/data.ts';
import { filterCalls, startSimulation, addSimulationMessage, finishSimulation, loadSessions, saveSessions } from '../src/domain.ts';

test('filtra calls por cliente e resultado', () => {
  const filtered = filterCalls(demoCalls, { search: 'Ricardo', outcome: 'Perdida', stage: 'Todas' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'CALL-1042');
});
test('não altera as informações da call original durante a simulação', () => {
  const before = JSON.stringify(demoCalls[0]);
  const session = startSimulation(demoCalls[0], 'M1', 'explorar', new Date('2026-10-20T20:00:00Z'));
  const updated = addSimulationMessage(session, 'Qual é o maior desafio para sua equipe?');
  assert.equal(updated.messages.length, 5);
  assert.equal(JSON.stringify(demoCalls[0]), before);
});
test('rejeita mensagem vazia e impede conversa depois de encerrar', () => {
  const session = startSimulation(demoCalls[0], 'M1', 'valor');
  assert.throws(() => addSimulationMessage(session, '  '));
  const completed = finishSimulation(session);
  assert.equal(completed.status, 'completed');
  assert.throws(() => addSimulationMessage(completed, 'Mais uma resposta'));
});
test('recupera sessões do armazenamento local', () => {
  let serialized = '';
  const storage = { setItem: (_k, v) => { serialized = v; }, getItem: () => serialized };
  const session = finishSimulation(startSimulation(demoCalls[0], 'M1', 'implantacao'));
  saveSessions(storage, [session]);
  assert.deepEqual(loadSessions(storage), [session]);
});

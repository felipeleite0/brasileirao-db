const estado = { jogos: [], classificacao: [] };

const elementos = {
  abas: document.querySelectorAll('.aba'),
  paineis: document.querySelectorAll('.painel'),
  classificacao: document.querySelector('#corpo-classificacao'),
  jogos: document.querySelector('#lista-jogos'),
  editor: document.querySelector('#editor'),
  formulario: document.querySelector('#form-jogo'),
  mensagem: document.querySelector('#mensagem'),
};

function iniciais(nome) {
  return nome.split(' ').map((parte) => parte[0]).join('').slice(0, 3).toUpperCase();
}

function renderizarResumo() {
  document.querySelector('#total-times').textContent = estado.classificacao.length;
  document.querySelector('#total-jogos').textContent = estado.jogos.length;
  document.querySelector('#finalizados').textContent = estado.jogos.filter((jogo) => jogo.status === 'finalizado').length;
}

function renderizarClassificacao() {
  elementos.classificacao.innerHTML = estado.classificacao.map((time, indice) => `
    <tr>
      <td class="posicao">${indice + 1}</td>
      <td><span class="time"><span class="escudo">${iniciais(time.time)}</span>${time.time}</span></td>
      <td><strong>${time.pontos}</strong></td><td>${time.jogos}</td>
      <td>${time.vitorias}</td><td>${time.empates}</td><td>${time.derrotas}</td>
      <td>${time.gols_pro}</td><td>${time.gols_contra}</td><td>${time.saldo}</td>
    </tr>
  `).join('');
}

function renderizarJogos() {
  elementos.jogos.innerHTML = estado.jogos.map((jogo) => {
    const placar = jogo.status === 'finalizado'
      ? `${jogo.gols_mandante} × ${jogo.gols_visitante}`
      : '×';
    return `
      <button class="jogo" data-id="${jogo.id}">
        <span class="rodada">Rodada ${jogo.rodada}</span>
        <strong class="mandante">${jogo.mandante}</strong>
        <span class="placar">${placar}</span>
        <strong class="visitante">${jogo.visitante}</strong>
        <span class="etiqueta ${jogo.status}">${jogo.status}</span>
      </button>
    `;
  }).join('');

  elementos.jogos.querySelectorAll('.jogo').forEach((botao) => {
    botao.addEventListener('click', () => abrirEditor(Number(botao.dataset.id)));
  });
}

async function carregarDados() {
  const resposta = await fetch('/api/dados');
  const dados = await resposta.json();
  estado.jogos = dados.jogos;
  estado.classificacao = dados.classificacao;
  renderizarResumo();
  renderizarClassificacao();
  renderizarJogos();
}

function abrirEditor(id) {
  const jogo = estado.jogos.find((item) => item.id === id);
  document.querySelector('#jogo-id').value = jogo.id;
  document.querySelector('#editor-rodada').textContent = `Rodada ${jogo.rodada} · ${jogo.data_jogo}`;
  document.querySelector('#nome-mandante').textContent = jogo.mandante;
  document.querySelector('#nome-visitante').textContent = jogo.visitante;
  document.querySelector('#gols-mandante').value = jogo.gols_mandante ?? '';
  document.querySelector('#gols-visitante').value = jogo.gols_visitante ?? '';
  document.querySelector('#jogo-status').value = jogo.status;
  elementos.mensagem.textContent = '';
  elementos.editor.showModal();
}

elementos.abas.forEach((aba) => {
  aba.addEventListener('click', () => {
    elementos.abas.forEach((item) => item.classList.toggle('ativa', item === aba));
    elementos.paineis.forEach((painel) => painel.classList.toggle('oculto', painel.id !== aba.dataset.alvo));
  });
});

document.querySelector('#fechar').addEventListener('click', () => elementos.editor.close());

elementos.formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  elementos.mensagem.textContent = 'Salvando...';

  const id = document.querySelector('#jogo-id').value;
  const resposta = await fetch(`/api/jogos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gols_mandante: document.querySelector('#gols-mandante').value,
      gols_visitante: document.querySelector('#gols-visitante').value,
      status: document.querySelector('#jogo-status').value,
    }),
  });

  const resultado = await resposta.json();
  if (!resposta.ok) {
    elementos.mensagem.textContent = resultado.erro;
    return;
  }

  elementos.editor.close();
  await carregarDados();
});

carregarDados().catch(() => {
  elementos.classificacao.innerHTML = '<tr><td colspan="10">Nao foi possivel carregar o banco.</td></tr>';
});


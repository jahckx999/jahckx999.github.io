/* KAELENVASH — Painel da Vitrine
   Edita data/vitrine.json direto no GitHub (API oficial). Sem servidor, sem senha guardada no site. */
(function () {
  'use strict';
  const { FORCAS, ORDEM_FORCAS, TEMAS, mandalaSVG, banner, resolver, esc } = window.KV;
  const REPO = 'jahckx999/jahckx999.github.io', ARQ = 'data/vitrine.json', RAMO = 'main';
  const API = `https://api.github.com/repos/${REPO}/contents/${ARQ}`;
  const CHAVE = 'kv_painel_token';
  const $ = (s) => document.querySelector(s);
  let token = null, sha = null, dados = null, sujo = false, editando = -1;

  /* ---------- base64 UTF-8 ---------- */
  const deB64 = (b) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
  const paraB64 = (s) => { const by = new TextEncoder().encode(s); let bin = ''; for (let i = 0; i < by.length; i += 0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i + 0x8000)); return btoa(bin); };

  /* ---------- GitHub ---------- */
  async function gh(metodo, corpo) {
    const r = await fetch(API + (metodo === 'GET' ? `?ref=${RAMO}&t=${Date.now()}` : ''), {
      method: metodo, cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: corpo ? JSON.stringify(corpo) : undefined
    });
    if (!r.ok) { const e = new Error(r.status); e.status = r.status; throw e; }
    return r.json();
  }
  const erroAmigo = (e) => ({ 401: 'Chave inválida ou expirada. Crie uma nova chave no GitHub.', 403: 'A chave não tem permissão de escrita (Contents: Read and write).', 404: 'Repositório não encontrado para esta chave. Confira se escolheu jahckx999.github.io.', 409: 'A vitrine foi alterada em outro lugar. Recarreguei a versão mais nova — refaça a última alteração.' }[e.status] || 'Falha de conexão. Verifique a internet e tente de novo.');

  async function carregar() {
    const j = await gh('GET');
    sha = j.sha; dados = JSON.parse(deB64(j.content));
    dados.config = dados.config || {}; dados.categorias = dados.categorias || []; dados.itens = dados.itens || [];
    marcar(false); tudo();
  }

  async function publicar() {
    const b = $('#publicar'); b.disabled = true; status('Publicando…');
    try {
      const j = await gh('PUT', { message: 'Vitrine: atualização pelo painel', content: paraB64(JSON.stringify(dados, null, 2) + '\n'), sha, branch: RAMO });
      sha = j.content.sha; marcar(false);
      status('Publicado! A vitrine atualiza em cerca de 1 minuto ✦', 'ok');
    } catch (e) {
      status(erroAmigo(e), 'erro');
      if (e.status === 409) await carregar().catch(() => {});
      else b.disabled = false;
    }
  }

  /* ---------- estado ---------- */
  function status(t, c = '') { const s = $('#status'); s.textContent = t; s.className = 'p-status ' + c; }
  function marcar(v) { sujo = v; $('#publicar').disabled = !v; if (v) status('Alterações não publicadas', 'sujo'); else status('Tudo salvo'); }
  addEventListener('beforeunload', (e) => { if (sujo) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- login ---------- */
  function entrarCom(t, lembrar) {
    token = t.trim();
    $('#msg-login').textContent = 'Conectando…';
    carregar().then(() => {
      try { (lembrar ? localStorage : sessionStorage).setItem(CHAVE, token); } catch (_) {}
      $('#tela-login').hidden = true; $('#tela-editor').hidden = false; $('#sair').hidden = false;
      $('#msg-login').textContent = '';
    }).catch((e) => { $('#msg-login').textContent = erroAmigo(e); token = null; });
  }
  $('#entrar').addEventListener('click', () => { const t = $('#token').value; if (t.length < 20) { $('#msg-login').textContent = 'Cole a chave completa.'; return; } entrarCom(t, $('#lembrar').checked); });
  $('#token').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#entrar').click(); });
  $('#sair').addEventListener('click', () => { if (sujo && !confirm('Há alterações não publicadas. Sair mesmo assim?')) return; try { localStorage.removeItem(CHAVE); sessionStorage.removeItem(CHAVE); } catch (_) {} location.reload(); });
  try { const salvo = localStorage.getItem(CHAVE) || sessionStorage.getItem(CHAVE); if (salvo) entrarCom(salvo, !!localStorage.getItem(CHAVE)); } catch (_) {}

  /* ---------- identidade ---------- */
  const CFG = { titulo: '#cfg-titulo', frase: '#cfg-frase', whatsapp: '#cfg-whatsapp', mensagemWhatsapp: '#cfg-msg' };
  Object.entries(CFG).forEach(([k, s]) => $(s).addEventListener('input', (e) => { dados.config[k] = k === 'whatsapp' ? e.target.value.replace(/\D/g, '') : e.target.value; marcar(true); previa(); lista(); }));

  /* ---------- render ---------- */
  function tudo() {
    Object.entries(CFG).forEach(([k, s]) => { $(s).value = dados.config[k] || ''; });
    lista(); cats(); previa();
  }

  function lista() {
    const res = resolver(dados);
    $('#lista').innerHTML = dados.itens.map((it, i) => {
      const o = res.find((r) => r.it === it) || { tema: { c1: '#222', c2: '#444' }, forca: 'cura' };
      const cat = (dados.categorias.find((c) => c.id === it.categoria) || {}).nome || it.categoria || '';
      const tags = (it.destaque ? '<span class="tag">destaque</span>' : '') + (it.ativo === false ? '<span class="tag">em breve</span>' : '') + (it.oculto ? '<span class="tag">oculto</span>' : '') + (it.url === 'whatsapp' && String(dados.config.whatsapp || '').length < 10 ? '<span class="tag">falta número</span>' : '');
      return `<li class="p-item${it.oculto ? ' esc' : ''}">
        <span class="sw" style="background:${esc(o.tema.grad || `linear-gradient(135deg,${o.tema.c1},${o.tema.c2})`)}">${mandalaSVG(o.forca, { traco: 3 })}</span>
        <span class="tx"><b>${esc(it.nome)}${tags}</b><small>${esc(cat)} · ${esc(it.url)}</small></span>
        <span class="bt">
          <button data-a="sobe" data-i="${i}" title="Subir" aria-label="Subir ${esc(it.nome)}">↑</button>
          <button data-a="desce" data-i="${i}" title="Descer" aria-label="Descer ${esc(it.nome)}">↓</button>
          <button data-a="edita" data-i="${i}" title="Editar" aria-label="Editar ${esc(it.nome)}">✎</button>
          <button data-a="apaga" data-i="${i}" title="Excluir" aria-label="Excluir ${esc(it.nome)}">🗑</button>
        </span></li>`;
    }).join('') || '<li class="vazio">Nenhum banner ainda.</li>';
  }

  $('#lista').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const i = +b.dataset.i, L = dados.itens;
    if (b.dataset.a === 'sobe' && i > 0) [L[i - 1], L[i]] = [L[i], L[i - 1]];
    else if (b.dataset.a === 'desce' && i < L.length - 1) [L[i + 1], L[i]] = [L[i], L[i + 1]];
    else if (b.dataset.a === 'edita') return abrir(i);
    else if (b.dataset.a === 'apaga') { if (!confirm(`Excluir “${L[i].nome}” da vitrine?\n(Dá para desfazer não publicando ou restaurando um backup.)`)) return; L.splice(i, 1); }
    else return;
    marcar(true); lista(); previa();
  });

  function cats() {
    $('#cats').innerHTML = dados.categorias.map((c, i) => `<li class="p-item"><span class="tx"><b>${esc(c.nome)}</b><small>${esc(c.descricao || '')}</small></span>
      <span class="bt"><button data-a="sobe" data-i="${i}" aria-label="Subir">↑</button><button data-a="edita" data-i="${i}" aria-label="Editar">✎</button><button data-a="apaga" data-i="${i}" aria-label="Excluir">🗑</button></span></li>`).join('');
  }
  $('#cats').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const i = +b.dataset.i, C = dados.categorias, c = C[i];
    if (b.dataset.a === 'sobe' && i > 0) [C[i - 1], C[i]] = [C[i], C[i - 1]];
    else if (b.dataset.a === 'edita') { const n = prompt('Nome da categoria:', c.nome); if (n === null) return; const d = prompt('Frase da categoria (opcional):', c.descricao || ''); c.nome = n.trim() || c.nome; c.descricao = (d || '').trim(); }
    else if (b.dataset.a === 'apaga') { if (dados.itens.some((it) => it.categoria === c.id)) { alert('Mova ou exclua os banners desta categoria antes.'); return; } if (!confirm(`Excluir a categoria “${c.nome}”?`)) return; C.splice(i, 1); }
    else return;
    marcar(true); cats(); previa(); lista();
  });
  function novaCategoria() {
    const n = prompt('Nome da nova categoria (ex.: Lojas, Cursos, Projetos):'); if (!n || !n.trim()) return null;
    let id = n.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'categoria';
    while (dados.categorias.some((c) => c.id === id)) id += '-2';
    dados.categorias.push({ id, nome: n.trim(), descricao: '' }); marcar(true); cats(); return id;
  }
  $('#nova-cat').addEventListener('click', () => { novaCategoria(); previa(); });

  function previa() {
    const res = resolver(dados).filter((o) => !o.it.oculto);
    $('#previa').innerHTML = res.map((o, i) => banner(o, dados.config, i)).join('') || '<p class="vazio">Vazio</p>';
    $('#previa').querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
  }

  /* ---------- formulário ---------- */
  const fm = $('#form');
  $('#f-tema').innerHTML = '<option value="auto">Automático (pelo link)</option>' + Object.keys(TEMAS).map((k) => `<option value="${k}">${esc(k.replace(/-/g, ' '))}</option>`).join('');
  $('#f-mandala').innerHTML = '<option value="auto">Automática</option>' + ORDEM_FORCAS.map((k) => `<option value="${k}">${esc(FORCAS[k].nome)} — ${esc(FORCAS[k].simbolo)}</option>`).join('');
  $('#f-coron').addEventListener('change', (e) => { $('#f-cores').hidden = !e.target.checked; fprevia(); });

  function opcoesCat(sel) {
    $('#f-cat').innerHTML = dados.categorias.map((c) => `<option value="${esc(c.id)}"${c.id === sel ? ' selected' : ''}>${esc(c.nome)}</option>`).join('') + '<option value="__nova">+ Nova categoria…</option>';
  }
  $('#f-cat').addEventListener('change', (e) => { if (e.target.value === '__nova') { const id = novaCategoria(); opcoesCat(id || (dados.categorias[0] || {}).id); } });

  function lerForm() {
    const d = new FormData(fm), g = (k) => String(d.get(k) || '').trim();
    let url = g('url');
    if (url && url.toLowerCase() === 'whatsapp') url = 'whatsapp';
    else if (url && !/^https:\/\//i.test(url) && !url.startsWith('/')) url = 'https://' + url.replace(/^http:\/\//i, '');
    const it = { id: '', nome: g('nome'), descricao: g('descricao'), url, categoria: g('categoria'), tema: g('tema') || 'auto', mandala: g('mandala') || 'auto', ativo: !!d.get('ativo'), destaque: !!d.get('destaque') };
    if (d.get('oculto')) it.oculto = true;
    if (g('cta')) it.cta = g('cta');
    if (d.get('corOn')) it.cores = { c1: g('c1'), c2: g('c2'), acento: g('acento'), grad: `linear-gradient(135deg, ${g('c1')} 0%, ${g('c2')} 100%)` };
    return it;
  }
  function fprevia() { const it = lerForm(); if (!it.nome) { $('#f-previa').innerHTML = ''; return; } const o = resolver({ itens: [it] })[0]; $('#f-previa').innerHTML = banner(o, dados.config, 0); $('#f-previa a')?.addEventListener('click', (e) => e.preventDefault()); }
  fm.addEventListener('input', fprevia);

  function abrir(i) {
    editando = i; fm.reset();
    const it = i >= 0 ? dados.itens[i] : { categoria: (dados.categorias[0] || {}).id, ativo: true, tema: 'auto', mandala: 'auto' };
    $('#dlg-titulo').textContent = i >= 0 ? `Editar: ${it.nome}` : 'Novo banner';
    opcoesCat(it.categoria);
    ['nome', 'descricao', 'url', 'cta'].forEach((k) => { fm.elements[k].value = it[k] || ''; });
    fm.elements.tema.value = TEMAS[it.tema] ? it.tema : 'auto';
    fm.elements.mandala.value = FORCAS[it.mandala] ? it.mandala : 'auto';
    fm.elements.ativo.checked = it.ativo !== false; fm.elements.destaque.checked = !!it.destaque; fm.elements.oculto.checked = !!it.oculto;
    fm.elements.corOn.checked = !!it.cores; $('#f-cores').hidden = !it.cores;
    if (it.cores) ['c1', 'c2', 'acento'].forEach((k) => { if (/^#[0-9a-f]{6}$/i.test(it.cores[k] || '')) fm.elements[k].value = it.cores[k]; });
    fprevia(); $('#dlg').showModal(); fm.elements.nome.focus();
  }
  $('#novo').addEventListener('click', () => abrir(-1));

  $('#dlg').addEventListener('close', () => {
    if ($('#dlg').returnValue !== 'ok') return;
    const it = lerForm();
    if (!it.nome || !it.url) return;
    if (it.url !== 'whatsapp' && !/^https:\/\/[^\s"'<>]+$/i.test(it.url) && !/^\/[\w\-./]*$/.test(it.url)) { alert('Link inválido. Use https://… ou /caminho/ ou whatsapp.'); return; }
    if (editando >= 0) { it.id = dados.itens[editando].id; dados.itens[editando] = it; }
    else { let id = it.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'; while (dados.itens.some((x) => x.id === id)) id += '-2'; it.id = id; dados.itens.push(it); }
    marcar(true); lista(); previa();
  });

  /* ---------- backup ---------- */
  $('#exportar').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }));
    a.download = `vitrine-kaelenvash-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
  });
  $('#importar').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const j = JSON.parse(await f.text()); if (!Array.isArray(j.itens)) throw 0; dados = j; dados.config = dados.config || {}; dados.categorias = dados.categorias || []; marcar(true); tudo(); status('Backup carregado — confira e clique em Publicar', 'sujo'); }
    catch (_) { alert('Arquivo de backup inválido.'); }
    e.target.value = '';
  });
  $('#publicar').addEventListener('click', publicar);
})();

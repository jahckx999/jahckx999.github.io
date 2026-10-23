/* KAELENVASH — página inicial: lê data/vitrine.json e monta tudo sozinha */
(function () {
  'use strict';
  const { FORCAS, ORDEM_FORCAS, mandalaSVG, banner, resolver, esc } = window.KV;
  const $ = (s) => document.querySelector(s);
  $('#ano').textContent = new Date().getFullYear();

  /* céu estrelado vivo */
  (function ceu() {
    const c = $('#ceu'), x = c.getContext('2d');
    const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W, H, est = [];
    const cria = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      W = c.width = innerWidth * d; H = c.height = innerHeight * d;
      const n = Math.min(260, Math.floor((innerWidth * innerHeight) / 5200));
      est = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.3 + .3) * d, f: Math.random() * 6.28, v: Math.random() * .02 + .005, o: Math.random() < .12 }));
    };
    const pinta = (t) => {
      x.clearRect(0, 0, W, H);
      for (const s of est) {
        const a = .35 + .65 * Math.abs(Math.sin(s.f + t * s.v * .06));
        x.globalAlpha = a; x.fillStyle = s.o ? '#FFE7A3' : '#F3EAFF';
        x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill();
      }
      if (!calmo) requestAnimationFrame(pinta);
    };
    cria(); addEventListener('resize', cria); requestAnimationFrame(pinta);
  })();

  /* órbita das 9 forças em volta da mandala-mestra */
  $('#orbita').innerHTML = ORDEM_FORCAS.map((k, i) => {
    const a = (i / ORDEM_FORCAS.length) * Math.PI * 2;
    return `<span style="left:${50 + 50 * Math.sin(a)}%;top:${50 - 50 * Math.cos(a)}%" title="${esc(FORCAS[k].nome)}">${mandalaSVG(k, { traco: 3 })}</span>`;
  }).join('');

  /* seção das forças */
  $('#forcas').innerHTML = ORDEM_FORCAS.map((k) => `<div class="forca">${mandalaSVG(k, { traco: 1.8 })}<div><h3>${esc(FORCAS[k].nome)}</h3><small>${esc(FORCAS[k].simbolo)}</small><p>${esc(FORCAS[k].sentido)}</p></div></div>`).join('');

  const revela = () => {
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); } }), { threshold: .12 }) : null;
    document.querySelectorAll('.banner').forEach((b) => io ? io.observe(b) : b.classList.add('visivel'));
  };

  function monta(dados) {
    const cfg = dados.config || {};
    if (cfg.titulo) { $('#titulo').textContent = cfg.titulo; }
    if (cfg.frase !== undefined) { $('#frase').textContent = cfg.frase; $('#frase').hidden = !cfg.frase; }
    const lista = resolver(dados).filter((o) => o.it.oculto !== true);
    const cats = (dados.categorias || []).slice();
    // categorias novas aparecem sozinhas
    lista.forEach((o) => { const id = o.it.categoria || 'outros'; if (!cats.find((c) => c.id === id)) cats.push({ id, nome: id.charAt(0).toUpperCase() + id.slice(1) }); });
    const usadas = cats.filter((c) => lista.some((o) => (o.it.categoria || 'outros') === c.id));

    $('#secoes').innerHTML = usadas.map((c) => {
      const itens = lista.filter((o) => (o.it.categoria || 'outros') === c.id);
      const classe = ['mundos', 'redes'].includes(c.id) ? c.id : (itens.length > 4 ? 'redes' : 'outros');
      return `<section class="secao" id="cat-${esc(c.id)}" data-cat="${esc(c.id)}">
        <div class="secao-topo"><h2 class="ouro">${esc(c.nome)}</h2>
        <div class="ornamento" aria-hidden="true">${mandalaSVG(ORDEM_FORCAS[(c.id.length * 7) % 9], { traco: 6 })}</div>
        ${c.descricao ? `<p>${esc(c.descricao)}</p>` : ''}</div>
        <div class="grade ${classe}">${itens.map((o, i) => banner(o, cfg, i)).join('')}</div></section>`;
    }).join('') || '<p class="vazio">Novos portais surgirão em breve.</p>';

    // filtros automáticos
    const f = $('#filtros');
    if (usadas.length > 1) {
      f.innerHTML = `<button type="button" aria-pressed="true" data-f="*">Todos</button>` + usadas.map((c) => `<button type="button" aria-pressed="false" data-f="${esc(c.id)}">${esc(c.nome)}</button>`).join('');
      f.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        f.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        document.querySelectorAll('#secoes .secao').forEach((s) => { s.hidden = b.dataset.f !== '*' && s.dataset.cat !== b.dataset.f; });
        $('#portais').scrollIntoView({ behavior: 'smooth' });
      });
    } else f.hidden = true;
    revela(); encaixa();
  }

  /* preenche a última linha de cada grade: nada de buracos, seja qual for a quantidade */
  function encaixa() {
    document.querySelectorAll('#secoes .grade').forEach((g) => {
      const itens = [...g.children].filter((b) => !b.classList.contains('destaque'));
      itens.forEach((b) => { b.style.gridColumn = ''; });
      const cols = getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length;
      const r = itens.length % cols;
      if (cols < 2 || r === 0) return;
      const ultimos = itens.slice(-r), base = Math.floor(cols / r);
      let extra = cols - base * r;
      ultimos.forEach((b, i) => { const sp = base + (i >= r - extra ? 1 : 0); b.style.gridColumn = `span ${sp}`; });
    });
  }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(encaixa, 120); });

  fetch('data/vitrine.json?v=' + Date.now(), { cache: 'no-store' })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(monta)
    .catch(() => { $('#secoes').innerHTML = '<p class="vazio">Não foi possível abrir os portais agora. Atualize a página em instantes.</p>'; });
})();

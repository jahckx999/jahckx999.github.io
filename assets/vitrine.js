/* KAELENVASH — motor da vitrine
   Gera banners, mandalas de geometria sagrada e temas automaticamente
   a partir de data/vitrine.json. Usado pela página inicial e pelo painel. */
(function (global) {
  'use strict';

  /* ---------- utilidades ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const f = (n) => Math.round(n * 100) / 100;
  const P = (r, deg) => { const a = (deg - 90) * Math.PI / 180; return [f(r * Math.cos(a)), f(r * Math.sin(a))]; };
  const poly = (pts) => 'M' + pts.map((p) => p.join(' ')).join('L') + 'Z';
  const ngon = (n, r, rot = 0) => Array.from({ length: n }, (_, i) => P(r, rot + i * 360 / n));
  const circ = (cx, cy, r, extra = '') => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"${extra}/>`;
  const hash = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); };

  /* ---------- as 9 forças (mandalas) ---------- */
  const FORCAS = {
    riqueza: { nome: 'Riqueza', simbolo: 'Estrela de Lakshmi', sentido: 'Abundância material que flui e se multiplica.' },
    sabedoria: { nome: 'Sabedoria', simbolo: 'Sri Yantra', sentido: 'A mente alinhada com a inteligência do Universo.' },
    poder: { nome: 'Poder', simbolo: 'Merkaba', sentido: 'Força interior, presença e direção.' },
    sexualidade: { nome: 'Sexualidade', simbolo: 'Hexagrama Sagrado', sentido: 'União das polaridades, desejo e energia criadora.' },
    protecao: { nome: 'Proteção', simbolo: 'Cubo de Metatron', sentido: 'Escudo espiritual que guarda seu caminho.' },
    cura: { nome: 'Cura', simbolo: 'Flor da Vida', sentido: 'Restauração do corpo, da mente e da alma.' },
    prosperidade: { nome: 'Prosperidade', simbolo: 'Espiral Áurea', sentido: 'Crescimento contínuo na proporção divina.' },
    amor: { nome: 'Amor', simbolo: 'Vesica Piscis', sentido: 'O encontro de dois mundos que gera vida.' },
    alegria: { nome: 'Alegria', simbolo: 'Coroa Solar', sentido: 'Luz que irradia e contagia.' }
  };
  const ORDEM_FORCAS = Object.keys(FORCAS);

  function geometria(tipo) {
    let g = '';
    switch (tipo) {
      case 'riqueza': {
        g += circ(0, 0, 92) + circ(0, 0, 84, ' stroke-dasharray="1.5 4"');
        g += `<path d="${poly(ngon(4, 80, 0))}"/><path d="${poly(ngon(4, 80, 45))}"/>`;
        g += `<path d="${poly(ngon(8, 80, 0).map((_, i, a) => a[(i * 3) % 8]))}"/>`;
        g += circ(0, 0, 44) + `<path d="${poly(ngon(4, 44, 0))}"/><path d="${poly(ngon(4, 44, 45))}"/>`;
        ngon(8, 80, 0).forEach(([x, y]) => { g += circ(x, y, 4.5, ' class="fill"'); });
        g += circ(0, 0, 14) + circ(0, 0, 5, ' class="fill"');
        break;
      }
      case 'sabedoria': {
        g += circ(0, 0, 94) + circ(0, 0, 88);
        for (let i = 0; i < 16; i++) { const [x1, y1] = P(76, i * 22.5 - 11.25), [x2, y2] = P(76, i * 22.5 + 11.25), [cx, cy] = P(96, i * 22.5); g += `<path d="M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}"/>`; }
        g += circ(0, 0, 76);
        const tri = (up, r, dy) => { const s = up ? 1 : -1; return `<path d="M0 ${f(dy - s * r)}L${f(r * 0.94)} ${f(dy + s * r * 0.62)}L${f(-r * 0.94)} ${f(dy + s * r * 0.62)}Z"/>`; };
        g += tri(true, 66, 6) + tri(true, 48, 12) + tri(true, 32, 4) + tri(true, 18, 2);
        g += tri(false, 66, -6) + tri(false, 52, -12) + tri(false, 38, -4) + tri(false, 24, -8) + tri(false, 12, 0);
        g += circ(0, 0, 3.5, ' class="fill"');
        break;
      }
      case 'poder': {
        g += circ(0, 0, 92) + circ(0, 0, 70);
        const doze = ngon(12, 92, 0); g += `<path d="${poly(doze.map((_, i) => doze[(i * 5) % 12]))}"/>`;
        const a = ngon(3, 70, 0), b = ngon(3, 70, 60);
        g += `<path d="${poly(a)}"/><path d="${poly(b)}"/>`;
        [...a, ...b].forEach(([x, y]) => { g += `<path d="M0 0L${x} ${y}"/>`; });
        g += `<path d="${poly(ngon(6, 35, 30))}"/>` + circ(0, 0, 35) + circ(0, 0, 10, ' class="fill"');
        break;
      }
      case 'sexualidade': {
        g += circ(0, 0, 92) + circ(-22, 0, 52) + circ(22, 0, 52);
        g += `<path d="${poly(ngon(3, 74, 0))}"/><path d="${poly(ngon(3, 74, 180))}"/>`;
        g += `<path d="${poly(ngon(6, 37, 30))}"/>` + circ(0, 0, 28);
        g += `<path d="M0 -30C14 -12 14 12 0 30C-14 12 -14 -12 0 -30Z" class="fill soft"/>`;
        g += circ(0, 0, 4, ' class="fill"');
        break;
      }
      case 'protecao': {
        const n = [[0, 0], ...ngon(6, 36, 0), ...ngon(6, 72, 0)];
        for (let i = 0; i < n.length; i++) for (let j = i + 1; j < n.length; j++) g += `<path d="M${n[i][0]} ${n[i][1]}L${n[j][0]} ${n[j][1]}" class="thin"/>`;
        n.forEach(([x, y]) => { g += circ(x, y, 17); });
        g += circ(0, 0, 94);
        break;
      }
      case 'cura': {
        const s = 22; const c = [[0, 0], ...ngon(6, s, 0), ...ngon(6, 2 * s, 0), ...ngon(6, s * Math.sqrt(3), 30)];
        c.forEach(([x, y]) => { g += circ(x, y, s); });
        g += circ(0, 0, 3 * s) + circ(0, 0, 3 * s + 6) + circ(0, 0, 4, ' class="fill"');
        break;
      }
      case 'prosperidade': {
        g += circ(0, 0, 94);
        const s = 20; [[0, 0], ...ngon(6, s, 0)].forEach(([x, y]) => { g += circ(x, y, s); });
        let d = 'M0 0', x = 0, y = 0, k = 2.2, dir = 0; const fib = [1, 1, 2, 3, 5, 8, 13, 21];
        for (const n of fib) { const r = n * k; const sw = [[r, -r], [r, r], [-r, r], [-r, -r]][dir % 4]; x += sw[0]; y += sw[1]; d += `A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y)}`; dir++; }
        g += `<path d="${d}" transform="translate(-14 10)" class="bold"/>`;
        ngon(8, 80, 22.5).forEach(([px, py]) => { g += circ(px, py, 3.5, ' class="fill"'); });
        break;
      }
      case 'amor': {
        g += circ(0, 0, 94);
        for (let i = 0; i < 12; i++) { const a = i * 30; const [x1, y1] = P(46, a - 15), [x2, y2] = P(46, a + 15), [t1x, t1y] = P(92, a - 6), [t2x, t2y] = P(92, a + 6); g += `<path d="M${x1} ${y1}C${t1x} ${t1y} ${t2x} ${t2y} ${x2} ${y2}"/>`; }
        g += circ(-16, 0, 32) + circ(16, 0, 32) + circ(0, 0, 46);
        g += `<path d="M0 -27C9 -12 9 12 0 27C-9 12 -9 -12 0 -27Z" class="fill soft"/>`;
        break;
      }
      case 'alegria': {
        for (let i = 0; i < 36; i++) { const a = i * 10; const [x1, y1] = P(48, a), [x2, y2] = P(i % 2 ? 78 : 94, a); g += `<path d="M${x1} ${y1}L${x2} ${y2}"/>`; }
        g += circ(0, 0, 46) + circ(0, 0, 38);
        for (let i = 0; i < 8; i++) { const [x, y] = P(19, i * 45); g += circ(x, y, 19); }
        g += circ(0, 0, 8, ' class="fill"');
        break;
      }
      default: g += circ(0, 0, 90);
    }
    return g;
  }

  function mandalaSVG(tipo, opts = {}) {
    const cor = opts.cor || '#E4BE55';
    const sw = opts.traco || 1.4;
    const id = 'g' + (hash(tipo + cor + Math.random()) % 1e6);
    return `<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" class="${esc(opts.classe || 'mandala')}" aria-hidden="true">
<defs><linearGradient id="${id}" x1="-100" y1="-100" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF2C2"/><stop offset=".5" stop-color="${cor}"/><stop offset="1" stop-color="#A8781B"/></linearGradient></defs>
<g fill="none" stroke="url(#${id})" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">${geometria(tipo).replace(/class="fill soft"/g, `fill="url(#${id})" fill-opacity=".3" stroke="none"`).replace(/class="fill"/g, `fill="url(#${id})" stroke="none"`).replace(/class="thin"/g, `stroke-width="${sw * 0.5}" opacity=".7"`).replace(/class="bold"/g, `stroke-width="${sw * 1.8}"`)}</g></svg>`;
  }

  /* ---------- ícones genéricos (desenhados à mão, sem logos de marcas) ---------- */
  const ICONES = {
    play: '<circle cx="12" cy="12" r="9.5"/><path d="M10 8.2l6 3.8-6 3.8z" fill="currentColor" stroke="none"/>',
    camera: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1" fill="currentColor"/>',
    nota: '<path d="M14 4v10.5a3.5 3.5 0 1 1-2-3.16V4h2z" fill="currentColor" stroke="none"/><path d="M14 4c.6 2.6 2.6 4.3 5 4.5"/>',
    pessoas: '<circle cx="9" cy="8.5" r="3"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5"/><path d="M14.5 14.4c2.6-.4 5 1 5.8 4.1"/>',
    arroba: '<circle cx="12" cy="12" r="3.6"/><path d="M15.6 12v1.4a2.6 2.6 0 0 0 5.2 0V12a8.8 8.8 0 1 0-3.6 7.1"/>',
    conversa: '<path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.3 18.4z"/><path d="M9.3 9.2c.3 2.7 2.6 5 5.4 5.5l1-1.2-1.6-1-.8.7c-1-.4-1.9-1.3-2.3-2.3l.7-.8-1-1.6z" fill="currentColor" stroke="none"/>',
    chama: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.3 2.6-5.4 3.7-8.4.5 2 1.6 3.1 2.6 3.6.2-2.8 1.5-5.2 3.5-6.6-.4 2.9.8 4.9 2 6.5 1 1.4 1.7 2.9 1.7 4.9 0 3.5-3 6.1-7 6.1z"/>',
    teia: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/>',
    idiomas: '<path d="M3.5 6h9M8 4v2c0 4-2 7-4.5 8.5M5.5 9.5c1.2 2.2 3.3 3.8 6 4.5"/><path d="M12.5 20l3.5-8.5 3.5 8.5M13.8 17h4.4"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 12l6.4-6.4"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="15.5" cy="8.8" r="1" fill="currentColor"/>',
    joia: '<path d="M6.5 4h11l3.5 5-9 11-9-11z"/><path d="M3 9h18M9.5 4L8 9l4 11 4-11-1.5-5"/>',
    estrela: '<path d="M12 3l2.4 6.2L21 10l-5 4.4L17.5 21 12 17.5 6.5 21 8 14.4 3 10l6.6-.8z"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'
  };
  const icone = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[n] || ICONES.link}</svg>`;

  /* ---------- temas: cada site/rede ganha sua estrutura visual ---------- */
  const TEMAS = {
    'teia-universal': { rotulo: 'Portal Espiritual', c1: '#2A0B55', c2: '#5B21B6', acento: '#C4B5FD', motivo: 'teia', icone: 'teia', forca: 'protecao', cta: 'Entrar no portal' },
    'teia-das-linguas': { rotulo: 'Escola de Idiomas', c1: '#06243A', c2: '#0E7490', acento: '#67E8F9', motivo: 'letras', icone: 'idiomas', forca: 'sabedoria', cta: 'Começar a aprender' },
    'radar-futuro': { rotulo: 'Notícias Diárias', c1: '#05132E', c2: '#1D4ED8', acento: '#7DD3FC', motivo: 'radar', icone: 'radar', forca: 'poder', cta: 'Ver o radar', hosts: ['blogspot.com'] },
    'garimpo-diario': { rotulo: 'Ofertas do Dia', c1: '#2A1500', c2: '#B45309', acento: '#FCD34D', motivo: 'joias', icone: 'joia', forca: 'riqueza', cta: 'Garimpar ofertas', hosts: ['meli.la', 'mercadolivre.com'] },
    youtube: { rotulo: 'Canal de vídeos', c1: '#2B0306', c2: '#B91C1C', acento: '#FCA5A5', motivo: 'filme', icone: 'play', forca: 'alegria', cta: 'Assistir', hosts: ['youtube.com', 'youtu.be'] },
    instagram: { rotulo: 'Fotos e Reels', c1: '#3B0A3F', c2: '#C2410C', acento: '#F9A8D4', motivo: 'lente', icone: 'camera', forca: 'amor', cta: 'Seguir', hosts: ['instagram.com'], grad: 'linear-gradient(135deg,#4C1D95 0%,#BE185D 50%,#EA580C 100%)' },
    tiktok: { rotulo: 'Vídeos curtos', c1: '#030712', c2: '#111827', acento: '#5EEAD4', motivo: 'ondas', icone: 'nota', forca: 'prosperidade', cta: 'Seguir', hosts: ['tiktok.com'], grad: 'linear-gradient(135deg,#020617 0%,#111827 55%,#3B0764 100%)' },
    facebook: { rotulo: 'Comunidade', c1: '#071A3D', c2: '#1D4ED8', acento: '#93C5FD', motivo: 'rede', icone: 'pessoas', forca: 'protecao', cta: 'Curtir a página', hosts: ['facebook.com', 'fb.com'] },
    threads: { rotulo: 'Conversas', c1: '#09090B', c2: '#3F3F46', acento: '#E4E4E7', motivo: 'fios', icone: 'arroba', forca: 'sabedoria', cta: 'Seguir', hosts: ['threads.net', 'threads.com'] },
    whatsapp: { rotulo: 'Conversa direta', c1: '#022C22', c2: '#047857', acento: '#6EE7B7', motivo: 'baloes', icone: 'conversa', forca: 'cura', cta: 'Chamar no WhatsApp', hosts: ['wa.me', 'whatsapp.com'] },
    tinder: { rotulo: 'Conexões', c1: '#3F0A1E', c2: '#E11D48', acento: '#FDBA74', motivo: 'chamas', icone: 'chama', forca: 'sexualidade', cta: 'Dar match', hosts: ['tinder.com'], grad: 'linear-gradient(135deg,#4C0519 0%,#BE123C 55%,#EA580C 100%)' }
  };

  function detectarTema(item) {
    if (item.tema && item.tema !== 'auto' && TEMAS[item.tema]) return item.tema;
    const u = String(item.url || '').toLowerCase();
    if (u === 'whatsapp') return 'whatsapp';
    for (const [k, t] of Object.entries(TEMAS)) if ((t.hosts || []).some((h) => u.includes(h))) return k;
    return null;
  }

  function temaGerado(item) {
    const h = hash(item.nome || item.id) % 360;
    return { rotulo: item.categoria === 'redes' ? 'Rede social' : 'Novo mundo', c1: `hsl(${h} 70% 9%)`, c2: `hsl(${h} 65% 34%)`, acento: `hsl(${h} 90% 80%)`, motivo: 'constelacao', icone: item.categoria === 'redes' ? 'link' : 'estrela', forca: null, cta: 'Acessar' };
  }

  function resolver(dados) {
    const usadas = new Set();
    const itens = (dados.itens || []).filter((i) => i && i.nome);
    const out = itens.map((it) => {
      const tk = detectarTema(it);
      const base = tk ? TEMAS[tk] : temaGerado(it);
      const tema = Object.assign({}, base, it.cores || {});
      let forca = it.mandala && it.mandala !== 'auto' && FORCAS[it.mandala] ? it.mandala : null;
      return { it, tk, tema, forca };
    });
    // distribui forças: preferência do tema, sem repetir dentro da mesma categoria quando possível
    const porCat = {};
    out.forEach((o) => {
      if (o.forca) return;
      const cat = o.it.categoria || 'outros'; porCat[cat] = porCat[cat] || new Set();
      const pref = o.tema.forca;
      if (pref && !porCat[cat].has(pref)) o.forca = pref;
      else o.forca = ORDEM_FORCAS.find((k) => !porCat[cat].has(k)) || ORDEM_FORCAS[hash(o.it.id) % 9];
      porCat[cat].add(o.forca); usadas.add(o.forca);
    });
    return out;
  }

  function linkDe(it, cfg) {
    const u = String(it.url || '').trim();
    if (it.ativo === false) return null;
    if (u === 'whatsapp') {
      const n = String(cfg.whatsapp || '').replace(/\D/g, '');
      if (n.length < 10) return null;
      return `https://wa.me/${n}?text=${encodeURIComponent(cfg.mensagemWhatsapp || '')}`;
    }
    if (/^https:\/\//i.test(u) || /^\/[\w\-./]*$/.test(u)) return u;
    return null;
  }

  /* ---------- motivos visuais de fundo de cada banner ---------- */
  function motivo(nome, acento) {
    const s = `stroke="${acento}" fill="none"`;
    let g = '';
    switch (nome) {
      case 'teia':
        for (let i = 0; i < 12; i++) { const [x, y] = P(260, i * 30); g += `<path d="M120 150L${120 + x} ${150 + y}" ${s} opacity=".35"/>`; }
        [40, 80, 125, 175, 230].forEach((r) => { g += `<path d="${poly(ngon(12, r).map(([x, y]) => [f(x + 120), f(y + 150)]))}" ${s} opacity=".28"/>`; });
        break;
      case 'letras': {
        const L = ['A', 'あ', 'Ω', 'ع', '字', 'Ж', 'ñ', 'ß', 'अ', '한', 'é', 'Ç'];
        L.forEach((c, i) => { g += `<text x="${30 + (i % 6) * 70}" y="${60 + Math.floor(i / 6) * 120 + (i % 2) * 30}" font-size="${34 + (i % 3) * 14}" fill="${acento}" opacity=".18" font-family="Cinzel,serif">${c}</text>`; });
        break;
      }
      case 'radar':
        [50, 100, 150, 200].forEach((r) => { g += circ(110, 210, r, ` ${s} opacity=".3"`); });
        g += `<path d="M110 210L${110 + 200} 210M110 210L110 10" ${s} opacity=".25"/>`;
        g += `<g class="sweep" style="transform-origin:110px 210px"><path d="M110 210L310 210A200 200 0 0 0 251 69Z" fill="${acento}" opacity=".16"/></g>`;
        [[190, 140], [60, 120], [240, 250]].forEach(([x, y]) => { g += circ(x, y, 3.5, ` fill="${acento}" opacity=".8"`); });
        break;
      case 'joias':
        [[60, 70, 34], [180, 40, 22], [250, 150, 40], [90, 220, 26], [330, 70, 18]].forEach(([x, y, r]) => {
          g += `<path d="M${x - r} ${y}L${x - r / 2} ${y - r * .6}H${x + r / 2}L${x + r} ${y}L${x} ${y + r}Z M${x - r} ${y}H${x + r} M${x - r / 2} ${y - r * .6}L${x - r / 4} ${y}L${x} ${y + r}L${x + r / 4} ${y}L${x + r / 2} ${y - r * .6}" ${s} opacity=".35"/>`;
        });
        break;
      case 'filme':
        for (let i = 0; i < 9; i++) { g += `<rect x="${i * 48}" y="14" width="30" height="18" rx="3" ${s} opacity=".25"/><rect x="${i * 48}" y="268" width="30" height="18" rx="3" ${s} opacity=".25"/>`; }
        g += `<path d="M150 110l60 40-60 40z" ${s} opacity=".25" stroke-width="2"/>`;
        break;
      case 'lente':
        g += `<rect x="40" y="40" width="220" height="220" rx="60" ${s} opacity=".25" stroke-width="2"/>` + circ(150, 150, 60, ` ${s} opacity=".25" stroke-width="2"`) + circ(220, 80, 9, ` fill="${acento}" opacity=".3"`);
        break;
      case 'ondas':
        for (let i = 0; i < 6; i++) { const y = 60 + i * 40; g += `<path d="M0 ${y}C60 ${y - 30} 120 ${y + 30} 180 ${y}S300 ${y - 30} 400 ${y}" stroke="${i % 2 ? '#22D3EE' : '#F472B6'}" fill="none" opacity=".28" stroke-width="1.6"/>`; }
        break;
      case 'rede': {
        const pts = [[40, 60], [130, 40], [220, 90], [300, 50], [80, 170], [190, 180], [280, 200], [60, 260], [170, 270], [320, 270]];
        const ed = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 5], [3, 6], [4, 5], [5, 6], [4, 7], [5, 8], [6, 9], [7, 8], [8, 9]];
        ed.forEach(([a, b]) => { g += `<path d="M${pts[a][0]} ${pts[a][1]}L${pts[b][0]} ${pts[b][1]}" ${s} opacity=".3"/>`; });
        pts.forEach(([x, y]) => { g += circ(x, y, 5, ` fill="${acento}" opacity=".45"`); });
        break;
      }
      case 'fios':
        for (let i = 0; i < 7; i++) { g += `<path d="M${-20 + i * 30} 300C${60 + i * 30} 150 ${120 + i * 20} 260 ${200 + i * 25} 0" ${s} opacity=".22"/>`; }
        break;
      case 'baloes':
        [[60, 70, 70], [200, 130, 90], [90, 220, 60]].forEach(([x, y, w]) => { g += `<rect x="${x}" y="${y}" width="${w}" height="${w * .55}" rx="${w * .2}" ${s} opacity=".3"/><path d="M${x + 14} ${y + w * .55}l-8 14 18-14" ${s} opacity=".3"/>`; });
        break;
      case 'chamas':
        [[70, 260, 1], [170, 270, 1.5], [280, 255, 1.1]].forEach(([x, y, k]) => { g += `<path transform="translate(${x} ${y}) scale(${k})" d="M0 0c-30 0-48-20-48-44 0-24 20-38 28-60 4 14 12 22 20 26 2-20 12-38 26-48-3 20 6 36 15 47 7 10 12 21 12 35 0 25-22 44-53 44z" ${s} opacity=".3"/>`; });
        break;
      default:
        for (let i = 0; i < 18; i++) { const x = (hash('x' + i + nome) % 380), y = (hash('y' + i + nome) % 280); g += circ(x, y, 1.6, ` fill="${acento}" opacity=".6"`); }
    }
    return `<svg class="motivo" viewBox="0 0 400 300" preserveAspectRatio="xMinYMid slice" aria-hidden="true">${g}</svg>`;
  }

  /* ---------- banner ---------- */
  function banner(o, cfg, i = 0) {
    const { it, tema, forca } = o;
    const href = linkDe(it, cfg);
    const F = FORCAS[forca];
    const fundo = tema.grad || `linear-gradient(135deg, ${tema.c1} 0%, ${tema.c2} 100%)`;
    const externo = href && /^https:/i.test(href);
    const tag = href ? 'a' : 'div';
    const attrs = href ? ` href="${esc(href)}"${externo ? ' target="_blank" rel="noopener noreferrer"' : ''}` : ' aria-disabled="true"';
    return `<${tag} class="banner${it.destaque ? ' destaque' : ''}${href ? '' : ' embreve'} cat-${esc(it.categoria || 'outros')}"${attrs} style="--fundo:${esc(fundo)};--acento:${esc(tema.acento)};--i:${i}" data-forca="${esc(forca)}">
  <span class="b-fundo"></span>
  ${motivo(tema.motivo, tema.acento)}
  <span class="b-mandala">${mandalaSVG(forca, { classe: 'mandala gira-lento' })}</span>
  <span class="b-brilho"></span>
  <span class="b-conteudo">
    <span class="b-topo"><span class="b-icone">${icone(tema.icone)}</span><span class="b-rotulo">${esc(tema.rotulo)}</span></span>
    <span class="b-nome">${esc(it.nome)}</span>
    ${it.descricao ? `<span class="b-desc">${esc(it.descricao)}</span>` : ''}
    <span class="b-rodape"><span class="b-forca" title="${esc(F.simbolo)}">✦ ${esc(F.nome)}</span><span class="b-cta">${href ? esc(it.cta || tema.cta) + ' <b>→</b>' : 'Em breve'}</span></span>
  </span>
</${tag}>`;
  }

  global.KV = { FORCAS, ORDEM_FORCAS, TEMAS, mandalaSVG, banner, resolver, linkDe, esc, icone, detectarTema };
})(window);

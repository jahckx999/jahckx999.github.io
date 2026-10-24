/* Checkout do Estúdio Kaelenvash — Pix principal.
   Link: kaelenvash.com/pagar/?v=1200&d=Landing%20page&ref=EK1A2B&n=Nome&k=mp
   v = valor em reais · d = serviço · ref = código do pedido · n = cliente · k = conta (mp ou nu) */
(function () {
  'use strict';

  var CHAVES = [
    { id: 'mp', banco: 'Mercado Pago', tipo: 'Celular', chave: '+5598985802413', mostra: '+55 (98) 98580-2413' },
    { id: 'nu', banco: 'Nubank', tipo: 'E-mail', chave: 'kaelenvash999@gmail.com', mostra: 'kaelenvash999@gmail.com' }
  ];
  /* Outras formas: aparecem para o cliente só quando "ativo: true" e com o link preenchido. */
  var OUTROS = [
    { id: 'cartao', nome: 'Cartão de crédito', detalhe: 'Visa, Mastercard, Elo', ativo: false, link: '' },
    { id: 'paypal', nome: 'PayPal', detalhe: 'Conta PayPal ou cartão internacional', ativo: false, link: '' },
    { id: 'payoneer', nome: 'Payoneer', detalhe: 'Pagamentos internacionais', ativo: false, link: '' },
    { id: 'transferencia', nome: 'Transferência bancária', detalhe: '', ativo: false, texto: '' }
  ];
  var RECEBEDOR = 'ESTUDIO KAELENVASH', CIDADE = 'BELEM', WHATS = '5598985802413';

  var $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search);
  var limpa = function (s, max) { return String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max); };

  var valor = parseValor(q.get('v'));
  var desc = limpa(q.get('d'), 70);
  var cliente = limpa(q.get('n'), 40);
  var ref = String(q.get('ref') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 25);
  var atual = CHAVES.filter(function (c) { return c.id === q.get('k'); })[0] || CHAVES[0];

  function parseValor(s) {
    if (!s) return 0;
    s = String(s).trim().replace(/\s/g, '');
    if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
    var n = Number(s);
    return isFinite(n) && n > 0 && n < 1e7 ? Math.round(n * 100) / 100 : 0;
  }
  function brl(n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function semAcento(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 ]/g, '').toUpperCase(); }

  /* Pix Copia e Cola (BR Code estático, padrão EMV do Banco Central) */
  function campo(id, v) { return id + String(v.length).padStart(2, '0') + v; }
  function crc16(s) {
    var crc = 0xffff;
    for (var i = 0; i < s.length; i++) {
      crc ^= s.charCodeAt(i) << 8;
      for (var j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  function brcode(chave, v, txid) {
    var p = campo('00', '01') + campo('26', campo('00', 'br.gov.bcb.pix') + campo('01', chave)) +
      campo('52', '0000') + campo('53', '986') + (v > 0 ? campo('54', v.toFixed(2)) : '') +
      campo('58', 'BR') + campo('59', semAcento(RECEBEDOR).slice(0, 25)) + campo('60', semAcento(CIDADE).slice(0, 15)) +
      campo('62', campo('05', txid || '***')) + '6304';
    return p + crc16(p);
  }

  function aviso(t) { var a = $('aviso'); a.textContent = t; a.hidden = false; clearTimeout(aviso.h); aviso.h = setTimeout(function () { a.hidden = true; }, 2200); }
  function copiar(texto, ok, alvo) {
    var feito = function () { aviso(ok); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(feito, function () { selecionar(alvo); });
    } else selecionar(alvo);
  }
  function selecionar(el) {
    if (!el) return;
    if (el.select) { el.hidden = false; el.focus(); el.select(); }
    else { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    aviso('Texto selecionado: toque em Copiar');
  }

  function valorAtual() { return valor || parseValor($('valor-input').value); }
  function render() {
    var v = valorAtual(), codigo = brcode(atual.chave, v, ref);
    $('qr').innerHTML = QR.svg(codigo, '#13042A', '#ffffff');
    $('codigo').value = codigo;
    $('chave-texto').textContent = atual.mostra;
    Array.prototype.forEach.call($('chaves').children, function (b) {
      var on = b.dataset.id === atual.id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var msg = 'Olá! Fiz o pagamento por Pix ao Estúdio Kaelenvash' + (cliente ? ' (' + cliente + ')' : '') +
      (v ? ', valor ' + brl(v) : '') + (ref ? ', pedido ' + ref : '') + '. Segue o comprovante.';
    $('comprovante').href = 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg);
  }

  /* resumo */
  if (cliente) { $('r-cliente').textContent = 'Para: ' + cliente; $('r-cliente').hidden = false; }
  if (desc) $('r-desc').textContent = desc;
  if (valor) { $('r-valor').textContent = brl(valor); $('r-valor').hidden = false; }
  else $('r-livre').hidden = false;
  if (ref) { $('r-ref').textContent = 'Pedido ' + ref; $('r-ref').hidden = false; }

  /* contas Pix */
  CHAVES.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'conta'; b.dataset.id = c.id; b.setAttribute('role', 'tab');
    var n = document.createElement('b'); n.textContent = c.banco;
    var t = document.createElement('span'); t.textContent = 'Chave ' + c.tipo.toLowerCase();
    b.appendChild(n); b.appendChild(t);
    b.addEventListener('click', function () { atual = c; render(); });
    $('chaves').appendChild(b);
  });

  /* outras formas (só as ativas) */
  var ativos = OUTROS.filter(function (o) { return o.ativo && (o.link || o.texto); });
  if (ativos.length) {
    ativos.forEach(function (o) {
      var el;
      if (o.link) { el = document.createElement('a'); el.href = o.link; el.target = '_blank'; el.rel = 'noopener'; }
      else el = document.createElement('div');
      el.className = 'forma';
      var n = document.createElement('b'); n.textContent = o.nome;
      var d = document.createElement('span'); d.textContent = o.texto || o.detalhe;
      el.appendChild(n); el.appendChild(d);
      $('outros-lista').appendChild(el);
    });
    $('outros').hidden = false;
  }

  $('valor-input').addEventListener('input', render);
  $('copiar-codigo').addEventListener('click', function () { copiar($('codigo').value, 'Código Pix copiado. Cole no app do banco.', $('codigo')); });
  $('copiar-chave').addEventListener('click', function () { copiar(atual.chave, 'Chave Pix copiada.', $('chave-texto')); });
  render();
})();

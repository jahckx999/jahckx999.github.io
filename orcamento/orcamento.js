/* Gerador de orçamentos do Estúdio Kaelenvash.
   Gera o texto, o PDF e o link de pagamento do /pagar/ já preenchido.
   Nada é salvo nem enviado a servidor. */
(function () {
  'use strict';
  var REMETENTE = 'estudio@kaelenvash.com', SITE = 'https://kaelenvash.com';
  var $ = function (id) { return document.getElementById(id); };
  var limpa = function (s, max) { return String(s || '').replace(/[\u0000-\u0009\u000b-\u001f<>]/g, '').trim().slice(0, max); };

  function parseValor(s) {
    if (!s) return 0;
    s = String(s).trim().replace(/\s|R\$/g, '');
    if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
    var n = Number(s);
    return isFinite(n) && n > 0 && n < 1e7 ? Math.round(n * 100) / 100 : 0;
  }
  function brl(n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function dataBR(d) { return d.toLocaleDateString('pt-BR'); }
  var agora = new Date();
  var num = 'EK' + agora.getFullYear().toString().slice(2) + ('0' + (agora.getMonth() + 1)).slice(-2) +
    ('0' + agora.getDate()).slice(-2) + String(Date.now()).slice(-3);

  function dados() {
    var valor = parseValor($('f-valor').value);
    var pct = Number($('f-cond').value) === 50 ? 50 : 100;
    var dias = Math.min(Math.max(parseInt($('f-valid').value, 10) || 7, 1), 365);
    var ate = new Date(agora.getTime() + dias * 864e5);
    var d = {
      nome: limpa($('f-nome').value, 60),
      serv: limpa($('f-serv').value, 70),
      itens: String($('f-itens').value || '').split('\n').map(function (l) { return limpa(l, 120); }).filter(Boolean).slice(0, 15),
      valor: valor, pct: pct, entrada: Math.round(valor * pct) / 100,
      prazo: limpa($('f-prazo').value, 30),
      validade: dataBR(ate),
      email: limpa($('f-email').value, 80),
      whats: String($('f-whats').value || '').replace(/\D/g, '').slice(0, 15)
    };
    var p = new URLSearchParams();
    if (d.entrada) p.set('v', d.entrada.toFixed(2));
    if (d.serv) p.set('d', (d.serv + (pct === 50 ? ' (entrada 50%)' : '')).slice(0, 70));
    p.set('ref', num);
    if (d.nome) p.set('n', d.nome.slice(0, 40));
    d.link = SITE + '/pagar/?' + p.toString();
    d.cond = pct === 50 ? '50% para iniciar (' + brl(d.entrada) + ') + 50% na entrega' : 'À vista no Pix';
    return d;
  }

  function texto(d) {
    var linhas = [
      'ORÇAMENTO · Estúdio Kaelenvash',
      'Nº ' + num,
      '',
      'Olá' + (d.nome ? ', ' + d.nome : '') + '! Segue a proposta:',
      '',
      '✦ ' + (d.serv || '[serviço]')
    ];
    d.itens.forEach(function (i) { linhas.push('  • ' + i); });
    linhas.push('',
      'Investimento: ' + (d.valor ? brl(d.valor) : '[valor]'),
      'Pagamento: ' + d.cond);
    if (d.prazo) linhas.push('Prazo de entrega: ' + d.prazo);
    linhas.push('Válido até: ' + d.validade, '',
      'Para aprovar, é só pagar pelo link (Pix na hora):', d.link, '',
      'Qualquer dúvida, é só responder esta mensagem.', '',
      '✦ Estúdio Kaelenvash ✦', 'kaelenvash.com · ' + REMETENTE);
    return linhas.join('\n');
  }

  function render() {
    var d = dados();
    $('p-num').textContent = 'Nº ' + num + ' · ' + dataBR(agora);
    $('p-para').textContent = 'Para: ' + (d.nome || '—');
    $('p-serv').textContent = d.serv || 'Serviço';
    var ul = $('p-itens'); ul.textContent = '';
    d.itens.forEach(function (i) { var li = document.createElement('li'); li.textContent = i; ul.appendChild(li); });
    $('p-valor').textContent = d.valor ? brl(d.valor) : 'R$ 0,00';
    $('p-cond').textContent = d.cond;
    $('p-prazo').textContent = d.prazo || '—';
    $('p-valid').textContent = 'até ' + d.validade;
    $('p-link').href = d.link; $('p-link').textContent = 'kaelenvash.com/pagar';

    var assunto = 'Orçamento Nº ' + num + (d.serv ? ' · ' + d.serv : '') + ' · Estúdio Kaelenvash';
    var corpo = texto(d);
    $('b-email').href = 'mailto:' + encodeURIComponent(d.email).replace(/%40/g, '@') +
      '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(corpo);
    $('b-whats').href = 'https://wa.me/' + d.whats + '?text=' + encodeURIComponent(corpo);
    var r = new URLSearchParams({ ref: num });
    if (d.entrada) r.set('v', d.entrada.toFixed(2));
    if (d.serv) r.set('d', d.serv); if (d.nome) r.set('n', d.nome);
    $('b-recibo').href = '../recibo/?' + r.toString();
  }

  function aviso(t) {
    var a = $('aviso'); a.textContent = t; a.hidden = false;
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { a.hidden = true; }, 2600);
  }
  function pronto(e) {
    var d = dados();
    if (!d.nome || !d.valor || !d.serv) { e.preventDefault(); aviso('Preencha cliente, serviço e valor'); return null; }
    return d;
  }

  ['f-nome', 'f-serv', 'f-itens', 'f-valor', 'f-prazo', 'f-cond', 'f-valid', 'f-email', 'f-whats'].forEach(function (id) {
    $(id).addEventListener('input', render); $(id).addEventListener('change', render);
  });
  $('b-email').addEventListener('click', function (e) {
    var d = pronto(e); if (d && !d.email) aviso('Sem e-mail do cliente: preencha o "Para" no Gmail');
  });
  $('b-whats').addEventListener('click', function (e) {
    var d = pronto(e); if (d && !d.whats) { e.preventDefault(); aviso('Coloque o WhatsApp do cliente'); }
  });
  $('b-copiar').addEventListener('click', function () {
    var t = texto(dados());
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(t).then(function () { aviso('Orçamento copiado ✓'); }, function () { aviso('Não deu para copiar'); });
    } else aviso('Não deu para copiar');
  });
  $('b-pdf').addEventListener('click', function () { window.print(); });
  render();
})();

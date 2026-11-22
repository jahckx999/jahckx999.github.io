/* Gerador de recibos do Estúdio Kaelenvash.
   Link pronto: kaelenvash.com/recibo/?v=1200&d=Landing%20page&ref=EK1A2B&n=Nome
   (mesmos parâmetros do /pagar/). Nada é salvo nem enviado a servidor. */
(function () {
  'use strict';
  var REMETENTE = 'estudio@kaelenvash.com';
  var $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search);
  var limpa = function (s, max) { return String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max); };

  function parseValor(s) {
    if (!s) return 0;
    s = String(s).trim().replace(/\s|R\$/g, '');
    if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
    var n = Number(s);
    return isFinite(n) && n > 0 && n < 1e7 ? Math.round(n * 100) / 100 : 0;
  }
  function brl(n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function hoje() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function dataBR(iso) { var p = String(iso || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
  function numeroAuto(iso) { return 'EK-' + String(iso || hoje()).replace(/-/g, '') + '-' + String(Date.now()).slice(-4); }

  /* preenche pelo link */
  $('f-nome').value = limpa(q.get('n'), 60);
  $('f-serv').value = limpa(q.get('d'), 80);
  var v0 = parseValor(q.get('v'));
  if (v0) $('f-valor').value = v0.toFixed(2).replace('.', ',');
  $('f-ref').value = String(q.get('ref') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 25);
  $('f-data').value = hoje();
  var auto = numeroAuto($('f-data').value);

  function dados() {
    var iso = $('f-data').value || hoje();
    return {
      nome: limpa($('f-nome').value, 60),
      serv: limpa($('f-serv').value, 80),
      valor: parseValor($('f-valor').value),
      data: dataBR(iso),
      num: limpa($('f-ref').value, 25).toUpperCase() || auto,
      email: limpa($('f-email').value, 80),
      whats: String($('f-whats').value || '').replace(/\D/g, '').slice(0, 15)
    };
  }

  function textoRecibo(d) {
    return [
      'RECIBO DE PAGAMENTO · Estúdio Kaelenvash',
      'Nº ' + d.num,
      '',
      'Recebemos de ' + (d.nome || '[cliente]') + ' o valor de ' + (d.valor ? brl(d.valor) : '[valor]') +
        ', referente a ' + (d.serv || '[serviço]') + ', pago via Pix (Nubank) em ' + d.data + '.',
      '',
      'Status: pagamento confirmado ✓',
      '',
      'Obrigado pela confiança! Qualquer dúvida, é só responder este e-mail.',
      '',
      '✦ Estúdio Kaelenvash ✦',
      'kaelenvash.com · ' + REMETENTE
    ].join('\n');
  }

  function render() {
    var d = dados();
    $('p-num').textContent = 'Nº ' + d.num;
    $('p-valor').textContent = d.valor ? brl(d.valor) : 'R$ 0,00';
    $('p-texto').textContent = 'Recebemos de ' + (d.nome || '—') + ' o valor acima, referente a ' +
      (d.serv || '—') + ', pago via Pix.';
    $('p-data').textContent = d.data;

    var assunto = 'Recibo de pagamento Nº ' + d.num + ' · Estúdio Kaelenvash';
    var corpo = textoRecibo(d);
    $('b-email').href = 'mailto:' + encodeURIComponent(d.email).replace(/%40/g, '@') + '?subject=' + encodeURIComponent(assunto) +
      '&body=' + encodeURIComponent(corpo);
    $('b-whats').href = 'https://wa.me/' + d.whats + '?text=' + encodeURIComponent(corpo);
    $('b-whats').setAttribute('aria-disabled', d.whats ? 'false' : 'true');
    return d;
  }

  function aviso(t) {
    var a = $('aviso'); a.textContent = t; a.hidden = false;
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { a.hidden = true; }, 2600);
  }

  ['f-nome', 'f-serv', 'f-valor', 'f-data', 'f-ref', 'f-email', 'f-whats'].forEach(function (id) {
    $(id).addEventListener('input', render);
  });
  $('f-data').addEventListener('change', function () { if (!$('f-ref').value) auto = numeroAuto($('f-data').value); render(); });

  $('b-email').addEventListener('click', function (e) {
    var d = dados();
    if (!d.valor || !d.nome) { e.preventDefault(); aviso('Preencha cliente e valor'); return; }
    if (!d.email) aviso('Sem e-mail do cliente: preencha o "Para" no Gmail');
  });
  $('b-whats').addEventListener('click', function (e) {
    var d = dados();
    if (!d.valor || !d.nome) { e.preventDefault(); aviso('Preencha cliente e valor'); return; }
    if (!d.whats) { e.preventDefault(); aviso('Coloque o WhatsApp do cliente'); }
  });
  $('b-copiar').addEventListener('click', function () {
    var t = textoRecibo(dados());
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(t).then(function () { aviso('Recibo copiado ✓'); }, function () { aviso('Não deu para copiar'); });
    } else aviso('Não deu para copiar');
  });
  $('b-pdf').addEventListener('click', function () { window.print(); });

  render();
})();

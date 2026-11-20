/* KAELENVASH — idiomas
   1) Troca sozinho para o idioma do visitante (PT, EN ou ES) na primeira visita;
      a escolha fica lembrada no navegador e o menu 🌐 permite trocar quando quiser.
   2) Monta o menu 🌐 a partir das <link rel="alternate" hreflang> da própria página.
   Robôs (Google, AdSense etc.) nunca são redirecionados: cada versão é indexada no seu endereço.
   Carregue no <head>, DEPOIS das tags <link rel="alternate">. */
(function () {
  'use strict';
  var CHAVE = 'kv-idioma';
  var NOMES = { pt: 'Português', en: 'English', es: 'Español' };
  var ROTULO = { pt: 'Idioma', en: 'Language', es: 'Idioma' };
  var atual = String(document.documentElement.lang || 'pt').slice(0, 2).toLowerCase();

  var alt = {};
  var links = document.querySelectorAll('link[rel="alternate"][hreflang]');
  for (var i = 0; i < links.length; i++) {
    var h = links[i].getAttribute('hreflang').slice(0, 2).toLowerCase();
    if (NOMES[h]) alt[h] = new URL(links[i].getAttribute('href'), location.href).pathname;
  }
  if (!alt[atual]) return; // página sem versões em outros idiomas

  var ler = function () { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } };
  var gravar = function (v) { try { localStorage.setItem(CHAVE, v); } catch (e) { /* navegação privada */ } };
  var robo = /bot|crawl|spider|slurp|mediapartners|adsbot|google-|googleother|lighthouse|preview|facebookexternalhit|headless/i.test(navigator.userAgent || '');

  var desejado = ler();
  if (!desejado && !robo) {
    var nav = String((navigator.languages && navigator.languages[0]) || navigator.language || 'pt').slice(0, 2).toLowerCase();
    desejado = nav === 'pt' ? 'pt' : nav === 'es' ? 'es' : 'en';
    gravar(desejado);
  }
  if (!robo && desejado && desejado !== atual && alt[desejado]) {
    if (alt[desejado] !== location.pathname) { location.replace(alt[desejado] + location.search + location.hash); return; }
  }

  function menu() {
    var caixa = document.createElement('div');
    caixa.className = 'kv-idioma';
    var botao = document.createElement('button');
    botao.type = 'button';
    botao.setAttribute('aria-haspopup', 'true');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', ROTULO[atual] + ': ' + NOMES[atual]);
    botao.innerHTML = '<span aria-hidden="true">🌐</span><b>' + atual.toUpperCase() + '</b>';
    var lista = document.createElement('ul');
    lista.hidden = true;
    ['pt', 'en', 'es'].forEach(function (k) {
      if (!alt[k]) return;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = alt[k];
      a.hreflang = k;
      a.lang = k;
      a.textContent = NOMES[k];
      if (k === atual) a.setAttribute('aria-current', 'true');
      a.addEventListener('click', function () { gravar(k); });
      li.appendChild(a);
      lista.appendChild(li);
    });
    var abre = function (v) { lista.hidden = !v; botao.setAttribute('aria-expanded', String(v)); };
    botao.addEventListener('click', function (e) { e.stopPropagation(); abre(lista.hidden); });
    document.addEventListener('click', function () { abre(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') abre(false); });
    caixa.appendChild(botao);
    caixa.appendChild(lista);
    var topo = document.querySelector('.pag-topo');
    if (topo) topo.appendChild(caixa); else { caixa.classList.add('flutua'); document.body.appendChild(caixa); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', menu); else menu();
})();

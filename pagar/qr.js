/* Gerador de QR Code (modo byte, correção M, versões 1–15). Código próprio, sem dependências.
   Baseado no algoritmo público da norma ISO/IEC 18004. Uso: QR.matriz("texto") -> array de linhas de booleanos. */
(function (global) {
  'use strict';
  var ECC = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24];
  var BLOCOS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10];

  function rawModulos(v) {
    var r = (16 * v + 128) * v + 64;
    if (v >= 2) { var n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
    return r;
  }
  function dadosCodewords(v) { return Math.floor(rawModulos(v) / 8) - ECC[v] * BLOCOS[v]; }
  function mul(x, y) { var z = 0; for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; } return z & 0xff; }
  function divisor(g) {
    var r = []; for (var i = 0; i < g - 1; i++) r.push(0); r.push(1);
    var raiz = 1;
    for (i = 0; i < g; i++) {
      for (var j = 0; j < r.length; j++) { r[j] = mul(r[j], raiz); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      raiz = mul(raiz, 2);
    }
    return r;
  }
  function resto(dados, div) {
    var r = div.map(function () { return 0; });
    dados.forEach(function (b) {
      var f = b ^ r.shift(); r.push(0);
      div.forEach(function (c, i) { r[i] ^= mul(c, f); });
    });
    return r;
  }
  function utf8(s) {
    var out = [], e = unescape(encodeURIComponent(s));
    for (var i = 0; i < e.length; i++) out.push(e.charCodeAt(i));
    return out;
  }

  function matriz(texto) {
    var bytes = utf8(texto), v;
    for (v = 1; v <= 15; v++) {
      var cap = dadosCodewords(v) * 8, bitsCont = v <= 9 ? 8 : 16;
      if (4 + bitsCont + bytes.length * 8 <= cap) break;
    }
    if (v > 15) throw new Error('Texto longo demais para o QR Code');
    var bits = [];
    function add(val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    add(4, 4); add(bytes.length, v <= 9 ? 8 : 16);
    bytes.forEach(function (b) { add(b, 8); });
    var capBits = dadosCodewords(v) * 8;
    add(0, Math.min(4, capBits - bits.length));
    add(0, (8 - bits.length % 8) % 8);
    for (var p = 0xec; bits.length < capBits; p ^= 0xec ^ 0x11) add(p, 8);
    var dados = [];
    for (var i = 0; i < bits.length; i += 8) { var b = 0; for (var k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; dados.push(b); }

    /* correção de erros e intercalação */
    var nb = BLOCOS[v], le = ECC[v], raw = Math.floor(rawModulos(v) / 8);
    var curtos = nb - raw % nb, lenCurto = Math.floor(raw / nb), div = divisor(le), blocos = [], pos = 0;
    for (i = 0; i < nb; i++) {
      var d = dados.slice(pos, pos + lenCurto - le + (i < curtos ? 0 : 1)); pos += d.length;
      var e = resto(d, div);
      if (i < curtos) d.push(0);
      blocos.push(d.concat(e));
    }
    var final = [];
    for (i = 0; i < blocos[0].length; i++)
      for (var j = 0; j < blocos.length; j++)
        if (i !== lenCurto - le || j >= curtos) final.push(blocos[j][i]);

    /* matriz */
    var n = v * 4 + 17, m = [], fn = [];
    for (i = 0; i < n; i++) { m.push(new Array(n).fill(false)); fn.push(new Array(n).fill(false)); }
    function set(x, y, val) { m[y][x] = val; fn[y][x] = true; }
    for (i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    function finder(x, y) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var dist = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy;
        if (xx >= 0 && xx < n && yy >= 0 && yy < n) set(xx, yy, dist !== 2 && dist !== 4);
      }
    }
    finder(3, 3); finder(n - 4, 3); finder(3, n - 4);
    var al = [];
    if (v > 1) {
      var na = Math.floor(v / 7) + 2, passo = Math.ceil((v * 4 + 4) / (na * 2 - 2)) * 2;
      al = [6]; for (var q = n - 7; al.length < na; q -= passo) al.splice(1, 0, q);
    }
    for (i = 0; i < al.length; i++) for (j = 0; j < al.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) continue;
      for (var ay = -2; ay <= 2; ay++) for (var ax = -2; ax <= 2; ax++) set(al[i] + ax, al[j] + ay, Math.max(Math.abs(ax), Math.abs(ay)) !== 1);
    }
    function formato(mask) {
      var dat = (0 << 3) | mask, r = dat; /* correção M = 00 */
      for (var t = 0; t < 10; t++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      var bt = ((dat << 10) | r) ^ 0x5412;
      function g(t) { return ((bt >>> t) & 1) !== 0; }
      for (t = 0; t <= 5; t++) set(8, t, g(t));
      set(8, 7, g(6)); set(8, 8, g(7)); set(7, 8, g(8));
      for (t = 9; t < 15; t++) set(14 - t, 8, g(t));
      for (t = 0; t < 8; t++) set(n - 1 - t, 8, g(t));
      for (t = 8; t < 15; t++) set(8, n - 15 + t, g(t));
      set(8, n - 8, true);
    }
    formato(0);
    if (v >= 7) {
      var r = v; for (i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
      var vb = (v << 12) | r;
      for (i = 0; i < 18; i++) { var bit = ((vb >>> i) & 1) !== 0, a = n - 11 + i % 3, bb = Math.floor(i / 3); set(a, bb, bit); set(bb, a, bit); }
    }
    /* dados */
    var idx = 0;
    for (var dir = n - 1; dir >= 1; dir -= 2) {
      if (dir === 6) dir = 5;
      for (var vert = 0; vert < n; vert++) for (j = 0; j < 2; j++) {
        var x = dir - j, sobe = ((dir + 1) & 2) === 0, y = sobe ? n - 1 - vert : vert;
        if (!fn[y][x] && idx < final.length * 8) { m[y][x] = ((final[idx >>> 3] >>> (7 - (idx & 7))) & 1) !== 0; idx++; }
      }
    }
    function mascara(k) {
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
        var inv;
        switch (k) {
          case 0: inv = (x + y) % 2 === 0; break;
          case 1: inv = y % 2 === 0; break;
          case 2: inv = x % 3 === 0; break;
          case 3: inv = (x + y) % 3 === 0; break;
          case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: inv = (x * y) % 2 + (x * y) % 3 === 0; break;
          case 6: inv = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
          default: inv = ((x + y) % 2 + (x * y) % 3) % 2 === 0;
        }
        if (!fn[y][x] && inv) m[y][x] = !m[y][x];
      }
    }
    function penalidade() {
      var p = 0, escuros = 0, x, y;
      for (y = 0; y < n; y++) {
        var cx = 1, cy = 1;
        for (x = 0; x < n; x++) {
          if (m[y][x]) escuros++;
          if (x > 0) { if (m[y][x] === m[y][x - 1]) { cx++; if (cx === 5) p += 3; else if (cx > 5) p++; } else cx = 1; }
          if (x > 0) { if (m[x][y] === m[x - 1][y]) { cy++; if (cy === 5) p += 3; else if (cy > 5) p++; } else cy = 1; }
          if (x > 0 && y > 0 && m[y][x] === m[y][x - 1] && m[y][x] === m[y - 1][x] && m[y][x] === m[y - 1][x - 1]) p += 3;
        }
      }
      var tot = n * n;
      p += Math.floor(Math.abs(escuros * 20 - tot * 10) / tot) * 10;
      return p;
    }
    var melhor = 0, menor = Infinity;
    for (var k = 0; k < 8; k++) {
      mascara(k); formato(k);
      var pen = penalidade();
      if (pen < menor) { menor = pen; melhor = k; }
      mascara(k);
    }
    mascara(melhor); formato(melhor);
    return m;
  }

  function svg(texto, cor, fundo) {
    var m = matriz(texto), n = m.length, borda = 4, t = n + borda * 2, d = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (m[y][x]) d += 'M' + (x + borda) + ' ' + (y + borda) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges" role="img" aria-label="QR Code do Pix">' +
      '<rect width="100%" height="100%" fill="' + (fundo || '#fff') + '"/><path d="' + d + '" fill="' + (cor || '#000') + '"/></svg>';
  }
  var api = { matriz: matriz, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else global.QR = api;
})(this);

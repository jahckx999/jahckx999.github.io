# -*- coding: utf-8 -*-
"""Gera a seção Guias do kaelenvash.com a partir de tools/guias_conteudo.py.

Uso:  python3 tools/guias.py
- Cria /guias/ (índice) e /guias/<slug>/ (um artigo por guia).
- Atualiza o bloco fixo de texto da página inicial (entre <!--guias-home--> e <!--/guias-home-->).
- Gera sitemap-guias.xml e garante que ele esteja no sitemap.xml (índice).
Não mexe no sitemap-vitrine.xml (esse é do tools/idiomas.py).
"""
import html
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))
from guias_conteudo import GUIAS  # noqa: E402

SITE = 'https://kaelenvash.com'
AUTOR = 'Jackson Davi Caldas Teixeira'


def ler(caminho):
    with open(os.path.join(RAIZ, caminho), encoding='utf-8') as f:
        return f.read()


def gravar(caminho, texto):
    destino = os.path.join(RAIZ, caminho)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with open(destino, 'w', encoding='utf-8') as f:
        f.write(texto)


# Mesma política de segurança (CSP) da página inicial, para ficar sempre em sincronia.
CSP = re.search(r'<meta http-equiv="Content-Security-Policy" content="([^"]+)">', ler('index.html')).group(1)
ADSENSE = ('<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?'
           'client=ca-pub-6152672467202667"\n     crossorigin="anonymous"></script>')


def data_br(iso):
    a, m, d = iso.split('-')
    meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto',
             'setembro', 'outubro', 'novembro', 'dezembro']
    return f'{int(d)} de {meses[int(m) - 1]} de {a}'


def cabeca(titulo, descricao, caminho, tipo='website', extra=''):
    t, d = html.escape(titulo), html.escape(descricao)
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{t} · KAELENVASH</title>
<meta name="description" content="{d}">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="theme-color" content="#13042A">
<link rel="canonical" href="{SITE}{caminho}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png"><link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png"><link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
<link rel="apple-touch-icon" href="/assets/icone-180.png">
<meta property="og:type" content="{tipo}">
<meta property="og:locale" content="pt_BR">
<meta property="og:url" content="{SITE}{caminho}">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:image" content="{SITE}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Manrope:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/vitrine.css">
<link rel="stylesheet" href="/assets/paginas.css">
<link rel="stylesheet" href="/assets/guias.css">
{extra}{ADSENSE}
</head>
<body>
<div class="envelope">
<header class="pag-topo">
  <a class="logo" href="/"><img src="/assets/mandala.svg" alt="" width="38" height="38"><span class="ouro">KAELENVASH</span></a>
  <nav aria-label="Páginas"><a href="/guias/"{' aria-current="page"' if caminho == '/guias/' else ''}>Guias</a><a href="/sobre/">Sobre</a><a href="/contato/">Contato</a><a href="/privacidade/">Privacidade</a></nav>
</header>
'''


RODAPE = '''<footer>
  <img src="/assets/mandala.svg" alt="" width="54" height="54">
  <div class="marca-r ouro">KAELENVASH</div>
  <nav class="legal" aria-label="Rodapé"><a href="/">Vitrine</a><a href="/guias/">Guias</a><a href="/sobre/">Sobre</a><a href="/contato/">Contato</a><a href="/privacidade/">Privacidade</a></nav>
  <div>© 2026 · kaelenvash.com · Todos os mundos conectados</div>
</footer>
</div>
</body>
</html>
'''


def cartao(g):
    return (f'<a href="/guias/{g["slug"]}/"><small>{html.escape(g["tema"])} · {g["leitura"]} min de leitura</small>'
            f'<b>{html.escape(g["titulo"])}</b><span>{html.escape(g["descricao"])}</span></a>')


def pagina_guia(g):
    caminho = f'/guias/{g["slug"]}/'
    ld = {
        '@context': 'https://schema.org', '@type': 'Article',
        'headline': g['titulo'], 'description': g['descricao'],
        'datePublished': g['publicado'], 'dateModified': g.get('atualizado', g['publicado']),
        'inLanguage': 'pt-BR', 'mainEntityOfPage': SITE + caminho,
        'image': SITE + '/assets/og.png',
        'author': {'@type': 'Person', 'name': AUTOR, 'url': SITE + '/sobre/'},
        'publisher': {'@type': 'Organization', 'name': 'KAELENVASH', 'url': SITE + '/',
                      'logo': {'@type': 'ImageObject', 'url': SITE + '/assets/icone-512.png'}},
    }
    extra = ('<meta property="article:published_time" content="' + g['publicado'] + '">\n'
             '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>\n')
    outros = [x for x in GUIAS if x['slug'] != g['slug']][:3]
    return (cabeca(g['titulo'], g['descricao'], caminho, 'article', extra)
            + '<main class="doc guia">\n'
            + '<nav class="trilha" aria-label="Você está em"><a href="/">Início</a> › <a href="/guias/">Guias</a> › '
            + html.escape(g['tema']) + '</nav>\n'
            + f'<h1 class="ouro">{html.escape(g["titulo"])}</h1>\n'
            + f'<p class="sub">Por {AUTOR} · {data_br(g["publicado"])} · {g["leitura"]} min de leitura</p>\n'
            + '<article>' + g['corpo'].strip() + '</article>\n'
            + '<p class="nota">Este guia tem caráter informativo e educativo. Temas espirituais são apresentados '
              'como ensinamentos das tradições, sem promessas de resultados, e nada aqui substitui orientação '
              'médica, psicológica ou profissional. Encontrou um erro? <a href="/contato/">Fale com a gente</a>.</p>\n'
            + '<h2>Mais guias</h2>\n<div class="kv-guias">' + ''.join(cartao(x) for x in outros) + '</div>\n'
            + '</main>\n' + RODAPE)


def pagina_indice():
    temas = []
    for g in GUIAS:
        if g['tema'] not in temas:
            temas.append(g['tema'])
    blocos = ''.join(
        f'<h2>{html.escape(t)}</h2>\n<div class="kv-guias">' + ''.join(cartao(g) for g in GUIAS if g['tema'] == t) + '</div>\n'
        for t in temas)
    return (cabeca('Guias', 'Guias completos e originais da KAELENVASH sobre geometria sagrada, mandalas, meditação, '
                   'chakras e aprendizado de idiomas.', '/guias/')
            + '<main class="doc">\n<img class="selinho" src="/assets/mandala.svg" alt="" width="84" height="84">\n'
            + '<h1 class="ouro">Guias KAELENVASH</h1>\n<p class="sub">Conhecimento claro, original e gratuito</p>\n'
            + '<p>Os guias reúnem, em textos completos, os temas centrais dos mundos KAELENVASH: a geometria sagrada '
              'e os símbolos da nossa mandala, práticas de bem-estar como a meditação, e métodos para aprender '
              'idiomas com base em pesquisas sobre memória. Cada guia é escrito em linguagem simples, separa o que '
              'é fato histórico ou científico do que é interpretação das tradições, e indica onde se aprofundar na '
              '<a href="/teia-universal/">Teia Universal</a> e na <a href="/teia-das-linguas/">Teia das Línguas</a>.</p>\n'
            + blocos + '</main>\n' + RODAPE)


HOME = '''<!--guias-home-->
    <section class="secao kv-sobre-home" id="guias-home" aria-labelledby="guias-home-titulo">
      <div class="secao-topo">
        <h2 class="ouro" id="guias-home-titulo">Conhecimento que conecta</h2>
        <p>A KAELENVASH é um portal brasileiro, gratuito e independente, que reúne mundos de conhecimento guardados pela geometria sagrada.</p>
      </div>
      <div class="kv-texto">
        <p>Aqui cada mundo tem um propósito. A <a href="/teia-universal/">Teia Universal</a> é uma enciclopédia viva da espiritualidade: apresenta a Fonte Criadora, as dimensões, os planos espirituais e os grandes temas espiritualistas pela visão de cada tradição, sempre citando de onde vem cada ensinamento. A <a href="/teia-das-linguas/">Teia das Línguas</a> ensina idiomas do nível A1 ao C2, começando pelo inglês, com milhares de verbos traduzidos, pronúncia adaptada ao português e métodos de estudo com base científica.</p>
        <p>Nos <a href="/guias/">Guias KAELENVASH</a> você encontra textos completos e originais para começar: o que é a geometria sagrada, como desenhar a Flor da Vida que está no centro da nossa mandala, a história das mandalas, um roteiro de meditação de 10 minutos, os sete chakras segundo as tradições e hábitos comprovados para aprender um idioma sozinho.</p>
      </div>
      <div class="kv-guias">
%s
      </div>
    </section>
<!--/guias-home-->'''


def main():
    os.makedirs(os.path.join(RAIZ, 'guias'), exist_ok=True)
    for g in GUIAS:
        gravar(f'guias/{g["slug"]}/index.html', pagina_guia(g))
    gravar('guias/index.html', pagina_indice())

    # Página inicial: bloco de texto fixo (visível sem JavaScript) + link no rodapé.
    idx = ler('index.html')
    bloco = HOME % '\n'.join('        ' + cartao(g) for g in GUIAS)
    if '<!--guias-home-->' in idx:
        idx = re.sub(r'<!--guias-home-->.*?<!--/guias-home-->', lambda _: bloco, idx, flags=re.S)
    else:
        idx = idx.replace('  </main>\n\n  <footer>', bloco + '\n  </main>\n\n  <footer>', 1)
    if '<link rel="stylesheet" href="assets/guias.css">' not in idx:
        idx = idx.replace('<link rel="stylesheet" href="assets/paginas.css">',
                          '<link rel="stylesheet" href="assets/paginas.css">\n<link rel="stylesheet" href="assets/guias.css">', 1)
    if '<a href="/guias/">Guias</a>' not in idx:
        idx = idx.replace('<nav class="legal" aria-label="Rodapé"><a href="/sobre/">',
                          '<nav class="legal" aria-label="Rodapé"><a href="/guias/">Guias</a><a href="/sobre/">', 1)
    gravar('index.html', idx)

    # Sitemaps
    urls = [('/guias/', max(g.get('atualizado', g['publicado']) for g in GUIAS))]
    urls += [(f'/guias/{g["slug"]}/', g.get('atualizado', g['publicado'])) for g in GUIAS]
    gravar('sitemap-guias.xml', '<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + '\n'.join(f'<url><loc>{SITE}{u}</loc><lastmod>{d}</lastmod></url>' for u, d in urls)
           + '\n</urlset>\n')
    sm = ler('sitemap.xml')
    if 'sitemap-guias.xml' not in sm:
        sm = sm.replace('<sitemap><loc>https://kaelenvash.com/sitemap-vitrine.xml</loc></sitemap>',
                        '<sitemap><loc>https://kaelenvash.com/sitemap-vitrine.xml</loc></sitemap>\n'
                        '<sitemap><loc>https://kaelenvash.com/sitemap-guias.xml</loc></sitemap>', 1)
        gravar('sitemap.xml', sm)
    print(f'ok: {len(GUIAS)} guias gerados, página inicial e sitemaps atualizados')


if __name__ == '__main__':
    main()

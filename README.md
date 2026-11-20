# KAELENVASH · kaelenvash.com

Vitrine que se monta sozinha a partir de `data/vitrine.json`.

- **Adicionar/editar banners:** abra `kaelenvash.com/painel/` e entre com o token do GitHub.
- **Tema e mandala** são escolhidos automaticamente pelo link (YouTube, Instagram, TikTok…).
- `assets/vitrine.js` — motor (banners, 9 mandalas, temas) · `assets/app.js` — página inicial · `painel/` — painel de edição.
- Versões antigas ficam no histórico do Git (dá para restaurar qualquer uma).

## Idiomas (PT · EN · ES)
- Versões: `/` (PT), `/en/`, `/es/` + páginas Sobre, Contato e Privacidade em cada idioma.
- `assets/idioma.js` — menu 🌐 e troca automática pelo idioma do navegador (a escolha fica lembrada; robôs do Google nunca são redirecionados).
- Banners traduzidos: `data/vitrine-en.json` e `data/vitrine-es.json` (por id; o que não estiver lá aparece em português).
- Depois de mudar textos institucionais: `python3 tools/idiomas.py` (regera EN/ES, hreflang, CSP e o sitemap).

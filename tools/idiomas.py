#!/usr/bin/env python3
"""KAELENVASH — gera as versões em inglês (/en/) e espanhol (/es/) da vitrine.

Uso:  python3 tools/idiomas.py

- Cria/atualiza: en/index.html, en/about/, en/contact/, en/privacy/,
                 es/index.html, es/sobre/, es/contacto/, es/privacidad/
- Nas páginas em português: aplica a política de segurança (CSP) que libera o
  AdSense e insere as tags hreflang + o seletor de idioma (bloco <!--idiomas-->).
- Atualiza o sitemap-vitrine.xml com todas as versões.
Os textos em português continuam sendo editados nas próprias páginas; ao mudar
um texto, ajuste a tradução abaixo e rode o script de novo.
"""
import datetime
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://kaelenvash.com'
HOJE = datetime.date.today().isoformat()

# Política de segurança: só o próprio site + Google Fonts + domínios oficiais do Google AdSense.
CSP = ("default-src 'self'; "
       "script-src 'self' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com "
       "https://*.google.com.br https://*.gstatic.com https://*.doubleclick.net https://*.googleadservices.com "
       "https://*.adtrafficquality.google; "
       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; "
       "img-src 'self' data: https:; "
       "frame-src https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.google.com.br "
       "https://*.adtrafficquality.google; "
       "connect-src 'self' https://*.google.com https://*.google.com.br https://*.googlesyndication.com "
       "https://*.doubleclick.net https://*.adtrafficquality.google; "
       "base-uri 'self'; form-action 'none'")

PAGINAS = {
    'home': {'pt': '/', 'en': '/en/', 'es': '/es/'},
    'sobre': {'pt': '/sobre/', 'en': '/en/about/', 'es': '/es/sobre/'},
    'contato': {'pt': '/contato/', 'en': '/en/contact/', 'es': '/es/contacto/'},
    'privacidade': {'pt': '/privacidade/', 'en': '/en/privacy/', 'es': '/es/privacidad/'},
}
HTML_LANG = {'pt': 'pt-BR', 'en': 'en', 'es': 'es'}
OG_LOCALE = {'pt': 'pt_BR', 'en': 'en_US', 'es': 'es_ES'}
ADSENSE = ('<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6152672467202667"\n'
           '     crossorigin="anonymous"></script>')
FONTES = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
          '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
          '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Manrope:wght@500;700&display=swap" rel="stylesheet">')
ICONES = ('<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="any">'
          '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png"><link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">'
          '<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">\n<link rel="apple-touch-icon" href="/assets/icone-180.png">')


def bloco_idiomas(pagina, lingua):
    urls = PAGINAS[pagina]
    linhas = ['<!--idiomas-->']
    for k in ('pt', 'en', 'es'):
        linhas.append(f'<link rel="alternate" hreflang="{HTML_LANG[k]}" href="{SITE}{urls[k]}">')
    linhas.append(f'<link rel="alternate" hreflang="x-default" href="{SITE}{urls["pt"]}">')
    linhas.append(f'<meta property="og:locale" content="{OG_LOCALE[lingua]}">')
    for k in ('pt', 'en', 'es'):
        if k != lingua:
            linhas.append(f'<meta property="og:locale:alternate" content="{OG_LOCALE[k]}">')
    linhas.append('<script src="/assets/idioma.js"></script>')
    linhas.append('<!--/idiomas-->')
    return '\n'.join(linhas)


def esc(t):
    return t.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')


# ------------------------------------------------------------------ textos
T = {
    'en': {
        'nav': [('sobre', 'About'), ('contato', 'Contact'), ('privacidade', 'Privacy')],
        'vitrine': 'Showcase', 'nav_aria': 'Institutional pages', 'rodape_aria': 'Footer',
        'rodape': '© 2026 · kaelenvash.com · All worlds connected',
        'home': {
            'title': 'KAELENVASH — A universe of connected worlds',
            'desc': 'KAELENVASH: a portal of connected worlds — spirituality, languages and the Kaelenvash networks, united by sacred geometry.',
            'og_desc': 'Spirituality, languages and the Kaelenvash networks — all in one portal.',
            'alt_mandala': 'KAELENVASH sacred geometry mandala',
            'frase': 'A universe of connected worlds', 'explorar': 'Explore', 'filtros': 'Filter showcase',
            'abrindo': 'Opening the portals…', 'meus': 'My Worlds',
            'forcas_t': 'The 9 Forces', 'forcas_p': 'Each portal is guarded by a sacred geometry mandala.',
        },
        'sobre': {
            'title': 'About · KAELENVASH',
            'desc': 'Meet KAELENVASH: who we are, our worlds (Teia Universal and Teia das Línguas) and our principles.',
            'h1': 'About KAELENVASH', 'sub': 'A universe of connected worlds',
            'corpo': '''<p><strong>KAELENVASH</strong> is a Brazilian portal that brings together, in one place, free digital projects to expand consciousness, mind and prosperity. Each “world” has its own purpose, but they all share the same identity: clear, welcoming and accessible knowledge, guarded by the sacred geometry of our mandala.</p>

<h2>Who is behind it</h2>
<p>kaelenvash.com was created and is maintained by <strong>Jackson Davi Caldas Teixeira</strong>, founder of the KAELENVASH brand, passionate about nature, freedom and knowledge. The project combines human creativity with artificial intelligence tools to produce and maintain quality content, always with editorial review and responsibility.</p>

<h2>The worlds of the Teia</h2>
<div class="mundos">
<a href="/teia-universal/"><b>Teia Universal</b><span>A living encyclopedia of spirituality: the Creative Source, the dimensions and the great spiritualist themes, presented through the view of each tradition. (In Portuguese for now.)</span></a>
<a href="/teia-das-linguas/"><b>Teia das Línguas</b><span>Learn languages from A1 to C2 with pronunciation, audio and proven study methods. It starts with English, with more than 11,000 verbs explained for Portuguese speakers.</span></a>
</div>

<h2>Our principles</h2>
<ul>
<li><strong>Original, free content</strong>, supported by discreet advertising.</li>
<li><strong>Respect for traditions:</strong> spiritual themes are presented as the teachings of each tradition, without proselytism and without promises.</li>
<li><strong>Accuracy:</strong> sources are cited, science is presented according to current consensus, and corrections are made whenever an error is pointed out.</li>
<li><strong>No professional advice:</strong> nothing here replaces medical, psychological, legal or financial guidance.</li>
<li><strong>Privacy:</strong> we ask for as little data as possible. Learn more in our <a href="/en/privacy/">Privacy Policy</a>.</li>
</ul>

<h2>Advertising</h2>
<p>To keep everything free, the site displays or may display Google AdSense ads, always labeled and kept separate from the content. Ads do not influence what we publish.</p>

<h2>Get in touch</h2>
<p>Suggestions, corrections, partnerships or questions are very welcome. Visit the <a href="/en/contact/">Contact</a> page or write to <a href="mailto:contato@kaelenvash.com?subject=Contact%20%E2%80%94%20kaelenvash.com">contato@kaelenvash.com</a>.</p>''',
        },
        'contato': {
            'title': 'Contact · KAELENVASH',
            'desc': 'Contact KAELENVASH by email, WhatsApp, Instagram or Facebook.',
            'h1': 'Contact', 'sub': 'Choose the channel you prefer',
            'corpo': '''<p>Have a question, a topic suggestion, an error to report, a partnership idea, or a request about your personal data? Talk directly to the KAELENVASH team.</p>

<div class="canais">
{canal_email}
<a class="canal" href="https://wa.me/5598985802413?text=Hi%21%20I%20found%20you%20through%20kaelenvash.com%20%E2%9C%A8" rel="noopener" target="_blank">{svg_whats}<span><b>WhatsApp</b><small>Direct chat</small></span></a>
{canal_insta}
{canal_face}
</div>

<h2>Before you write</h2>
<ul>
<li><strong>Found an error in a verb or pronunciation?</strong> In Teia das Línguas, use the “relatar erro” (report error) button on the verb page itself; the fix goes into the review queue.</li>
<li><strong>Privacy and data rights:</strong> to access, correct or delete your data, email us with the subject “Data rights”. See our <a href="/en/privacy/">Privacy Policy</a>.</li>
<li><strong>Partnerships and advertising:</strong> tell us a little about yourself or your company and what you have in mind.</li>
</ul>

<div class="caixa"><strong>Security:</strong> we never ask for passwords, verification codes or card details by message. Be wary of anyone contacting you on our behalf with this kind of request.</div>

<p>We reply as soon as possible, in Portuguese, English or Spanish. Responsible: Jackson Davi Caldas Teixeira · Brazil.</p>''',
            'email_assunto': 'Contact%20%E2%80%94%20kaelenvash.com',
        },
        'privacidade': {
            'title': 'Privacy Policy · KAELENVASH',
            'desc': 'How kaelenvash.com handles visitor information, cookies and Google AdSense advertising.',
            'h1': 'Privacy Policy', 'sub': 'Last updated: 10/26/2026',
            'corpo': '''<p>This policy explains, simply and transparently, how <strong>kaelenvash.com</strong> handles the information of people who visit the site, in accordance with Brazil’s General Data Protection Law (LGPD — Law No. 13,709/2018) and with Google AdSense policies.</p>
<p><em>This is a translation of the original policy in Portuguese. In case of any discrepancy, the <a href="/privacidade/">Portuguese version</a> prevails.</em></p>

<h2>1. Who is responsible</h2>
<p>kaelenvash.com is maintained by <strong>Jackson Davi Caldas Teixeira</strong> (KAELENVASH brand), in Brazil, who acts as the controller of the personal data processed on this site. For any privacy matter, write to <a href="mailto:contato@kaelenvash.com?subject=Privacy%20%E2%80%94%20kaelenvash.com">contato@kaelenvash.com</a>.</p>

<h2>2. What this policy covers</h2>
<p>It applies to the entire kaelenvash.com domain, including the showcase and the portals published on it, such as <a href="/teia-universal/">Teia Universal</a> and <a href="/teia-das-linguas/">Teia das Línguas</a>. Features specific to each portal (for example, the Teia das Línguas study account) may have complementary rules described in <a href="/teia-das-linguas/privacidade.html">that portal’s own policy</a>. External sites we link to, such as social networks, follow their own providers’ policies.</p>

<h2>3. What data we process</h2>
<ul>
<li><strong>Browsing without registration:</strong> the showcase does not ask for your name, email or registration to be visited.</li>
<li><strong>Technical data:</strong> as on any website, the hosting server (GitHub Pages) and third-party services may log data such as IP address, browser type, pages accessed and date and time, in order to deliver content and keep the site secure.</li>
<li><strong>Fonts:</strong> the site’s fonts are loaded from Google Fonts, which involves sending your IP address to Google.</li>
<li><strong>Local storage:</strong> some portals store preferences and progress only in your browser (local storage) — for example, the language you chose — without sending them to us.</li>
<li><strong>Voluntary contact:</strong> if you write to us by email, WhatsApp or social media, we receive the information you choose to send, such as your name, contact details and message.</li>
<li><strong>Payments:</strong> services hired from Estúdio Kaelenvash are paid via Pix (Brazil’s instant payment system), directly in your bank’s app. We do not receive or store card details or banking passwords; a receipt only reaches us if you decide to send it.</li>
</ul>

<h2>4. Cookies and advertising (Google AdSense)</h2>
<p>This site displays or may display ads provided by <strong>Google AdSense</strong>. It is important that you know:</p>
<ul>
<li>Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this website or other websites.</li>
<li>Google’s use of advertising cookies enables it and its partners to serve ads to users based on their visits to this site and/or other sites on the Internet.</li>
<li>You may opt out of personalized advertising in <a href="https://adssettings.google.com" rel="noopener" target="_blank">Google Ads Settings</a>. You can also opt out of third-party vendors’ cookies for personalized advertising at <a href="https://www.aboutads.info/choices/" rel="noopener" target="_blank">aboutads.info/choices</a> and <a href="https://www.youronlinechoices.eu/" rel="noopener" target="_blank">youronlinechoices.eu</a>.</li>
<li>To understand how Google uses data on partner sites, see <a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">How Google uses information from sites or apps that use our services</a>.</li>
</ul>
<p>Where required by the law of the visitor’s region (such as the European Economic Area and the United Kingdom), a notice will be shown to collect your consent before personalized advertising cookies are used. You can also block or delete cookies in your browser settings; this does not prevent access to the content, but it may make ads less relevant.</p>

<h2>5. Audience measurement</h2>
<p>At the moment, the showcase does not use audience analytics tools. If we start using one (for example, Google Analytics), this policy will be updated beforehand, stating what data is collected and how to opt out.</p>

<h2>6. Why we use data and on what legal basis</h2>
<ul>
<li><strong>Delivering the site securely</strong> and preventing abuse — legitimate interest.</li>
<li><strong>Answering messages</strong> and providing services you request — performance of a contract or of preliminary procedures at the data subject’s request.</li>
<li><strong>Displaying ads</strong> that keep the content free — consent, where required, or legitimate interest, under the LGPD.</li>
<li><strong>Complying with legal obligations</strong> — where applicable.</li>
</ul>
<p><strong>We do not sell personal data.</strong></p>

<h2>7. Sharing</h2>
<p>Data may be processed by the providers that make the site possible: GitHub (hosting), Google (fonts and ads), Supabase (Teia das Línguas accounts) and the messaging platforms you choose to use. We may also share information if there is a legal obligation or an order from a competent authority. Some of these providers may process data outside Brazil, with the safeguards provided for in the LGPD.</p>

<h2>8. How long we keep it</h2>
<p>Messages and receipts are kept only for as long as needed to handle your request and comply with legal obligations. Data stored in your browser is under your control and can be deleted at any time in its settings.</p>

<h2>9. Your rights</h2>
<p>Under the LGPD (art. 18), you may request at any time: confirmation that we process your data; access; correction; anonymization, blocking or deletion of unnecessary data; portability; information about whom we share it with; and withdrawal of consent. Just write to <a href="mailto:contato@kaelenvash.com?subject=Data%20rights%20%E2%80%94%20kaelenvash.com">contato@kaelenvash.com</a>. We will reply within a reasonable time, and, if you prefer, you may also contact Brazil’s National Data Protection Authority (ANPD) or the data protection authority of your country.</p>

<h2>10. Security</h2>
<p>The site uses an encrypted connection (HTTPS) and content security policies that limit what can be loaded on its pages. No system is 100% invulnerable, but we take reasonable measures to protect information.</p>

<h2>11. Children and teenagers</h2>
<p>The content is educational and open to everyone, but it is not specifically directed at children. We do not knowingly collect data from children; if you are a parent or guardian and believe this has happened, contact us so the data can be removed.</p>

<h2>12. Changes to this policy</h2>
<p>This policy may be updated to reflect new features or legal requirements. The date at the top shows the most recent version.</p>

<div class="caixa">Questions? Talk to us through the <a href="/en/contact/">Contact</a> page or by email at <a href="mailto:contato@kaelenvash.com?subject=Privacy%20%E2%80%94%20kaelenvash.com">contato@kaelenvash.com</a>.</div>''',
        },
        'canal_insta': 'Instagram', 'canal_face': 'Facebook',
    },
    'es': {
        'nav': [('sobre', 'Sobre'), ('contato', 'Contacto'), ('privacidade', 'Privacidad')],
        'vitrine': 'Vitrina', 'nav_aria': 'Páginas institucionales', 'rodape_aria': 'Pie de página',
        'rodape': '© 2026 · kaelenvash.com · Todos los mundos conectados',
        'home': {
            'title': 'KAELENVASH — Un universo de mundos conectados',
            'desc': 'KAELENVASH: portal de mundos conectados — espiritualidad, idiomas y las redes Kaelenvash, unidos por la geometría sagrada.',
            'og_desc': 'Espiritualidad, idiomas y las redes Kaelenvash — todo en un solo portal.',
            'alt_mandala': 'Mandala KAELENVASH de geometría sagrada',
            'frase': 'Un universo de mundos conectados', 'explorar': 'Explorar', 'filtros': 'Filtrar vitrina',
            'abrindo': 'Abriendo los portales…', 'meus': 'Mis Mundos',
            'forcas_t': 'Las 9 Fuerzas', 'forcas_p': 'Cada portal está protegido por un mandala de geometría sagrada.',
        },
        'sobre': {
            'title': 'Sobre · KAELENVASH',
            'desc': 'Conoce KAELENVASH: quiénes somos, nuestros mundos (Teia Universal y Teia das Línguas) y nuestros principios.',
            'h1': 'Sobre KAELENVASH', 'sub': 'Un universo de mundos conectados',
            'corpo': '''<p><strong>KAELENVASH</strong> es un portal brasileño que reúne, en un solo lugar, proyectos digitales gratuitos para expandir la conciencia, la mente y la prosperidad. Cada “mundo” tiene un propósito propio, pero todos comparten la misma identidad: conocimiento claro, acogedor y accesible, protegido por la geometría sagrada de nuestro mandala.</p>

<h2>Quién está detrás</h2>
<p>kaelenvash.com fue creado y es mantenido por <strong>Jackson Davi Caldas Teixeira</strong>, fundador de la marca KAELENVASH, apasionado por la naturaleza, la libertad y el conocimiento. El proyecto une la creatividad humana con herramientas de inteligencia artificial para producir y mantener contenido de calidad, siempre con revisión y responsabilidad editorial.</p>

<h2>Los mundos de la Teia</h2>
<div class="mundos">
<a href="/teia-universal/"><b>Teia Universal</b><span>Enciclopedia viva de la espiritualidad: la Fuente Creadora, las dimensiones y los grandes temas espiritualistas, presentados desde la visión de cada tradición. (Por ahora, en portugués.)</span></a>
<a href="/teia-das-linguas/"><b>Teia das Línguas</b><span>Aprende idiomas del A1 al C2 con pronunciación, audio y métodos de estudio comprobados. Empieza por el inglés, con más de 11 mil verbos explicados para hablantes de portugués.</span></a>
</div>

<h2>Nuestros principios</h2>
<ul>
<li><strong>Contenido original y gratuito</strong>, sostenido por publicidad discreta.</li>
<li><strong>Respeto a las tradiciones:</strong> los temas espirituales se presentan como enseñanzas de cada corriente, sin proselitismo y sin promesas.</li>
<li><strong>Precisión:</strong> fuentes citadas, ciencia presentada según el consenso actual y correcciones siempre que se señala un error.</li>
<li><strong>Sin asesoramiento profesional:</strong> nada aquí sustituye la orientación médica, psicológica, jurídica o financiera.</li>
<li><strong>Privacidad:</strong> pedimos el mínimo de datos posible. Más información en la <a href="/es/privacidad/">Política de Privacidad</a>.</li>
</ul>

<h2>Publicidad</h2>
<p>Para mantener todo gratuito, el sitio muestra o podrá mostrar anuncios de Google AdSense, siempre identificados y separados del contenido. Los anuncios no influyen en lo que publicamos.</p>

<h2>Habla con nosotros</h2>
<p>Sugerencias, correcciones, alianzas o dudas son muy bienvenidas. Visita la página de <a href="/es/contacto/">Contacto</a> o escribe a <a href="mailto:contato@kaelenvash.com?subject=Contacto%20%E2%80%94%20kaelenvash.com">contato@kaelenvash.com</a>.</p>''',
        },
        'contato': {
            'title': 'Contacto · KAELENVASH',
            'desc': 'Habla con KAELENVASH por correo electrónico, WhatsApp, Instagram o Facebook.',
            'h1': 'Contacto', 'sub': 'Elige el canal que prefieras',
            'corpo': '''<p>¿Quieres resolver una duda, sugerir un tema, reportar un error, proponer una alianza o hablar sobre tus datos personales? Habla directamente con el equipo KAELENVASH.</p>

<div class="canais">
{canal_email}
<a class="canal" href="https://wa.me/5598985802413?text=%C2%A1Hola%21%20Llegu%C3%A9%20por%20kaelenvash.com%20%E2%9C%A8" rel="noopener" target="_blank">{svg_whats}<span><b>WhatsApp</b><small>Charla directa</small></span></a>
{canal_insta}
{canal_face}
</div>

<h2>Antes de escribir</h2>
<ul>
<li><strong>¿Error en un verbo o en la pronunciación?</strong> En la Teia das Línguas, usa el botón “relatar erro” (reportar error) en la propia página del verbo; la corrección entra en la fila de revisión.</li>
<li><strong>Privacidad y derechos sobre tus datos:</strong> para acceder, corregir o borrar tus datos, escríbenos con el asunto “Derechos de datos”. Consulta la <a href="/es/privacidad/">Política de Privacidad</a>.</li>
<li><strong>Alianzas y publicidad:</strong> cuéntanos un poco sobre ti o tu empresa y lo que tienes en mente.</li>
</ul>

<div class="caixa"><strong>Seguridad:</strong> nunca pedimos contraseñas, códigos de verificación ni datos de tarjeta por mensaje. Desconfía de cualquier contacto en nuestro nombre que haga este tipo de pedido.</div>

<p>Respondemos lo antes posible, en portugués, español o inglés. Responsable: Jackson Davi Caldas Teixeira · Brasil.</p>''',
            'email_assunto': 'Contacto%20%E2%80%94%20kaelenvash.com',
        },
        'privacidade': {
            'title': 'Política de Privacidad · KAELENVASH',
            'desc': 'Cómo kaelenvash.com trata la información de los visitantes, las cookies y la publicidad de Google AdSense.',
            'h1': 'Política de Privacidad', 'sub': 'Última actualización: 26/10/2026',
            'corpo': '''<p>Esta política explica, de forma sencilla y transparente, cómo <strong>kaelenvash.com</strong> trata la información de quienes visitan el sitio, de acuerdo con la Ley General de Protección de Datos de Brasil (LGPD — Ley n.º 13.709/2018) y con las políticas de Google AdSense.</p>
<p><em>Esta es una traducción de la política original en portugués. En caso de divergencia, prevalece la <a href="/privacidade/">versión en portugués</a>.</em></p>

<h2>1. Quién es el responsable</h2>
<p>kaelenvash.com es mantenido por <strong>Jackson Davi Caldas Teixeira</strong> (marca KAELENVASH), en Brasil, quien actúa como responsable del tratamiento de los datos personales en este sitio. Para cualquier asunto de privacidad, escribe a <a href="mailto:contato@kaelenvash.com?subject=Privacidad%20%E2%80%94%20kaelenvash.com">contato@kaelenvash.com</a>.</p>

<h2>2. A qué se aplica esta política</h2>
<p>Se aplica a todo el dominio kaelenvash.com, incluidos la vitrina y los portales publicados en él, como la <a href="/teia-universal/">Teia Universal</a> y la <a href="/teia-das-linguas/">Teia das Línguas</a>. Las funciones específicas de cada portal (por ejemplo, la cuenta de estudios de la Teia das Línguas) pueden tener reglas complementarias descritas en la <a href="/teia-das-linguas/privacidade.html">política propia de ese portal</a>. Los sitios externos que indicamos, como las redes sociales, siguen las políticas de sus propios proveedores.</p>

<h2>3. Qué datos tratamos</h2>
<ul>
<li><strong>Navegación sin registro:</strong> la vitrina no pide nombre, correo electrónico ni registro para ser visitada.</li>
<li><strong>Datos técnicos:</strong> como en cualquier sitio, el servidor de alojamiento (GitHub Pages) y servicios de terceros pueden registrar datos como dirección IP, tipo de navegador, páginas visitadas y fecha y hora, para entregar el contenido y mantener la seguridad.</li>
<li><strong>Fuentes tipográficas:</strong> las fuentes del sitio se cargan desde Google Fonts, lo que implica el envío de tu dirección IP a Google.</li>
<li><strong>Almacenamiento local:</strong> algunos portales guardan preferencias y progreso solo en tu navegador (almacenamiento local) — por ejemplo, el idioma que elegiste — sin enviarlos a nosotros.</li>
<li><strong>Contacto voluntario:</strong> si nos escribes por correo, WhatsApp o redes sociales, recibimos la información que decidas enviar, como nombre, contacto y mensaje.</li>
<li><strong>Pagos:</strong> los servicios contratados con Estúdio Kaelenvash se pagan por Pix (el sistema de pagos instantáneos de Brasil), directamente en la aplicación de tu banco. No recibimos ni guardamos datos de tarjeta ni contraseñas bancarias; el comprobante solo nos llega si decides enviarlo.</li>
</ul>

<h2>4. Cookies y publicidad (Google AdSense)</h2>
<p>Este sitio muestra o podrá mostrar anuncios proporcionados por <strong>Google AdSense</strong>. Al respecto, es importante que sepas:</p>
<ul>
<li>Los proveedores externos, incluido Google, utilizan cookies para mostrar anuncios basados en las visitas anteriores del usuario a este y a otros sitios web.</li>
<li>El uso de cookies de publicidad permite a Google y a sus socios mostrar anuncios a los usuarios basados en sus visitas a este sitio y/u otros sitios de Internet.</li>
<li>Puedes desactivar la publicidad personalizada en la <a href="https://adssettings.google.com" rel="noopener" target="_blank">Configuración de anuncios de Google</a>. También puedes desactivar las cookies de proveedores externos de publicidad personalizada en <a href="https://www.aboutads.info/choices/" rel="noopener" target="_blank">aboutads.info/choices</a> y <a href="https://www.youronlinechoices.eu/" rel="noopener" target="_blank">youronlinechoices.eu</a>.</li>
<li>Para entender cómo Google trata los datos en los sitios asociados, consulta <a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">Cómo utiliza Google la información de sitios web o aplicaciones que utilizan sus servicios</a>.</li>
</ul>
<p>Cuando lo exija la legislación de la región del visitante (como el Espacio Económico Europeo y el Reino Unido), se mostrará un aviso para obtener tu consentimiento antes del uso de cookies de publicidad personalizada. También puedes bloquear o borrar las cookies en la configuración de tu navegador; esto no impide el acceso al contenido, pero puede hacer que los anuncios sean menos relevantes.</p>

<h2>5. Medición de audiencia</h2>
<p>Por el momento, la vitrina no utiliza herramientas de análisis de audiencia. Si pasamos a usar alguna (por ejemplo, Google Analytics), esta política se actualizará antes, informando qué datos se recopilan y cómo desactivarlos.</p>

<h2>6. Para qué usamos los datos y con qué base legal</h2>
<ul>
<li><strong>Entregar el sitio con seguridad</strong> y prevenir abusos — interés legítimo.</li>
<li><strong>Responder mensajes</strong> y prestar los servicios que solicites — ejecución de contrato o de procedimientos preliminares a petición del titular.</li>
<li><strong>Mostrar anuncios</strong> que mantienen el contenido gratuito — consentimiento, cuando se exija, o interés legítimo, según la LGPD.</li>
<li><strong>Cumplir obligaciones legales</strong> — cuando corresponda.</li>
</ul>
<p><strong>No vendemos datos personales.</strong></p>

<h2>7. Compartición</h2>
<p>Los datos pueden ser tratados por los proveedores que hacen posible el sitio: GitHub (alojamiento), Google (fuentes y anuncios), Supabase (cuentas de la Teia das Línguas) y las plataformas de mensajería que elijas usar. También podremos compartir información si existe una obligación legal u orden de una autoridad competente. Algunos de estos proveedores pueden tratar datos fuera de Brasil, con las salvaguardias previstas en la LGPD.</p>

<h2>8. Por cuánto tiempo los guardamos</h2>
<p>Los mensajes y comprobantes se guardan solo durante el tiempo necesario para atender tu solicitud y cumplir obligaciones legales. Los datos guardados en tu navegador están bajo tu control y pueden borrarse en cualquier momento desde su configuración.</p>

<h2>9. Tus derechos</h2>
<p>Según la LGPD (art. 18), puedes solicitar en cualquier momento: confirmación de que tratamos tus datos; acceso; corrección; anonimización, bloqueo o eliminación de datos innecesarios; portabilidad; información sobre con quién los compartimos; y revocación del consentimiento. Basta con escribir a <a href="mailto:contato@kaelenvash.com?subject=Derechos%20de%20datos%20%E2%80%94%20kaelenvash.com">contato@kaelenvash.com</a>. Responderemos en un plazo razonable y, si lo prefieres, también puedes acudir a la Autoridad Nacional de Protección de Datos de Brasil (ANPD) o a la autoridad de protección de datos de tu país.</p>

<h2>10. Seguridad</h2>
<p>El sitio utiliza conexión cifrada (HTTPS) y políticas de seguridad de contenido que limitan lo que se puede cargar en las páginas. Ningún sistema es 100 % invulnerable, pero adoptamos medidas razonables para proteger la información.</p>

<h2>11. Niños y adolescentes</h2>
<p>El contenido es educativo y abierto a todos, pero no está dirigido específicamente a niños. No recopilamos intencionadamente datos de niños; si eres madre, padre o tutor y crees que esto ocurrió, contáctanos para que los datos sean eliminados.</p>

<h2>12. Cambios en esta política</h2>
<p>Esta política puede actualizarse para reflejar nuevas funciones o exigencias legales. La fecha en la parte superior indica la versión más reciente.</p>

<div class="caixa">¿Dudas? Habla con nosotros en la página de <a href="/es/contacto/">Contacto</a> o por correo en <a href="mailto:contato@kaelenvash.com?subject=Privacidad%20%E2%80%94%20kaelenvash.com">contato@kaelenvash.com</a>.</div>''',
        },
        'canal_insta': 'Instagram', 'canal_face': 'Facebook',
    },
}


def ler(rel):
    with open(os.path.join(RAIZ, rel), encoding='utf-8') as f:
        return f.read()


def gravar(rel, txt):
    caminho = os.path.join(RAIZ, rel)
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w', encoding='utf-8') as f:
        f.write(txt)


def aplica_cabecalho(html, pagina, lingua):
    """CSP nova + bloco de idiomas logo após o canonical (idempotente)."""
    html = re.sub(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">',
                  f'<meta http-equiv="Content-Security-Policy" content="{CSP}">', html, count=1)
    html = re.sub(r'\n?<!--idiomas-->.*?<!--/idiomas-->', '', html, flags=re.S)
    html = re.sub(r'(<link rel="canonical" href="[^"]*">)', lambda m: m.group(1) + '\n' + bloco_idiomas(pagina, lingua), html, count=1)
    return html


# ------------------------------------------------------------------ páginas em português
for pag, rel in (('home', 'index.html'), ('sobre', 'sobre/index.html'), ('contato', 'contato/index.html'), ('privacidade', 'privacidade/index.html')):
    gravar(rel, aplica_cabecalho(ler(rel), pag, 'pt'))

# ------------------------------------------------------------------ peças reaproveitadas do contato em português
contato_pt = ler('contato/index.html')
canais = re.findall(r'<a class="canal".*?</a>', contato_pt, flags=re.S)
svg_whats = re.search(r'(<svg.*?</svg>)', canais[1], flags=re.S).group(1)
canal_insta, canal_face = canais[2], canais[3]


def cabeca(lingua, pagina, title, desc, og_desc=None):
    url = SITE + PAGINAS[pagina][lingua]
    return f'''<!doctype html>
<html lang="{HTML_LANG[lingua]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="theme-color" content="#13042A">
<link rel="canonical" href="{url}">
{bloco_idiomas(pagina, lingua)}
{ICONES}
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(og_desc or desc)}">
<meta property="og:image" content="{SITE}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
{FONTES}
<link rel="stylesheet" href="/assets/vitrine.css">
<link rel="stylesheet" href="/assets/paginas.css">
{ADSENSE}
</head>'''


def rodape(lingua, com_vitrine=True):
    t = T[lingua]
    links = ''.join(f'<a href="{PAGINAS[p][lingua]}">{n}</a>' for p, n in t['nav'])
    if com_vitrine:
        links = f'<a href="{PAGINAS["home"][lingua]}">{t["vitrine"]}</a>' + links
    return links


for lingua, t in T.items():
    # ---------- página inicial
    h = t['home']
    home = cabeca(lingua, 'home', h['title'], h['desc'], h['og_desc']) + f'''
<body>
<canvas id="ceu" aria-hidden="true"></canvas>
<div class="envelope">
  <header class="heroi">
    <div class="selo">
      <div class="aura"></div>
      <div class="orbita" id="orbita" aria-hidden="true"></div>
      <img class="mestra" src="/assets/mandala.svg" alt="{esc(h['alt_mandala'])}" width="440" height="440">
    </div>
    <h1 class="marca ouro" id="titulo">KAELENVASH</h1>
    <p class="frase" id="frase">{h['frase']}</p>
    <p class="dominio">KAELENVASH.COM</p>
    <a class="descer" href="#portais">{h['explorar']} <i></i></a>
  </header>

  <nav class="filtros" id="filtros" aria-label="{esc(h['filtros'])}"></nav>

  <main id="portais">
    <div id="secoes"><nav class="vazio" aria-label="{esc(h['meus'])}"><p>{h['abrindo']}</p><p><a href="/teia-universal/">Teia Universal</a> · <a href="/teia-das-linguas/">Teia das Línguas</a></p></nav></div>

    <section class="secao" id="forcas-secao">
      <div class="secao-topo">
        <h2 class="ouro">{h['forcas_t']}</h2>
        <div class="ornamento" aria-hidden="true"><svg viewBox="-100 -100 200 200"><g fill="none" stroke="currentColor" stroke-width="8"><circle r="40"/><circle cx="40" r="40"/><circle cx="-40" r="40"/></g></svg></div>
        <p>{h['forcas_p']}</p>
      </div>
      <div class="forcas" id="forcas"></div>
    </section>
  </main>

  <footer>
    <img src="/assets/mandala.svg" alt="" width="54" height="54">
    <div class="marca-r ouro">KAELENVASH</div>
    <nav class="legal" aria-label="{esc(t['rodape_aria'])}">{rodape(lingua, com_vitrine=False)}</nav>
    <div>© <span id="ano">2026</span> · kaelenvash.com · {t['rodape'].split(' · ')[-1]}</div>
  </footer>
</div>
<script src="/assets/vitrine.js"></script>
<script src="/assets/app.js"></script>
</body>
</html>
'''
    gravar(PAGINAS['home'][lingua].strip('/') + '/index.html', home)

    # ---------- páginas institucionais
    for pag in ('sobre', 'contato', 'privacidade'):
        p = t[pag]
        corpo = p['corpo']
        if pag == 'contato':
            canal_email = (f'<a class="canal" href="mailto:contato@kaelenvash.com?subject={p["email_assunto"]}">'
                           + re.search(r'(<svg.*?</svg>)', canais[0], flags=re.S).group(1)
                           + '<span><b>E-mail</b><small>contato@kaelenvash.com</small></span></a>')
            corpo = corpo.format(canal_email=canal_email, svg_whats=svg_whats, canal_insta=canal_insta, canal_face=canal_face)
        atual = ' aria-current="page"'
        nav = ''.join(f'<a href="{PAGINAS[k][lingua]}"{atual if k == pag else ""}>{n}</a>' for k, n in t['nav'])
        html = cabeca(lingua, pag, p['title'], p['desc']) + f'''
<body>
<div class="envelope">
<header class="pag-topo">
  <a class="logo" href="{PAGINAS['home'][lingua]}"><img src="/assets/mandala.svg" alt="" width="38" height="38"><span class="ouro">KAELENVASH</span></a>
  <nav aria-label="{esc(t['nav_aria'])}">{nav}</nav>
</header>
<main class="doc">
<img class="selinho" src="/assets/mandala.svg" alt="" width="84" height="84">
<h1 class="ouro">{p['h1']}</h1>
<p class="sub">{p['sub']}</p>

{corpo}

</main>
<footer>
  <img src="/assets/mandala.svg" alt="" width="54" height="54">
  <div class="marca-r ouro">KAELENVASH</div>
  <nav class="legal" aria-label="{esc(t['rodape_aria'])}">{rodape(lingua)}</nav>
  <div>{t['rodape']}</div>
</footer>
</div>
</body>
</html>
'''
        gravar(PAGINAS[pag][lingua].strip('/') + '/index.html', html)

# ------------------------------------------------------------------ sitemap da vitrine (com versões de idioma)
itens = []
for pag, urls in PAGINAS.items():
    for k in ('pt', 'en', 'es'):
        alts = ''.join(f'<xhtml:link rel="alternate" hreflang="{HTML_LANG[x]}" href="{SITE}{urls[x]}"/>' for x in ('pt', 'en', 'es'))
        alts += f'<xhtml:link rel="alternate" hreflang="x-default" href="{SITE}{urls["pt"]}"/>'
        itens.append(f'<url><loc>{SITE}{urls[k]}</loc><lastmod>{HOJE}</lastmod>{alts}</url>')
gravar('sitemap-vitrine.xml', '<?xml version="1.0" encoding="UTF-8"?>\n'
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
       + '\n'.join(itens) + '\n</urlset>\n')
print('ok: páginas em EN/ES geradas, cabeçalhos PT atualizados, sitemap-vitrine.xml atualizado')

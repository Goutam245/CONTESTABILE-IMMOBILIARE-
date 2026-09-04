/**
 * Every string the interface renders, in Italian.
 *
 * The site was briefly bilingual; the client settled on Italian only, so the
 * provider, the locale state and the switcher are gone. What remains is a plain
 * lookup table — keys still live in one place, which is what made the i18n layer
 * worth having, without any of the branching that came with it.
 */

const copy = {

    'nav.home': 'Home',
    'nav.properties': 'Immobili',
    'nav.about': 'Agenzia',
    'nav.contact': 'Contatti',
    'nav.menu': 'Menu',
    'nav.close': 'Chiudi',
    'nav.call': 'Chiama',
    'nav.whatsapp': 'WhatsApp',

    'lang.label': 'Lingua',
    'lang.it': 'Italiano',
    'lang.en': 'Inglese',

    'a11y.skip': 'Vai al contenuto',
    'a11y.scroll': 'Scorri per esplorare',

    'home.hero.eyebrow': 'Caserta e provincia · dal 1989',
    'home.hero.title.a': 'Trentasette anni',
    'home.hero.title.b': 'nella stessa strada.',
    'home.hero.sub':
      'Vendita e locazione a Caserta e in provincia. Ogni immobile visto di persona, misurato e raccontato per quello che è.',
    'home.hero.cta': 'Scopri gli immobili',
    'home.hero.cta2': 'Contattaci',

    'home.search.title': 'Cerca un immobile',
    'home.featured.eyebrow': 'Selezione',
    'home.featured.title': 'In evidenza',
    'home.featured.sub': 'Una selezione dal portafoglio corrente.',
    'home.featured.all': 'Vedi tutti gli immobili',
    'home.about.eyebrow': "L'agenzia",
    'home.about.more': 'La nostra storia',
    'home.stats.eyebrow': 'In cifre',
    'home.stats.note': 'Dati indicativi — in attesa di conferma dall’agenzia.',
    'home.stats.anni': 'Anni di attività',
    'home.stats.immobili': 'Immobili trattati',
    'home.stats.comuni': 'Comuni seguiti',
    'home.stats.soddisfazione': 'Clienti soddisfatti',
    // Auto-cycling lines beside the In Cifre figures. Brand-voice statements
    // about how the agency works, not claims that need evidencing.
    'ticker.1': 'Ogni immobile visto di persona.',
    'ticker.2': 'Un solo mercato, dal 1989.',
    'ticker.3': 'Misurato, fotografato, raccontato per quello che è.',
    'ticker.4': 'Se una casa è affittata, lo scriviamo.',

    // The Agenzia timeline. Milestones 1-2 are evidenced (founding year and
    // the address on the letterhead); 3-4 are the agency's positioning, not
    // dated history — flagged in-page as editorial.
    'timeline.eyebrow': 'La nostra storia',
    'timeline.title.a': 'Trentasette anni,',
    'timeline.title.b': 'un solo indirizzo.',
    'timeline.1.heading': 'Apre l’agenzia',
    'timeline.1.body':
      'Contestabile Immobiliare apre a Caserta, in Viale Alberto Beneduce. È ancora lì.',
    'timeline.2.heading': 'Il raggio d’azione',
    'timeline.2.body':
      'Dal centro storico di Caserta ai comuni della cintura, fino all’alto casertano: Caiazzo, Alvignano, Marzano Appio.',
    'timeline.3.heading': 'Il portafoglio di oggi',
    'timeline.3.body':
      'Vendita e locazione, residenziale e commerciale. Ogni scheda pubblicata con consistenze reali, classe energetica e stato di occupazione.',
    'timeline.4.heading': 'Il metodo',
    'timeline.4.body':
      'Una casa alla volta: vista di persona, misurata, fotografata da noi. Preferiamo una telefonata in meno e un cliente informato in più.',
    'timeline.note':
      'Le ultime due voci descrivono il nostro modo di lavorare, non date storiche — da rivedere con l’agenzia.',
    'timeline.comuni': 'comuni seguiti',
    'timeline.immobili': 'immobili in portafoglio',

    // The 3D photo ring.
    'ring.eyebrow': 'Il portafoglio',
    'ring.title': 'Trenta scatti, quattordici indirizzi.',
    'ring.sub':
      'Ogni fotografia è nostra, scattata negli immobili che trattiamo. Fermate l’anello su una qualsiasi per vedere di quale casa si tratta.',
    'ring.hint': 'Passate sopra per fermare · toccate per aprire',
    'ring.open': 'Vedi la scheda completa',

    // Mid-page cinematic break, between the featured rail and the story.
    'interlude.eyebrow': 'Contestabile Immobiliare',
    'interlude.title.a': 'Una casa alla volta,',
    'interlude.title.b': 'dal 1989.',
    'interlude.sub':
      'Non pubblichiamo un immobile che non abbiamo visto, misurato e fotografato di persona. È il motivo per cui una scheda vale una visita.',
    'interlude.cta': 'Guarda il portafoglio',

    'home.testimonials.eyebrow': 'Dicono di noi',
    'home.testimonials.title': 'Chi ci ha affidato una casa',
    'home.testimonials.note': 'Testimonianze di esempio, in attesa di quelle reali.',
    'home.cta.title': 'Parliamo della vostra casa.',
    'home.cta.sub':
      'Una valutazione, un sopralluogo, o solo un parere sul mercato di zona. Rispondiamo noi, non un centralino.',
    'home.cta.button': 'Scrivici',

    'props.hero.eyebrow': 'Portafoglio',
    'props.hero.title': 'Immobili',
    'props.hero.sub': 'Vendita e locazione a Caserta e in provincia.',
    'props.count.one': 'immobile',
    'props.count.other': 'immobili',
    'props.filters': 'Filtri',
    'props.filter.tipologia': 'Tipologia',
    'props.filter.contratto': 'Contratto',
    'props.filter.comune': 'Comune',
    'props.filter.prezzo': 'Prezzo',
    'props.filter.superficie': 'Superficie',
    'props.filter.all': 'Tutti',
    'props.filter.reset': 'Azzera filtri',
    'props.sort': 'Ordina',
    'props.sort.recent': 'Predefinito',
    'props.sort.priceAsc': 'Prezzo crescente',
    'props.sort.priceDesc': 'Prezzo decrescente',
    'props.sort.areaDesc': 'Superficie',
    'props.empty.title': 'Nessun immobile corrisponde ai filtri',
    'props.empty.sub': 'Provate ad allargare la ricerca, oppure chiamateci: molte trattative non sono pubblicate.',
    'props.view.grid': 'Griglia',
    'props.view.list': 'Elenco',

    'detail.back': 'Tutti gli immobili',
    'detail.gallery': 'Foto dell’immobile',
    'detail.gallery.open': 'Apri la galleria',
    'detail.gallery.close': 'Chiudi galleria',
    'detail.gallery.prev': 'Foto precedente',
    'detail.gallery.next': 'Foto successiva',
    'detail.gallery.of': 'di',
    'detail.description': 'Descrizione',
    'detail.details': 'Dettagli',
    'detail.consistenze': 'Consistenze',
    'detail.consistenze.desc': 'Descrizione',
    'detail.consistenze.mq': 'MQ',
    'detail.consistenze.mqc': 'MQ COMM.',
    'detail.consistenze.total': 'Totale',
    'detail.map': 'Mappa dell’immobile',
    'detail.map.via': 'Posizione della via.',
    'detail.map.approx': 'Posizione indicativa — la via non è mappata con precisione.',
    'detail.map.comune': 'Posizione indicativa sul comune.',
    'detail.form.title': 'Richiedi informazioni',
    'detail.form.sub': 'Vi rispondiamo di persona, in giornata.',
    'detail.notfound.title': 'Immobile non disponibile',
    'detail.notfound.sub': 'Questo annuncio non è più online, oppure l’indirizzo non è corretto.',
    'detail.related': 'Altri immobili',
    'detail.ref': 'Rif.',
    'detail.share': 'Condividi',
    'detail.copied': 'Link copiato',

    'spec.vani': 'Vani',
    'spec.camere': 'Camere',
    'spec.bagni': 'Bagni',
    'spec.mq': 'Superficie',
    'spec.mqc': 'Sup. commerciale',
    'spec.classe': 'Classe energetica',
    'spec.piano': 'Piano',
    'spec.riscaldamento': 'Riscaldamento',
    'spec.cucina': 'Cucina',
    'spec.soggiorno': 'Soggiorno',
    'spec.occupazione': 'Occupazione',
    'spec.condizioni': 'Condizioni',
    'spec.contesto': 'Contesto',
    'spec.spese': 'Spese condominiali',
    'spec.arredato': 'Arredato',
    'spec.condizionamento': 'Condizionamento',
    'spec.ascensore': 'Ascensore',
    'spec.mese': '/ mese',
    'spec.si': 'Sì',
    'spec.no': 'No',

    'type.appartamento': 'Appartamento',
    'type.palazzo': 'Palazzo',
    'type.villa': 'Villa',
    'type.negozio': 'Negozio',
    'type.appartamento.plural': 'Appartamenti',
    'type.palazzo.plural': 'Palazzi',
    'type.villa.plural': 'Ville',
    'type.negozio.plural': 'Negozi',
    'contract.vendita': 'Vendita',
    'contract.affitto': 'Affitto',
    'contract.vendita.short': 'In vendita',
    'contract.affitto.short': 'In affitto',

    'about.hero.eyebrow': 'Agenzia',
    'about.hero.title': 'Chi siamo',
    'about.pledge': 'Il nostro impegno',
    'about.agent.role': 'Titolare',
    'about.office': 'Lo studio',
    'about.hours': 'Orari',
    'about.hours.note': 'Orari indicativi — da confermare con l’agenzia.',
    'about.areas': 'Dove operiamo',
    'about.areas.sub': 'I comuni in cui abbiamo immobili in questo momento.',

    'contact.hero.eyebrow': 'Contatti',
    'contact.hero.title': 'Parliamone',
    'contact.hero.sub': 'Viale Alberto Beneduce 23, Caserta. Oppure un messaggio, se preferite.',
    'contact.direct': 'Contatti diretti',
    'contact.phone': 'Telefono',
    'contact.mobile': 'Cellulare',
    'contact.email': 'Email',
    'contact.address': 'Indirizzo',
    'contact.follow': 'Seguici su',
    'contact.map.title': 'Dove siamo',

    'form.name': 'Nominativo',
    'form.phone': 'Telefono',
    'form.email': 'Email',
    'form.message': 'Messaggio',
    'form.message.ph': 'Come possiamo aiutarvi?',
    'form.check': 'Verifica anti-spam',
    'form.check.q': 'Quanto fa',
    'form.check.ph': 'Risultato',
    'form.privacy': 'Inviando accettate che i dati siano usati per rispondervi.',
    'form.submit': 'Invia il messaggio',
    'form.sending': 'Invio in corso…',
    'form.sent.title': 'Messaggio inviato',
    'form.sent.sub': 'Grazie. Vi ricontattiamo al più presto.',
    'form.error': 'Invio non riuscito. Riprovate, oppure chiamateci allo 0823.305974.',
    'form.err.name': 'Inserite un nominativo.',
    'form.err.contact': 'Serve almeno un recapito: email o telefono.',
    'form.err.email': 'Indirizzo email non valido.',
    'form.err.message': 'Scrivete due righe sulla vostra richiesta.',
    'form.err.check': 'Risposta non corretta.',
    'form.unconfigured':
      'Modulo non ancora collegato: inserite l’ID Formspree in src/data/site.ts.',

    'footer.nav': 'Navigazione',
    'footer.contact': 'Contatti',
    'footer.legal': 'Informazioni',
    'footer.rights': 'Tutti i diritti riservati.',
    'footer.credits': 'Dati immobili aggiornati dal gestionale dell’agenzia.',
    'footer.privacy': 'Privacy',
    'footer.top': 'Torna su',
    'footer.developed': 'Sviluppato da',

    'nf.title': 'Pagina non trovata',
    'nf.sub': 'L’indirizzo non esiste, o non esiste più.',
    'nf.cta': 'Torna alla home',
} as const

export type TKey = keyof typeof copy

/** Look up a UI string. Unknown keys return the key, which is loud in review. */
export const t = (key: TKey): string => copy[key] ?? (key as string)

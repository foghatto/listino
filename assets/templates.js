/* ListinoRapido — modelli di partenza per mestiere.
   Ogni modello ha al massimo 10 servizi (il limite del piano Free). Prezzi e durate sono solo esempi da modificare. */
(function () {
  const s = (name, price, min, desc) => ({ name, price, min, desc: desc || '' });
  window.LRTemplates = [
    {
      id: 'parrucchiere', emoji: '💇', name: 'Parrucchiere / Parrucchiera',
      categories: [
        { name: 'Taglio e piega', items: [
          s('Taglio donna', 30, 45, 'Consulenza, shampoo, taglio su misura e asciugatura.'),
          s('Taglio uomo', 18, 30, 'Taglio con shampoo e finitura.'),
          s('Piega', 20, 30, 'Shampoo, maschera e piega.'),
          s('Taglio bambino', 12, 20, 'Fino a 12 anni.')] },
        { name: 'Colore', items: [
          s('Colore radice', 40, 60, 'Ritocco della ricrescita con shampoo e piega.'),
          s('Colore completo', 55, 90, 'Colorazione su tutta la lunghezza, shampoo e piega.'),
          s('Meches / Balayage', 85, 150, 'Schiariture naturali effetto sole, tonalizzazione e piega.')] },
        { name: 'Trattamenti', items: [
          s('Trattamento ristrutturante', 25, 30, 'Maschera nutriente per capelli secchi o trattati.'),
          s('Cheratina lisciante', 90, 150, 'Riduce il crespo e dà lucentezza per settimane.'),
          s('Trattamento anticaduta', 30, 30, 'Fiala rinforzante con massaggio del cuoio capelluto.')] }
      ]
    },
    {
      id: 'estetista', emoji: '💆', name: 'Estetista',
      categories: [
        { name: 'Viso', items: [
          s('Pulizia viso profonda', 55, 60, 'Detersione, vapore, estrazione impurità e maschera.'),
          s('Trattamento idratante', 45, 45, 'Siero, massaggio e maschera per pelli spente o secche.'),
          s('Trattamento anti-età', 65, 75, 'Siero attivo, massaggio lifting e maschera rassodante.')] },
        { name: 'Mani e piedi', items: [
          s('Manicure', 22, 40, 'Cura delle unghie, cuticole e smalto.'),
          s('Pedicure estetica', 32, 60, 'Bagno rilassante, scrub, cura e smalto.')] },
        { name: 'Epilazione', items: [
          s('Ceretta gambe complete', 28, 40),
          s('Ceretta inguine', 15, 20),
          s('Ceretta baffetti e sopracciglia', 10, 15)] },
        { name: 'Corpo', items: [
          s('Massaggio rilassante', 50, 50, 'Oli caldi e manovre distensive.')] }
      ]
    },
    {
      id: 'nail', emoji: '💅', name: 'Nail artist (unghie)',
      categories: [
        { name: 'Smalto', items: [
          s('Manicure classica', 20, 40, 'Cura e smalto tradizionale.'),
          s('Smalto semipermanente', 28, 50, 'Dura fino a tre settimane, brillante e resistente.'),
          s('Rimozione semipermanente', 10, 20)] },
        { name: 'Ricostruzione', items: [
          s('Ricostruzione in gel', 50, 120, 'Forma e lunghezza su misura.'),
          s('Refill gel', 38, 90, 'Ritocco delle unghie ricostruite.'),
          s('Copertura in gel su unghia naturale', 38, 75, 'Rinforza l\'unghia naturale senza allungarla.')] },
        { name: 'Decorazioni', items: [
          s('Nail art (per unghia)', 3, 10, 'Disegni e decorazioni a mano.'),
          s('French', 8, 15),
          s('Pedicure con semipermanente', 40, 75)] }
      ]
    },
    {
      id: 'barbiere', emoji: '💈', name: 'Barbiere',
      categories: [
        { name: 'Capelli', items: [
          s('Taglio uomo', 18, 30, 'Taglio con shampoo e finitura.'),
          s('Taglio sfumato', 20, 35, 'Sfumatura alta, media o bassa a scelta.'),
          s('Taglio bambino', 12, 20, 'Fino a 12 anni.')] },
        { name: 'Barba', items: [
          s('Barba con panno caldo', 14, 25, 'Rasatura o modellatura con panno caldo e olio.'),
          s('Rifinitura barba', 8, 15),
          s('Taglio + barba', 28, 50, 'Il pacchetto completo.')] },
        { name: 'Extra', items: [
          s('Trattamento anti-grigio', 20, 25),
          s('Maschera viso detox', 12, 15),
          s('Cera naso e orecchie', 5, 10)] }
      ]
    },
    {
      id: 'massaggi', emoji: '🧖', name: 'Massaggi e benessere',
      categories: [
        { name: 'Massaggi', items: [
          s('Massaggio rilassante', 50, 50, 'Oli caldi e manovre distensive su tutto il corpo.'),
          s('Massaggio decontratturante', 55, 50, 'Lavoro profondo su schiena, collo e spalle.'),
          s('Massaggio schiena e collo', 30, 30, 'Rapido sollievo da tensioni e stress.'),
          s('Massaggio drenante gambe', 40, 40, 'Aiuta a ridurre gonfiore e pesantezza.')] },
        { name: 'Percorsi', items: [
          s('Scrub corpo al sale marino', 45, 45, 'Esfoliazione e idratazione profonda.'),
          s('Percorso relax', 85, 90, 'Scrub, massaggio e momento di tisana.'),
          s('Massaggio di coppia', 100, 60, 'Due cabine, un momento da condividere.')] },
        { name: 'Pacchetti', items: [
          s('5 massaggi rilassanti', 220, 50, 'Cinque sedute da usare quando vuoi.')] }
      ]
    }
  ];
})();

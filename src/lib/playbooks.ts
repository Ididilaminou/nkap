export const PLAYBOOKS: Record<string, string[]> = {
  "Vente de produits": [
    "Un statut WhatsApp par jour : photo nette, prix, quartiers desservis.",
    "Liste de diffusion de tes clients : relance à J+30 avec les nouveautés.",
    "Livraison : demande un acompte MoMo/OM (ex. 30 %) pour limiter les colis refusés.",
    "Petits formats ou paiement en 2 tranches pour les budgets serrés.",
  ],
  Restauration: [
    "Menu du jour posté en statut avant 10h, commande par WhatsApp.",
    "Cible les bureaux et écoles proches : commande groupée la veille.",
    "Plat du jour à prix fixe + option livraison par moto-taxi avec frais clairs.",
    "Paiement MoMo à la commande pour les grosses quantités.",
  ],
  Services: [
    "Affiche 2-3 offres claires avec prix (pack simple, pack complet) au lieu de « on discute ».",
    "Demande un acompte avant de commencer, solde à la livraison.",
    "Photos avant/après et témoignages clients dans tes statuts.",
    "Relance les devis sans réponse après 48 h.",
  ],
  Agro: [
    "Vends par lots (sacs, paniers) avec prix fixe et jour de livraison.",
    "Précommande WhatsApp avant la récolte pour sécuriser la vente.",
    "Vise les restaurants, revendeuses et familles d'un même quartier.",
    "Fixe un jour de livraison groupée pour réduire les frais de transport.",
  ],
  Formation: [
    "Une mini-session gratuite en direct pour attirer, puis offre payante.",
    "Facilite le paiement en 2 ou 3 tranches par MoMo/OM.",
    "Groupe WhatsApp par promotion pour garder les élèves actifs.",
    "Cible les étudiants en période d'examens et les jeunes diplômés.",
  ],
  Autre: [
    "Définis une offre simple avec un prix clair.",
    "Poste régulièrement là où se trouvent tes clients (WhatsApp d'abord).",
    "Note chaque vente : sans chiffres, aucun conseil ne sera précis.",
  ],
};

export const EVENTS = [
  { nom: "Saint-Valentin", m: 2, j: 14, conseil: "Coffrets, cadeaux couples, livraison express." },
  { nom: "8 mars (Journée de la femme)", m: 3, j: 8, conseil: "Pagnes, tenues, soins : très fort en vente groupée." },
  { nom: "Fête du Travail", m: 5, j: 1, conseil: "Promos et offres pour les familles en congé." },
  { nom: "Fête nationale", m: 5, j: 20, conseil: "Tenues, boissons, restauration." },
  { nom: "Rentrée scolaire", m: 9, j: 1, conseil: "Fournitures, uniformes, cours de soutien : prépare 3 semaines avant." },
  { nom: "Fêtes de fin d'année", m: 12, j: 25, conseil: "Plus forte période : stock, promos et livraisons à planifier tôt." },
];
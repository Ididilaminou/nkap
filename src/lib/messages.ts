export const waLink = (tel: string | null, text: string) => {
  const d = (tel ?? "").replace(/\D/g, "");
  const n = d.length === 9 ? "237" + d : d;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
};

export const msgRelance = (nom: string, offre: string, boutique: string) =>
  `Bonjour ${nom}, c'est ${boutique}. Je reviens vers vous pour ${offre}, c'est toujours d'actualité pour vous ? Je peux livrer dans la journée si vous êtes sur Yaoundé.`;

export const msgReachat = (nom: string, boutique: string) =>
  `Bonjour ${nom}, ça fait un moment ! C'est ${boutique}. On a du nouveau cette semaine, je vous envoie les photos ?`;

export const msgPromo = (offre: string, prix: number, boutique: string) =>
  `🔥 ${boutique} : ${offre} à ${new Intl.NumberFormat("fr-FR").format(prix)} FCFA cette semaine seulement. Paiement MTN MoMo ou Orange Money, livraison possible. Écrivez-moi en privé.`;

export const msgAvis = (nom: string, boutique: string) =>
  `Bonjour ${nom}, merci encore pour votre achat chez ${boutique}. Ça s'est bien passé ? Si vous êtes satisfait(e), un petit message à vos proches nous aiderait beaucoup, et j'ai une autre nouveauté qui peut vous plaire.`;

export const msgImpaye = (nom: string, reste: number, boutique: string) =>
  `Bonjour ${nom}, c'est ${boutique}. Petit rappel pour le reste de ${new Intl.NumberFormat("fr-FR").format(reste)} FCFA. Vous pouvez envoyer par MTN MoMo ou Orange Money, je vous confirme dès réception. Merci !`;

export const msgRecu = (nom: string, offre: string, montant: number, reste: number, boutique: string) => {
  const f = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
  return `Reçu ${boutique}\nClient : ${nom || "—"}\nArticle : ${offre || "—"}\nTotal : ${f(montant)}\n` +
    (reste > 0 ? `Payé : ${f(montant - reste)}\nReste à payer : ${f(reste)}\n` : "Statut : payé en totalité\n") +
    `Merci pour votre confiance !`;
};
import QRCode from "qrcode";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

/** Génère un identifiant unique de carte donneur, ex. LL-2026-AB12CD. */
export function genererIdentifiant() {
  const annee = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LL-${annee}-${rand}`;
}

/**
 * (Re)génère la carte numérique d'un donneur : identifiant + QR (data URL)
 * encodant l'URL de vérification. Met à jour le sous-document carteNumerique.
 */
export async function genererCarte(donneur) {
  if (!donneur.carteNumerique?.identifiantUnique) {
    donneur.carteNumerique = {
      ...donneur.carteNumerique,
      identifiantUnique: genererIdentifiant(),
    };
  }
  const id = donneur.carteNumerique.identifiantUnique;
  const url = `${CLIENT_ORIGIN}/verifier/${id}`;
  const codeQR = await QRCode.toDataURL(url, {
    margin: 1,
    color: { dark: "#7af0ff", light: "#00000000" },
    width: 240,
  });
  donneur.carteNumerique = {
    identifiantUnique: id,
    codeQR,
    dateGeneration: new Date(),
  };
  return { url };
}

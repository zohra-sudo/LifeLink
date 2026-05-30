import "dotenv/config";
import { connectDB, disconnectDB } from "./config/db.js";
import { Administrateur } from "./models/Administrateur.js";
import { Donneur } from "./models/Donneur.js";
import { Hopital } from "./models/Hopital.js";
import { Demande } from "./models/Demande.js";
import { JournalActivite } from "./models/JournalActivite.js";
import { Statistiques } from "./models/Statistiques.js";

/**
 * Sème UNIQUEMENT le compte administrateur et garantit l'existence des 6
 * collections (pour qu'elles apparaissent dans Compass). Donneurs et hôpitaux
 * se créent via la page d'inscription.
 */
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lifelink";

const ADMIN = {
  nom: "El Ghazrani",
  prenom: "Jihane",
  email: "elghazranijihane@gmail.com",
  motDePasse: "JhnZhr0504",
  niveauAcces: "super",
};

async function ensureCollections() {
  const models = [Administrateur, Donneur, Hopital, Demande, JournalActivite, Statistiques];
  for (const M of models) {
    try {
      await M.createCollection();
    } catch {
      /* existe déjà */
    }
  }
}

async function run() {
  await connectDB(MONGODB_URI);
  await ensureCollections();

  const existe = await Administrateur.findOne({ email: ADMIN.email.toLowerCase() });
  if (existe) console.log(`• admin déjà présent : ${ADMIN.email}`);
  else {
    await Administrateur.create(ADMIN);
    console.log(`✓ admin créé : ${ADMIN.email}`);
  }

  console.log("\nCollections : donneurs, hopitaux, administrateurs, demandes, journaux_activite, statistiques");
  console.log("Connexion admin :");
  console.log(`  ${ADMIN.email} / ${ADMIN.motDePasse}`);
  console.log("Les comptes donneur/hôpital se créent via l'inscription.");

  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

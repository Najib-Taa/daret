// Daret — simulateur. Ton code commence ici.
// Le HTML (index.html) est déjà intégré : lis-le, repère les id et les data-*, puis fais-le vivre.

// ================================================================================================================================


const formulaire = document.querySelector("#daret-form");
const nomCercle = document.querySelector("#nom-cercle");
const erreurNom = document.querySelector("#nom-cercle-erreur");
const cotisation = document.querySelector("#cotisation");
const erreurCotisation = document.querySelector("#cotisation-erreur");
const periodicite = document.querySelector("#periodicite");
const erreurPeriodicite = document.querySelector("#periodicite-erreur");
const dateDebut = document.querySelector("#date-debut");
const erreurDate = document.querySelector("#date-debut-erreur");
const participantsListe = document.querySelector("#participants-liste");
const participantsCompteur = document.querySelector("#participants-compteur");
const participantsErreur = document.querySelector("#participants-erreur");
const ajouterParticipant = document.querySelector("#ajouter-participant");
const etatVide = document.querySelector("#etat-vide");
const contenuResultat = document.querySelector("#contenu-resultat");
const resumeCagnotte = document.querySelector("#resume-cagnotte");
const resumeTotalCycle = document.querySelector("#resume-total-cycle");
const resumeNbTours = document.querySelector("#resume-nb-tours");
const resumeDates = document.querySelector("#resume-dates");
const tirageAuSort = document.querySelector("#tirage-au-sort");
const ordreSaisie = document.querySelector("#ordre-saisie");
const compteurTours = document.querySelector("#compteur-tours");
const calendrierCorps = document.querySelector("#calendrier-corps");
const reinitialiser = document.querySelector("#reinitialiser");
const detailTour = document.querySelector("#detail-tour");
const detailTitre = document.querySelector("#detail-titre");
const detailDate = document.querySelector("#detail-date");
const detailBeneficiaire = document.querySelector("#detail-beneficiaire");
const detailMontant = document.querySelector("#detail-montant");
const detailContributeurs = document.querySelector("#detail-contributeurs");
const detailFermer = document.querySelector("#detail-fermer");

const minimumParticipants = Number(participantsListe.dataset.min);
const maximumParticipants = Number(participantsListe.dataset.max);
const periodicitesValides = ["hebdomadaire", "quinzaine", "mensuelle"];
const nomsRegex = /^[\p{L}\p{N} -]{3,40}$/u;
const prenomRegex = /^[\p{L}\p{M}]+(?:[’'-][\p{L}\p{M}]+)*$/u;
const monnaie = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0
});
const formatDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC"
});

let participantsOrdreSaisie = [];
let participantsOrdreActuel = [];
let toursTermines = new Set();
let configurationActuelle = null;
let elementOuverture = null;
let prochainIdParticipant = 1;

function obtenirDateLocale() {
  const maintenant = new Date();
  const annee = maintenant.getFullYear();
  const mois = String(maintenant.getMonth() + 1).padStart(2, "0");
  const jour = String(maintenant.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

function afficherErreur(element, message, champ) {
  element.textContent = message;
  element.classList.remove("hidden");
  if (champ) {
    champ.setAttribute("aria-invalid", "true");
    champ.setAttribute("aria-describedby", element.id);
  }
}

function effacerErreur(element, champ) {
  element.textContent = "";
  element.classList.add("hidden");
  if (champ) {
    champ.setAttribute("aria-invalid", "false");
    champ.removeAttribute("aria-describedby");
  }
}

function verifierNom() {
  const valeur = nomCercle.value.trim();
  const valide = nomsRegex.test(valeur) && /[\p{L}\p{N}]/u.test(valeur);

  if (!valide) {
    afficherErreur(erreurNom, "Le nom doit contenir 3 à 40 caractères : lettres, chiffres, espaces ou tirets.", nomCercle);
    return false;
  }

  effacerErreur(erreurNom, nomCercle);
  return true;
}

function verifierCotisation() {
  const montant = Number(cotisation.value);
  const valide = cotisation.value.trim() !== "" && Number.isInteger(montant) && montant >= 100 && montant <= 50000;

  if (!valide) {
    afficherErreur(erreurCotisation, "La cotisation doit être un nombre entier entre 100 et 50 000 MAD.", cotisation);
    return false;
  }

  effacerErreur(erreurCotisation, cotisation);
  return true;
}

function verifierPeriodicite() {
  const valide = periodicitesValides.includes(periodicite.value);

  if (!valide) {
    afficherErreur(erreurPeriodicite, "Veuillez choisir une périodicité valide.", periodicite);
    return false;
  }

  effacerErreur(erreurPeriodicite, periodicite);
  return true;
}

function verifierDate() {
  const valide = dateDebut.value !== "" && dateDebut.value >= obtenirDateLocale();

  if (!valide) {
    afficherErreur(erreurDate, "La date doit être aujourd'hui ou dans le futur.", dateDebut);
    return false;
  }

  effacerErreur(erreurDate, dateDebut);
  return true;
}

function normaliserPrenom(prenom) {
  return prenom.trim().normalize("NFC").toLocaleLowerCase("fr");
}

function verifierParticipants() {
  const champs = Array.from(participantsListe.querySelectorAll("input[data-participant]"));
  const valeurs = champs.map((champ) => champ.value.trim());
  const occurrences = new Map();
  const champsInvalides = new Set();
  let message = "";

  valeurs.forEach((valeur, index) => {
    if (valeur !== "") {
      const cle = normaliserPrenom(valeur);
      if (!occurrences.has(cle)) {
        occurrences.set(cle, []);
      }
      occurrences.get(cle).push(index);
    }
  });

  valeurs.forEach((valeur, index) => {
    const prenomNormalise = valeur.normalize("NFC");
    const longueur = Array.from(prenomNormalise).length;
    if (longueur < 2 || longueur > 30 || !prenomRegex.test(prenomNormalise)) {
      champsInvalides.add(index);
    }
  });

  occurrences.forEach((indices) => {
    if (indices.length > 1) {
      indices.forEach((index) => champsInvalides.add(index));
    }
  });

  const nombreValide = champs.length >= minimumParticipants && champs.length <= maximumParticipants;

  if (!nombreValide) {
    message = `Le cercle doit contenir entre ${minimumParticipants} et ${maximumParticipants} participants.`;
  } else if (champsInvalides.size > 0) {
    const doublons = Array.from(occurrences.values()).some((indices) => indices.length > 1);
    const prenomIncorrect = valeurs.some((valeur) => {
      const prenomNormalise = valeur.normalize("NFC");
      const longueur = Array.from(prenomNormalise).length;
      return longueur < 2 || longueur > 30 || !prenomRegex.test(prenomNormalise);
    });

    if (prenomIncorrect && doublons) {
      message = "Chaque prénom doit contenir 2 à 30 lettres et aucun prénom ne doit être répété.";
    } else if (doublons) {
      message = "Les prénoms des participants doivent être différents.";
    } else {
      message = "Chaque prénom doit contenir entre 2 et 30 lettres, avec apostrophe ou tiret si nécessaire.";
    }
  }

  champs.forEach((champ, index) => {
    if (champsInvalides.has(index)) {
      champ.setAttribute("aria-invalid", "true");
      champ.setAttribute("aria-describedby", participantsErreur.id);
    } else {
      champ.setAttribute("aria-invalid", "false");
      champ.removeAttribute("aria-describedby");
    }
  });

  if (message) {
    afficherErreur(participantsErreur, message, participantsListe);
    return false;
  }

  effacerErreur(participantsErreur, participantsListe);
  return true;
}

function validerFormulaire() {
  const validations = [
    { valide: verifierNom(), champ: nomCercle },
    { valide: verifierCotisation(), champ: cotisation },
    { valide: verifierPeriodicite(), champ: periodicite },
    { valide: verifierDate(), champ: dateDebut },
    {
      valide: verifierParticipants(),
      champ: participantsListe.querySelector('input[aria-invalid="true"]') || participantsListe.querySelector("input[data-participant]") || ajouterParticipant
    }
  ];

  return validations.find((validation) => !validation.valide)?.champ || null;
}

function mettreAJourCompteurParticipants() {
  const nombre = participantsListe.querySelectorAll("input[data-participant]").length;
  participantsCompteur.textContent = `${nombre} participant${nombre > 1 ? "s" : ""}`;
  ajouterParticipant.disabled = nombre >= maximumParticipants;
  participantsListe.querySelectorAll("button[data-action='retirer-participant']").forEach((bouton) => {
    bouton.disabled = nombre <= minimumParticipants;
  });
}

function creerParticipant(valeur = "") {
  const identifiant = prochainIdParticipant++;
  const ligne = document.createElement("li");
  ligne.className = "flex flex-wrap items-center gap-2";

  const etiquette = document.createElement("label");
  etiquette.className = "sr-only";
  etiquette.htmlFor = `participant-${identifiant}`;
  etiquette.textContent = `Prénom du participant ${identifiant}`;

  const champ = document.createElement("input");
  champ.id = `participant-${identifiant}`;
  champ.type = "text";
  champ.name = "participants[]";
  champ.autocomplete = "off";
  champ.value = valeur;
  champ.dataset.participant = "true";
  champ.placeholder = `Participant ${participantsListe.children.length + 1}`;
  champ.className = "min-w-0 flex-1 rounded border border-daret-bordure px-3 py-2 focus:outline-2 focus:outline-offset-2 focus:outline-daret-vert";

  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.dataset.action = "retirer-participant";
  bouton.className = "rounded border border-daret-bordure px-3 py-2 text-sm hover:bg-daret-fond focus:outline-2 focus:outline-offset-2 focus:outline-daret-vert";
  bouton.textContent = "Retirer";
  bouton.setAttribute("aria-label", `Retirer le participant ${identifiant}`);

  ligne.append(etiquette, champ, bouton);
  participantsListe.append(ligne);
  mettreAJourCompteurParticipants();
}

function lireParticipants() {
  return Array.from(participantsListe.querySelectorAll("input[data-participant]"))
    .map((champ) => champ.value.trim());
}

function calculerResume(montant, nombreParticipants, dates) {
  return {
    cagnotte: montant * nombreParticipants,
    totalCycle: montant * nombreParticipants,
    nombreTours: nombreParticipants,
    premiereDate: dates[0],
    derniereDate: dates[dates.length - 1]
  };
}

function creerDateTour(dateDepart, periodiciteChoisie, numeroTour) {
  const [annee, mois, jour] = dateDepart.split("-").map(Number);

  if (periodiciteChoisie === "hebdomadaire" || periodiciteChoisie === "quinzaine") {
    const date = new Date(Date.UTC(annee, mois - 1, jour));
    const intervalle = periodiciteChoisie === "hebdomadaire" ? 7 : 14;
    date.setUTCDate(date.getUTCDate() + intervalle * numeroTour);
    return date;
  }

  const moisCible = mois - 1 + numeroTour;
  const anneeCible = annee + Math.floor(moisCible / 12);
  const numeroMoisCible = moisCible % 12;
  const dernierJour = new Date(Date.UTC(anneeCible, numeroMoisCible + 1, 0)).getUTCDate();
  return new Date(Date.UTC(anneeCible, numeroMoisCible, Math.min(jour, dernierJour)));
}

function formaterDate(date) {
  return formatDate.format(date);
}

function melangerParticipants(participants) {
  const resultat = [...participants];

  for (let index = resultat.length - 1; index > 0; index--) {
    const indexAleatoire = Math.floor(Math.random() * (index + 1));
    [resultat[index], resultat[indexAleatoire]] = [resultat[indexAleatoire], resultat[index]];
  }

  return resultat;
}

function mettreAJourResume(dates) {
  const resume = calculerResume(configurationActuelle.montant, participantsOrdreActuel.length, dates);
  resumeCagnotte.textContent = monnaie.format(resume.cagnotte);
  resumeTotalCycle.textContent = monnaie.format(resume.totalCycle);
  resumeNbTours.textContent = String(resume.nombreTours);
  resumeDates.textContent = `${formaterDate(dates[0])} – ${formaterDate(dates[dates.length - 1])}`;
}

function mettreAJourAvancement() {
  const nombreTermines = toursTermines.size;
  const nombreTotal = participantsOrdreActuel.length;
  compteurTours.textContent = `${nombreTermines} tour${nombreTermines > 1 ? "s" : ""} terminé${nombreTermines > 1 ? "s" : ""} sur ${nombreTotal}`;

  const lignes = Array.from(calendrierCorps.querySelectorAll("tr[data-tour]"));
  lignes.forEach((ligne) => ligne.classList.remove("prochain-tour"));
  const prochain = lignes.find((ligne) => {
    const beneficiaire = ligne.dataset.beneficiaire;
    return !toursTermines.has(normaliserPrenom(beneficiaire));
  });

  if (prochain) {
    prochain.classList.add("prochain-tour");
  }
}

function creerCellule(texte) {
  const cellule = document.createElement("td");
  cellule.className = "px-4 py-3 align-middle";
  cellule.textContent = texte;
  return cellule;
}

function afficherCalendrier() {
  calendrierCorps.replaceChildren();
  const montantRecu = configurationActuelle.montant * participantsOrdreActuel.length;

  participantsOrdreActuel.forEach((beneficiaire, index) => {
    const date = creerDateTour(configurationActuelle.date, configurationActuelle.periodicite, index);
    const cle = normaliserPrenom(beneficiaire);
    const termine = toursTermines.has(cle);
    const ligne = document.createElement("tr");
    ligne.dataset.tour = String(index + 1);
    ligne.dataset.beneficiaire = beneficiaire;

    if (termine) {
      ligne.classList.add("ligne-terminee");
    }

    ligne.append(creerCellule(String(index + 1)));
    ligne.append(creerCellule(formaterDate(date)));

    const celluleBeneficiaire = document.createElement("td");
    celluleBeneficiaire.className = "px-4 py-3 align-middle";
    const boutonDetail = document.createElement("button");
    boutonDetail.type = "button";
    boutonDetail.dataset.action = "ouvrir-detail";
    boutonDetail.className = "font-medium text-daret-vert underline underline-offset-2 focus:outline-2 focus:outline-offset-2 focus:outline-daret-vert";
    boutonDetail.textContent = beneficiaire;
    celluleBeneficiaire.append(boutonDetail);
    ligne.append(celluleBeneficiaire);

    ligne.append(creerCellule(monnaie.format(montantRecu)));
    ligne.append(creerCellule(termine ? "Terminé" : "À venir"));

    const celluleAction = document.createElement("td");
    celluleAction.className = "px-4 py-3 align-middle";
    const boutonStatut = document.createElement("button");
    boutonStatut.type = "button";
    boutonStatut.dataset.action = "basculer-statut";
    boutonStatut.className = "rounded border border-daret-bordure px-3 py-2 text-sm focus:outline-2 focus:outline-offset-2 focus:outline-daret-vert";
    boutonStatut.textContent = termine ? "Annuler" : "Marquer comme terminé";
    boutonStatut.setAttribute("aria-label", `${termine ? "Annuler le statut terminé pour" : "Marquer comme terminé pour"} ${beneficiaire}`);
    celluleAction.append(boutonStatut);
    ligne.append(celluleAction);

    calendrierCorps.append(ligne);
  });

  mettreAJourAvancement();
}

function genererCalendrier() {
  participantsOrdreSaisie = lireParticipants();
  participantsOrdreActuel = [...participantsOrdreSaisie];
  toursTermines = new Set();
  configurationActuelle = {
    nom: nomCercle.value.trim(),
    montant: Number(cotisation.value),
    periodicite: periodicite.value,
    date: dateDebut.value
  };

  const dates = participantsOrdreActuel.map((participant, index) =>
    creerDateTour(configurationActuelle.date, configurationActuelle.periodicite, index)
  );

  mettreAJourResume(dates);
  afficherCalendrier();
  etatVide.classList.add("hidden");
  contenuResultat.classList.remove("hidden");
}

function afficherDetail(ligne, bouton) {
  const numeroTour = Number(ligne.dataset.tour);
  const beneficiaire = ligne.dataset.beneficiaire;
  const date = creerDateTour(configurationActuelle.date, configurationActuelle.periodicite, numeroTour - 1);
  const montantRecu = configurationActuelle.montant * participantsOrdreActuel.length;
  const contributeurs = participantsOrdreActuel.filter((participant) => participant !== beneficiaire);

  detailTitre.textContent = `Détail du tour ${numeroTour}`;
  detailDate.textContent = formaterDate(date);
  detailBeneficiaire.textContent = beneficiaire;
  detailMontant.textContent = monnaie.format(montantRecu);
  detailContributeurs.replaceChildren();

  contributeurs.forEach((participant) => {
    const element = document.createElement("li");
    element.textContent = participant;
    detailContributeurs.append(element);
  });

  elementOuverture = bouton;
  detailTour.showModal();
  detailFermer.focus();
}

function fermerDetail() {
  if (detailTour.open) {
    detailTour.close();
  }
}

function reinitialiserApplication() {
  formulaire.reset();
  participantsListe.replaceChildren();
  prochainIdParticipant = 1;
  for (let index = 0; index < 3; index++) {
    creerParticipant();
  }

  [
    [erreurNom, nomCercle],
    [erreurCotisation, cotisation],
    [erreurPeriodicite, periodicite],
    [erreurDate, dateDebut]
  ].forEach(([erreur, champ]) => effacerErreur(erreur, champ));

  effacerErreur(participantsErreur, participantsListe);
  participantsListe.querySelectorAll("input[data-participant]").forEach((champ) => {
    champ.setAttribute("aria-invalid", "false");
    champ.removeAttribute("aria-describedby");
  });

  participantsOrdreSaisie = [];
  participantsOrdreActuel = [];
  toursTermines = new Set();
  configurationActuelle = null;
  calendrierCorps.replaceChildren();
  resumeCagnotte.textContent = "";
  resumeTotalCycle.textContent = "";
  resumeNbTours.textContent = "";
  resumeDates.textContent = "";
  compteurTours.textContent = "";
  contenuResultat.classList.add("hidden");
  etatVide.classList.remove("hidden");
  mettreAJourCompteurParticipants();
}

participantsListe.addEventListener("click", (event) => {
  const bouton = event.target.closest("button[data-action='retirer-participant']");

  if (!bouton || bouton.disabled) {
    return;
  }

  bouton.closest("li").remove();
  mettreAJourCompteurParticipants();
  verifierParticipants();
});

participantsListe.addEventListener("input", (event) => {
  if (event.target.matches("input[data-participant]")) {
    verifierParticipants();
  }
});

ajouterParticipant.addEventListener("click", () => {
  const nombre = participantsListe.querySelectorAll("input[data-participant]").length;

  if (nombre < maximumParticipants) {
    creerParticipant();
    verifierParticipants();
    const champs = participantsListe.querySelectorAll("input[data-participant]");
    champs[champs.length - 1].focus();
  }
});

nomCercle.addEventListener("input", verifierNom);
cotisation.addEventListener("input", verifierCotisation);
periodicite.addEventListener("change", verifierPeriodicite);
dateDebut.addEventListener("change", verifierDate);

formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  const premierChampInvalide = validerFormulaire();

  if (premierChampInvalide) {
    premierChampInvalide.focus();
    return;
  }

  genererCalendrier();
});

tirageAuSort.addEventListener("click", () => {
  if (!configurationActuelle) {
    return;
  }

  participantsOrdreActuel = melangerParticipants(participantsOrdreSaisie);
  afficherCalendrier();
});

ordreSaisie.addEventListener("click", () => {
  if (!configurationActuelle) {
    return;
  }

  participantsOrdreActuel = [...participantsOrdreSaisie];
  afficherCalendrier();
});

calendrierCorps.addEventListener("click", (event) => {
  const bouton = event.target.closest("button[data-action]");

  if (!bouton) {
    return;
  }

  const ligne = bouton.closest("tr[data-tour]");

  if (!ligne) {
    return;
  }

  if (bouton.dataset.action === "basculer-statut") {
    const cle = normaliserPrenom(ligne.dataset.beneficiaire);

    if (toursTermines.has(cle)) {
      toursTermines.delete(cle);
    } else {
      toursTermines.add(cle);
    }

    afficherCalendrier();
  }

  if (bouton.dataset.action === "ouvrir-detail") {
    afficherDetail(ligne, bouton);
  }
});

detailFermer.addEventListener("click", fermerDetail);
detailTour.addEventListener("click", (event) => {
  if (event.target === detailTour) {
    fermerDetail();
  }
});
detailTour.addEventListener("close", () => {
  if (elementOuverture && elementOuverture.isConnected) {
    elementOuverture.focus();
  }
  elementOuverture = null;
});

reinitialiser.addEventListener("click", reinitialiserApplication);

for (let index = 0; index < 3; index++) {
  creerParticipant();
}
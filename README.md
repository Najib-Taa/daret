# Daret — simulateur de cercle d'épargne

> Projet pédagogique YouCode. **Simulation** : aucun argent réel, aucun paiement, aucun compte, des prénoms fictifs uniquement.

_À compléter par toi : remplace cette introduction par la description de **ton** projet._

## Liens

- Site (GitHub Pages) : _à compléter_
- Tableau GitHub Projects : _à compléter_
- Maquette Figma : _à compléter_

## Installation

```bash
npm install
npm run build     # construit assets/style.css
npm run dev       # reconstruit le CSS à chaque modification
```

Ouvre ensuite `index.html` dans le navigateur (ou avec une extension « Live Server »).

## Ce qui est fourni, ce que tu fais

| Fourni | À faire |
| --- | --- |
| `index.html` (intégré avec Tailwind), `src/input.css` (design tokens, classes d'état) | `src/app.js` : tout le JavaScript |

## Repères du HTML

| Besoin | Où |
| --- | --- |
| Formulaire | `#daret-form` (`novalidate`) |
| Champs et messages d'erreur | `#nom-cercle` / `#nom-cercle-erreur`, `#cotisation` / `#cotisation-erreur`, `#periodicite` / `#periodicite-erreur`, `#date-debut` / `#date-debut-erreur` |
| Participants | `#participants-liste` (`data-min`, `data-max`), `#participants-compteur`, `#participants-erreur`, `#ajouter-participant` |
| Boutons | `#generer` (envoi), `#reinitialiser`, `#tirage-au-sort`, `#ordre-saisie` |
| État vide / résultat | `#etat-vide`, `#contenu-resultat` (caché par défaut avec la classe `hidden`), titre `#titre-resultat` |
| Résumé | `#resume-cagnotte`, `#resume-total-cycle`, `#resume-nb-tours`, `#resume-dates` |
| Calendrier | `#calendrier-corps` (les `<tr>` sont à créer), `#compteur-tours` (`aria-live`) |
| Fenêtre de détail | `#detail-tour` (`<dialog>`), `#detail-titre`, `#detail-date`, `#detail-beneficiaire`, `#detail-montant`, `#detail-contributeurs`, `#detail-fermer` |

Conventions conseillées pour les lignes que tu crées : `data-tour` sur chaque `<tr>`, `data-action="ouvrir-detail"` et `data-action="basculer-statut"` sur les boutons.

Classes d'état prêtes dans `src/input.css` : `champ-invalide`, `ligne-terminee`, `prochain-tour` (à ajouter / retirer avec `classList`).

## Fonctionnalités réalisées

_À compléter : liste des user stories (US-01 à US-08) réalisées._

## Jeu d'essai

| # | Donnée saisie | Résultat attendu | Résultat obtenu | Validé |
| --- | --- | --- | --- | --- |
| 1 | _à compléter (au moins 10 cas : valides, invalides, limites)_ | | | |

## Difficultés rencontrées

_À compléter : liens vers tes issues de bug._

## Captures d'écran

_À compléter : mobile et desktop._

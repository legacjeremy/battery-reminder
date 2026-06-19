# Battery Reminder

Application web statique pour suivre l'autodécharge de batteries stockées.

## Version

v0.3

## Fonctionnalités incluses

- GitHub Pages compatible avec HTML/CSS/JavaScript uniquement.
- Stockage local via IndexedDB.
- Création de batteries.
- Mesure par pourcentage.
- Mesure par LEDs fixes.
- Mesure par LEDs fixes + clignotantes.
- Pour les mesures LED, le slider et le champ pourcentage se mettent à jour dans les deux sens.
- Bouton `+` contextuel :
  - Accueil : ajouter une mesure en choisissant la batterie.
  - Toutes les batteries : créer une batterie.
  - Fiche batterie : ajouter une mesure sur la batterie affichée.
- Bouton `Rechargé à 100 %` dans la fiche batterie.
- Historique avec perte en `%/j` par rapport à la mesure précédente.
- Modification et suppression des mesures.
- Archivage, restauration et suppression définitive des batteries.
- Page Archives.
- Export JSON manuel.
- Statut : non initialisée, OK, à surveiller, à recharger.

## Fonctionnalités prévues

- Import JSON.
- Paramètres complets dans l'interface.
- Tri configurable des batteries.
- Vue graphique de l'historique.
- Détection des mesures aberrantes avec demande de confirmation.
- Affichage plus détaillé d'une mesure au clic.
- Meilleure gestion des plages constructeurs pour les LEDs avancées.
- PWA complète avec icônes.
- Notifications locales.
- Synchronisation optionnelle avec Home Assistant ou un service cloud.

## Règles métier importantes

- L'application suit uniquement l'autodécharge en stockage.
- Si un appareil est utilisé, il faut le recharger à 100 % avant de repartir sur un cycle propre.
- Une mesure de type `charge` démarre un nouveau cycle.
- Les cycles sont recalculés depuis l'historique, ils ne sont pas stockés en base.
- Le statut et la date estimée sont calculés, jamais stockés.
- Une mesure LED stocke l'observation brute et le pourcentage utilisé pour le calcul.

## Lancer le projet

Ne pas ouvrir `index.html` directement en `file://`.

Utiliser GitHub Pages ou un petit serveur local, par exemple avec VS Code Live Server.

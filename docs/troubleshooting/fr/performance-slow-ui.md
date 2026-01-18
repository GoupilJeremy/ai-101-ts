---
id: performance-slow-ui
title: Problèmes de Performance de l'Interface
category: Performance
symptoms:
  - lent
  - lag
  - saccadé
  - fps
  - ralentissement
  - lenteur
errorCodes:
  - AI101-PERF-001
relatedDocs:
  - _bmad-output/planning-artifacts/architecture.md#performance
---

## Description du Symptôme

Les animations du HUD apparaissent saccadées, l'interface répond lentement, ou vous remarquez des ralentissements lorsque les agents mettent à jour leur statut. L'extension peut sembler lente ou ne pas répondre.

## Étapes de Diagnostic

1. **Vérifier l'utilisation du CPU** dans les Outils de Développement VSCode (Aide > Basculer les Outils de Développement)
   - Rechercher une utilisation élevée du CPU (>80%) quand AI-101 est actif
   
2. **Vérifier le compteur FPS** (si disponible en mode debug)
   - L'objectif est 60fps pour des animations fluides
   
3. **Compter les extensions actives**
   - Trop d'extensions peuvent impacter les performances
   - Exécuter la commande `Extensions: Afficher les Extensions Installées`
   
4. **Vérifier les ressources système**
   - Ouvrir le Gestionnaire des Tâches (Windows) ou Moniteur d'Activité (Mac)
   - Vérifier la RAM et la capacité CPU disponibles

## Solutions

### Solution 1: Activer le Mode Performance

Le Mode Performance réduit la complexité des animations et limite les mises à jour.

```
1. Ouvrir la Palette de Commandes (Ctrl+Shift+P / Cmd+Shift+P)
2. Exécuter "AI 101: Toggle Performance Mode"
3. Redémarrer VSCode si les problèmes persistent
```

**Paramètres:**
```json
{
  "ai101.performanceMode.autoActivate": true,
  "ai101.performanceMode.collisionThrottleMs": 500,
  "ai101.performanceMode.metricsThrottleMs": 1000
}
```

### Solution 2: Réduire la Transparence

Des niveaux de transparence plus bas réduisent la charge GPU.

```
1. Ouvrir les Paramètres (Ctrl+, / Cmd+,)
2. Rechercher "ai101.ui.transparency"
3. Définir sur "minimal" au lieu de "full"
```

### Solution 3: Désactiver d'Autres Extensions

Désactiver temporairement d'autres extensions pour identifier les conflits.

```
1. Ouvrir la vue Extensions (Ctrl+Shift+X / Cmd+Shift+X)
2. Désactiver les extensions une par une
3. Recharger la fenêtre après chaque changement
4. Identifier quelle extension cause le problème
```

### Solution 4: Mettre à Jour les Pilotes Graphiques

Des pilotes graphiques obsolètes peuvent causer des problèmes de rendu.

- **Windows:** Mettre à jour via le Gestionnaire de Périphériques ou le site du fabricant
- **Mac:** Mettre à jour via Préférences Système > Mise à Jour Logicielle
- **Linux:** Mettre à jour via le gestionnaire de paquets (varie selon la distribution)

## Prévention

- **Garder peu d'extensions** - N'installer que les extensions que vous utilisez activement
- **Activer le Mode Performance automatique** - Définir `ai101.performanceMode.autoActivate: true`
- **Utiliser le Mode Focus lors du codage** - Cache les agents pour réduire la complexité visuelle
- **Fermer les fenêtres VSCode inutilisées** - Chaque fenêtre consomme des ressources
- **Redémarrer VSCode quotidiennement** - Efface les fuites mémoire des sessions longues

## Documentation Associée

- [Architecture: Exigences de Performance](_bmad-output/planning-artifacts/architecture.md#performance)
- [Guide Utilisateur: Mode Performance](docs/user-guide.md#performance-mode)
- [Référence Configuration](docs/configuration.md#performance-settings)

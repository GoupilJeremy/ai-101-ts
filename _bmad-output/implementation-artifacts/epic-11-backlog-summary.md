# 🍉 Epic 11: Backlog des Agents Interactifs Animés

**Status:** 📋 READY TO START
**Date de Création:** 2026-02-08
**Estimation Totale:** 10 semaines (5 sprints × 2 semaines)
**Points Totaux:** 112 story points

---

## 📊 Vue d'Ensemble

Ce backlog transforme vos agents IA de simples icônes emoji statiques en **personnages vivants** qui se déplacent dans l'éditeur VSCode, interagissent visuellement, et réalisent pleinement votre vision du "Théâtre d'IA Transparent".

### Résultats Attendus

✨ **Expérience Utilisateur**
- Agents personnages en traits sumi-e japonais (2-5 traits)
- Déplacement fluide vers les lignes de code analysées
- Interactions visuelles (traits d'encre entre agents)
- Fusion collective en forme Enso lors collaboration intense

🎯 **Métriques de Succès**
- 60fps garanti avec 4 agents animés
- 80%+ utilisateurs comprennent quel code chaque agent analyse
- 50%+ augmentation acceptation suggestions (confiance accrue)
- 0 rapports "trop distrayant"

---

## 📅 Planning par Sprint

### Sprint 1-2 : Fondations (4 semaines) - 44 pts

**Objectif:** Personnages SVG et ancrage au code fonctionnels

| ID | Story | Points | Priorité | Description Courte |
|----|-------|--------|----------|-------------------|
| 11.1 | Assets SVG Sumi-e | 5 | 🔴 CRITICAL | Créer les 4 personnages en traits de pinceau |
| 11.2 | AgentPositioning | 8 | 🔴 CRITICAL | Système de calcul position/ancrage ligne |
| 11.3 | Étendre SpatialManager | 5 | 🔴 CRITICAL | Ancrage dynamique + sync scroll |
| 11.4 | AgentCharacterComponent | 13 | 🔴 CRITICAL | Composant animé avec déplacement fluide |
| 11.5 | Intégration WebviewManager | 5 | 🟠 HIGH | Remplacer AgentComponent par nouveau |
| 11.6 | Tests E2E Sprint 1-2 | 8 | 🟠 HIGH | Validation flow complet |

**Livrable Sprint 1-2:**
- ✅ 4 agents personnages SVG fonctionnels
- ✅ Déplacement fluide vers lignes de code
- ✅ Performance 60fps validée

---

### Sprint 3 : Interactions Inter-Agents (2 semaines) - 26 pts

**Objectif:** Communication visuelle entre agents

| ID | Story | Points | Priorité | Description Courte |
|----|-------|--------|----------|-------------------|
| 11.7 | AgentInteractionManager | 13 | 🟠 HIGH | Traits d'encre animés entre agents |
| 11.8 | Intégration Orchestrator | 8 | 🟠 HIGH | Déclencher visualisations dans flow |
| 11.9 | États Visuels Enrichis | 5 | 🟡 MEDIUM | Améliorer animations idle/thinking/working |

**Livrable Sprint 3:**
- ✅ Traits d'encre voyagent entre agents pendant collaboration
- ✅ Visualisation complète du flow: Context → Architect → Coder → Reviewer
- ✅ États agents plus expressifs

---

### Sprint 4 : Fusion Collective Enso (2 semaines) - 26 pts

**Objectif:** Forme unifiée lors collaboration intense

| ID | Story | Points | Priorité | Description Courte |
|----|-------|--------|----------|-------------------|
| 11.10 | AgentFusionManager | 13 | 🟡 MEDIUM | Fusion agents → Enso avec dashboard |
| 11.11 | Logique Fusion Orchestrator | 8 | 🟡 MEDIUM | Détecter quand fusion nécessaire |
| 11.12 | Tests Intégration Sprint 4 | 5 | 🟡 MEDIUM | Validation fusion/défusion |

**Livrable Sprint 4:**
- ✅ Agents convergent en cercle Enso lors collaboration intense
- ✅ Mini-dashboard intégré (tokens, status)
- ✅ Défusion automatique en fin de collaboration

---

### Sprint 5 : Polish & Optimisations (2 semaines) - 39 pts

**Objectif:** Finitions, performance, documentation

| ID | Story | Points | Priorité | Description Courte |
|----|-------|--------|----------|-------------------|
| 11.13 | Pathfinding Intelligent | 13 | 🔵 LOW | Évitement zones code dense (OPTIONNEL) |
| 11.14 | Micro-Animations Personnalité | 8 | 🔵 LOW | Animations contextuelles subtiles |
| 11.15 | Easter Eggs | 5 | 🔵 LOW | Petits délices cachés |
| 11.16 | Optimisations Performance | 8 | 🟠 HIGH | Garantir 60fps final |
| 11.17 | Documentation Vidéo | 5 | 🟡 MEDIUM | GIFs, tutoriels, changelog |

**Livrable Sprint 5:**
- ✅ Performance AAA (60fps garanti)
- ✅ Documentation complète avec démos visuelles
- ✅ Expérience polie et délicieuse

---

## 🎯 Quick Start - Par Où Commencer ?

### Option 1 : Approche Séquentielle (Recommandé)

Suivez l'ordre des sprints. Commencez par **Story 11.1** :

```bash
# 1. Créer les assets SVG
cd /home/jeregoupix/dev/suika
mkdir -p src/webview/animations
# Créer les 4 fichiers SVG selon les specs dans Epic 11

# 2. Tester le rendu
# Ouvrir VSCode, F5 pour lancer Extension Development Host
# Vérifier que les SVG s'affichent correctement
```

**Story 11.1 Acceptance Criteria:**
- [ ] `architect.svg` créé (3 traits max)
- [ ] `coder.svg` créé (4 traits max)
- [ ] `reviewer.svg` créé (3 traits max)
- [ ] `context.svg` créé (5 traits max)
- [ ] Validation esthétique sumi-e ✓

### Option 2 : Prototype Rapide

Pour voir rapidement le résultat, créez un **prototype minimal** :

```bash
# Créer un prototype de déplacement agent simple
# Stories 11.1, 11.4, 11.5 en version simplifiée
# ≈ 3-5 jours de travail

# Résultat : 1 agent qui se déplace vers une ligne
```

---

## 📦 Dépendances Techniques

### À Installer
```json
// package.json - Aucune dépendance externe requise !
// Utilisation de CSS transitions natives (pas de lib animation)
```

### À Créer
- [ ] Fichiers SVG personnages (Story 11.1)
- [ ] `src/ui/agent-positioning.ts` (Story 11.2)
- [ ] `src/webview/components/agent-character-component.js` (Story 11.4)
- [ ] `src/webview/components/agent-interaction-manager.js` (Story 11.7)
- [ ] `src/webview/components/agent-fusion-manager.js` (Story 11.10)

### À Modifier
- [ ] `src/ui/spatial-manager.ts` - Extension ancrage ligne
- [ ] `src/state/extension-state-manager.ts` - Ajout état visuel
- [ ] `src/agents/orchestrator.ts` - Visualisation interactions
- [ ] `src/webview/main.ts` - Intégration nouveaux composants

---

## 🧪 Stratégie de Tests

### Tests Unitaires (Vitest)
```bash
npm run test:unit

# Couvrir :
# - AgentPositioning.getAgentPosition()
# - AgentPositioning.isLineVisible()
# - AgentCharacterComponent.moveToPosition()
# - AgentInteractionManager.drawInkStroke()
```

### Tests Intégration (VSCode Test)
```bash
npm test

# Couvrir :
# - Backend → Webview flow complet
# - Ancrage ligne + scroll
# - 4 agents simultanés
```

### Tests Performance
```bash
# Chrome DevTools Profiler
# Valider : 60fps avec 4 agents + 3 ink strokes + fusion
# CPU : <5% idle, <10% actif
```

---

## 🚀 Roadmap de Déploiement

### Phase Beta (Après Sprint 1-2)
```typescript
// Feature flag
"suika.features.animatedAgents": false // Off par défaut

// Testing avec early adopters
// Collecter feedback performance
```

### Phase GA (Après Sprint 4)
```typescript
// Feature flag ON par défaut
"suika.features.animatedAgents": true

// Annonce changelog avec GIFs démo
// Monitoring métriques adoption
```

---

## 📊 Métriques de Suivi

### Performance (Technique)
| Métrique | Cible | Actuel | Status |
|----------|-------|--------|--------|
| FPS avec 4 agents | 60 | - | ⏳ |
| CPU idle | <5% | - | ⏳ |
| CPU actif | <10% | - | ⏳ |
| Calcul pathfinding | <16ms | - | ⏳ |

### Engagement (Utilisateur)
| Métrique | Cible | Actuel | Status |
|----------|-------|--------|--------|
| Compréhension position agents | 80%+ | - | ⏳ |
| Augmentation acceptation | +50% | - | ⏳ |
| Perception "utile" vs "distrayant" | 70%+ | - | ⏳ |
| Rapports "trop distrayant" | 0 | - | ⏳ |

---

## 🔧 Configuration Développement

### Variables CSS à Définir
```css
/* src/webview/styles/variables.css */
:root {
  /* Couleurs agents */
  --ink-black: #2C3E50;
  --vermillion-red: #E74C3C;
  --success-green: #50C878;
  --error-red: #FF6B6B;

  /* Animations */
  --agent-transition-duration: 800ms;
  --agent-breathe-duration: 4s;
  --agent-think-duration: 2s;
  --agent-work-duration: 1s;

  /* Tailles */
  --agent-size: 80px;
  --agent-size-fused: 56px;
  --enso-radius: 80px;
}
```

### Settings VSCode
```json
{
  "suika.features.animatedAgents": true,
  "suika.animations.personality": true,  // Micro-animations
  "suika.animations.inkStrokes": true,   // Traits d'encre
  "suika.animations.fusion": true,        // Fusion Enso
  "suika.performance.maxSimultaneousStrokes": 3
}
```

---

## 🐛 Problèmes Connus & Contournements

### Issue 1 : Bounds Éditeur Approximatifs
**Problème:** VSCode API ne donne pas accès direct aux dimensions éditeur
**Contournement:** Utiliser estimations + measurements via webview (Story 11.2)
**TODO:** Améliorer avec API future ou calculs avancés

### Issue 2 : Performance Pathfinding
**Problème:** A* peut être coûteux pour grilles grandes
**Contournement:** Simplifier grille, limiter distance max (Story 11.13)
**TODO:** Worker thread pour calculs lourds si nécessaire

---

## 💡 Conseils d'Implémentation

### DO ✅
- **GPU Acceleration:** Utiliser `transform: translate3d()` et `will-change`
- **RequestAnimationFrame:** Pour toute manipulation DOM
- **CSS Transitions:** Préférer aux libs JS (plus performant)
- **Throttling:** Events scroll/resize à 60fps max
- **Object Pooling:** Réutiliser SVG ink strokes

### DON'T ❌
- **Animations JS Lourdes:** Éviter setInterval/setTimeout pour animations
- **DOM Queries Fréquentes:** Cache les références éléments
- **Synchronous Layout:** Éviter getBoundingClientRect() dans loops
- **Trop de Strokes:** Max 3 simultanés (performance)
- **Animations Idle Excessives:** Keep it subtle (Zen aesthetic)

---

## 📚 Ressources Complémentaires

### Documentation Technique
- [Epic 11 Détaillé](./epic-11-agents-interactifs-animes.md) - Specs complètes
- [Project Context](../_bmad-output/project-context.md) - Règles architecture
- [Architecture](../_bmad-output/planning-artifacts/architecture.md) - Décisions clés

### Références Esthétiques
- **Sumi-e (墨絵):** Art du trait de pinceau japonais
- **Ma (間):** Concept d'espace négatif
- **Wabi-sabi (侘寂):** Beauté de l'imperfection
- **Enso (円相):** Cercle zen de l'éveil

### Outils Recommandés
- **SVG Editors:** Inkscape, Figma (pour créer personnages)
- **Animation Preview:** Chrome DevTools, VSCode Webview DevTools
- **Performance Profiling:** Chrome Performance Tab

---

## 🎬 Prochaines Actions

### Pour Démarrer Aujourd'hui

1. **Lire Epic 11 complet** (30 min)
   ```bash
   cat /home/jeregoupix/dev/suika/_bmad-output/implementation-artifacts/epic-11-agents-interactifs-animes.md
   ```

2. **Créer branche Git** (2 min)
   ```bash
   git checkout -b feature/epic-11-animated-agents
   ```

3. **Commencer Story 11.1** (2-4h)
   - Créer `/src/webview/animations/architect.svg`
   - Créer `/src/webview/animations/coder.svg`
   - Créer `/src/webview/animations/reviewer.svg`
   - Créer `/src/webview/animations/context.svg`

4. **Tester Rendu** (30 min)
   ```bash
   npm run watch
   # F5 dans VSCode
   # Vérifier affichage SVG dans webview
   ```

### Questions ?

Consultez la documentation complète dans `epic-11-agents-interactifs-animes.md` ou demandez de l'aide !

---

**Bonne chance ! 🍉 Transformons ces agents en personnages vivants ! 🎨✨**

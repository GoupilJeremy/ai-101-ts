---
stepsCompleted: [1, 2]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
workflowType: 'ux-design'
lastStep: 2
---

# UX Design Specification suika

**Author:** Jeregoupix
**Date:** 2026-01-10

---

## Executive Summary

### Project Vision

**suika** est un plugin VSCode révolutionnaire qui inverse le paradigme dominant de l'IA développeur "invisible et magique". Au lieu de cacher le raisonnement de l'intelligence artificielle, ce plugin le rend **visible, compréhensible et éducatif** à travers un "Théâtre d'IA Transparent".

Quatre agents IA spécialisés (🏗️ Architecte, 💻 Codeur, 🔍 Reviewer, 📚 Contexte) collaborent visuellement au-dessus du code dans un HUD overlay utilisant l'esthétique minimaliste japonaise **sumi-e** (墨絵). Les développeurs peuvent observer en temps réel comment l'IA analyse, raisonne et suggère - transformant l'expérience de "consommation passive de suggestions" en "collaboration active avec compréhension".

**Le Challenge Paradigmatique:** Prouver que **transparence > invisibilité** - que comprendre le "pourquoi" crée plus de confiance, d'apprentissage et de productivité que la rapidité opaque des outils actuels (Copilot, Cursor).

**Le Success Metric UX Critique:** 0 rapports "trop distrayant" - démontrer qu'on peut montrer beaucoup d'information tout en respectant le flow de coding.

### Target Users

**Développeurs End-Users (4 Segments Principaux):**

1. **Junior Developers (Persona: Sarah Chen, 24 ans)**
   - **Pain Point:** Syndrome imposteur aggravé par IA opaque - accepte du code qu'elle ne comprend pas vraiment
   - **Need:** Apprentissage actif, comprendre le "pourquoi", devenir meilleur développeur
   - **Mode Préféré:** Learning mode avec explications détaillées

2. **Senior Developers Sceptiques (Persona: Marcus Rodriguez, 38 ans)**
   - **Pain Point:** Refuse l'IA "magique" - ne peut pas faire confiance à une boîte noire
   - **Need:** Transparence totale, contrôle, voir tous les edge cases et risques
   - **Mode Préféré:** Expert mode avec détails techniques profonds

3. **Solo Indie Developers (Persona: Alex Kim, 31 ans)**
   - **Pain Point:** Jongle tout seul, passe 40% du temps à valider suggestions incomprises
   - **Need:** Efficacité + compréhension, retrouver le flow, se sentir développeur pas "AI operator"
   - **Mode Préféré:** Balanced mode, sessions longues (10+/jour)

4. **Tech Leads (Persona: Priya Sharma)**
   - **Pain Point:** Juniors committent code IA incompris, dette technique s'accumule
   - **Need:** Qualité code, apprentissage équipe, reviews efficaces
   - **Mode Préféré:** Team mode avec métriques et collaboration

**Ecosystem Users (3 Segments Secondaires):**

5. **Open-Source Contributors** (Persona: Jamie Torres) - Besoin doc architecture claire, good first issues
6. **Extension Developers** (Persona: Elena Volkov) - Besoin API publique, customisation LLM internes
7. **Community Support** (Persona: David Park) - Besoin KB searchable, troubleshooting guides

**Tech-Savviness:** Élevé - développeurs professionnels comfortable avec VSCode, extensions, LLMs
**Devices:** Desktop/Laptop exclusivement (Mac, Windows, Linux cross-platform)
**Usage Context:** Sessions quotidiennes longues, flow state fragile, interruptions fréquentes

### Key Design Challenges

#### 1. Le Paradoxe "Montrer Sans Distraire" 🔥 (Challenge #1 Critique)

**Le Défi:** Comment afficher information complexe (4 agents + états + raisonnement + collaboration + contexte + alerts) sans briser le flow de coding sacré des développeurs?

**Contraintes Dures:**
- Target: **0 rapports "trop distrayant"** (success metric critique)
- Performance: <100ms response time, 60fps animations constant
- Réalité: Développeurs en flow state très fragile, tolérance zéro pour distraction

**Pourquoi C'est Dur:** Le paradigme actuel (Copilot, Cursor) est invisible par design et performant. Tu dois prouver que "visible" peut être **non-intrusif ET plus utile**. C'est une bataille UX contre des années de conditionnement "less is more" dans l'espace dev tools.

**UX Solutions Requises:**
- Progressive disclosure intelligent (montrer juste assez au bon moment)
- Opacité adaptative 5-40% selon contexte utilisateur
- Anti-obstruction spatial intelligence
- Mode Focus/DND avec désactivation élégante
- Auto-detection activité (frappe intensive → réduit visibilité)

#### 2. Complexité Visuelle vs Clarté du Raisonnement

**Le Défi:** Montrer le raisonnement IA complet (multi-agents, états, interactions) tout en maintenant clarté visuelle et esthétique minimaliste sumi-e.

**Contraintes Design:**
- Esthétique zen stricte: coups de pinceau (2-5 traits), palette monochrome + 1 accent
- Philosophie Ma (間 espace négatif) - le vide est intentionnel, pas accidentel
- Must communicate "pourquoi" clairement malgré minimalisme extrême
- 4 agents + orchestrateur + micro-agents éphémères = beaucoup d'acteurs

**Tension Centrale:** Minimalisme japonais vs richesse informationnelle - comment résoudre?

**UX Solutions Requises:**
- Iconographie sumi-e ultra-claire (2-5 traits mais immédiatement reconnaissable)
- Animations significatives (chaque mouvement raconte une histoire)
- Layering intelligent (Vital Signs always-visible, agents contextuels, détails on-demand)
- Spatial storytelling (position = sens)

#### 3. Adaptation Multi-Contexte & Multi-Persona

**Le Défi:** Même interface doit servir Junior qui veut apprendre (verbose) ET Senior qui veut vitesse (concis) ET Tech Lead qui veut métriques ET Solo Dev qui veut performance.

**Modes Requis (5 minimum):**
1. **Learning Mode** - Explications détaillées, pédagogique (Sarah)
2. **Expert Mode** - Détails techniques profonds, edge cases (Marcus)
3. **Focus/DND Mode** - Invisible, suggestions sans overhead visuel (Alex sous deadline)
4. **Team Mode** - Labels visibles, métriques, collaboration (Priya)
5. **Performance Mode** - Animations réduites, machines low-end

**Risque:** Trop de modes = confusion, paradox of choice. Comment garder simple?

**UX Solutions Requises:**
- Defaults intelligents selon détection (nouveau user → Learning, senior → Expert)
- Transitions fluides entre modes (pas de restart required)
- Settings presets (solo-dev-config, team-config, enterprise-config)
- Hotkeys rapides pour toggle commun

#### 4. Overlay Spatial Intelligence & Multi-Monitor

**Le Défi:** HUD flottant qui doit "savoir où être" sans obstruer code, suivre contexte, s'adapter à multi-monitors, éviter curseur.

**Contraintes Spatiales:**
- Anti-obstruction temps réel (curseur, zone édition active)
- 4 états positionnels: repos (coin), thinking (centre-haut), actif (près code), alert (ligne problème)
- Ancrage intelligent: agents "attachés" aux sections code qu'ils analysent
- Scroll handling: suivre ou rester fixe?
- Multi-monitor: quel écran si code sur écran 1, terminal sur écran 2?

**UX Solutions Requises:**
- Algorithme anti-collision sophistiqué
- Spatial anchoring context-aware
- Drag-to-reposition avec memory
- Multi-screen detection et préférences

### Design Opportunities

#### 1. Animations Sumi-e Significatives ✨ (Signature Visuelle)

**L'Opportunité:** Transformer chaque animation en **storytelling fonctionnel** - pas juste beau, mais porteur de sens et d'information.

**Animations Signature:**
- **Respiration (pulse subtil):** Agent idle/thinking - communique "je suis vivant mais pas intrusif"
- **Traits de pinceau voyageurs:** Communication entre agents - visualise la collaboration en temps réel
- **Convergence/Fusion collective:** 4 agents fusionnent en Enso/Lotus lors collaboration intense - **Wow factor** unique au marché
- **Opacité adaptative:** 5% idle → 40% actif - respire avec l'attention utilisateur
- **Transitions fluides:** idle → thinking → active → alert → success - machine à états visuelle claire

**Impact Compétitif:** Beauté + utilité fusionnées (wabi-sabi philosophy) - crée emotional connection avec le tool, mémorable, Instagram/Twitter-worthy screenshots.

**Requirement UX:** 60fps constant, GPU-accelerated, CSS `will-change: transform`, async rendering non-blocking.

#### 2. Progressive Disclosure Intelligent (Résout Challenge #1)

**L'Opportunité:** Système de layering qui montre **juste assez au bon moment** selon contexte utilisateur et activité.

**Architecture de Disclosure:**
- **Layer 1 (Always-Visible):** Vital Signs Bar (tokens, files, état) - 24px max, non-intrusive
- **Layer 2 (Contextuel):** Agents apparaissent selon activité - Architecte lors imports, Codeur lors functions
- **Layer 3 (On-Demand):** Détails raisonnement via hover/click - opt-in user
- **Layer 4 (Mode Focus):** Tout disparaît sauf Vital Signs - toggle Cmd+Shift+F

**Intelligence Contextuelle:**
- Détecte frappe intensive (coding actif) → réduit opacité automatiquement
- Détecte idle/lecture (reviewing) → augmente visibilité
- Détecte hotfix context (branch name, commit messages) → suggère Mode Focus
- User override toujours possible (hotkeys)

**Impact:** Résout le paradoxe "montrer sans distraire" - information est là quand tu en as besoin, invisible quand tu n'en veux pas.

#### 3. Spatial Storytelling & Anchoring (Magie UX)

**L'Opportunité:** Position spatiale des agents **raconte le contexte** et crée une expérience "magique" où les agents semblent "comprendre" la géographie du code.

**Spatial Intelligence:**
- **Architecte ancré** aux imports/dépendances (top fichier) - "je surveille la structure"
- **Codeur ancré** aux fonctions actives (où curseur) - "je t'aide ici maintenant"
- **Reviewer ancré** aux zones problématiques (lignes avec warnings/errors) - "attention ici"
- **Contexte montre** scope global (minimap-like overlay) - "voici ce que j'ai chargé"

**Behaviors Magiques:**
- Agents "suivent" le scroll comme attachés aux lignes de code (parallax subtil)
- Reviewer "pointe" vers ligne problème avec trait de pinceau
- Codeur "observe" le curseur et anticipe où aller
- Convergence agents se fait au centre de la zone d'intérêt

**Impact:** Users disent "Comment il sait où être?!" - sentiment de collaboration naturelle avec des "pairs" qui comprennent le contexte spatial.

#### 4. Education Through Interaction (Transforme en Learning Tool)

**L'Opportunité:** Chaque interaction devient une **micro-lesson** - le plugin enseigne pendant qu'il aide, transformant productivité en apprentissage actif.

**Interactions Éducatives:**
- **Hover sur agent actif:** Tooltip explique "Je suis actif maintenant parce que [raison contextuelle]"
- **Click sur suggestion:** Modal montre raisonnement complet + alternatives considérées + pourquoi cette approche
- **Click sur alert:** Fix proposé + explication pédagogique du problème
- **Historique décisions:** Timeline des suggestions avec raisonnements - "learning trail"
- **Mode Learning toggle:** Annotations pédagogiques en temps réel

**Contextes d'Apprentissage:**
- **Junior (Sarah):** Explications détaillées, patterns nommés, liens vers docs
- **Senior (Marcus):** Justifications techniques, trade-offs, edge cases
- **Team (Priya):** Pourquoi partageable pour code reviews

**Impact Transformationnel:** Plugin devient **outil d'apprentissage, pas juste productivité** - users progressent 2x plus vite (persona Priya), value proposition élargie (bootcamps, écoles, onboarding entreprise).

**Metric Success:** 7/10 développeurs disent "j'ai appris quelque chose cette semaine grâce au raisonnement visible" (PRD target).

---
stepsCompleted: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - '_bmad-output/analysis/brainstorming-session-2026-01-09.md'
workflowType: 'prd'
lastStep: 11
briefCount: 0
researchCount: 0
brainstormingCount: 1
projectDocsCount: 0
workflowComplete: true
completionDate: 2026-01-10
---

# Product Requirements Document - suika

**Author:** Jeregoupix
**Date:** 2026-01-10

## Executive Summary

### Vision du Produit

Un plugin VSCode révolutionnaire qui transforme l'interaction développeur-IA en rendant visible et compréhensible le processus de raisonnement de l'intelligence artificielle. À travers une interface HUD (Heads-Up Display) utilisant l'esthétique minimaliste japonaise sumi-e, quatre agents IA spécialisés collaborent de manière transparente au-dessus du code, permettant aux développeurs de voir et comprendre comment l'IA analyse, suggère et raisonne.

**Les 4 Agents Core:**
- 🏗️ **Architecte** - Analyse de structure projet, dépendances, architecture globale
- 💻 **Codeur** - Génération code, suggestions, completions, implémentations
- 🔍 **Reviewer** - Qualité, erreurs, best practices, tests, validations
- 📚 **Contexte** - Gestion mémoire, fichiers chargés, optimisation contexte

**Le Problème Résolu:**

Actuellement, l'IA pour développeurs fonctionne comme une **boîte noire mystérieuse** - les suggestions apparaissent sans explication, créant méfiance et incompréhension. Les développeurs reçoivent des recommandations mais ne comprennent pas le raisonnement derrière, les forçant à choisir entre confiance aveugle ou rejet complet.

**Le Moment "Aha!"**

Le moment décisif survient quand un développeur **comprend POURQUOI l'IA a fait une suggestion** - pas juste voir qu'elle travaille, mais saisir le raisonnement, voir quel agent a analysé quelle partie, comprendre le processus de pensée. C'est ce passage de "qu'est-ce que l'IA a produit?" à "pourquoi l'IA pense que c'est la bonne approche?" qui transforme l'expérience.

### Ce Qui Rend Ce Plugin Spécial

**1. Théâtre d'IA Transparent**
Transformation radicale de l'IA de boîte noire en performance visible. Les développeurs voient leurs agents IA collaborer en temps réel, communicant visuellement (traits de pinceau qui voyagent entre agents), changeant d'état (idle → thinking → active → alert), et fusionnant collectivement lors de collaboration intense.

**2. Challenge du Paradigme "Magie Invisible"**
Le marché actuel croit que "l'IA doit être invisible et magique - moins le dev en voit, mieux c'est". Ce plugin inverse cette croyance: **la transparence n'est pas un bug, c'est une feature**. Comprendre l'IA rend les développeurs plus confiants, efficaces et autonomes.

**3. Design Zen Distinctif**
Interface minimaliste japonaise sumi-e (墨絵) avec philosophie Ma (間 - espace négatif), Wabi-sabi (beauté imperfection), Kanso (簡素 - simplicité). Personnages agents en coups de pinceau (2-5 traits), palette monochrome + accent rouge vermillon stratégique, overlay adaptatif intelligent qui respecte le code.

**4. Architecture Hybride Pragmatique**
Distribution intelligente des LLMs - modèles puissants (GPT-4/Claude Opus) seulement où nécessaire (Architecte, Codeur), outils légers ailleurs (Reviewer hybride, Contexte algorithmes purs). Équilibre performance, coût et efficacité.

**5. Impact Transformationnel Dual:**

**Impact Immédiat (Utilisateur):**
Les développeurs ne consomment plus passivement des suggestions IA - ils **collaborent avec l'IA comme avec un pair**, comprenant le raisonnement, apprenant du processus, devenant de meilleurs développeurs au passage.

**Impact Industrie (Long-terme):**
Établir la **transparence comme critère obligatoire** pour tous les outils de dev IA. Changer les attentes - les développeurs exigeront de comprendre "pourquoi" et ne toléreront plus les boîtes noires opaques.

### Innovation Breakthrough

**Fusion Visuelle = Multi-Fonction**
Lors de collaboration intense, les 4 agents convergent en une **forme collective unifiée** (Enso, Lotus abstrait, Tourbillon d'encre) qui sert simultanément d'art visuel ET de mini-dashboard fonctionnel (tokens, état, contexte). Beauté et utilité fusionnées selon la philosophie wabi-sabi.

## Project Classification

**Technical Type:** Developer Tool (VSCode Extension)
**Domain:** General Software / Developer Tooling
**Complexity:** Medium
**Project Context:** Greenfield - nouveau projet

**Justification de la Classification:**

- **Developer Tool** confirmé par: Extension VSCode, intégrations SDK multiples (OpenAI, Anthropic), webview API, packaging npm
- **Complexité Medium** justifiée par:
  - Architecture technique sophistiquée (4 agents + orchestrateur + micro-agents éphémères)
  - Intégrations LLM multiples avec fallbacks et gestion coûts
  - Animations SVG performantes et overlay adaptatif intelligent
  - Pas de régulations sectorielles (pas healthcare/fintech)
  - Innovation forte mais faisabilité technique établie (10 semaines MVP selon brainstorming)

**Signaux d'Innovation Détectés:**
- Nouveau paradigme interaction développeur-IA (transparence vs invisibilité)
- Design visuel unique (sumi-e appliqué au HUD développeur)
- Architecture hybride LLM (optimisation pragmatique ressources)

## Success Criteria

### User Success

Le succès utilisateur se mesure par la réalisation de notre vision transformationnelle: les développeurs collaborent avec l'IA comme avec un pair et comprennent le raisonnement derrière chaque suggestion.

**Compréhension & Transparence:**
- **8/10 développeurs peuvent expliquer pourquoi l'IA a suggéré un changement** - La métrique core qui valide que le "Théâtre d'IA Transparent" fonctionne. Mesure via surveys post-session.
- **0 rapports "trop distrayant"** - Le design zen sumi-e respecte le flow du développeur, ne l'interrompt pas.

**Apprentissage & Collaboration:**
- **7/10 développeurs disent avoir appris quelque chose de l'IA en voyant son raisonnement** - Valide l'impact transformationnel: l'IA rend les devs meilleurs.
- **Taux d'acceptation des suggestions >60%** (vs ~40% pour outils traditionnels comme Copilot) - La transparence crée la confiance, qui se traduit en acceptation plus élevée.

**Expérience & Design:**
- **8/10 beta-testeurs: "Design zen et élégant"** - L'esthétique sumi-e n'est pas juste jolie, elle doit être perçue comme fonctionnellement élégante.
- **NPS (Net Promoter Score) >40** - Les utilisateurs recommandent activement le plugin à leurs pairs.

### Business Success

Le modèle open-source avec vision premium future nécessite une croissance organique forte et une adoption démontrant la valeur.

**Adoption & Croissance:**
- **3 mois post-lancement MVP: 1,000 early adopters** - Validation initiale du concept et product-market fit avec innovators/early adopters.
- **12 mois: 10,000+ utilisateurs actifs** - Base solide démontrant adoption mainstream au-delà des early adopters.
- **GitHub Stars:** Métrique community importante pour projet open-source, indicateur de visibilité et intérêt.

**Engagement & Rétention:**
- **10+ sessions par semaine** - Indicateur que le plugin est devenu un outil essentiel, utilisé quotidiennement (>2x/jour en moyenne).
- **Installation <2 minutes** - Friction minimale à l'adoption, critical pour croissance organique.
- **Documentation self-service complète** - Les utilisateurs peuvent onboard sans support direct.

**Modèle Économique:**
- **Phase 1 (MVP - 12 mois):** Gratuit et open-source pour maximiser adoption et feedback
- **Phase 2 (Post-validation):** Features premium payantes pour équipes/entreprises tout en gardant le core gratuit

### Technical Success

Performance irréprochable, architecture maintenable, et coûts maîtrisés sont également critiques pour un outil open-source de qualité professionnelle.

**Performance & Fiabilité:**
- **<100ms UI response time** - Les animations sumi-e et transitions d'agents doivent être fluides (60fps)
- **Extension démarre sans crash** - Stabilité critique, 0 tolérance pour crashes au startup
- **Cross-platform:** Fonctionne sur Mac, Windows, Linux sans dégradation

**Architecture & Maintenabilité:**
- **Couverture tests >70%** - Code quality pour projet open-source, facilite contributions
- **Documentation API complète** - Essentiel pour contributors et extensibilité future
- **Code quality standards:** Linting, TypeScript strict, patterns cohérents

**Coûts & Efficience:**
- **Coûts LLM <$0.10/session** - Soutenabilité économique critique pour modèle gratuit
- **2+ providers LLM fonctionnels** avec fallbacks automatiques (OpenAI, Anthropic minimum)
- **Cache hit rate >50%** - Optimisation coûts via cache intelligent des requêtes répétées

### Measurable Outcomes

**Validation du Paradigme "Transparence > Invisibilité":**
- Si 8/10 peuvent expliquer le raisonnement ET 7/10 ont appris → Le paradigme est validé
- Si taux d'acceptation >60% → La transparence crée confiance supérieure aux outils opaques
- Si NPS >40 avec croissance 1K→10K → Product-market fit confirmé

**Signal de Transformation Industrie:**
- Lorsque des développeurs commencent à demander "pourquoi?" à d'autres outils IA
- Lorsque d'autres tools commencent à copier l'approche transparence
- Lorsque "voir le raisonnement de l'IA" devient un feature request standard

## Product Scope

### MVP - Minimum Viable Product

**Timeline:** 10 semaines selon roadmap brainstorming

**5 Features Core (ce qui DOIT fonctionner pour que ce soit utile):**

**1. 4 Core Agents en Sumi-e**
- Personnages à coups de pinceau (2-5 traits) représentant: Architecte, Codeur, Reviewer, Contexte
- Palette monochrome + rouge vermillon
- Animations basiques: opacité (5%→30%), taille (20px→50px), respiration
- **Justification MVP:** C'est l'essence différenciatrice - sans ça, pas de "Théâtre d'IA Transparent"

**2. Overlay Central Adaptatif**
- Positionnement flottant superposé sur code
- 4 états de base: repos (coin), thinking (centre-haut), actif (près code), alert (ligne problème)
- Anti-obstruction: recule si curseur proche
- **Justification MVP:** Fondation du layout HUD - sans ça, les agents n'existent pas visuellement

**3. États Comportementaux**
- State machine: idle → thinking → working → alert → success
- Feedback visuel distinct par état
- Triggers connectés aux événements LLM (API calls, résultats)
- **Justification MVP:** Donne vie aux agents, différencie d'icônes statiques

**4. Vital Signs Bar**
- Barre status toujours visible (top/bottom, max 24px)
- 3 métriques core: Tokens consommés, Files en contexte, État global
- 4 niveaux alertes: info → warning (注) → critical (警) → urgent (pulse)
- **Justification MVP:** Info essentielle always-visible, users doivent connaître tokens/état

**5. Architecture Hybride LLM**
- AgentOrchestrator coordonnant 4 agents
- LLMService abstraction multi-providers
- ContextManager sans LLM (algorithmes purs)
- 2 providers minimum: OpenAI (Architecte) + Anthropic Claude (Codeur)
- Cache, rate limiting, error handling robuste
- **Justification MVP:** Fondation backend, pragmatique et scalable

**Critères de Succès MVP:**
- Les 5 features fonctionnent ensemble sans crash
- Démo convaincante montrant le "Théâtre d'IA Transparent"
- 5-10 beta-testeurs peuvent utiliser et donner feedback
- Métriques techniques MVP validées (performance, coûts)

### Growth Features (Post-MVP)

**Quick Wins (Faciles + Bon Impact) - Mois 3-6:**

**1. Mode High Contrast** (1-2 jours)
- Accessibilité importante: 60% opacité vs 10%
- Alternatives daltonisme: orange, cyan+pattern, monochrome+pulse
- **Impact:** Élargit audience, démontre inclusivité

**2. Hotkeys Basiques** (1-2 jours)
- Toggle HUD, expand/collapse agents, force states
- **Impact:** UX power users, efficacité

**3. Code-Anchored Alerts** (3-5 jours)
- Problèmes affichés directement à côté ligne concernée
- Suit la ligne si scroll, hover → tooltip, click → propose fix
- **Impact:** Valeur immédiate, améliore workflow debug

**4. Détection Performance Auto** (2-3 jours)
- Détection machines low-end
- Mode Static Zen: animations désactivées, icônes statiques
- Settings: Smooth / Balanced / Performance
- **Impact:** Fonctionne partout, pas juste machines puissantes

**Priorité Growth:** Features qui élargissent l'accessibilité et améliorent l'expérience quotidienne sans complexité architecturale majeure.

### Vision (Future)

**Innovations Long-Terme (Différenciation Majeure) - Mois 6-18+:**

**1. Fusion Visuelle Collective**
- Lors collaboration intense, 4 agents convergent en forme unifiée (Enso, Lotus, Tourbillon)
- Forme collective = mini-dashboard (tokens, état au centre)
- Transitions: convergence (0.5s) → fusion (0.8s) → défusion
- **Impact:** Wow factor incroyable, signature unique du plugin

**2. Mode War Room**
- Vue étendue avec panneau dédié par agent
- Chaque panneau montre section code + suggestions en diff visuel
- Toggle: Cmd+Shift+W
- **Impact:** Pro feature avancée, workflows complexes

**3. Ancrage Spatial Intelligent**
- Agents "ancrés" spatialement à sections code spécifiques
- Suivent scroll comme attachés aux lignes
- Architecte ancré imports, Codeur aux fonctions, etc.
- **Impact:** Magie UX, contextualisation spatiale code

**4. Agents Observent Vous (Coaching)**
- Inverse: agents donnent feedback sur VOTRE code
- Suggestions proactives basées sur patterns détectés
- Learning mode avec explications pédagogiques
- **Impact:** Revolutionary, transforme en coach personnel

**5. Gamification**
- XP, leveling, achievements pour apprentissage
- Unlock features selon utilisation et compréhension
- **Impact:** Engagement long-terme, communauté

**Philosophie Vision:** Ces features établissent le plugin comme définiteur de catégorie - pas juste un outil, mais une nouvelle façon de penser l'interaction développeur-IA.

## User Journeys

### Journey 1: Sarah Chen - De l'Imposteur à l'Apprentie Confiante

Sarah est une développeuse junior de 24 ans qui a rejoint une startup tech il y a 6 mois. Chaque matin, elle ouvre VSCode avec une boule au ventre. Elle utilise GitHub Copilot pour accélérer son travail, mais se sent comme une imposteur - elle accepte des suggestions qu'elle ne comprend pas vraiment, puis doit demander à son senior "pourquoi cette approche?" lors des code reviews. Elle passe ses soirées à lire des tutoriels, cherchant désespérément à combler le gap entre "faire fonctionner le code" et "vraiment comprendre".

Un vendredi soir, épuisée après une semaine difficile, elle tombe sur un post Reddit mentionnant un plugin VSCode avec "IA transparente". Intriguée par les screenshots montrant des agents sumi-e, elle l'installe. Le lundi matin, lors de son premier refactoring, elle voit quelque chose de différent: quand le Codeur suggère un pattern, l'Architecte s'illumine et montre POURQUOI - les dépendances actuelles, la structure du projet. Sarah comprend soudain: "Ah, c'est pour ça que Dependency Injection est meilleur ici!"

Le moment décisif arrive deux semaines plus tard lors d'une code review. Quand son senior demande "pourquoi as-tu utilisé cette approche?", Sarah peut expliquer: "L'Architecte a montré que notre structure actuelle créait un couplage fort, et le Reviewer a validé que cette approche suivait nos patterns." Son senior, impressionné, demande: "Quel plugin utilises-tu?" Six mois plus tard, Sarah mène ses propres code reviews, expliquant les décisions architecturales avec confiance. Elle a appris plus en voyant le raisonnement de l'IA qu'en deux ans d'université.

**Exigences révélées:**
- Visualisation claire du raisonnement de chaque agent
- Connexion entre suggestions et architecture existante du projet
- Mode "Learning" avec explications détaillées
- Historique des décisions pour référence future

### Journey 2: Marcus Rodriguez - Du Sceptique au Believer

Marcus est un développeur senior de 38 ans avec 12 ans d'expérience. Il a essayé GitHub Copilot pendant deux semaines avant de le désactiver, frustré. "C'est de l'autocomplete glorifié," dit-il à ses collègues. "Ça devine, mais ça n'explique rien." Marcus refuse d'utiliser du code qu'il ne comprend pas - c'est une question de professionnalisme. Il code "à l'ancienne", convaincu que l'IA est un gadget pour développeurs paresseux.

Un mardi après-midi, lors d'un hackathon interne, sa collègue lui montre son écran avec quatre agents sumi-e collaborant au-dessus de son code. "Regarde ça," dit-elle. Marcus, intrigué malgré lui par l'esthétique zen, observe. Quand le Codeur suggère une optimisation, le Reviewer s'active immédiatement, montrant les edge cases potentiels. "Attends... il montre les problèmes AVANT que tu acceptes?" Marcus installe le plugin "juste pour tester".

Le breakthrough arrive une semaine plus tard. Marcus travaille sur une migration de base de données complexe. Les agents montrent leur collaboration: l'Architecte analyse les dépendances, le Codeur propose la migration, le Reviewer pointe les risques de data loss, le Contexte montre les fichiers impactés. Marcus voit le processus de pensée complet - comme s'il pair programmait avec trois seniors simultanément. Il accepte la suggestion, mais cette fois, il *comprend pourquoi*. Trois mois plus tard, Marcus évangélise le plugin dans des meetups: "Ce n'est pas de l'IA magique, c'est un pair transparent. Ça change tout."

**Exigences révélées:**
- Affichage simultané de multiples perspectives (Architecte, Codeur, Reviewer)
- Identification proactive des edge cases et risques
- Visualisation des fichiers impactés par changement
- Mode expert avec détails techniques profonds

### Journey 3: Alex Kim - L'Indie Dev Qui Retrouve le Flow

Alex est un développeur indie de 31 ans qui construit seul une SaaS de gestion de projet. Il jongle entre React frontend, Node backend, AWS devops, et Stripe intégration. Alex utilise l'IA intensivement - Copilot, ChatGPT, Claude - mais se sent déconnecté, comme s'il orchestrait des boîtes noires sans vraiment coder. Il passe 40% de son temps à valider et débugger des suggestions IA qu'il ne comprend pas complètement. Certains soirs, il se demande s'il est encore développeur ou juste "AI prompt engineer".

Début janvier, cherchant à optimiser son workflow pour lancer avant Q2, Alex découvre le plugin via une newsletter tech. L'idée de "voir l'IA penser" résonne avec sa frustration actuelle. Il l'installe et configure les API keys (OpenAI pour Architecte, Claude pour Codeur). La première semaine, le changement est subtil - il voit les agents, c'est joli, mais est-ce vraiment utile?

Puis arrive le moment critique: Alex implémente une feature complexe de permissions multi-tenants. Normalement, ça prendrait trois jours avec beaucoup d'aller-retours ChatGPT. Mais cette fois, il voit le Contexte charger les fichiers pertinents, l'Architecte analyser son auth système actuel, le Codeur proposer du code *aligné avec ses patterns existants*, et le Reviewer valider la sécurité en temps réel. En 6 heures, c'est terminé - et Alex comprend chaque ligne. Le flow est revenu. Six mois plus tard, Alex lance en beta avec 10+ sessions quotidiennes du plugin. Il code 60% plus vite *et* se sent redevenu développeur, pas opérateur IA.

**Exigences révélées:**
- Gestion intelligente du contexte multi-fichiers
- Alignement des suggestions avec patterns existants du projet
- Validation sécurité en temps réel (pour apps production)
- Performance optimale pour sessions longues (10+/jour)
- Support multi-providers LLM (OpenAI + Claude)

### Journey 4: Priya Sharma - La Tech Lead Qui Remet la Qualité au Centre

Priya est tech lead d'une équipe de 5 développeurs dans une fintech. Son plus grand défi? Deux de ses juniors utilisent Copilot et acceptent des suggestions sans vraiment les comprendre. Lors des code reviews, Priya doit souvent demander "pourquoi cette approche?" et obtient des réponses vagues: "Copilot l'a suggéré..." La qualité du code se dégrade, la dette technique s'accumule, et Priya passe 50% de son temps en reviews au lieu de coder.

Un lundi matin, lors du standup, elle pose un ultimatum: "Soit vous comprenez le code que vous committez, soit on désactive l'IA." L'équipe est frustrée - personne ne veut revenir en arrière, mais personne ne sait comment résoudre le problème de compréhension. Un de ses devs seniors mentionne avoir vu un plugin avec "IA explicable". Priya, sceptique mais désespérée, décide de tester avec toute l'équipe.

Le changement prend deux semaines. Au début, c'est étrange - les code reviews changent de nature. Au lieu de "pourquoi ça?", Priya demande maintenant "quel agent a validé cette approche?". Les juniors peuvent montrer: "Le Reviewer a vérifié les edge cases, l'Architecte a confirmé que ça suit notre structure." Les discussions deviennent plus riches, plus techniques. Le moment "aha!" collectif arrive lors d'une review d'une feature complexe: un junior explique le raisonnement complet avec une clarté qui surprend Priya. "Tu as vraiment compris ça?" "Oui, j'ai vu le processus de pensée de A à Z."

Trois mois plus tard, Priya constate: dette technique en baisse, reviews 30% plus rapides, et ses juniors progressent 2x plus vite. Elle recommande le plugin au CTO pour adoption company-wide. Le plugin n'a pas juste accéléré l'équipe - il a transformé l'IA d'outil de productivité en outil d'apprentissage.

**Exigences révélées:**
- Mode Team/Collaboration avec labels visibles pour pair programming
- Capacité à capturer et partager le raisonnement (pour reviews)
- Validation qualité stricte (edge cases, patterns, best practices)
- Métriques/logs pour tech leads (adoption, compréhension)

### Journey 5: Jamie Torres - Le Contributor Qui Trouve sa Place

Jamie est un développeur full-stack de 28 ans qui travaille en remote pour une agence. Le soir et les weekends, il contribue à des projets open-source - c'est sa passion et son portfolio. Un samedi matin, il découvre le plugin via Hacker News. Les screenshots des agents sumi-e le captivent, et quand il voit "open-source" avec 2,000 stars GitHub, il sait qu'il veut contribuer.

Jamie clone le repo et ouvre le README. La documentation mentionne "voir CONTRIBUTING.md" - il y trouve une architecture claire, des guidelines de code, et surtout une liste de "good first issues". Il choisit: "Add support for local LLM providers (Ollama)". Excité, il plonge dans le code. L'architecture est bien structurée - `LLMService` abstraction, providers plugins. En trois heures de lecture, Jamie comprend comment ajouter un provider.

Le challenge arrive lors de l'implémentation. Il crée `OllamaProvider.ts`, mais quand il teste, les agents ne s'affichent pas correctement. Frustré, il poste sur Discord: "Agents not rendering with Ollama provider, any hints?" En 20 minutes, David (community support) répond avec un lien vers l'architecture doc des agents. Jamie comprend: il doit émettre les mêmes events que les autres providers. Il corrige, teste, ça fonctionne!

Le moment de fierté: Jamie ouvre sa PR. En 48h, un maintainer review avec des suggestions constructives. Jamie itère, le CI passe au vert, et sa PR est mergée. Quelques jours plus tard, il voit sa contribution dans le changelog de la release 0.8.0. Six mois plus tard, Jamie est devenu maintainer, ayant contribué 15+ PRs. Il a trouvé sa communauté et son impact.

**Exigences révélées:**
- Documentation claire d'architecture et contribution
- Architecture extensible (plugins pour providers LLM)
- Good first issues bien labelés pour newcomers
- Community responsive (Discord, GitHub discussions)
- CI/CD robuste pour validation automatique
- Changelog et recognition des contributors

### Journey 6: Elena Volkov - L'Extension Developer Qui Personnalise son Expérience

Elena est développeuse senior dans une entreprise utilisant un LLM interne custom pour raisons de confidentialité. Elle découvre le plugin et l'adore, mais il ne supporte que OpenAI et Claude. Elena ne peut pas utiliser de LLMs externes - toutes les données doivent rester on-premise. Elle se demande: "Puis-je l'adapter à notre LLM interne?"

Elle explore le repo GitHub et trouve la section "Extending the Plugin" dans la doc. L'architecture montre une interface `ILLMProvider` avec des méthodes claires: `sendRequest()`, `streamResponse()`, `handleError()`. Elena réalise qu'elle peut créer un plugin personnalisé. Elle commence par copier `AnthropicProvider.ts` comme template.

Le vrai défi: leur LLM interne a une API différente et retourne des metadata spécifiques à afficher. Elena découvre dans la doc avancée qu'elle peut aussi étendre `AgentRenderer` pour personnaliser l'affichage. En deux semaines de développement (en parallèle de son travail), elle crée `InternalLLMProvider` + custom rendering pour leurs metadata. Elle teste en local - ça fonctionne parfaitement!

Elena ne peut pas open-source cette extension (propriétaire entreprise), mais elle documente son approche dans un blog post: "How I Extended the VSCode AI Plugin for Our Internal LLM". Le post génère 50+ upvotes sur dev.to, et trois autres entreprises la contactent pour conseils. Le plugin est devenu une plateforme, pas juste un outil.

**Exigences révélées:**
- API publique bien documentée pour extensions
- Interfaces claires (`ILLMProvider`, `IAgentRenderer`)
- Exemples de plugins/extensions dans la doc
- Architecture découplée permettant customization
- Support pour LLMs non-standard (custom metadata, formatting)
- Documentation avancée pour extension developers

### Journey 7: David Park - Le Community Hero Qui Scale le Support

David est un early adopter qui a découvert le plugin lors de la beta (utilisateur #47). Développeur senior dans une startup, il utilise le plugin quotidiennement et est tombé amoureux de l'approche transparente. Quand il voit sur GitHub que le projet cherche des community moderators pour Discord, il se porte volontaire.

Au début, c'est gérable - 50 utilisateurs, quelques questions par jour. David répond facilement: problèmes d'installation, configuration API keys, questions features. Mais après 3 mois, il y a 1,000 utilisateurs et 20+ questions quotidiennes. David se sent submergé. Comment scaler le support sans perdre la qualité qui fait la réputation du projet?

David propose au core team de créer une "knowledge base" structurée. Avec l'aide de deux autres community members, ils créent:
- **FAQ vivant** mis à jour avec chaque question récurrente
- **Troubleshooting guides** catégorisés par symptôme
- **Video tutorials** pour setup complexes
- **Templates GitHub issues** pour bug reports structurés

Le breakthrough: ils ajoutent un bot Discord qui, avant qu'un user poste, suggère des KB articles basés sur keywords. 60% des questions trouvent réponse sans intervention humaine. Pour les 40% restants, David et son équipe répondent rapidement avec des liens KB pertinents.

Un an plus tard, avec 10,000 utilisateurs, David lead une équipe de 8 community mods. Le projet a une réputation de "meilleur support de l'écosystème VSCode". David a même été embauché part-time par le projet pour gérer la community. Il a transformé le support d'un goulot en un avantage compétitif.

**Exigences révélées:**
- Documentation utilisateur exhaustive et searchable
- Troubleshooting guides par symptômes
- Templates d'issues GitHub structurés
- Telemetry opt-in pour diagnostics (sans data sensible)
- Community guidelines et moderation tools
- Bot support / FAQ automation
- Recognition program pour community helpers

### Journey Requirements Summary

Ces 7 parcours révèlent les capacités suivantes nécessaires pour le plugin:

**Core Product Capabilities:**
- **Transparence du Raisonnement:** Visualisation claire de pourquoi chaque agent suggère quelque chose (Sarah, Marcus)
- **Multi-Agent Collaboration Visible:** Voir Architecte + Codeur + Reviewer + Contexte travailler ensemble (Marcus, Alex, Priya)
- **Modes Adaptatifs:** Learning (Sarah), Expert (Marcus), Team (Priya), Focus (Alex)
- **Performance Sessions Longues:** Support 10+ sessions/jour sans lag (Alex)

**Architecture & Extensibilité:**
- **Plugin System pour LLM Providers:** Interface `ILLMProvider` pour extensions (Jamie, Elena)
- **API Publique Documentée:** Permettre customization profonde (Elena)
- **Architecture Découplée:** Agents, Renderers, Providers séparables (Elena)

**Quality & Security:**
- **Validation Sécurité Temps Réel:** Pour apps production sensibles (Alex, Priya)
- **Edge Case Detection:** Reviewer identifie risques proactivement (Marcus, Priya)
- **Alignment Pattern Projet:** Suggestions respectent architecture existante (Alex)

**Collaboration & Team:**
- **Pair Programming Mode:** Labels visibles, explications partagées (Priya)
- **Review Support:** Capture du raisonnement pour code reviews (Priya)
- **Team Metrics:** Adoption, compréhension, qualité (Priya)

**Community & Support:**
- **Documentation Multi-Niveau:** User docs, Contributing guides, API docs, Troubleshooting (Jamie, Elena, David)
- **Good First Issues Program:** Onboarding contributors efficacement (Jamie)
- **Knowledge Base Searchable:** FAQ, guides, videos (David)
- **Community Tools:** Discord, GitHub templates, bot support (David)
- **CI/CD Robuste:** Validation automatique des contributions (Jamie)

**Developer Experience:**
- **Installation <2min:** Friction minimale (tous)
- **Multi-Platform:** Mac, Windows, Linux sans dégradation (tous)
- **Support Multi-LLM:** OpenAI, Claude, custom providers (Alex, Elena)
- **Telemetry Opt-in:** Diagnostics sans compromettre privacy (David)

## Innovation & Novel Patterns

### Detected Innovation Areas

**Paradigme Shift: Transparence > Invisibilité**

Le marché actuel des outils IA pour développeurs (GitHub Copilot, Cursor, Continue.dev, Codeium) suit unanimement le paradigme "l'IA doit être invisible et magique - moins le dev en voit, mieux c'est". Ces outils optimisent pour la suggestion rapide et l'autocomplete fluide, mais cachent intentionnellement le raisonnement.

Ce plugin inverse radicalement cette approche: **la transparence n'est pas un bug, c'est une feature**. L'hypothèse fondamentale est que comprendre le "pourquoi" derrière les suggestions IA crée:
- Confiance supérieure (mesurée par taux d'acceptation >60% vs ~40% traditionnel)
- Apprentissage actif (7/10 développeurs apprennent du raisonnement visible)
- Collaboration réelle vs consommation passive

**Innovation Technique: Théâtre d'IA Multi-Agent Visible**

Première implémentation connue d'un système multi-agents (Architecte, Codeur, Reviewer, Contexte) où la collaboration est visuellement exposée en temps réel au-dessus du code. Les agents ne sont pas des abstractions backend - ils sont des personnages visuels dont les interactions, états, et raisonnements sont observables.

Architecture hybride LLM innovante: au lieu d'un LLM monolithique ou distribution uniforme, optimisation pragmatique - modèles puissants (GPT-4/Claude) seulement où le raisonnement complexe est nécessaire, algorithmes purs ailleurs. Coût <$0.10/session permet modèle gratuit/open-source soutenable.

**Innovation Design: Esthétique Sumi-e Appliquée au HUD Développeur**

Premier outil de développement appliquant philosophie design japonaise zen (sumi-e, Ma, Wabi-sabi, Kanso) à une interface fonctionnelle. Le design n'est pas cosmétique - c'est une solution au problème "comment montrer information complexe sans distraire?".

Personnages agents en coups de pinceau (2-5 traits), palette monochrome + accent rouge stratégique, opacité adaptative (5-40%), anti-obstruction intelligente. Le minimalisme fonctionnel résout le paradoxe: montrer beaucoup d'information tout en respectant le flow de coding.

### Market Context & Competitive Landscape

**Outils IA Développeurs Existants (2026):**

- **GitHub Copilot:** Leader du marché, boîte noire complète, autocomplete rapide, aucune explication de raisonnement
- **Cursor:** IDE IA-first, suggestions contextuelles, mais opaque sur le "pourquoi"
- **Continue.dev:** Open-source, multi-LLM, mais paradigme invisible standard
- **Codeium:** Alternative gratuite Copilot, même approche opaque

**Gap du Marché Identifié:**

Aucun outil actuel n'adresse le problème de compréhension. Les développeurs ont deux choix insatisfaisants:
1. Accepter aveuglément les suggestions (rapide mais risqué, crée dette technique)
2. Rejeter et coder manuellement (sûr mais lent, perd les bénéfices IA)

Le plugin crée une **troisième voie**: accepter avec compréhension. Les développeurs voient le raisonnement, apprennent du processus, deviennent meilleurs tout en étant plus productifs.

**Positionnement Différencié:**

Non concurrent direct des outils existants - positionnement comme **complément éducatif transparent** ou **alternative pour devs qui valorisent compréhension > vitesse pure**. Segments cibles:
- Juniors qui veulent apprendre (Sarah Chen persona)
- Seniors sceptiques de l'IA opaque (Marcus Rodriguez persona)
- Teams valorisant qualité et compréhension (Priya Sharma persona)

### Validation Approach

**Méthodologie: Validation par Metrics Comparatives**

L'hypothèse "transparence > invisibilité" sera validée via comparaison directe des métriques définies vs benchmarks outils traditionnels:

**Metrics Primaires de Validation:**

1. **Taux d'Acceptation des Suggestions: >60% vs ~40% baseline**
   - Baseline: Taux typique Copilot/Cursor (~40% selon études publiques)
   - Target: >60% via confiance accrue grâce à transparence
   - Mesure: Analytics intégrées tracking suggestions présentées vs acceptées
   - Timeline: Validation après 3 mois beta avec 1,000 users

2. **Compréhension du Raisonnement: 8/10 peuvent expliquer "pourquoi"**
   - Mesure: Survey post-session aléatoires demandant d'expliquer dernière suggestion acceptée
   - Scoring: Peut articuler raisonnement complet vs réponse vague
   - Comparatif: Outils opaques score ~2-3/10 (estimation conservatrice)
   - Timeline: Validation continue, rapport mensuel

3. **Apprentissage Actif: 7/10 disent avoir appris quelque chose**
   - Mesure: Survey hebdomadaire "Avez-vous appris un nouveau pattern/approche cette semaine grâce au plugin?"
   - Comparatif: Outils traditionnels ~3-4/10 (apprentissage passif via exposition)
   - Timeline: Suivi longitudinal 6 mois

**Metrics Secondaires:**

- **NPS >40:** Recommandation active vs tools traditionnels (NPS typique ~20-30)
- **Sessions/semaine >10:** Outil essentiel quotidien vs usage occasionnel
- **0 rapports "trop distrayant":** Le design zen respecte le flow

**Validation Qualitative:**

- Interviews approfondis 20-30 beta users (mix juniors/seniors/teams)
- Observation sessions de coding filmées (avec consentement) pour voir interaction réelle
- A/B testing optionnel: Mode transparence ON vs OFF dans même session

**Critères de Succès Validation:**

Si 3/5 metrics primaires + secondaires sont atteintes après 6 mois beta → Paradigme validé, scale vers 10K users.

Si <2/5 metrics → Pivot requis, explorer hybride transparence/invisibilité.

### Risk Mitigation

**Risque Principal: Transparence Distrait au Lieu d'Aider**

L'hypothèse peut échouer pour certains segments:
- Devs habitués à vitesse pure préfèrent Copilot rapide
- Contextes de coding pressants (deadlines serrées, hotfixes production)
- Préférences personnelles - certains préfèrent vraiment "magie invisible"

**Fallback Strategy: Mode Focus/DND**

Solution déjà conçue dans brainstorming initial - **mode adaptatif avec désactivation élégante**:

**Implémentation du Fallback:**

1. **Mode Focus (Primary Fallback)**
   - Hotkey: Cmd/Ctrl + Shift + F (Toggle rapide)
   - Comportement: Agents deviennent invisibles ou état dormant minimal
   - Vital Signs Bar reste (info essentielle) mais HUD agents disparaît
   - Suggestions continuent mais sans visualisation du raisonnement
   - Utilisateur garde bénéfices IA sans overhead visuel

2. **Niveaux de Transparence Graduels (Secondary Fallback)**
   - Settings: Minimal → Medium → Full transparency
   - **Minimal:** Vital Signs Bar seulement, agents cachés
   - **Medium:** Un agent visible (le plus actif), autres dormants
   - **Full:** Tous agents, états, communications visibles
   - Permet personnalisation selon préférence/contexte

3. **Auto-Detection Contextuelle**
   - Détecte frappe intensive (coding actif) → réduit opacité automatiquement
   - Idle/lecture → augmente visibilité
   - User peut override manuel via hotkeys

**Stratégie de Communication du Fallback:**

- Onboarding explique modes dès installation
- Tooltip initiale: "Trop d'info? Appuyez Cmd+Shift+F pour Mode Focus"
- Documentation claire: "Transparence est optionnelle, pas obligatoire"
- Metrics tracking: combien utilisent fallback régulièrement (si >40% → problème design)

**Plan B si Fallback Insuffisant:**

Si même avec modes adaptatifs le paradigme ne valide pas (metrics <2/5):
- Pivot vers **hybrid tool**: transparence opt-in pour learning, invisibilité par défaut
- Ou reposition comme **educational tool** pour juniors/bootcamps, pas production tool
- Architecture permet ces pivots sans réécriture majeure

## Technical Specifications - Developer Tool

### Language & Runtime

**TypeScript Configuration:**
- TypeScript 5.x (latest stable)
- Strict mode enabled (tsconfig strict: true)
- Target: ES2020 pour balance compatibilité/features modernes
- Node Runtime: Node 16+ (compatibilité VSCode minimum requirement)

### Package Management

**Standard npm:**
- npm comme package manager principal
- package-lock.json committed pour reproducible builds
- Compatible yarn/pnpm pour contributors qui préfèrent
- Distribution: VSCode Marketplace (.vsix packaging)

### VSCode Integration

**APIs Utilisées:**
- **Webview API:** Pour HUD overlay et agents sumi-e rendering
- **Extension API:** Activation events, commands, configuration
- **Workspace API:** Accès fichiers projet, file watching
- **Language Features:** Hover providers (pour tooltips agents), CodeLens (potentiel)

**Configuration:**
- Settings via `contributes.configuration` dans package.json
- User settings dans VSCode settings.json
- API keys storage: VSCode SecretStorage API (secure)
- Preferences: workspace vs user settings support

**Commands Palette:**
- Toggle HUD visibility
- Mode Focus/DND
- Configure API keys
- Show/Hide agents individuels
- Reset to defaults

### Documentation Structure

**Multi-Level Documentation:**

1. **End Users:**
   - README.md principal (installation, quick start)
   - docs/getting-started.md
   - docs/configuration.md (API keys setup)
   - docs/usage.md (features, hotkeys)

2. **Contributors:**
   - CONTRIBUTING.md (architecture overview, dev setup, PR process)
   - docs/architecture.md (system design, agent orchestration)
   - docs/development.md (local dev, debugging, testing)

3. **Extension Developers:**
   - docs/api/README.md (public API overview)
   - docs/api/providers.md (ILLMProvider interface, custom providers)
   - docs/api/renderers.md (IAgentRenderer interface, customization)
   - JSDoc inline pour IntelliSense

4. **Community:**
   - docs/troubleshooting.md (par symptômes, comme David persona)
   - FAQ.md
   - CHANGELOG.md (releases, contributors recognition)

### Examples & Templates

**Repository Structure:**
```
examples/
├── configurations/
│   ├── solo-dev-config.json
│   ├── team-config.json
│   └── enterprise-config.json
├── providers/
│   ├── ollama-provider-example/
│   └── custom-llm-provider-template/
└── integrations/
    ├── react-project/
    ├── node-backend/
    └── monorepo/
```

**Code Examples:**
- Custom LLM Provider implementation guide (step-by-step)
- Custom Agent Renderer example
- Configuration presets pour cas d'usage communs
- Migration guides si breaking changes

### Installation & Distribution

**Installation Methods:**
- **Primary:** VSCode Marketplace (one-click install)
- **Manual:** Download .vsix from GitHub releases
- **Dev:** Clone repo + `npm install` + F5 (Extension Development Host)

**Installation Time Target:** <2 minutes from Marketplace discovery to first use

### API Surface

**Public APIs pour Extensibilité:**
- `ILLMProvider` interface - add custom LLM providers
- `IAgentRenderer` interface - customize agent visualization
- Event emitters - hook into agent lifecycle (onAgentActivated, onSuggestionAccepted)
- Configuration schema - typed settings access

**Versioning:**
- Semantic versioning (semver)
- Stable API promise pour public interfaces
- Deprecation warnings avant breaking changes
- Migration guides pour major versions

## Functional Requirements

### Capability Area 1: Multi-Agent AI System

**FR1:** Le système doit afficher 4 agents IA distincts (Architecte, Codeur, Reviewer, Contexte) avec identités visuelles uniques

**FR2:** Les utilisateurs peuvent voir l'état actuel de chaque agent (idle, thinking, working, alert, success) en temps réel

**FR3:** Les utilisateurs peuvent observer la collaboration entre agents (communication visuelle, coordination)

**FR4:** Le système doit montrer quel agent est responsable de chaque suggestion de code

**FR5:** Les utilisateurs peuvent voir le raisonnement complet derrière chaque suggestion IA (pourquoi cette approche, quelles alternatives considérées)

**FR6:** Les utilisateurs peuvent voir quels fichiers/contexte chaque agent analyse actuellement

**FR7:** Le système doit permettre aux agents de fusionner visuellement en une forme collective lors de collaboration intense

**FR8:** Les utilisateurs peuvent interroger un agent spécifique sur son raisonnement ou décision

### Capability Area 2: Visualisation & Interface HUD

**FR9:** Le système doit afficher un HUD (overlay) transparent superposé au code

**FR10:** Les utilisateurs peuvent voir les agents positionnés adaptivement selon le contexte (repos, thinking, actif, alert)

**FR11:** Le HUD doit automatiquement éviter d'obstruer le curseur ou la zone d'édition active

**FR12:** Les utilisateurs peuvent voir une "Vital Signs Bar" affichant tokens consommés, fichiers en contexte, état global

**FR13:** Le système doit afficher 4 niveaux d'alertes visuels distincts (info, warning, critical, urgent) avec idéogrammes

**FR14:** Les utilisateurs peuvent voir des animations fluides (transitions d'état, respiration, mouvements) à 60fps minimum

**FR15:** Le système doit afficher les problèmes détectés directement à côté des lignes de code concernées (code-anchored alerts)

**FR16:** Les utilisateurs peuvent voir des traits de pinceau animés représentant la communication entre agents

### Capability Area 3: Modes & Personnalisation

**FR17:** Les utilisateurs peuvent basculer en Mode Focus/DND où les agents deviennent invisibles tout en gardant les suggestions IA

**FR18:** Les utilisateurs peuvent choisir entre 3 niveaux de transparence (Minimal, Medium, Full)

**FR19:** Le système doit adapter automatiquement l'opacité/visibilité selon l'activité de l'utilisateur (coding actif vs idle)

**FR20:** Les utilisateurs peuvent activer un Mode Learning avec explications détaillées et pédagogiques

**FR21:** Les utilisateurs peuvent activer un Mode Expert avec détails techniques approfondis

**FR22:** Les utilisateurs peuvent activer un Mode Team/Collaboration avec labels visibles pour pair programming

**FR23:** Les utilisateurs peuvent personnaliser l'apparence (palette couleurs, taille agents, position barre)

**FR24:** Les utilisateurs peuvent activer un Mode High Contrast pour accessibilité

**FR25:** Les utilisateurs peuvent configurer des alternatives daltonisme (patterns, couleurs adaptées)

### Capability Area 4: Gestion LLM & Providers

**FR26:** Le système doit supporter multiple providers LLM simultanément (OpenAI, Anthropic Claude minimum)

**FR27:** Les utilisateurs peuvent configurer quel provider LLM utiliser pour quel agent

**FR28:** Les utilisateurs peuvent ajouter des providers LLM personnalisés via l'interface `ILLMProvider`

**FR29:** Le système doit gérer automatiquement les fallbacks si un provider est indisponible

**FR30:** Les utilisateurs peuvent voir les coûts LLM estimés par session en temps réel

**FR31:** Le système doit implémenter un cache intelligent pour réduire les appels LLM répétitifs (>50% hit rate)

**FR32:** Les utilisateurs peuvent configurer rate limiting et budgets pour contrôler les coûts

**FR33:** Le système doit supporter des LLMs on-premise/internes pour conformité entreprise

### Capability Area 5: Gestion du Contexte & Intelligence

**FR34:** Le système doit charger automatiquement les fichiers pertinents du projet comme contexte

**FR35:** L'agent Contexte doit optimiser la sélection de fichiers pour rester sous les limites de tokens

**FR36:** Les utilisateurs peuvent voir quels fichiers sont actuellement dans le contexte de l'IA

**FR37:** Le système doit analyser l'architecture existante du projet pour aligner les suggestions avec les patterns actuels

**FR38:** L'agent Reviewer doit identifier proactivement les edge cases et risques avant acceptation de suggestion

**FR39:** Le système doit valider la sécurité du code suggéré en temps réel (pour apps production)

**FR40:** Les utilisateurs peuvent voir l'historique des décisions et raisonnements pour référence future

**FR41:** Le système doit détecter et s'adapter aux phases de développement (prototype, production, debug)

### Capability Area 6: Interaction & Commandes

**FR42:** Les utilisateurs peuvent accepter ou rejeter des suggestions IA avec feedback visuel immédiat

**FR43:** Les utilisateurs peuvent utiliser des hotkeys pour toggle HUD, changer modes, forcer états d'agents

**FR44:** Les utilisateurs peuvent drag-and-drop des alertes vers TODO list pour création automatique d'entrées

**FR45:** Les utilisateurs peuvent hover sur agents pour voir tooltips avec détails contextuels

**FR46:** Les utilisateurs peuvent cliquer sur alertes code-anchored pour voir fix proposé

**FR47:** Le système doit exposer toutes fonctions via Command Palette VSCode

**FR48:** Les utilisateurs peuvent naviguer keyboard-only (Tab, arrows, Enter, Espace) pour accessibilité

### Capability Area 7: Configuration & Installation

**FR49:** Les utilisateurs peuvent installer le plugin via VSCode Marketplace en moins de 2 minutes

**FR50:** Les utilisateurs peuvent configurer leurs API keys de manière sécurisée (VSCode SecretStorage)

**FR51:** Le système doit fonctionner sur Mac, Windows, Linux sans dégradation de fonctionnalités

**FR52:** Les utilisateurs peuvent configurer preferences au niveau workspace ou user settings

**FR53:** Le système doit fournir des templates de configuration pour différents use cases (solo dev, team, enterprise)

**FR54:** Les utilisateurs peuvent exporter/importer leurs configurations personnalisées

### Capability Area 8: Monitoring & Analytics

**FR55:** Les utilisateurs peuvent voir des métriques d'utilisation (sessions, suggestions acceptées/rejetées, temps économisé)

**FR56:** Le système doit tracker l'adoption et compréhension pour tech leads (mode team)

**FR57:** Les utilisateurs peuvent opt-in pour telemetry diagnostique (sans données sensibles de code)

**FR58:** Le système doit logger erreurs et performances pour troubleshooting

**FR59:** Les utilisateurs peuvent générer des rapports d'utilisation et apprentissage

### Capability Area 9: Extensibilité & API Publique

**FR60:** Les développeurs peuvent créer des providers LLM personnalisés via interface `ILLMProvider`

**FR61:** Les développeurs peuvent personnaliser le rendu des agents via interface `IAgentRenderer`

**FR62:** Les développeurs peuvent s'abonner à des événements du cycle de vie des agents (onAgentActivated, onSuggestionAccepted)

**FR63:** Le système doit exposer une API typée pour accès programmatique aux configurations

**FR64:** Le système doit maintenir la compatibilité API selon semantic versioning

### Capability Area 10: Documentation & Support

**FR65:** Les utilisateurs peuvent accéder à une documentation getting-started intégrée dans le plugin

**FR66:** Les utilisateurs peuvent rechercher dans une knowledge base de troubleshooting par symptômes

**FR67:** Les contributeurs peuvent accéder à une documentation architecture complète

**FR68:** Les extension developers peuvent accéder à des API docs avec exemples de code

**FR69:** Le système doit fournir des messages d'erreur clairs avec liens vers documentation pertinente

**FR70:** Les utilisateurs peuvent accéder à un changelog détaillé avec reconnaissance des contributors

### Capability Area 11: Validation & Metrics

**FR71:** Le système doit tracker et afficher le taux d'acceptation des suggestions (target >60%)

**FR72:** Le système doit permettre des surveys post-session pour mesurer la compréhension (target 8/10)

**FR73:** Le système doit tracker l'apprentissage utilisateur via surveys hebdomadaires (target 7/10)

**FR74:** Le système doit calculer et afficher le NPS (Net Promoter Score)

**FR75:** Le système doit détecter et rapporter si le design est "trop distrayant" (target 0 rapports)

## Non-Functional Requirements

### Performance

**NFR-PERF-1:** Les animations HUD (agents, transitions, respiration) doivent maintenir 60fps constant

**NFR-PERF-2:** Le UI response time doit être <100ms pour toutes interactions utilisateur

**NFR-PERF-3:** Le temps de startup de l'extension doit être <2 secondes

**NFR-PERF-4:** Le plugin doit supporter 10+ sessions par jour sans dégradation de performance

**NFR-PERF-5:** Les transitions SVG et CSS doivent utiliser `will-change: transform` pour optimisation GPU

**NFR-PERF-6:** Le rendering HUD ne doit pas bloquer l'édition de code (async rendering)

### Accessibility

**NFR-ACCESS-1:** Le système doit supporter navigation complète keyboard-only (Tab, arrows, Enter, Espace)

**NFR-ACCESS-2:** Le système doit fournir un mode High Contrast avec 60% opacité minimum

**NFR-ACCESS-3:** Le système doit fournir alternatives daltonisme (patterns, couleurs adaptées)

**NFR-ACCESS-4:** Le système doit être compatible screen readers pour contenus textuels

**NFR-ACCESS-5:** Les hotkeys doivent être configurables pour éviter conflits avec assistive tools

### Security & Privacy

**NFR-SEC-1:** Les API keys doivent être stockées via VSCode SecretStorage API (encrypted)

**NFR-SEC-2:** Aucune donnée de code utilisateur ne doit être loggée ou transmitted sans consentement explicite

**NFR-SEC-3:** La telemetry doit être opt-in par défaut avec transparence complète sur données collectées

**NFR-SEC-4:** Les communications avec providers LLM doivent utiliser HTTPS/TLS

**NFR-SEC-5:** Le système doit permettre utilisation de LLMs on-premise pour conformité entreprise

### Maintainability & Code Quality

**NFR-MAINT-1:** La couverture de tests doit être >70% (unitaires + intégration)

**NFR-MAINT-2:** Le code doit respecter TypeScript strict mode et linting standards (ESLint)

**NFR-MAINT-3:** L'architecture doit être découplée (Agents, Renderers, Providers séparables)

**NFR-MAINT-4:** La documentation API doit être générée automatiquement (JSDoc + TypeDoc)

**NFR-MAINT-5:** Le code doit suivre patterns cohérents facilitant contributions open-source

**NFR-MAINT-6:** Les public APIs doivent maintenir compatibilité selon semantic versioning

### Cost Management

**NFR-COST-1:** Les coûts LLM par session doivent être <$0.10 en moyenne

**NFR-COST-2:** Le cache hit rate doit être >50% pour réduire appels LLM répétitifs

**NFR-COST-3:** Le système doit permettre configuration de budgets et rate limiting par utilisateur

**NFR-COST-4:** Les metrics de coûts doivent être visibles en temps réel pour utilisateurs

### Reliability & Stability

**NFR-REL-1:** L'extension doit démarrer sans crash (0 tolérance pour startup failures)

**NFR-REL-2:** Le système doit fonctionner sur Mac, Windows, Linux sans dégradation

**NFR-REL-3:** Les fallbacks LLM provider doivent être automatiques et transparents

**NFR-REL-4:** Le système doit gracefully handle erreurs réseau ou API timeouts

**NFR-REL-5:** Les logs d'erreur doivent inclure contexte suffisant pour troubleshooting

### Compatibility & Portability

**NFR-COMPAT-1:** Le système doit supporter Node 16+ (VSCode minimum requirement)

**NFR-COMPAT-2:** Le système doit être compatible VSCode versions 1.75+

**NFR-COMPAT-3:** Les configurations doivent être portables entre machines (export/import)

**NFR-COMPAT-4:** Le système doit fonctionner avec yarn/pnpm pour contributors

### Usability

**NFR-USAB-1:** L'installation depuis VSCode Marketplace doit prendre <2 minutes total

**NFR-USAB-2:** La configuration initiale (API keys) doit avoir flow guidé < 5 minutes

**NFR-USAB-3:** Les messages d'erreur doivent inclure liens vers documentation/troubleshooting

**NFR-USAB-4:** Le système doit fournir tooltips contextuels pour découvrabilité features

# Epic 11: Agents Interactifs Animés - Transformation en Personnages Vivants

**Status:** Planning
**Priority:** HIGH
**Complexity:** High
**Estimated Duration:** 5 Sprints (10 semaines)

## Vision

Transformer les agents IA de simples icônes emoji statiques en personnages animés vivants qui se déplacent dans l'éditeur VSCode, interagissent visuellement entre eux, et s'ancrent au code qu'ils analysent. Cette transformation réalise pleinement la vision du "Théâtre d'IA Transparent" avec une esthétique sumi-e japonaise authentique.

## Objectifs Business

1. **Différenciation Marché**: Créer une expérience visuelle unique qui positionne Suika comme l'outil IA le plus transparent et engageant
2. **Engagement Utilisateur**: Augmenter le temps d'utilisation et la compréhension du raisonnement IA de 40%
3. **Impact Apprentissage**: 8/10 développeurs peuvent expliquer le raisonnement IA grâce à la visualisation
4. **Viralité**: Interface suffisamment distinctive pour générer du partage social organique

## Success Metrics

- **Performance**: Maintenir 60fps avec 4 agents animés simultanément
- **Compréhension**: 80%+ utilisateurs comprennent quelle partie du code chaque agent analyse
- **Engagement**: 50%+ augmentation du taux d'acceptation des suggestions (grâce à la confiance accrue)
- **Esthétique**: 0 rapports "trop distrayant" (design zen respecte le flow)

## Architecture Impact

### Nouveaux Composants
```
src/
├── webview/
│   ├── components/
│   │   ├── agent-character-component.js      # NOUVEAU - Personnages SVG animés
│   │   ├── agent-interaction-manager.js      # NOUVEAU - Traits d'encre inter-agents
│   │   ├── agent-fusion-manager.js           # NOUVEAU - Fusion collective Enso
│   │   └── agent-animation-library.js        # NOUVEAU - Bibliothèque animations
│   └── animations/
│       └── sumi-e-characters.svg             # NOUVEAU - Assets SVG personnages
├── ui/
│   ├── agent-positioning.ts                  # NOUVEAU - Calcul position/ancrage code
│   └── agent-pathfinding.ts                  # NOUVEAU - Évitement collisions
└── agents/
    └── shared/
        └── agent-visual-state.interface.ts   # NOUVEAU - État visuel étendu
```

### Composants Modifiés
- `spatial-manager.ts`: Extension pour ancrage ligne de code
- `extension-state-manager.ts`: Ajout état visuel agents (position, cible, animation)
- `agent-component.js`: Migration vers `AgentCharacterComponent`

## Technical Challenges

1. **Performance 60fps**: Animations GPU-accelerated avec requestAnimationFrame
2. **Ancrage Dynamique**: Synchronisation position agent ↔ lignes code pendant scroll
3. **Collision Detection**: Anti-collision entre agents + zones code dense
4. **Responsive Design**: Adaptation taille personnages selon viewport

## Dependencies

- ✅ Architecture actuelle (Orchestrator, 4 agents, State Manager)
- ✅ SpatialManager existant
- ✅ Webview infrastructure
- ⚠️ Bibliothèque animation (anime.js ou GSAP) - À installer
- ⚠️ Assets SVG personnages sumi-e - À créer

---

# Sprint Breakdown

## 🎯 Sprint 1-2: Fondations - Personnages SVG et Ancrage Code

### Story 11.1: Créer les Assets SVG Sumi-e pour les 4 Agents
**Points:** 5 | **Priority:** CRITICAL

**Description:**
Créer des personnages minimalistes en traits de pinceau japonais (2-5 traits max) pour chaque agent, respectant l'esthétique sumi-e et la philosophie wabi-sabi.

**Acceptance Criteria:**
- [ ] 4 fichiers SVG créés (`architect.svg`, `coder.svg`, `reviewer.svg`, `context.svg`)
- [ ] Chaque personnage = 2-5 traits de pinceau maximum
- [ ] Palette monochrome (noir encre) + accent vermillon stratégique
- [ ] ViewBox 100x100 pour scalabilité
- [ ] Classes CSS pour états (idle, thinking, working, success, alert)
- [ ] Validation design avec esthétique sumi-e authentique

**Design Specs:**
```svg
<!-- Architect - Silhouette avec règle en T -->
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50,20 Q45,50 50,80" stroke="var(--ink-black)" stroke-width="3"/>
  <path d="M35,45 L65,45" stroke="var(--ink-black)" stroke-width="2"/>
  <circle cx="50" cy="15" r="8" fill="var(--ink-black)"/>
</svg>

<!-- Coder - Développeur penché sur clavier -->
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50,15 L50,45 Q55,60 65,65" stroke="var(--ink-black)" stroke-width="3"/>
  <path d="M35,65 L65,65" stroke="var(--ink-black)" stroke-width="2"/>
  <circle cx="50" cy="12" r="7" fill="var(--ink-black)"/>
  <path d="M45,55 L55,55" stroke="var(--vermillion-red)" stroke-width="1"/>
</svg>

<!-- Reviewer - Gardien avec bouclier -->
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50,20 L50,75" stroke="var(--ink-black)" stroke-width="3"/>
  <path d="M35,30 Q50,25 65,30 L50,55 Z" fill="var(--ink-black)" opacity="0.8"/>
  <circle cx="50" cy="15" r="7" fill="var(--ink-black)"/>
</svg>

<!-- Context - Observateur avec loupe -->
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="15" r="7" fill="var(--ink-black)"/>
  <path d="M50,22 L50,60" stroke="var(--ink-black)" stroke-width="3"/>
  <circle cx="50" cy="50" r="15" stroke="var(--ink-black)" stroke-width="2" fill="none"/>
  <path d="M62,62 L72,72" stroke="var(--ink-black)" stroke-width="3"/>
</svg>
```

**Technical Notes:**
- Utiliser CSS custom properties pour couleurs thémables
- Stroke-linecap="round" pour effet pinceau authentique
- Animations CSS pour états (pas dans SVG statique)

---

### Story 11.2: Implémenter AgentPositioning - Ancrage au Code
**Points:** 8 | **Priority:** CRITICAL

**Description:**
Créer le système qui permet aux agents de se positionner et s'ancrer aux lignes de code qu'ils analysent, avec calcul de position basé sur la géométrie de l'éditeur.

**Acceptance Criteria:**
- [ ] Classe `AgentPositioning` créée dans `src/ui/agent-positioning.ts`
- [ ] Méthode `getAgentPosition(lineNumber, totalLines, editorBounds)` retourne {x, y}
- [ ] Position Y calculée relativement à la ligne cible (0-100% de la hauteur éditeur)
- [ ] Position X par défaut par agent:
  - Context: marge gauche (-60px)
  - Architect: marge gauche étendue (-120px)
  - Coder: marge droite (+20px du bord)
  - Reviewer: marge droite étendue (+80px du bord)
- [ ] Gestion des cas edge (ligne hors viewport, éditeur minimisé)
- [ ] Tests unitaires: 5+ scénarios (ligne début/milieu/fin, viewport scroll, multi-éditeurs)

**Implementation:**
```typescript
// src/ui/agent-positioning.ts
export interface AgentPosition {
  x: number;
  y: number;
  anchorLine: number;
  relativeY: number; // 0-1
}

export interface EditorBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

export class AgentPositioning {
  private static readonly MARGIN_OFFSETS = {
    context: -60,
    architect: -120,
    coder: (bounds: EditorBounds) => bounds.width + 20,
    reviewer: (bounds: EditorBounds) => bounds.width + 80
  };

  /**
   * Calcule la position absolue d'un agent pour s'ancrer à une ligne de code
   */
  static getAgentPosition(
    agentType: AgentType,
    lineNumber: number,
    totalLines: number,
    editorBounds: EditorBounds
  ): AgentPosition {
    // Clamp line number
    const clampedLine = Math.max(0, Math.min(lineNumber, totalLines - 1));

    // Calculate relative Y (0-1)
    const relativeY = totalLines > 0 ? clampedLine / totalLines : 0;

    // Calculate absolute Y position
    const y = editorBounds.top + (editorBounds.height * relativeY);

    // Calculate X position based on agent type
    const offsetFn = this.MARGIN_OFFSETS[agentType];
    const x = typeof offsetFn === 'function'
      ? offsetFn(editorBounds)
      : editorBounds.left + offsetFn;

    return {
      x,
      y,
      anchorLine: clampedLine,
      relativeY
    };
  }

  /**
   * Vérifie si une ligne est visible dans le viewport actuel
   */
  static isLineVisible(
    lineNumber: number,
    visibleRanges: Array<{ start: number; end: number }>
  ): boolean {
    return visibleRanges.some(
      range => lineNumber >= range.start && lineNumber <= range.end
    );
  }

  /**
   * Trouve la ligne visible la plus proche d'une ligne cible
   */
  static findNearestVisibleLine(
    targetLine: number,
    visibleRanges: Array<{ start: number; end: number }>
  ): number {
    if (this.isLineVisible(targetLine, visibleRanges)) {
      return targetLine;
    }

    // Trouve le range le plus proche
    let nearestLine = targetLine;
    let minDistance = Infinity;

    visibleRanges.forEach(range => {
      const distanceToStart = Math.abs(targetLine - range.start);
      const distanceToEnd = Math.abs(targetLine - range.end);

      if (distanceToStart < minDistance) {
        minDistance = distanceToStart;
        nearestLine = range.start;
      }
      if (distanceToEnd < minDistance) {
        minDistance = distanceToEnd;
        nearestLine = range.end;
      }
    });

    return nearestLine;
  }
}
```

**Tests Required:**
```typescript
// src/ui/__tests__/agent-positioning.test.ts
describe('AgentPositioning', () => {
  it('positions architect at left margin (-120px)');
  it('positions coder at right margin (+20px from edge)');
  it('calculates Y position for line in middle of file (50%)');
  it('handles edge case: line 0');
  it('handles edge case: last line');
  it('clamps line number to valid range');
  it('finds nearest visible line when target is scrolled out');
});
```

---

### Story 11.3: Étendre SpatialManager pour Ancrage Ligne
**Points:** 5 | **Priority:** CRITICAL

**Description:**
Étendre le `SpatialManager` existant pour permettre aux agents de s'ancrer dynamiquement à des lignes de code spécifiques et maintenir cette ancrage pendant le scroll.

**Acceptance Criteria:**
- [ ] Méthode `attachAgentToLine(agentId, lineNumber)` implémentée
- [ ] Méthode `detachAgent(agentId)` implémentée
- [ ] Méthode `getEditorBounds()` retourne dimensions éditeur actif
- [ ] Synchronisation automatique lors du scroll (onDidChangeTextEditorVisibleRanges)
- [ ] Synchronisation automatique lors du resize éditeur
- [ ] postMessage vers webview avec nouvelle position agent
- [ ] Tests: ancrage + scroll + resize

**Implementation:**
```typescript
// src/ui/spatial-manager.ts (EXTENSION)
import { AgentPositioning, AgentPosition } from './agent-positioning.js';

export class SpatialManager {
  private agentAnchors: Map<string, number> = new Map(); // agentId -> lineNumber

  /**
   * Ancre un agent à une ligne de code spécifique
   */
  public attachAgentToLine(agentId: AgentType, lineNumber: number): void {
    this.agentAnchors.set(agentId, lineNumber);
    this.updateAgentPosition(agentId);
  }

  /**
   * Détache un agent (retour position par défaut)
   */
  public detachAgent(agentId: AgentType): void {
    this.agentAnchors.delete(agentId);
    this.updateAgentPosition(agentId);
  }

  /**
   * Calcule et envoie la nouvelle position d'un agent au webview
   */
  private updateAgentPosition(agentId: AgentType): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const anchorLine = this.agentAnchors.get(agentId);
    if (anchorLine === undefined) {
      // Position par défaut (hors écran ou position neutre)
      this.notifyWebview(agentId, null);
      return;
    }

    const bounds = this.getEditorBounds();
    const totalLines = editor.document.lineCount;

    const position = AgentPositioning.getAgentPosition(
      agentId,
      anchorLine,
      totalLines,
      bounds
    );

    // Vérifier si la ligne est visible
    const isVisible = AgentPositioning.isLineVisible(
      anchorLine,
      editor.visibleRanges.map(r => ({ start: r.start.line, end: r.end.line }))
    );

    this.notifyWebview(agentId, {
      ...position,
      isVisible
    });
  }

  /**
   * Obtenir les dimensions de l'éditeur actif
   */
  private getEditorBounds(): EditorBounds {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return { top: 0, left: 0, width: 800, height: 600 }; // Fallback
    }

    // Note: VSCode API ne donne pas directement les bounds
    // On utilise des estimations basées sur le viewport
    return {
      top: 0,
      left: 0,
      width: 1200, // Largeur typique éditeur
      height: 800  // Hauteur typique éditeur
      // TODO: Améliorer avec measurements réels via webview
    };
  }

  /**
   * Notifie le webview de la nouvelle position agent
   */
  private notifyWebview(agentId: AgentType, position: AgentPosition | null): void {
    ExtensionStateManager.getInstance().postMessageToWebview({
      type: 'toWebview:agentPositionUpdate',
      agentId,
      position
    });
  }

  /**
   * Re-synchroniser tous les agents ancrés (appelé lors scroll/resize)
   */
  private resyncAllAnchors(): void {
    this.agentAnchors.forEach((_, agentId) => {
      this.updateAgentPosition(agentId as AgentType);
    });
  }

  // OVERRIDE: Extension du listener de scroll existant
  private initializeListeners(): void {
    // ... code existant ...

    // Ajout: Re-sync positions lors du scroll
    this.disposables.push(
      vscode.window.onDidChangeTextEditorVisibleRanges(e => {
        this.syncCursorPosition(e.textEditor);
        this.resyncAllAnchors(); // NOUVEAU
      })
    );
  }
}
```

---

### Story 11.4: Créer AgentCharacterComponent avec Animations de Déplacement
**Points:** 13 | **Priority:** CRITICAL

**Description:**
Remplacer `AgentComponent` par `AgentCharacterComponent` qui utilise les SVG sumi-e et gère les animations fluides de déplacement entre positions.

**Acceptance Criteria:**
- [ ] Classe `AgentCharacterComponent` créée (étend `AgentComponent`)
- [ ] Chargement et rendu des SVG personnages
- [ ] Méthode `moveToPosition({x, y})` avec animation 800ms easeInOutQuad
- [ ] Méthode `moveToLine(lineNumber, totalLines)` utilisant `AgentPositioning`
- [ ] Animation d'entrée (slide-in depuis hors écran)
- [ ] Animation de sortie (fade-out)
- [ ] Gestion de l'état `moving` pendant transition
- [ ] Listener sur `toWebview:agentPositionUpdate` pour déclencher déplacement
- [ ] Performance 60fps validée (will-change, GPU acceleration)
- [ ] Tests: rendu, déplacement, états

**Implementation:**
```javascript
// src/webview/components/agent-character-component.js
import AgentComponent from './agent-component.js';

/**
 * AgentCharacterComponent - Personnage animé qui se déplace dans l'éditeur
 * Remplace les icônes emoji statiques par des SVG sumi-e animés
 */
class AgentCharacterComponent extends AgentComponent {
  constructor(agentId, initialState) {
    super(agentId, initialState);

    this.currentPosition = { x: 0, y: 0 };
    this.targetPosition = null;
    this.isMoving = false;
    this.animationController = null;
  }

  /**
   * Render SVG character instead of emoji
   */
  render(container) {
    this.element = document.createElement('div');
    this.element.id = `agent-${this.agentId}`;
    this.element.className = `agent-character ${this.state.status}`;
    this.element.dataset.agent = this.agentId;
    this.element.setAttribute('role', 'img');
    this.element.setAttribute('aria-label', `${this.labelMap[this.agentId]} Agent`);

    // Load SVG character
    this.loadCharacterSVG();

    // Position initiale hors écran (entrée animée)
    this.element.style.transform = 'translate(-200px, 100px)';
    this.element.style.opacity = '0';

    container.appendChild(this.element);
    this.attachEvents();

    // Entrée animée après un court délai
    requestAnimationFrame(() => {
      this.performEntryAnimation();
    });
  }

  /**
   * Charge le SVG personnage depuis les assets
   */
  async loadCharacterSVG() {
    // Pour l'instant, on utilise du SVG inline
    // TODO: Charger depuis fichiers externes si nécessaire
    const svgMap = {
      architect: `
        <svg viewBox="0 0 100 100" class="agent-svg">
          <path d="M50,20 Q45,50 50,80" stroke="currentColor" stroke-width="3" fill="none"/>
          <path d="M35,45 L65,45" stroke="currentColor" stroke-width="2"/>
          <circle cx="50" cy="15" r="8" fill="currentColor"/>
        </svg>
      `,
      coder: `
        <svg viewBox="0 0 100 100" class="agent-svg">
          <path d="M50,15 L50,45 Q55,60 65,65" stroke="currentColor" stroke-width="3" fill="none"/>
          <path d="M35,65 L65,65" stroke="currentColor" stroke-width="2"/>
          <circle cx="50" cy="12" r="7" fill="currentColor"/>
          <path d="M45,55 L55,55" stroke="var(--vermillion-red)" stroke-width="1"/>
        </svg>
      `,
      reviewer: `
        <svg viewBox="0 0 100 100" class="agent-svg">
          <path d="M50,20 L50,75" stroke="currentColor" stroke-width="3"/>
          <path d="M35,30 Q50,25 65,30 L50,55 Z" fill="currentColor" opacity="0.8"/>
          <circle cx="50" cy="15" r="7" fill="currentColor"/>
        </svg>
      `,
      context: `
        <svg viewBox="0 0 100 100" class="agent-svg">
          <circle cx="50" cy="15" r="7" fill="currentColor"/>
          <path d="M50,22 L50,60" stroke="currentColor" stroke-width="3"/>
          <circle cx="50" cy="50" r="15" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M62,62 L72,72" stroke="currentColor" stroke-width="3"/>
        </svg>
      `
    };

    this.element.innerHTML = svgMap[this.agentId] || svgMap.context;
  }

  /**
   * Animation d'entrée en scène
   */
  performEntryAnimation() {
    this.element.style.transition = 'transform 1200ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 800ms ease-out';
    this.element.style.transform = 'translate(0, 0)';
    this.element.style.opacity = '1';
  }

  /**
   * Déplace l'agent vers une position {x, y} avec animation fluide
   */
  moveToPosition(target) {
    if (!target || !this.element) return;

    this.targetPosition = target;
    this.isMoving = true;
    this.element.classList.add('moving');

    // Animation fluide avec transition CSS
    this.element.style.transition = 'transform 800ms cubic-bezier(0.4, 0.0, 0.2, 1)';
    this.element.style.transform = `translate(${target.x}px, ${target.y}px)`;

    // Cleanup après animation
    setTimeout(() => {
      this.isMoving = false;
      this.element.classList.remove('moving');
      this.currentPosition = { ...target };
    }, 800);
  }

  /**
   * Déplace l'agent vers une ligne de code spécifique
   */
  moveToLine(lineNumber, totalLines) {
    // Cette méthode sera appelée par le webview manager
    // quand il reçoit agentPositionUpdate du backend
    const position = {
      x: this.getDefaultXPosition(),
      y: (lineNumber / totalLines) * window.innerHeight
    };
    this.moveToPosition(position);
  }

  /**
   * Position X par défaut selon le type d'agent
   */
  getDefaultXPosition() {
    const positions = {
      context: -60,
      architect: -120,
      coder: window.innerWidth + 20,
      reviewer: window.innerWidth + 80
    };
    return positions[this.agentId] || 0;
  }

  /**
   * Override: Update avec gestion de la position
   */
  update(newState) {
    super.update(newState);

    // Si l'état contient une nouvelle position, s'y déplacer
    if (newState.position) {
      this.moveToPosition(newState.position);
    }

    // Mise à jour animation état
    this.updateStateAnimation(newState.status);
  }

  /**
   * Change l'animation selon l'état de l'agent
   */
  updateStateAnimation(status) {
    // Retirer toutes les classes d'état
    this.element.classList.remove('idle', 'thinking', 'working', 'success', 'alert', 'error');

    // Ajouter la classe d'état actuel
    this.element.classList.add(status);
  }

  /**
   * Override: Générer tooltip content avec position
   */
  generateTooltipContent() {
    const baseContent = super.generateTooltipContent();

    if (this.targetPosition && this.targetPosition.anchorLine !== undefined) {
      return baseContent + `
        <div class="tooltip__position">
          📍 Line ${this.targetPosition.anchorLine + 1}
        </div>
      `;
    }

    return baseContent;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.animationController) {
      this.animationController.cancel();
    }
    super.destroy?.();
  }
}

export default AgentCharacterComponent;
```

**CSS Animations:**
```css
/* src/webview/styles/components/agent-character.css */
.agent-character {
  position: fixed;
  width: 80px;
  height: 80px;
  pointer-events: all;
  cursor: pointer;
  z-index: 9999;

  /* Performance optimizations */
  will-change: transform;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.agent-svg {
  width: 100%;
  height: 100%;
  color: var(--ink-black);
}

/* État: Idle - Respiration douce */
.agent-character.idle .agent-svg {
  animation: agent-breathe 4s ease-in-out infinite;
}

@keyframes agent-breathe {
  0%, 100% {
    transform: scale(1) translateY(0);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05) translateY(-2px);
    opacity: 0.9;
  }
}

/* État: Thinking - Oscillation */
.agent-character.thinking .agent-svg {
  animation: agent-think 2s ease-in-out infinite;
}

@keyframes agent-think {
  0%, 100% { transform: rotate(-3deg); }
  25% { transform: rotate(3deg); }
  50% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

/* État: Working - Pulsation intense */
.agent-character.working .agent-svg {
  animation: agent-work 1s ease-in-out infinite;
  color: var(--vermillion-red);
}

@keyframes agent-work {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 transparent);
  }
  50% {
    transform: scale(1.15);
    filter: drop-shadow(0 0 10px var(--vermillion-red));
  }
}

/* État: Success - Lueur douce */
.agent-character.success .agent-svg {
  animation: agent-success 2s ease-out;
  color: var(--success-green, #50C878);
}

@keyframes agent-success {
  0% {
    transform: scale(1.3);
    filter: drop-shadow(0 0 15px var(--success-green));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 transparent);
  }
}

/* État: Alert/Error - Secousse */
.agent-character.alert .agent-svg,
.agent-character.error .agent-svg {
  animation: agent-alert 0.5s ease-in-out;
  color: var(--error-red, #FF6B6B);
}

@keyframes agent-alert {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Moving - Oscillation de marche */
.agent-character.moving .agent-svg {
  animation: agent-walk 800ms ease-in-out;
}

@keyframes agent-walk {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-3px) rotate(2deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(-3px) rotate(-2deg);
  }
}

/* Hover effects */
.agent-character:hover .agent-svg {
  transform: scale(1.1);
  transition: transform 200ms ease-out;
}

.agent-character:active .agent-svg {
  transform: scale(0.95);
}
```

**Tests:**
```javascript
// src/webview/components/__tests__/agent-character-component.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import AgentCharacterComponent from '../agent-character-component.js';

describe('AgentCharacterComponent', () => {
  let container;
  let agent;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    agent = new AgentCharacterComponent('coder', { status: 'idle' });
  });

  it('renders SVG character instead of emoji', () => {
    agent.render(container);
    const svg = container.querySelector('.agent-svg');
    expect(svg).toBeTruthy();
    expect(svg.tagName).toBe('svg');
  });

  it('performs entry animation on render', async () => {
    agent.render(container);
    expect(agent.element.style.opacity).toBe('0');

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(agent.element.style.opacity).toBe('1');
  });

  it('moves to position with animation', () => {
    agent.render(container);
    const target = { x: 100, y: 200 };

    agent.moveToPosition(target);

    expect(agent.isMoving).toBe(true);
    expect(agent.element.classList.contains('moving')).toBe(true);
    expect(agent.element.style.transform).toContain('100px');
    expect(agent.element.style.transform).toContain('200px');
  });

  it('updates state animation classes', () => {
    agent.render(container);

    agent.update({ status: 'thinking' });
    expect(agent.element.classList.contains('thinking')).toBe(true);

    agent.update({ status: 'working' });
    expect(agent.element.classList.contains('working')).toBe(true);
    expect(agent.element.classList.contains('thinking')).toBe(false);
  });

  it('moves to line number', () => {
    agent.render(container);
    agent.moveToLine(50, 100);

    expect(agent.targetPosition.y).toBeCloseTo(window.innerHeight * 0.5, 1);
  });
});
```

---

### Story 11.5: Intégrer AgentCharacterComponent dans WebviewManager
**Points:** 5 | **Priority:** HIGH

**Description:**
Remplacer l'utilisation de `AgentComponent` par `AgentCharacterComponent` dans le `WebviewManager` et gérer les messages `agentPositionUpdate`.

**Acceptance Criteria:**
- [ ] Import de `AgentCharacterComponent` au lieu de `AgentComponent`
- [ ] Listener sur `toWebview:agentPositionUpdate` implémenté
- [ ] Appel à `agent.moveToPosition()` quand position reçue
- [ ] Gestion des cas edge (agent non rendu, position null)
- [ ] Migration des 4 agents existants vers le nouveau composant
- [ ] Tests d'intégration: message → déplacement agent

**Implementation:**
```typescript
// src/webview/main.ts (ou webview-manager.js)
import AgentCharacterComponent from './components/agent-character-component.js';

class WebviewManager {
  private agents: Map<AgentType, AgentCharacterComponent> = new Map();

  initializeAgents() {
    const agentTypes: AgentType[] = ['context', 'architect', 'coder', 'reviewer'];
    const hudContainer = document.getElementById('agents-container');

    agentTypes.forEach(type => {
      const agent = new AgentCharacterComponent(type, {
        status: 'idle',
        currentTask: null,
        lastUpdate: Date.now()
      });

      agent.render(hudContainer);
      this.agents.set(type, agent);
    });
  }

  setupMessageListeners() {
    window.addEventListener('message', (event) => {
      const message = event.data;

      switch (message.type) {
        case 'toWebview:agentStateUpdate':
          this.handleAgentStateUpdate(message);
          break;

        case 'toWebview:agentPositionUpdate':
          this.handleAgentPositionUpdate(message);
          break;

        // ... autres handlers
      }
    });
  }

  handleAgentPositionUpdate(message) {
    const { agentId, position } = message;
    const agent = this.agents.get(agentId);

    if (!agent) {
      console.warn(`Agent ${agentId} not found for position update`);
      return;
    }

    if (position === null) {
      // Détachement - retour position par défaut
      agent.moveToPosition({
        x: agent.getDefaultXPosition(),
        y: 100 // Position neutre
      });
    } else {
      // Ancrage à la nouvelle position
      agent.moveToPosition(position);
    }
  }

  handleAgentStateUpdate(message) {
    const { agent: agentId, status, currentTask, lastUpdate } = message;
    const agent = this.agents.get(agentId);

    if (agent) {
      agent.update({
        status,
        currentTask,
        lastUpdate,
        // Position peut être incluse dans l'update
        position: message.position
      });
    }
  }
}
```

---

### Story 11.6: Tests d'Intégration End-to-End Sprint 1-2
**Points:** 8 | **Priority:** HIGH

**Description:**
Créer une suite de tests d'intégration qui valide le flow complet: Backend state → SpatialManager → Webview → Animation agent.

**Acceptance Criteria:**
- [ ] Test: Orchestrator active agent → Agent s'ancre à ligne cible
- [ ] Test: Scroll éditeur → Agents ancrés se re-positionnent
- [ ] Test: Changement fichier → Agents se désancrent
- [ ] Test: 4 agents simultanés → Pas de collision visuelle
- [ ] Test Performance: 60fps avec 4 agents animés
- [ ] Validation visuelle (screenshots/video si possible)

---

## 🎯 Sprint 3: Interactions Inter-Agents

### Story 11.7: Créer AgentInteractionManager - Traits d'Encre
**Points:** 13 | **Priority:** HIGH

**Description:**
Implémenter le système de visualisation des communications inter-agents avec des traits de pinceau animés (ink strokes) qui voyagent entre agents.

**Acceptance Criteria:**
- [ ] Classe `AgentInteractionManager` créée
- [ ] Méthode `drawInkStroke(fromAgent, toAgent, message)` crée SVG path animé
- [ ] Animation: stroke-dashoffset (trait se dessine progressivement)
- [ ] Durée 1200ms avec easing naturel
- [ ] Couleur vermillon pour interactions critiques, noir pour routines
- [ ] Auto-cleanup (SVG supprimé après animation)
- [ ] Support pour messages avec contenu (tooltip au survol du trait)
- [ ] Performance: max 3 traits simultanés
- [ ] Tests: création, animation, cleanup

**Implementation:**
```javascript
// src/webview/components/agent-interaction-manager.js
class AgentInteractionManager {
  constructor() {
    this.activeStrokes = new Set();
    this.maxSimultaneousStrokes = 3;
  }

  /**
   * Dessine un trait d'encre animé entre deux agents
   */
  drawInkStroke(fromAgent, toAgent, options = {}) {
    const {
      message = '',
      critical = false,
      duration = 1200,
      onComplete = null
    } = options;

    // Limite le nombre de traits simultanés (performance)
    if (this.activeStrokes.size >= this.maxSimultaneousStrokes) {
      console.warn('Max ink strokes reached, skipping');
      return;
    }

    // Récupère les positions actuelles des agents
    const fromPos = this.getAgentPosition(fromAgent);
    const toPos = this.getAgentPosition(toAgent);

    if (!fromPos || !toPos) return;

    // Crée le SVG overlay
    const svg = this.createStrokeSVG(fromPos, toPos, critical);
    const strokeId = `stroke-${Date.now()}-${Math.random()}`;
    svg.id = strokeId;

    document.body.appendChild(svg);
    this.activeStrokes.add(strokeId);

    // Anime le trait
    this.animateStroke(svg, duration, () => {
      svg.remove();
      this.activeStrokes.delete(strokeId);
      if (onComplete) onComplete();
    });

    // Tooltip si message présent
    if (message) {
      this.attachMessageTooltip(svg, message);
    }
  }

  /**
   * Crée le SVG path pour le trait d'encre
   */
  createStrokeSVG(from, to, critical) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('ink-stroke-overlay');
    svg.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;

    // Calcul du point de contrôle pour courbe quadratique
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    // Offset perpendiculaire pour courbe naturelle
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / distance * 30; // 30px de courbure
    const perpY = dx / distance * 30;

    const controlX = midX + perpX;
    const controlY = midY + perpY;

    // Path Bézier quadratique
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`);
    path.setAttribute('stroke', critical ? 'var(--vermillion-red)' : 'var(--ink-black)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.classList.add('ink-path');

    // Calculer la longueur totale du path pour stroke-dasharray
    svg.appendChild(path);
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    return svg;
  }

  /**
   * Anime le trait (dessin progressif)
   */
  animateStroke(svg, duration, onComplete) {
    const path = svg.querySelector('.ink-path');
    const pathLength = path.getTotalLength();

    // Animation: strokeDashoffset de pathLength à 0
    path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;

    requestAnimationFrame(() => {
      path.style.strokeDashoffset = '0';
    });

    // Fade out après 80% de l'animation
    setTimeout(() => {
      svg.style.transition = 'opacity 300ms ease-out';
      svg.style.opacity = '0';
    }, duration * 0.8);

    // Cleanup
    setTimeout(() => {
      onComplete();
    }, duration + 300);
  }

  /**
   * Attache un tooltip au trait pour afficher le message
   */
  attachMessageTooltip(svg, message) {
    svg.style.pointerEvents = 'all';
    svg.style.cursor = 'help';

    const tooltip = document.createElement('div');
    tooltip.className = 'ink-stroke-tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
      position: fixed;
      background: var(--tooltip-bg);
      color: var(--tooltip-text);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 200ms ease;
      z-index: 10000;
    `;
    document.body.appendChild(tooltip);

    svg.addEventListener('mouseenter', (e) => {
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 10}px`;
      tooltip.style.opacity = '1';
    });

    svg.addEventListener('mousemove', (e) => {
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 10}px`;
    });

    svg.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });

    // Cleanup tooltip avec le SVG
    const originalRemove = svg.remove.bind(svg);
    svg.remove = () => {
      tooltip.remove();
      originalRemove();
    };
  }

  /**
   * Récupère la position actuelle d'un agent
   */
  getAgentPosition(agentId) {
    const agentElement = document.querySelector(`[data-agent="${agentId}"]`);
    if (!agentElement) return null;

    const rect = agentElement.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  /**
   * Singleton
   */
  static getInstance() {
    if (!AgentInteractionManager.instance) {
      AgentInteractionManager.instance = new AgentInteractionManager();
    }
    return AgentInteractionManager.instance;
  }
}

export default AgentInteractionManager;
```

**CSS:**
```css
/* src/webview/styles/components/ink-strokes.css */
.ink-stroke-overlay {
  filter: url(#ink-texture); /* Optionnel: filtre SVG pour effet encre */
}

.ink-path {
  opacity: 0.8;
}

.ink-stroke-tooltip {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}
```

---

### Story 11.8: Intégrer Visualisation dans AgentOrchestrator
**Points:** 8 | **Priority:** HIGH

**Description:**
Modifier `AgentOrchestrator` pour déclencher la visualisation des interactions inter-agents pendant le processus de collaboration.

**Acceptance Criteria:**
- [ ] Méthode `visualizeAgentInteraction(from, to, message, critical)` ajoutée
- [ ] Appels insérés dans `processUserRequest()`:
  - Context → Architect ("Context loaded")
  - Architect → Coder ("Analysis ready")
  - Coder → Reviewer ("Code generated")
  - Reviewer → Orchestrator ("Review complete")
- [ ] postMessage vers webview pour déclencher animation
- [ ] Listener dans webview qui appelle `AgentInteractionManager.drawInkStroke()`
- [ ] Tests: chaque étape du flow génère visualisation
- [ ] Performance: pas d'impact sur temps de traitement (async)

**Implementation:**
```typescript
// src/agents/orchestrator.ts (MODIFICATION)
export class AgentOrchestrator {
  /**
   * Visualise une interaction entre deux agents
   */
  private visualizeAgentInteraction(
    fromAgent: AgentType,
    toAgent: AgentType,
    message: string,
    critical: boolean = false
  ): void {
    // Envoie au webview pour visualisation
    ExtensionStateManager.getInstance().postMessageToWebview({
      type: 'toWebview:agentInteraction',
      from: fromAgent,
      to: toAgent,
      message,
      critical,
      timestamp: Date.now()
    });
  }

  /**
   * OVERRIDE: Ajouter visualisations au processus
   */
  async processUserRequest(prompt: string): Promise<IAgentResponse> {
    ErrorHandler.log(`Processing user request: ${prompt}`);

    try {
      // 1. Context Agent - Load relevant files
      this.visualizeAgentInteraction('context', 'architect',
        'Loading context files...', false);
      const contextResponse = await this.runAgent('context', { prompt });
      let currentContext = contextResponse.result;

      // 2. Architect Agent
      let architectReasoning = '';
      let projectArchitecture;

      const architectAgent = this.getAgent('architect');
      if (architectAgent) {
        if (typeof (architectAgent as any).analyzeProject === 'function') {
          projectArchitecture = await (architectAgent as any).analyzeProject();
        }

        if (this.shouldInvolveArchitect(prompt)) {
          this.visualizeAgentInteraction('architect', 'coder',
            'Architecture analysis complete', true);
          const architectResponse = await this.runAgent('architect', {
            prompt,
            context: currentContext
          });
          currentContext += `\n\nArchitectural Analysis:\n${architectResponse.result}`;
          architectReasoning = architectResponse.reasoning;
        }
      }

      // 3. Coder Agent
      this.visualizeAgentInteraction('coder', 'reviewer',
        'Code generation complete', true);
      const coderResponse = await this.runAgent('coder', {
        prompt,
        context: currentContext,
        data: { architecture: projectArchitecture }
      });

      // 4. Reviewer Agent
      const reviewerResponse = await this.runAgent('reviewer', {
        prompt: `Review this code: ${coderResponse.result}`,
        context: currentContext
      });

      this.visualizeAgentInteraction('reviewer', 'context',
        'Review complete - updating context', false);

      // 5. Synthesize
      return this.synthesizeResponse(coderResponse, reviewerResponse, architectReasoning, prompt);

    } catch (error: any) {
      ErrorHandler.handleError(error);
      throw error;
    }
  }
}
```

**Webview Listener:**
```javascript
// src/webview/main.ts (ajout dans setupMessageListeners)
case 'toWebview:agentInteraction':
  this.handleAgentInteraction(message);
  break;

// ...

handleAgentInteraction(message) {
  const { from, to, message: text, critical } = message;

  AgentInteractionManager.getInstance().drawInkStroke(
    from,
    to,
    {
      message: text,
      critical,
      duration: critical ? 1500 : 1200
    }
  );
}
```

---

### Story 11.9: États Visuels Enrichis (Idle/Thinking/Working)
**Points:** 5 | **Priority:** MEDIUM

**Description:**
Améliorer les animations d'états pour rendre chaque agent plus expressif et communiquer visuellement son activité.

**Acceptance Criteria:**
- [ ] Animation `idle`: Respiration douce (4s cycle)
- [ ] Animation `thinking`: Oscillation légère (2s cycle)
- [ ] Animation `working`: Pulsation intense avec glow vermillon (1s cycle)
- [ ] Animation `success`: Flash vert avec expansion (2s one-time)
- [ ] Animation `alert/error`: Secousse rouge (0.5s one-time)
- [ ] Transitions fluides entre états
- [ ] Tests visuels: chaque état vérifié
- [ ] Performance: 60fps maintenu

(Déjà implémenté en grande partie dans Story 11.4, ici on affine et teste)

---

## 🎯 Sprint 4: Fusion Collective Enso

### Story 11.10: Créer AgentFusionManager - Forme Collective
**Points:** 13 | **Priority:** MEDIUM

**Description:**
Implémenter le système de fusion visuelle des 4 agents en une forme unifiée (Enso) lors de collaboration intense, avec mini-dashboard intégré.

**Acceptance Criteria:**
- [ ] Classe `AgentFusionManager` créée
- [ ] Méthode `triggerFusion(agents)` déplace agents vers centre
- [ ] Méthode `renderEnsoForm(center, metadata)` affiche cercle Enso
- [ ] Mini-dashboard intégré dans Enso:
  - Tokens utilisés
  - État collaboration
  - Agents actifs (icônes miniatures)
- [ ] Animation de fusion: 1000ms vers centre avec scale 0.8
- [ ] Méthode `releaseFusion()` retour positions originales
- [ ] Gestion état fusionné vs non-fusionné
- [ ] Tests: fusion, Enso render, défusion

**Implementation:**
```javascript
// src/webview/components/agent-fusion-manager.js
class AgentFusionManager {
  constructor() {
    this.isFused = false;
    this.fusedAgents = [];
    this.ensoElement = null;
    this.originalPositions = new Map();
  }

  /**
   * Déclenche la fusion des agents au centre de l'écran
   */
  triggerFusion(agents, metadata = {}) {
    if (this.isFused) return; // Déjà fusionné

    this.fusedAgents = agents;
    this.isFused = true;

    // Sauvegarder positions originales
    agents.forEach(agent => {
      this.originalPositions.set(agent.agentId, {
        x: agent.currentPosition.x,
        y: agent.currentPosition.y
      });
    });

    // Calculer point central
    const centerPoint = this.calculateScreenCenter();

    // Déplacer tous les agents vers le centre avec animation
    agents.forEach((agent, index) => {
      const angleOffset = (Math.PI * 2 / agents.length) * index;
      const orbitRadius = 50; // Distance du centre

      const targetX = centerPoint.x + Math.cos(angleOffset) * orbitRadius;
      const targetY = centerPoint.y + Math.sin(angleOffset) * orbitRadius;

      // Animation de convergence
      agent.element.style.transition = 'transform 1000ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 800ms ease';
      agent.element.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.7)`;
      agent.element.style.opacity = '0.6';
      agent.element.classList.add('fused');
    });

    // Afficher la forme Enso après 500ms (agents en route)
    setTimeout(() => {
      this.renderEnsoForm(centerPoint, metadata);
    }, 500);
  }

  /**
   * Libère la fusion - retour positions originales
   */
  releaseFusion() {
    if (!this.isFused) return;

    this.isFused = false;

    // Retirer l'Enso
    if (this.ensoElement) {
      this.ensoElement.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
      this.ensoElement.style.opacity = '0';
      this.ensoElement.style.transform = 'scale(0.8)';

      setTimeout(() => {
        this.ensoElement?.remove();
        this.ensoElement = null;
      }, 400);
    }

    // Retourner agents à positions originales
    this.fusedAgents.forEach(agent => {
      const original = this.originalPositions.get(agent.agentId);
      if (original) {
        agent.element.style.transition = 'transform 1000ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 800ms ease';
        agent.element.style.transform = `translate(${original.x}px, ${original.y}px) scale(1)`;
        agent.element.style.opacity = '1';
        agent.element.classList.remove('fused');
      }
    });

    this.fusedAgents = [];
    this.originalPositions.clear();
  }

  /**
   * Affiche la forme Enso collective au centre
   */
  renderEnsoForm(center, metadata) {
    const {
      tokens = 0,
      status = 'collaborating',
      agents = [],
      message = 'Deep collaboration...'
    } = metadata;

    // Créer conteneur Enso
    this.ensoElement = document.createElement('div');
    this.ensoElement.className = 'fusion-enso';
    this.ensoElement.style.cssText = `
      position: fixed;
      left: ${center.x}px;
      top: ${center.y}px;
      transform: translate(-50%, -50%) scale(0);
      pointer-events: all;
      cursor: pointer;
      z-index: 9997;
    `;

    // SVG Enso avec dashboard
    this.ensoElement.innerHTML = `
      <svg class="enso-circle" viewBox="0 0 200 200" width="200" height="200">
        <!-- Cercle Enso incomplet (wabi-sabi) -->
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="var(--ink-black)"
          stroke-width="4"
          stroke-dasharray="480 20"
          fill="none"
          class="enso-path"
        />

        <!-- Mini-dashboard au centre -->
        <g class="enso-dashboard">
          <!-- Tokens -->
          <text x="100" y="85" text-anchor="middle" class="enso-tokens">
            ${tokens} tokens
          </text>

          <!-- Status -->
          <text x="100" y="105" text-anchor="middle" class="enso-status">
            ${status}
          </text>

          <!-- Agents actifs (icônes miniatures) -->
          <g class="enso-agents" transform="translate(100, 125)">
            ${this.renderAgentIcons(agents)}
          </g>
        </g>

        <!-- Effet de rotation douce -->
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 100 100"
          to="360 100 100"
          dur="60s"
          repeatCount="indefinite"
        />
      </svg>

      <!-- Tooltip message -->
      <div class="enso-message">${message}</div>
    `;

    document.body.appendChild(this.ensoElement);

    // Animation d'apparition
    requestAnimationFrame(() => {
      this.ensoElement.style.transition = 'transform 800ms cubic-bezier(0.4, 0.0, 0.2, 1)';
      this.ensoElement.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // Effet de pulsation
    this.startEnsoBreathing();

    // Click pour défuser
    this.ensoElement.addEventListener('click', () => {
      this.releaseFusion();
    });
  }

  /**
   * Génère les icônes miniatures des agents actifs
   */
  renderAgentIcons(agents) {
    const iconMap = {
      context: '🔍',
      architect: '🏗️',
      coder: '💻',
      reviewer: '🛡️'
    };

    return agents.map((agentId, index) => {
      const x = (index - agents.length / 2) * 20;
      return `
        <text x="${x}" y="0" text-anchor="middle" font-size="14" opacity="0.8">
          ${iconMap[agentId] || '🤖'}
        </text>
      `;
    }).join('');
  }

  /**
   * Animation de respiration de l'Enso
   */
  startEnsoBreathing() {
    const circle = this.ensoElement?.querySelector('.enso-path');
    if (!circle) return;

    circle.style.animation = 'enso-breathe 4s ease-in-out infinite';
  }

  /**
   * Calcule le centre de l'écran
   */
  calculateScreenCenter() {
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  }

  /**
   * Singleton
   */
  static getInstance() {
    if (!AgentFusionManager.instance) {
      AgentFusionManager.instance = new AgentFusionManager();
    }
    return AgentFusionManager.instance;
  }
}

export default AgentFusionManager;
```

**CSS:**
```css
/* src/webview/styles/components/fusion-enso.css */
.fusion-enso {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.enso-circle {
  filter: drop-shadow(0 0 8px var(--ink-black));
}

.enso-path {
  stroke-linecap: round;
}

@keyframes enso-breathe {
  0%, 100% {
    stroke-width: 4;
    opacity: 0.9;
  }
  50% {
    stroke-width: 5;
    opacity: 1;
  }
}

.enso-tokens {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  fill: var(--ink-black);
  font-weight: bold;
}

.enso-status {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  fill: var(--ink-black);
  opacity: 0.7;
}

.enso-message {
  position: absolute;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 200ms ease;
}

.fusion-enso:hover .enso-message {
  opacity: 1;
}

/* Agent fusionné - état réduit */
.agent-character.fused {
  pointer-events: none;
}
```

---

### Story 11.11: Intégrer Logique de Fusion dans Orchestrator
**Points:** 8 | **Priority:** MEDIUM

**Description:**
Ajouter la logique qui détecte quand déclencher/relâcher la fusion collective basée sur l'intensité de collaboration.

**Acceptance Criteria:**
- [ ] Méthode `shouldTriggerFusion()` détecte collaboration intense:
  - 3+ agents actifs simultanément
  - Tâche complexe (architectural changes + code gen + review)
  - Durée estimée >5s
- [ ] Appel à `AgentFusionManager.triggerFusion()` via postMessage
- [ ] Relâche fusion quand collaboration terminée
- [ ] Metadata transmis: tokens, agents actifs, message contextuel
- [ ] Tests: fusion déclenchée dans scénarios appropriés
- [ ] Tests: pas de fusion pour tâches simples

---

### Story 11.12: Tests d'Intégration Sprint 4
**Points:** 5 | **Priority:** MEDIUM

**Description:**
Valider le flow complet de fusion: détection → animation → Enso → défusion.

**Acceptance Criteria:**
- [ ] Test: Collaboration intense → Fusion déclenchée
- [ ] Test: Agents convergent vers centre
- [ ] Test: Enso affiché avec dashboard correct
- [ ] Test: Click Enso → Défusion
- [ ] Test: Fin collaboration → Défusion automatique
- [ ] Performance: 60fps pendant fusion/défusion

---

## 🎯 Sprint 5: Polish & Optimisations

### Story 11.13: Pathfinding Intelligent (Anti-Collision Avancé)
**Points:** 13 | **Priority:** LOW

**Description:**
Implémenter un système de pathfinding pour que les agents évitent intelligemment les zones de code dense et les autres agents.

**Acceptance Criteria:**
- [ ] Classe `AgentPathfinding` avec A* simplifié
- [ ] Méthode `getCodeDensityMap()` analyse densité code par ligne
- [ ] Agents évitent zones >70% de densité lors déplacement
- [ ] Agents évitent collision avec autres agents (distance min 100px)
- [ ] Paths lissés avec courbes Bézier
- [ ] Performance: calcul path <16ms (1 frame)
- [ ] Tests: évitement zones denses, collision évitée

(Cette story est optionnelle - peut être reportée si temps manque)

---

### Story 11.14: Micro-Animations de Personnalité
**Points:** 8 | **Priority:** LOW

**Description:**
Ajouter des micro-animations subtiles qui donnent plus de personnalité aux agents.

**Acceptance Criteria:**
- [ ] Idle prolongé (>30s) → Agent "s'endort" (opacity réduite, plus de mouvement)
- [ ] Premier succès de session → Agent "célèbre" (jump animation)
- [ ] Erreur après succès → Agent "découragé" (slump)
- [ ] Multi-succès rapides → Agent "confiant" (posture plus droite)
- [ ] Animations déclenchées selon contexte
- [ ] Désactivable via setting `suika.animations.personality`
- [ ] Tests: chaque animation vérifiée

---

### Story 11.15: Easter Eggs & Délices
**Points:** 5 | **Priority:** LOW

**Description:**
Ajouter des petits easter eggs amusants qui renforcent la connexion utilisateur-agents.

**Ideas:**
- [ ] Agent "salue" le dev au premier lancement de journée
- [ ] Agents "applaudissent" ensemble après grosse refacto réussie
- [ ] Coder et Reviewer "disputent" visuellement si désaccord (oscillation face-à-face)
- [ ] Context "dort" si pas utilisé pendant 1h
- [ ] Double-click agent → Animation spéciale + message encourageant

---

### Story 11.16: Optimisations Performance Finales
**Points:** 8 | **Priority:** HIGH

**Description:**
Audit complet et optimisations pour garantir 60fps avec toutes les features activées.

**Acceptance Criteria:**
- [ ] Profiling Chrome DevTools: identifier bottlenecks
- [ ] Animations GPU-accelerated (transform3d, will-change)
- [ ] Throttling des events scroll/resize (max 60fps)
- [ ] Lazy loading des SVG si hors viewport
- [ ] Object pooling pour ink strokes
- [ ] Tests performance: 60fps avec 4 agents + 3 strokes + fusion
- [ ] Benchmark: <5% CPU idle, <10% CPU actif

---

### Story 11.17: Documentation Vidéo & Tutoriel
**Points:** 5 | **Priority:** MEDIUM

**Description:**
Créer documentation visuelle expliquant les nouveaux comportements des agents.

**Deliverables:**
- [ ] GIF animé: Agent s'ancrant au code
- [ ] GIF animé: Interaction inter-agents (ink stroke)
- [ ] GIF animé: Fusion collective Enso
- [ ] Section README.md mise à jour
- [ ] Changelog détaillé Epic 11
- [ ] Video démo 2min (optionnel)

---

## Success Metrics - Epic 11

**Performance:**
- ✅ 60fps maintenu avec 4 agents animés
- ✅ <16ms calcul pathfinding
- ✅ <5% CPU idle, <10% actif

**Engagement:**
- 🎯 80%+ utilisateurs comprennent quel code chaque agent analyse
- 🎯 50%+ augmentation acceptation suggestions (confiance accrue)
- 🎯 70%+ utilisateurs trouvent les animations "utiles" vs "distrayantes"

**Qualité:**
- ✅ 0 rapports "trop distrayant"
- ✅ 0 bugs critiques liés aux animations
- ✅ Compatibilité tous thèmes VSCode

---

## Technical Debt & Risks

**Risks Identifiés:**
1. **Performance**: Animations complexes peuvent impacter VSCode
   - Mitigation: GPU acceleration, throttling, profiling continu
2. **Complexité Visual**: Trop d'animations = confusion
   - Mitigation: User testing, settings pour réduire animations
3. **Scope Creep**: Features "cool" mais non-essentielles
   - Mitigation: Priorisation stricte, Sprint 5 optionnel

**Technical Debt:**
- Estimation bounds éditeur approximative (Story 11.2) - à améliorer via webview measurements
- Pathfinding A* simplifié - pourrait être amélioré avec worker thread
- SVG inline vs fichiers externes - migrer vers assets si performance nécessaire

---

## Dependencies & Blockers

**Dependencies:**
- ✅ Architecture actuelle stable (Orchestrator, State Manager)
- ⚠️ Bibliothèque animation (recommandation: utiliser CSS transitions natifs, éviter lib externe)
- ⚠️ Assets SVG personnages (besoin designer ou création interne)

**Potential Blockers:**
- Performance VSCode API (limitations accès bounds éditeur)
- Compatibilité tous thèmes VSCode (couleurs, contrastes)

---

## Rollout Plan

**Phase 1 (Sprint 1-2):** Beta interne
- Feature flag `suika.features.animatedAgents` (off par défaut)
- Testing avec early adopters
- Collecter feedback performance

**Phase 2 (Sprint 3-4):** Beta publique
- Feature flag on par défaut (opt-out)
- Annonce changelog, GIFs démo
- Monitoring métriques adoption

**Phase 3 (Sprint 5+):** GA
- Retrait feature flag (toujours actif)
- Optimisations basées feedback
- Documentation complète

---

## Conclusion

Cet Epic transforme Suika d'un "HUD statique avec agents" en un véritable **"Théâtre d'IA Transparent Vivant"** où les développeurs voient non seulement QUI travaille, mais aussi COMMENT, OÙ, et POURQUOI. Les personnages animés créent une connexion émotionnelle avec l'IA, rendant la collaboration intuitive et engageante.

**Impact Business:** Différenciation marché unique, viralité organique, adoption accrue
**Impact Utilisateur:** Compréhension 8/10, confiance +50%, apprentissage continu
**Impact Technique:** Architecture extensible, performance 60fps, qualité AAA

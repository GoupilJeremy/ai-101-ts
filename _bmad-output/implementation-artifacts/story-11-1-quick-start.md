# Story 11.1 : Quick Start - Créer les Assets SVG Sumi-e

**Status:** 🟢 READY TO START
**Estimation:** 2-4 heures
**Priorité:** 🔴 CRITICAL

---

## 📋 Objectif

Créer 4 personnages minimalistes en traits de pinceau japonais (style sumi-e) pour représenter vos agents IA. Chaque personnage doit avoir **2-5 traits maximum** et capturer l'essence de son rôle.

---

## 🎨 Spécifications de Design

### Philosophie Sumi-e (墨絵)
- **Minimalisme Extrême:** Chaque trait doit compter
- **Asymétrie Naturelle:** Pas de symétrie parfaite (wabi-sabi)
- **Espace Négatif (Ma):** Le vide est aussi important que le plein
- **Un Seul Coup:** Traits fluides, pas de retouches

### Contraintes Techniques
- **Format:** SVG inline
- **ViewBox:** `0 0 100 100` (scalable)
- **Couleurs:** CSS variables (`var(--ink-black)`, `var(--vermillion-red)`)
- **Stroke:** `stroke-linecap="round"` pour effet pinceau
- **Traits Max:** 2-5 par personnage

---

## 🚀 Création Rapide (Copy-Paste Ready)

### Étape 1 : Créer le Dossier

```bash
cd /home/jeregoupix/dev/suika
mkdir -p src/webview/animations
cd src/webview/animations
```

### Étape 2 : Créer architect.svg

```bash
cat > architect.svg << 'EOF'
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Tête -->
  <circle cx="50" cy="15" r="8" fill="var(--ink-black, #2C3E50)"/>

  <!-- Corps + posture pensante -->
  <path
    d="M50,23 Q45,50 50,80"
    stroke="var(--ink-black, #2C3E50)"
    stroke-width="3"
    stroke-linecap="round"
    fill="none"
  />

  <!-- Règle en T (outil architecte) -->
  <path
    d="M35,45 L65,45"
    stroke="var(--ink-black, #2C3E50)"
    stroke-width="2"
    stroke-linecap="round"
  />

  <!-- Accent vermillon subtil (vision) -->
  <circle
    cx="50"
    cy="15"
    r="2"
    fill="var(--vermillion-red, #E74C3C)"
    opacity="0.6"
  />
</svg>
EOF
```

### Étape 3 : Créer coder.svg

```bash
cat > coder.svg << 'EOF'
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Tête -->
  <circle cx="50" cy="12" r="7" fill="var(--ink-black, #2C3E50)"/>

  <!-- Corps penché (concentration) -->
  <path
    d="M50,19 L50,45 Q55,60 65,65"
    stroke="var(--ink-black, #2C3E50)"
    stroke-width="3"
    stroke-linecap="round"
    fill="none"
  />

  <!-- Clavier/base -->
  <path
    d="M35,65 L70,65"
    stroke="var(--ink-black, #2C3E50)"
    stroke-width="2"
    stroke-linecap="round"
  />

  <!-- Accent vermillon (ligne de code active) -->
  <path
    d="M45,55 L60,55"
    stroke="var(--vermillion-red, #E74C3C)"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</svg>
EOF
```

### Étape 4 : Créer reviewer.svg

```bash
cat > reviewer.svg << 'EOF'
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Tête -->
  <circle cx="50" cy="15" r="7" fill="var(--ink-black, #2C3E50)"/>

  <!-- Corps droit (gardien) -->
  <path
    d="M50,22 L50,75"
    stroke="var(--ink-black, #2C3E50)"
    stroke-width="3"
    stroke-linecap="round"
  />

  <!-- Bouclier (protection/validation) -->
  <path
    d="M35,30 Q50,25 65,30 L50,55 Z"
    fill="var(--ink-black, #2C3E50)"
    opacity="0.7"
  />

  <!-- Accent vigilance (oeil) -->
  <circle
    cx="50"
    cy="40"
    r="3"
    fill="var(--vermillion-red, #E74C3C)"
    opacity="0.5"
  />
</svg>
EOF
```

### Étape 5 : Créer context.svg

```bash
cat > context.svg << 'EOF'
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Tête -->
  <circle cx="50" cy="15" r="7" fill="var(--ink-black, #2C3E50)"/>

  <!-- Corps -->
  <path
    d="M50,22 L50,55"
    stroke="var(--ink-black, #2C3E50)"
    stroke-width="3"
    stroke-linecap="round"
  />

  <!-- Loupe (observation) -->
  <circle
    cx="50"
    cy="50"
    r="15"
    stroke="var(--ink-black, #2C3E50)"
    stroke-width="2"
    fill="none"
  />

  <!-- Manche loupe -->
  <path
    d="M62,62 L72,72"
    stroke="var(--ink-black, #2C3E50)"
    stroke-width="3"
    stroke-linecap="round"
  />

  <!-- Accent focus (point central loupe) -->
  <circle
    cx="50"
    cy="50"
    r="2"
    fill="var(--vermillion-red, #E74C3C)"
    opacity="0.6"
  />
</svg>
EOF
```

---

## ✅ Validation des Assets

### Test Visuel Rapide (HTML)

Créez un fichier de test :

```bash
cat > test-characters.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <style>
    :root {
      --ink-black: #2C3E50;
      --vermillion-red: #E74C3C;
    }
    body {
      display: flex;
      gap: 40px;
      padding: 40px;
      background: #f5f5f5;
    }
    .character-card {
      text-align: center;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    svg {
      width: 120px;
      height: 120px;
    }
    h3 {
      margin-top: 10px;
      font-family: 'Monaco', monospace;
      color: var(--ink-black);
    }
  </style>
</head>
<body>
  <div class="character-card">
    <svg viewBox="0 0 100 100">
      <!-- Copier contenu architect.svg ici -->
    </svg>
    <h3>🏗️ Architect</h3>
  </div>

  <div class="character-card">
    <svg viewBox="0 0 100 100">
      <!-- Copier contenu coder.svg ici -->
    </svg>
    <h3>💻 Coder</h3>
  </div>

  <div class="character-card">
    <svg viewBox="0 0 100 100">
      <!-- Copier contenu reviewer.svg ici -->
    </svg>
    <h3>🛡️ Reviewer</h3>
  </div>

  <div class="character-card">
    <svg viewBox="0 0 100 100">
      <!-- Copier contenu context.svg ici -->
    </svg>
    <h3>🔍 Context</h3>
  </div>
</body>
</html>
EOF

# Ouvrir dans navigateur
xdg-open test-characters.html  # Linux
# open test-characters.html    # macOS
```

### Checklist de Validation

- [ ] **Minimalisme:** Chaque personnage a 2-5 traits max ✓
- [ ] **Identifiable:** On reconnaît le rôle de chaque agent ✓
- [ ] **Cohérence:** Style uniforme entre les 4 personnages ✓
- [ ] **Scalabilité:** Lisible de 40px à 120px ✓
- [ ] **Esthétique Sumi-e:** Traits fluides, asymétrie naturelle ✓
- [ ] **CSS Variables:** Couleurs thémables ✓

---

## 🎨 Variantes Alternatives (Si Nécessaire)

### Version Minimaliste Extrême (2-3 traits)

Si vous voulez encore plus minimaliste :

```svg
<!-- Architect Ultra-Minimal -->
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="20" r="8" fill="var(--ink-black)"/>
  <path d="M50,28 L50,80" stroke="var(--ink-black)" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>

<!-- Coder Ultra-Minimal -->
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="20" r="8" fill="var(--ink-black)"/>
  <path d="M50,28 Q60,60 50,80" stroke="var(--ink-black)" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>
```

### Version Avec Plus de Détails (4-5 traits)

Si vous voulez plus d'expression :

```svg
<!-- Architect Détaillé -->
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="15" r="8" fill="var(--ink-black)"/>
  <path d="M50,23 Q45,50 50,80" stroke="var(--ink-black)" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M35,45 L65,45" stroke="var(--ink-black)" stroke-width="2" stroke-linecap="round"/>
  <path d="M45,45 L45,55" stroke="var(--ink-black)" stroke-width="1" opacity="0.5"/>
  <circle cx="50" cy="15" r="2" fill="var(--vermillion-red)" opacity="0.6"/>
</svg>
```

---

## 🔧 Intégration dans le Code (Aperçu)

Une fois les SVG créés, voici comment ils seront utilisés (ne pas implémenter maintenant, juste pour info) :

```javascript
// src/webview/components/agent-character-component.js (Story 11.4)
const AGENT_CHARACTERS = {
  architect: `<svg viewBox="0 0 100 100">...</svg>`,
  coder: `<svg viewBox="0 0 100 100">...</svg>`,
  reviewer: `<svg viewBox="0 0 100 100">...</svg>`,
  context: `<svg viewBox="0 0 100 100">...</svg>`
};
```

---

## 📝 Acceptance Criteria - Vérification Finale

Avant de passer à Story 11.2, vérifier :

- [x] **4 fichiers SVG créés** dans `src/webview/animations/`
  - [ ] `architect.svg`
  - [ ] `coder.svg`
  - [ ] `reviewer.svg`
  - [ ] `context.svg`

- [x] **Chaque personnage respect les contraintes :**
  - [ ] 2-5 traits de pinceau maximum
  - [ ] ViewBox 100x100
  - [ ] CSS variables pour couleurs
  - [ ] stroke-linecap="round"

- [x] **Esthétique sumi-e validée :**
  - [ ] Minimalisme extrême
  - [ ] Asymétrie naturelle
  - [ ] Traits fluides
  - [ ] Accent vermillon stratégique

- [x] **Test visuel effectué :**
  - [ ] Rendu HTML correct
  - [ ] Lisible à différentes tailles
  - [ ] Identifiable par rôle

---

## 🎉 Félicitations !

Une fois cette story terminée, vous aurez les fondations visuelles pour transformer vos agents en personnages vivants !

**Prochaine Story:** [11.2 - Implémenter AgentPositioning](./epic-11-agents-interactifs-animes.md#story-112)

---

## 💡 Astuces Pro

### Éditer les SVG Facilement

Si vous voulez modifier visuellement :

1. **VSCode avec extension SVG:**
   - Install : "SVG" by jock
   - Preview inline dans éditeur

2. **Inkscape (gratuit):**
   ```bash
   sudo apt install inkscape  # Linux
   # ou télécharger sur inkscape.org
   ```

3. **Figma (en ligne, gratuit):**
   - Créer sur figma.com
   - Export SVG → Optimiser code

### Optimiser le SVG

Si généré par outil graphique, nettoyer :

```bash
# Installer SVGO (optionnel)
npm install -g svgo

# Optimiser
svgo architect.svg -o architect.optimized.svg
```

### Inspiration Sumi-e

Recherchez "sumi-e characters minimalist" sur Google Images pour inspiration !

---

**Temps estimé total:** 2-4 heures (création + tests)
**Difficulté:** 🟢 Facile (design créatif, pas de code)

Bon courage ! 🎨✨

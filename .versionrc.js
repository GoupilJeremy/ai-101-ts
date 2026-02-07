module.exports = {
    "header": "# Changelog\n\nAll notable changes to this project will be documented in this file.",
    "types": [
        { "type": "feat", "section": "Added" },
        { "type": "fix", "section": "Fixed" },
        { "type": "chore", "section": "Chores" },
        { "type": "docs", "section": "Documentation" },
        { "type": "style", "section": "Styles" },
        { "type": "refactor", "section": "Refactor" },
        { "type": "perf", "section": "Performance" },
        { "type": "test", "section": "Tests" }
    ],
    "commitUrlFormat": "https://github.com/GoupilJeremy/ai-101-ts/commit/{{hash}}",
    "compareUrlFormat": "https://github.com/GoupilJeremy/ai-101-ts/compare/{{previousTag}}...{{currentTag}}",
    "issueUrlFormat": "https://github.com/GoupilJeremy/ai-101-ts/issues/{{id}}",
    "scripts": {
        "postchangelog": "ts-node scripts/generate-changelog.ts"
    }
};

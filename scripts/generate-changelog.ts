import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Custom changelog generator that adds contributor recognition.
 * This script is called by standard-version.
 */

function getContributors(): string[] {
    try {
        // Get all authors from git log, unique and sorted
        const output = execSync('git log --format="%aN (@%aN)"').toString();
        const authors = output.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return [...new Set(authors)].sort();
    } catch (error) {
        console.error('Error fetching contributors:', error);
        return [];
    }
}

function generateThankYou(contributors: string[]): string {
    if (contributors.length === 0) return '';

    let section = '\n## ❤️ Thank You\n\nWe would like to thank all the contributors who have helped make Suika better:\n\n';
    contributors.forEach(contributor => {
        section += `- ${contributor}\n`;
    });

    return section;
}

function updateChangelog() {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');

    if (!fs.existsSync(changelogPath)) {
        console.log('CHANGELOG.md not found, creating a new one...');
        fs.writeFileSync(changelogPath, '# Changelog\n\nAll notable changes to this project will be documented in this file.\n');
    }

    const contributors = getContributors();
    const thankYouSection = generateThankYou(contributors);

    // For now, we just append the thank you section if it's not already there
    // or update it. This is a simple implementation.
    // In a real scenario, we might want to use conventional-changelog-core
    // to perfectly integrate into the generation flow.

    let content = fs.readFileSync(changelogPath, 'utf8');

    // Remove existing Thank You section if it exists to replace it
    const thankYouRegex = /\n## ❤️ Thank You[\s\S]*$/;
    content = content.replace(thankYouRegex, '');

    content += thankYouSection;

    fs.writeFileSync(changelogPath, content);
    console.log('✅ Changelog updated with contributor recognition.');
}

updateChangelog();

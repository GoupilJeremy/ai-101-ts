/**
 * Documentation Validation Script
 * 
 * Validates that all public API exports have proper JSDoc documentation.
 * 
 * Usage: npx ts-node scripts/validate-docs.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
    file: string;
    errors: string[];
    warnings: string[];
}

interface ValidationSummary {
    totalFiles: number;
    filesWithErrors: number;
    totalErrors: number;
    totalWarnings: number;
    results: ValidationResult[];
}

const PUBLIC_API_FILES = [
    'src/api/extension-api.ts',
    'src/api/events.ts',
    'src/api/configuration-types.ts',
    'src/llm/provider.interface.ts',
    'src/ui/renderer.interface.ts',
];

const REQUIRED_JSDOC_TAGS = ['@since'];
const RECOMMENDED_JSDOC_TAGS = ['@example'];

function validateFile(filePath: string): ValidationResult {
    const result: ValidationResult = {
        file: filePath,
        errors: [],
        warnings: [],
    };

    if (!fs.existsSync(filePath)) {
        result.errors.push(`File not found: ${filePath}`);
        return result;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Find all export declarations
    const exportPattern = /export\s+(interface|type|class|function|const|enum)\s+(\w+)/g;
    let match: RegExpExecArray | null;

    while ((match = exportPattern.exec(content)) !== null) {
        const exportType = match[1];
        const exportName = match[2];
        const exportIndex = match.index;

        // Find the line number
        const textBefore = content.substring(0, exportIndex);
        const lineNumber = textBefore.split('\n').length;

        // Check for JSDoc comment before the export
        const linesBefore = lines.slice(Math.max(0, lineNumber - 20), lineNumber - 1);
        const hasJSDoc = linesBefore.some(line => line.trim().startsWith('/**'));

        if (!hasJSDoc) {
            result.errors.push(
                `Line ${lineNumber}: ${exportType} '${exportName}' is missing JSDoc documentation`
            );
        } else {
            // Find the JSDoc block
            let jsdocStart = -1;
            for (let i = linesBefore.length - 1; i >= 0; i--) {
                if (linesBefore[i].trim().startsWith('/**')) {
                    jsdocStart = i;
                    break;
                }
            }

            if (jsdocStart >= 0) {
                const jsdocLines = linesBefore.slice(jsdocStart).join('\n');

                // Check for required tags
                for (const tag of REQUIRED_JSDOC_TAGS) {
                    if (!jsdocLines.includes(tag)) {
                        result.errors.push(
                            `Line ${lineNumber}: ${exportType} '${exportName}' is missing required JSDoc tag '${tag}'`
                        );
                    }
                }

                // Check for recommended tags (warnings only)
                for (const tag of RECOMMENDED_JSDOC_TAGS) {
                    if (!jsdocLines.includes(tag)) {
                        result.warnings.push(
                            `Line ${lineNumber}: ${exportType} '${exportName}' is missing recommended JSDoc tag '${tag}'`
                        );
                    }
                }
            }
        }
    }

    return result;
}

function validateDocumentation(): ValidationSummary {
    const summary: ValidationSummary = {
        totalFiles: PUBLIC_API_FILES.length,
        filesWithErrors: 0,
        totalErrors: 0,
        totalWarnings: 0,
        results: [],
    };

    for (const file of PUBLIC_API_FILES) {
        const result = validateFile(file);
        summary.results.push(result);

        if (result.errors.length > 0) {
            summary.filesWithErrors++;
            summary.totalErrors += result.errors.length;
        }
        summary.totalWarnings += result.warnings.length;
    }

    return summary;
}

function printResults(summary: ValidationSummary): void {
    console.log('\n📚 Documentation Validation Report\n');
    console.log('='.repeat(60));

    for (const result of summary.results) {
        console.log(`\n📄 ${result.file}`);

        if (result.errors.length === 0 && result.warnings.length === 0) {
            console.log('   ✅ All exports properly documented');
        }

        for (const error of result.errors) {
            console.log(`   ❌ ${error}`);
        }

        for (const warning of result.warnings) {
            console.log(`   ⚠️  ${warning}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Files checked: ${summary.totalFiles}`);
    console.log(`   Files with errors: ${summary.filesWithErrors}`);
    console.log(`   Total errors: ${summary.totalErrors}`);
    console.log(`   Total warnings: ${summary.totalWarnings}`);

    if (summary.totalErrors > 0) {
        console.log('\n❌ Validation FAILED - Fix errors before publishing docs\n');
        process.exit(1);
    } else if (summary.totalWarnings > 0) {
        console.log('\n⚠️  Validation PASSED with warnings\n');
        process.exit(0);
    } else {
        console.log('\n✅ Validation PASSED - All documentation complete\n');
        process.exit(0);
    }
}

// Main execution
const summary = validateDocumentation();
printResults(summary);

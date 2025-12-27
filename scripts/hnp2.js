const fs = require('fs');
const crypto = require('crypto');

/**
 * HNP-2: Format-Aware Normalization Protocol
 * 
 * Markdown Normalization Rules:
 * 1. Normalize ATX heading syntax (consistent spacing)
 * 2. Normalize emphasis markers (consistent style)
 * 3. Normalize horizontal rules (consistent style)
 * 4. Normalize list markers (consistent style)
 * 5. Normalize link/image spacing
 * 6. Normalize code block fences
 * 
 * Then apply HNP-1 text normalization:
 * 1. Strip BOM
 * 2. Normalize Unicode to NFC
 * 3. Convert line endings to LF
 * 4. Remove trailing whitespace per line
 * 5. Normalize tabs to 4 spaces
 * 6. Remove leading blank lines
 * 7. Remove trailing blank lines
 * 8. Compress multiple blank lines to single
 * 9. Ensure single trailing newline
 * 10. Hash the result
 */

/**
 * Step 1: Markdown Normalization
 * Converts Markdown to canonical form while preserving structure
 */
function normalizeMarkdown(content) {
  let lines = content.split('\n');
  let normalized = [];
  
  for (let line of lines) {
    let processed = line;
    
    // 1. Normalize ATX headings: ensure single space after hash marks
    // Matches: #{1,6} followed by optional spaces, then content
    processed = processed.replace(/^(#{1,6})\s+(.+)$/, '$1 $2');
    processed = processed.replace(/^(#{1,6})([^\s#].*)$/, '$1 $2');
    
    // 2. Normalize emphasis markers
    // Bold: Convert __ to **
    processed = processed.replace(/__(.*?)__/g, '**$1**');
    // Italic: Convert _ to * (but not in middle of words)
    processed = processed.replace(/\b_(.*?)_\b/g, '*$1*');
    
    // 3. Normalize horizontal rules to ---
    // Match lines that are only HR markers (*, -, _) with optional spaces
    if (/^\s*([*\-_])\s*\1\s*\1+\s*$/.test(processed)) {
      processed = '---';
    }
    
    // 4. Normalize unordered list markers to -
    // Convert * or + at start of line (with optional indent) to -
    processed = processed.replace(/^(\s*)[\*\+]\s+/, '$1- ');
    
    // 5. Normalize ordered list markers (ensure single space after period)
    processed = processed.replace(/^(\s*)(\d+)\.\s+/, '$1$2. ');
    
    // 6. Normalize link/image spacing - remove space between ]( 
    // Links: [text] (url) → [text](url)
    processed = processed.replace(/\[([^\]]+)\]\s+\(([^\)]+)\)/g, '[$1]($2)');
    // Images: ![alt] (url) → ![alt](url)
    processed = processed.replace(/!\[([^\]]*)\]\s+\(([^\)]+)\)/g, '![$1]($2)');
    
    // 7. Normalize code block fences to triple backtick
    // Convert ~~~ to ```
    if (/^~~~/.test(processed)) {
      processed = processed.replace(/^~~~/, '```');
    }
    
    normalized.push(processed);
  }
  
  return normalized.join('\n');
}

/**
 * Step 2: HNP-1 Text Normalization
 * Same rules as original HNP-1
 */
function normalizeText(content) {
  // Remove BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  // Normalize Unicode to NFC (composed form)
  content = content.normalize('NFC');

  // Convert all line endings to LF (\n)
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split into lines and process each
  let lines = content.split('\n');

  // Remove trailing whitespace from each line
  lines = lines.map(line => line.replace(/\s+$/, ''));

  // Normalize tabs to 4 spaces
  lines = lines.map(line => line.replace(/\t/g, '    '));

  // Remove leading blank lines
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }

  // Remove trailing blank lines
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  // Collapse multiple consecutive blank lines
  let normalizedLines = [];
  let lastWasBlank = false;

  for (let line of lines) {
    const isBlank = line.trim() === '';

    if (isBlank) {
      if (!lastWasBlank) {
        normalizedLines.push(line);
        lastWasBlank = true;
      }
    } else {
      normalizedLines.push(line);
      lastWasBlank = false;
    }
  }

  // Join lines and ensure single trailing newline
  let normalized = normalizedLines.join('\n');
  normalized = normalized.replace(/\n*$/, '\n');

  return normalized;
}

/**
 * Compute SHA-256 hash of normalized content
 */
function computeHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Main HNP-2 Pipeline
 */
function processHNP2(content) {
  // Step 1: Markdown normalization
  const markdownNormalized = normalizeMarkdown(content);
  
  // Step 2: Text normalization (HNP-1 rules)
  const textNormalized = normalizeText(markdownNormalized);
  
  // Step 3: Hash
  const hash = computeHash(textNormalized);
  
  return {
    normalized: textNormalized,
    hash: '0x' + hash
  };
}

/**
 * Main execution
 */
function main() {
  if (process.argv.length < 3) {
    console.error('Usage: node hnp2.js <input_file> [--verbose]');
    console.error('');
    console.error('Options:');
    console.error('  --verbose    Output normalized content before hashing');
    process.exit(1);
  }

  const filePath = process.argv[2];
  const verbose = process.argv.includes('--verbose');

  try {
    // Read file
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    const rawContent = fs.readFileSync(filePath, 'utf8');

    // Process through HNP-2
    const result = processHNP2(rawContent);

    if (verbose) {
      console.log('=== NORMALIZED CONTENT ===');
      console.log(result.normalized);
      console.log('=== END NORMALIZED CONTENT ===');
      console.log('');
    }

    console.log(result.hash);
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
    process.exit(1);
  }
}

main();
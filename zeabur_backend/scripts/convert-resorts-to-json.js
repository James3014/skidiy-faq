#!/usr/bin/env node
/**
 * Convert YAML Resort Files to JSON
 *
 * Scans faq/resorts directory for all .yaml files
 * and converts them into a single resort_kb.json file
 */

const fs = require('fs');
const path = require('path');

// Try to load js-yaml from backend's node_modules
let yaml;
try {
  yaml = require('../backend/node_modules/js-yaml');
} catch (e) {
  yaml = require('js-yaml');
}

// Paths
const RESORTS_DIR = path.join(__dirname, '../faq/resorts');
const OUTPUT_FILE = path.join(__dirname, '../data/resort_kb.json');

/**
 * Recursively find all YAML files in a directory
 */
function findYamlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findYamlFiles(filePath, fileList);
    } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract region from file path
 */
function extractRegion(filePath) {
  const parts = filePath.split(path.sep);
  const resortsIndex = parts.indexOf('resorts');

  if (resortsIndex !== -1 && resortsIndex + 1 < parts.length) {
    return parts[resortsIndex + 1]; // e.g., "nagano", "niigata", "hokkaido"
  }

  return 'unknown';
}

/**
 * Extract area from file path (for regions with sub-areas like yuzawa, myoko)
 */
function extractArea(filePath) {
  const parts = filePath.split(path.sep);
  const resortsIndex = parts.indexOf('resorts');

  if (resortsIndex !== -1 && resortsIndex + 2 < parts.length) {
    const possibleArea = parts[resortsIndex + 2];
    // Check if it's a directory name (not a file)
    if (!possibleArea.endsWith('.yaml') && !possibleArea.endsWith('.yml')) {
      return possibleArea;
    }
  }

  return null;
}

/**
 * Main conversion function
 */
function convertResorts() {
  console.log('[Resort Converter] Starting conversion...');
  console.log('[Resort Converter] Scanning directory:', RESORTS_DIR);

  // Find all YAML files
  const yamlFiles = findYamlFiles(RESORTS_DIR);
  console.log(`[Resort Converter] Found ${yamlFiles.length} YAML files`);

  // Convert each file
  const resorts = [];
  const errors = [];

  yamlFiles.forEach((filePath, index) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      // Extract metadata from file path
      const region = extractRegion(filePath);
      const area = extractArea(filePath);
      const fileName = path.basename(filePath, path.extname(filePath));

      // Add metadata
      const resort = {
        ...data,
        _metadata: {
          source_file: path.relative(path.join(__dirname, '..'), filePath),
          region,
          area: area || region,
          last_converted: new Date().toISOString()
        }
      };

      // Ensure resort_id exists
      if (!resort.resort_id) {
        resort.resort_id = fileName;
      }

      resorts.push(resort);
      console.log(`[${index + 1}/${yamlFiles.length}] ✓ ${resort.resort_id}`);
    } catch (error) {
      console.error(`[${index + 1}/${yamlFiles.length}] ✗ ${path.basename(filePath)}: ${error.message}`);
      errors.push({
        file: filePath,
        error: error.message
      });
    }
  });

  // Sort resorts by region and name
  resorts.sort((a, b) => {
    if (a._metadata.region !== b._metadata.region) {
      return a._metadata.region.localeCompare(b._metadata.region);
    }
    return (a.names?.zh || a.resort_id).localeCompare(b.names?.zh || b.resort_id);
  });

  // Generate statistics
  const stats = {
    total: resorts.length,
    by_region: {},
    by_prefecture: {},
    with_pricing: resorts.filter(r => r.pricing).length,
    with_transportation: resorts.filter(r => r.transportation).length,
    with_night_ski: resorts.filter(r => r.snow_stats?.night_ski).length,
  };

  resorts.forEach(resort => {
    const region = resort._metadata.region;
    stats.by_region[region] = (stats.by_region[region] || 0) + 1;

    if (resort.region) {
      stats.by_prefecture[resort.region] = (stats.by_prefecture[resort.region] || 0) + 1;
    }
  });

  // Build output structure
  const output = {
    meta: {
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      source_directory: 'faq/resorts',
      total_resorts: resorts.length,
      statistics: stats,
      errors: errors.length > 0 ? errors : undefined
    },
    resorts
  };

  // Write to file
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n[Resort Converter] ✓ Conversion complete!`);
  console.log(`[Resort Converter] Output: ${OUTPUT_FILE}`);
  console.log(`[Resort Converter] Total resorts: ${resorts.length}`);
  console.log(`[Resort Converter] By region:`, stats.by_region);

  if (errors.length > 0) {
    console.log(`\n[Resort Converter] ⚠ ${errors.length} errors occurred`);
    errors.forEach(err => {
      console.log(`  - ${path.basename(err.file)}: ${err.error}`);
    });
  }

  return output;
}

// Run conversion
if (require.main === module) {
  try {
    convertResorts();
    process.exit(0);
  } catch (error) {
    console.error('[Resort Converter] Fatal error:', error);
    process.exit(1);
  }
}

module.exports = { convertResorts, findYamlFiles };

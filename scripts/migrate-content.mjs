#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration script for VitePress to Astro content
async function migrateContent() {
  console.log('Starting VitePress to Astro content migration...');
  
  // Define source and destination paths
  const sourceDir = path.join(__dirname, '../docs'); // VitePress source
  const destDir = path.join(__dirname, '../src/content/blog');
  
  // Try different possible source locations
  let sourceExists = false;
  let actualSourceDir = '';
  
  // Check if docs/ exists
  try {
    await fs.access(sourceDir);
    actualSourceDir = sourceDir;
    sourceExists = true;
  } catch (e) {
    console.log('docs/ directory not found, checking other locations...');
  }
  
  // Check if .vitepress/ exists with source content
  if (!sourceExists) {
    const vitepressDir = path.join(__dirname, '../.vitepress');
    try {
      await fs.access(vitepressDir);
      // This migration might need to happen from the original VitePress content
      actualSourceDir = path.join(__dirname, '..'); // Main directory might contain content
      sourceExists = false; // We'll need to identify actual source differently
    } catch (e) {
      console.log('.vitepress directory not found, looking for markdown files in common locations...');
    }
  }

  // Since we're migrating an existing project, let's look for the actual content locations
  // based on the original index.md structure we saw
  const contentLocations = [
    '../work-docs',
    '../scattered-notes', 
    '../*.md' // root level markdown files
  ];
  
  // For this implementation, let's set up the migration based on what we know the structure should be
  // First, ensure destination directory exists
  await fs.mkdir(destDir, { recursive: true });
  
  // Migration results tracking
  const migrationResults = {
    totalFiles: 0,
    migratedFiles: 0,
    failedFiles: 0,
    issues: [],
    mappings: []
  };

  // We'll check for the actual content files in the project
  const contentDir = path.join(__dirname, '..');
  const files = await fs.readdir(contentDir);
  const markdownFiles = files.filter(file => 
    file.endsWith('.md') && file !== 'index.md' && file !== 'package.json' && 
    file !== 'README.md' && file !== 'pnpm-lock.yaml'
  );
  
  console.log(`Found ${markdownFiles.length} markdown files to migrate`);
  
  for (const file of markdownFiles) {
    const sourcePath = path.join(contentDir, file);
    const stat = await fs.stat(sourcePath);
    
    if (stat.isFile() && path.extname(sourcePath) === '.md') {
      migrationResults.totalFiles++;
      
      try {
        let content = await fs.readFile(sourcePath, 'utf8');
        
        // Transform VitePress frontmatter to Astro format
        const transformedContent = transformFrontmatter(content);
        
        // Create new file path in Astro content collection
        const newFileName = file;
        const destPath = path.join(destDir, newFileName);
        
        await fs.writeFile(destPath, transformedContent);
        
        migrationResults.migratedFiles++;
        migrationResults.mappings.push({
          originalPath: sourcePath,
          newPath: destPath
        });
        
        console.log(`✓ Migrated: ${file}`);
      } catch (error) {
        migrationResults.failedFiles++;
        migrationResults.issues.push({
          file: file,
          error: error.message
        });
        console.error(`✗ Failed to migrate ${file}:`, error.message);
      }
    }
  }
  
  // Additionally, migrate content from subdirectories recursively
  const subdirs = ['work-docs', 'scattered-notes'];
  for (const subdir of subdirs) {
    const subdirPath = path.join(__dirname, '..', subdir);
    try {
      const stat = await fs.stat(subdirPath);
      if (stat.isDirectory()) {
        await migrateDirectoryRecursively(subdirPath, destDir, migrationResults, subdir);
      }
    } catch (e) {
      console.log(`Subdirectory ${subdir} does not exist, skipping...`);
    }
  }
  
  // Save migration results
  const resultsPath = path.join(__dirname, '../migration-result.json');
  await fs.writeFile(resultsPath, JSON.stringify(migrationResults, null, 2));
  
  console.log('\nMigration completed!');
  console.log(`Total files processed: ${migrationResults.totalFiles}`);
  console.log(`Successfully migrated: ${migrationResults.migratedFiles}`);
  console.log(`Failed migrations: ${migrationResults.failedFiles}`);
  
  if (migrationResults.issues.length > 0) {
    console.log('\nIssues encountered:');
    migrationResults.issues.forEach(issue => {
      console.log(`- ${issue.file}: ${issue.error}`);
    });
  }
  
  return migrationResults;
}

// Function to transform VitePress frontmatter to Astro format
function transformFrontmatter(content) {
  // Extract frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    // If no frontmatter, add minimal frontmatter required by Astro
    return '---\ntitle: \'Default Title\'\ndescription: \'Default Description\'\ndraft: false\n---\n\n' + content;
  }
  
  // Parse existing frontmatter
  let frontmatter = match[1];
  const originalContent = content.slice(match[0].length);
  
  // Parse the frontmatter as YAML-like structure
  const lines = frontmatter.split('\n');
  const frontmatterObj = {};
  
  // Simple YAML parsing for key-value pairs
  let currentKey = '';
  let currentMultilineValue = '';
  let inMultiline = false;
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    if (line.match(/^\w/) && !inMultiline) {
      // New key-value line
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Handle special cases for different value types
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith('\'') && value.endsWith('\'')) {
          value = value.substring(1, value.length - 1);
        } else if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (!isNaN(value) && value.trim() !== '') {
          value = Number(value);
        }
        
        frontmatterObj[key] = value;
        currentKey = key;
      }
    } else if (inMultiline || (line.startsWith('  ') && currentKey)) {
      // Multiline value continuation
      if (!inMultiline) {
        inMultiline = true;
        currentMultilineValue = String(frontmatterObj[currentKey]);
      }
      currentMultilineValue += '\n' + line;
      frontmatterObj[currentKey] = currentMultilineValue;
    }
  }
  
  // Transform specific VitePress properties to Astro equivalents
  // title mapping: 'name' or other fields -> 'title'
  if (!frontmatterObj.title && frontmatterObj.name) {
    frontmatterObj.title = frontmatterObj.name;
    delete frontmatterObj.name;
  }
  
  // description mapping: 'tagline' or other fields -> 'description'
  if (!frontmatterObj.description && frontmatterObj.tagline) {
    frontmatterObj.description = frontmatterObj.tagline;
    delete frontmatterObj.tagline;
  }
  
  // date mapping: 'date' remains the same
  // author mapping: 'author' remains the same
  // tags mapping: 'tags' remains the same
  
  // Ensure required fields for Astro content collections
  if (!frontmatterObj.title) {
    frontmatterObj.title = 'Untitled';
  }
  
  if (!frontmatterObj.description) {
    frontmatterObj.description = 'Description needed';
  }
  
  // Convert the transformed object back to YAML
  let newFrontmatter = '';
  for (const [key, value] of Object.entries(frontmatterObj)) {
    if (typeof value === 'string') {
      // Escape special characters for YAML
      if (value.includes('\n')) {
        // Use literal block for multiline strings
        newFrontmatter += `${key}: |\n`;
        const lines = value.split('\n');
        for (const line of lines) {
          newFrontmatter += `  ${line}\n`;
        }
      } else if (value.includes(':') || value.includes('#') || value.includes('[') || value.includes(']') || value.includes('{') || value.includes('}')) {
        // Use quoted string for values with special characters
        newFrontmatter += `${key}: "${value.replace(/"/g, '\\"')}"\n`;
      } else {
        newFrontmatter += `${key}: ${value}\n`;
      }
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      newFrontmatter += `${key}: ${value}\n`;
    } else if (Array.isArray(value)) {
      newFrontmatter += `${key}:\n`;
      for (const item of value) {
        newFrontmatter += `  - ${item}\n`;
      }
    } else {
      newFrontmatter += `${key}: ${JSON.stringify(value)}\n`;
    }
  }
  
  // Construct final content with new frontmatter
  return `---\n${newFrontmatter}---\n\n${originalContent}`;
}

// Function to validate content based on data-model.md requirements
function validateContent(frontmatter) {
  const errors = [];
  
  // Blog Post Validation per data-model.md
  // Title is required
  if (!frontmatter.title || typeof frontmatter.title !== 'string' || frontmatter.title.trim() === '') {
    errors.push('Title is required and must be a non-empty string');
  }
  
  // Description is required
  if (!frontmatter.description || typeof frontmatter.description !== 'string' || frontmatter.description.trim() === '') {
    errors.push('Description is required and must be a non-empty string');
  }
  
  // Date format must be valid if present
  if (frontmatter.date && frontmatter.date !== undefined) {
    const date = new Date(frontmatter.date);
    if (isNaN(date.getTime())) {
      errors.push('Date format must be valid if present');
    }
  }
  
  // Slug must be URL-friendly (this will be generated by Astro from filename)
  // Tags must be valid strings if present
  if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
    errors.push('Tags must be an array if present');
  } else if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
    const invalidTags = frontmatter.tags.filter(tag => typeof tag !== 'string');
    if (invalidTags.length > 0) {
      errors.push(`Tags must be strings, found invalid tags: ${invalidTags.join(', ')}`);
    }
  }
  
  // Content will be validated by Astro's content collection schema
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Recursive function to migrate content from nested directories
async function migrateDirectoryRecursively(sourceDir, destDir, migrationResults, baseSubdir) {
  const items = await fs.readdir(sourceDir);
  
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const stat = await fs.stat(sourcePath);
    
    if (stat.isDirectory()) {
      // If it's a directory, recurse into it
      const relativePath = path.relative(path.join(__dirname, '..'), sourcePath);
      const destSubdir = path.join(destDir, relativePath);
      await fs.mkdir(destSubdir, { recursive: true });
      
      await migrateDirectoryRecursively(sourcePath, destDir, migrationResults, baseSubdir);
    } else if (stat.isFile() && path.extname(sourcePath) === '.md') {
      // If it's a markdown file, process it
      migrationResults.totalFiles++;
      
      try {
        let content = await fs.readFile(sourcePath, 'utf8');
        
        // Transform VitePress frontmatter to Astro format
        const transformedContent = transformFrontmatter(content);
        
        // Create new file path preserving directory structure
        const relativePath = path.relative(path.join(__dirname, '..'), sourcePath);
        const destPath = path.join(destDir, relativePath);
        
        // Ensure destination directory exists
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        
        await fs.writeFile(destPath, transformedContent);
        
        migrationResults.migratedFiles++;
        migrationResults.mappings.push({
          originalPath: sourcePath,
          newPath: destPath
        });
        
        console.log(`✓ Migrated: ${relativePath}`);
      } catch (error) {
        migrationResults.failedFiles++;
        migrationResults.issues.push({
          file: path.relative(path.join(__dirname, '..'), sourcePath),
          error: error.message
        });
        console.error(`✗ Failed to migrate ${path.relative(path.join(__dirname, '..'), sourcePath)}:`, error.message);
      }
    }
  }
}

// Run migration if this script is executed directly
if (process.argv[1] === __filename) {
  migrateContent().catch(console.error);
}

export default migrateContent;
export { validateContent, transformFrontmatter };
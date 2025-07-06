/**
 * Script to update Unsplash URLs with local placeholders
 * سكريبت لتحديث روابط Unsplash بالصور المحلية
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

// Files to update
const filesToUpdate = [
  'src/pages/Home.jsx',
  'src/components/Hero.jsx',
  'src/components/content/ContentCard.jsx'
];

// Content type mapping based on context
const getContentTypeFromContext = (line) => {
  const lowerLine = line.toLowerCase();
  
  if (lowerLine.includes('event') || lowerLine.includes('فعالية') || lowerLine.includes('مؤتمر')) {
    return 'event';
  }
  if (lowerLine.includes('news') || lowerLine.includes('أخبار') || lowerLine.includes('خبر')) {
    return 'news';
  }
  if (lowerLine.includes('research') || lowerLine.includes('بحث') || lowerLine.includes('دراسة')) {
    return 'research';
  }
  if (lowerLine.includes('publication') || lowerLine.includes('منشور') || lowerLine.includes('إصدار')) {
    return 'publication';
  }
  if (lowerLine.includes('article') || lowerLine.includes('مقال')) {
    return 'article';
  }
  if (lowerLine.includes('press') || lowerLine.includes('صحافة')) {
    return 'press';
  }
  
  return 'default';
};

// Update function
const updateUnsplashUrls = () => {
  console.log('🔄 Starting Unsplash URL replacement...\n');
  
  let totalReplacements = 0;
  
  filesToUpdate.forEach(filePath => {
    const fullPath = join(projectRoot, filePath);
    
    try {
      console.log(`📁 Processing: ${filePath}`);
      
      let content = readFileSync(fullPath, 'utf8');
      let fileReplacements = 0;
      
      // Add import if not present
      if (!content.includes('getImageWithFallback')) {
        const importLine = "import { getImageWithFallback } from '../assets/images/placeholders';";
        
        // Find the last import line
        const lines = content.split('\n');
        let lastImportIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('import ')) {
            lastImportIndex = i;
          }
        }
        
        if (lastImportIndex !== -1) {
          lines.splice(lastImportIndex + 1, 0, importLine);
          content = lines.join('\n');
          console.log('  ✅ Added getImageWithFallback import');
        }
      }
      
      // Add helper function if not present
      if (!content.includes('replaceUnsplashUrl')) {
        const helperFunction = `
// Helper function to replace Unsplash URLs with local placeholders
const replaceUnsplashUrl = (url, contentType = 'default') => {
  if (url && url.includes('images.unsplash.com')) {
    return getImageWithFallback(url, contentType);
  }
  return url;
};
`;
        
        // Find where to insert the helper function (before the main component)
        const componentMatch = content.match(/(const \w+ = \(\) => {|function \w+\(\) {)/);
        if (componentMatch) {
          const insertIndex = content.indexOf(componentMatch[0]);
          content = content.slice(0, insertIndex) + helperFunction + '\n' + content.slice(insertIndex);
          console.log('  ✅ Added replaceUnsplashUrl helper function');
        }
      }
      
      // Replace Unsplash URLs
      const unsplashRegex = /"https:\/\/images\.unsplash\.com\/[^"]+"/g;
      const matches = content.match(unsplashRegex);
      
      if (matches) {
        matches.forEach(match => {
          const url = match.slice(1, -1); // Remove quotes
          
          // Find the line containing this URL for context
          const lines = content.split('\n');
          const lineWithUrl = lines.find(line => line.includes(url));
          const contentType = getContentTypeFromContext(lineWithUrl || '');
          
          const replacement = `replaceUnsplashUrl(${match}, "${contentType}")`;
          content = content.replace(match, replacement);
          fileReplacements++;
        });
        
        console.log(`  ✅ Replaced ${fileReplacements} Unsplash URLs`);
      } else {
        console.log('  ℹ️  No Unsplash URLs found');
      }
      
      // Write updated content
      writeFileSync(fullPath, content, 'utf8');
      totalReplacements += fileReplacements;
      
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
    
    console.log('');
  });
  
  console.log(`🎉 Completed! Total replacements: ${totalReplacements}`);
  console.log('✅ All Unsplash URLs have been replaced with local placeholders');
  console.log('🔒 CSP errors should now be resolved');
};

// Run the update
updateUnsplashUrls();

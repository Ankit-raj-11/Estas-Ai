const aiFixService = require('../services/ai-fix.service');
require('dotenv').config();

// Test finding
const testFinding = {
  tool: 'semgrep',
  file: 'test.js',
  line: 5,
  severity: 'medium',
  rule: 'javascript.lang.security.audit.unsafe-formatstring.unsafe-formatstring',
  message: 'Detected string concatenation with a non-literal variable in a console.log function'
};

// Test file content with vulnerability
const testFileContent = `const express = require('express');
const app = express();

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  console.log('User requested: ' + userId);
  res.json({ id: userId });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
`;

async function testAIFix() {
  console.log('Testing AI fix generation...\n');
  console.log('Finding:', testFinding);
  console.log('\nOriginal code:\n', testFileContent);
  console.log('\n' + '='.repeat(60) + '\n');
  
  try {
    const result = await aiFixService.generateFix(testFinding, testFileContent);
    
    console.log('Fix Result:');
    console.log('- Fixed:', result.fixed);
    console.log('- Has fixedCode:', !!result.fixedCode);
    console.log('- fixedCode length:', result.fixedCode?.length || 0);
    console.log('- Explanation:', result.explanation);
    console.log('- Recommendations:', result.recommendations);
    
    if (result.fixed && result.fixedCode) {
      console.log('\n' + '='.repeat(60));
      console.log('Fixed Code:');
      console.log('='.repeat(60));
      console.log(result.fixedCode);
      console.log('='.repeat(60));
      
      // Check if code actually changed
      if (result.fixedCode === testFileContent) {
        console.log('\n⚠️  WARNING: Fixed code is identical to original!');
      } else {
        console.log('\n✅ Code was modified by AI');
      }
    } else {
      console.log('\n❌ Fix failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testAIFix();

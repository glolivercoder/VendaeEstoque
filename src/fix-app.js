// This script will help fix the App.jsx file
const fs = require('fs');
const path = require('path');

// Path to App.jsx
const appPath = path.join(__dirname, 'src', 'App.jsx');

// Read the file
let content = fs.readFileSync(appPath, 'utf8');

// Find the position to insert the SimpleSalesReport component
const closingDivPos = content.lastIndexOf('</div>\n  );');

if (closingDivPos !== -1) {
  // Insert the SimpleSalesReport component before the closing div
  const newContent = [
    content.slice(0, closingDivPos),
    '\n      {/* Simple Sales Report Component */}\n',
    '      <SimpleSalesReport \n',
    '        showSimpleSalesReport={showSimpleSalesReport}\n',
    '        setShowSimpleSalesReport={setShowSimpleSalesReport}\n',
    '        clientSearchTerm={clientSearchTerm}\n',
    '        setClientSearchTerm={setClientSearchTerm}\n',
    '        productSearchTerm={productSearchTerm}\n',
    '        setProductSearchTerm={setProductSearchTerm}\n',
    '        getCurrentDateISO={getCurrentDateISO}\n',
    '        salesData={salesData}\n',
    '        formatDateToBrazilian={formatDateToBrazilian}\n',
    '      />\n',
    content.slice(closingDivPos)
  ].join('');

  // Write the updated content back to the file
  fs.writeFileSync(appPath, newContent, 'utf8');
  console.log('Successfully added SimpleSalesReport component to App.jsx');
} else {
  console.error('Could not find the right position to insert the component');
}

// Also ensure the button is calling the correct function
let updatedContent = fs.readFileSync(appPath, 'utf8');

// Check if the button is calling the correct function
if (updatedContent.includes('onClick={() => setShowSalesReport(true)}') && 
    updatedContent.includes('Relatório de Vendas')) {
  // Replace with the correct function
  updatedContent = updatedContent.replace(
    'onClick={() => setShowSalesReport(true)}',
    'onClick={handleShowSimpleSalesReport}'
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(appPath, updatedContent, 'utf8');
  console.log('Successfully fixed the button onClick handler');
}

console.log('Fix script completed');

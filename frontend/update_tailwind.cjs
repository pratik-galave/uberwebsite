const fs = require('fs');

const html = fs.readFileSync('stitch_screens/Vehicle_Selection.html', 'utf8');
const configMatch = html.match(/tailwind\.config = (\{[\s\S]*?\});/);

if (configMatch) {
    const configStr = configMatch[1];
    const tailwindConfigPath = 'tailwind.config.js';
    
    // Evaluate the config string to get the JS object
    const tailwindConfig = eval('(' + configStr + ')');
    
    const newConfig = `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: ${JSON.stringify(tailwindConfig.theme, null, 2)},
  plugins: [],
}
`;
    fs.writeFileSync(tailwindConfigPath, newConfig);
    console.log('tailwind.config.js updated successfully.');
} else {
    console.log('Could not find tailwind config in HTML.');
}

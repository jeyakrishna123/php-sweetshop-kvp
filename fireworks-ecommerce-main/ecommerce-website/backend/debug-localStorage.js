// Debug script to check localStorage data
console.log('🔍 Debugging localStorage Data');
console.log('============================');

// This script should be run in the browser console on the frontend
console.log(`
To debug the localStorage data, open your browser's developer console (F12) 
and run the following commands:

1. Check what's in localStorage:
   localStorage.getItem('predefinedCategoryModifications')

2. Check all localStorage keys:
   Object.keys(localStorage)

3. Pretty print the modifications:
   console.log(JSON.parse(localStorage.getItem('predefinedCategoryModifications') || '{}'))

4. Check specific category:
   const mods = JSON.parse(localStorage.getItem('predefinedCategoryModifications') || '{}');
   console.log('Chocolate:', mods.Chocolate);
   console.log('Vanilla:', mods.Vanilla);
   console.log('Strawberry:', mods.Strawberry);

5. Clear and reset (if needed):
   localStorage.removeItem('predefinedCategoryModifications');
   localStorage.setItem('predefinedCategoryModifications', JSON.stringify({}));
`);

console.log('✅ Debug instructions ready!');

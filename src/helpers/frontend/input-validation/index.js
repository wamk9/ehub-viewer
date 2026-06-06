const modules = import.meta.glob('./*.js', { eager: true });

const inputValidation = {};

for (const path in modules) {
  if (path.includes('index.js')) continue; // skip index itself

  // Get filename without extension (e.g. currency, categories, runMode)
  const name = path.split('/').pop().replace('.js', '');

  inputValidation[name] = modules[path].default;
}

export default inputValidation;
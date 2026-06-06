const modules = import.meta.glob('./*.js', { eager: true });

const demo = {};

for (const path in modules) {
  if (path.includes('index.js')) continue; // skip index itself

  // Get filename without extension (e.g. currency, categories, runMode)
  const name = path.split('/').pop().replace('.js', '');

  demo[name] = modules[path].default;
}

export default demo;
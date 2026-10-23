/* Genera assets/tailwind.css (le utility usate dal sito) senza caricare Tailwind da un CDN esterno.
   Dopo aver aggiunto o cambiato classi Tailwind in un .html o .js:  cd tools && npm install && npm run build:css  e fai commit di assets/tailwind.css */
module.exports = {
  content: ['../*.html', '../assets/*.js'],
  theme: { extend: { fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] } } }
};

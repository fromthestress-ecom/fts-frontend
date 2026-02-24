export function ThemeScript() {
  const script = `
(function() {
  var key = 'fts-theme';
  var stored = localStorage.getItem(key);
  var theme = stored === 'light' || stored === 'dark' ? stored : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', theme);
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

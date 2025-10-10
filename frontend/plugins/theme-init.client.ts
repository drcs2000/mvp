export default defineNuxtPlugin(() => {
  const theme = useState<string>('theme', () => 'light');

  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
    theme.value = savedTheme;
  } 
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark';
  }
  
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

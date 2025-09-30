/**
 * Este plugin é executado apenas no lado do cliente.
 * Ele verifica o localStorage ou a preferência do sistema do usuário
 * para definir o tema (claro/escuro) antes da página ser totalmente carregada,
 * evitando o "flash" de tema incorreto.
 */
export default defineNuxtPlugin(() => {
  // Define um estado global reativo para o tema.
  // O valor padrão 'light' é usado se nada for encontrado.
  const theme = useState<string>('theme', () => 'light');

  // Busca o tema salvo no localStorage do navegador.
  const savedTheme = localStorage.getItem('theme');
  
  // Se houver um tema salvo ('light' or 'dark'), usa ele.
  if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
    theme.value = savedTheme;
  } 
  // Caso contrário, verifica se o sistema operacional do usuário prefere o modo escuro.
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark';
  }

  // Aplica a classe 'dark' ao elemento <html> se o tema for escuro.
  // O Tailwind CSS usará esta classe para aplicar os estilos do modo escuro.
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

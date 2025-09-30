/**
 * Este composable fornece uma maneira fácil de acessar e
 * modificar o tema em qualquer componente da aplicação.
 */
export const useTheme = () => {
  // Acessa o estado 'theme' que foi inicializado pelo plugin.
  const theme = useState<string>('theme');

  /**
   * Define o tema para 'light' ou 'dark',
   * salva a preferência no localStorage e atualiza
   * a classe no elemento <html>.
   * @param {'light' | 'dark'} newTheme O novo tema a ser aplicado.
   */
  const setTheme = (newTheme: 'light' | 'dark') => {
    // Se o novo tema for inválido ou o mesmo que o atual, não faz nada.
    if (!newTheme || theme.value === newTheme) {
      return;
    }
    
    // Salva a escolha do usuário no navegador para persistência.
    localStorage.setItem('theme', newTheme);
    
    // Atualiza o estado global.
    theme.value = newTheme;

    // Atualiza a classe no elemento <html> para que o Tailwind aplique os estilos corretos.
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Expõe o estado do tema e a função para definí-lo.
  return {
    theme,
    setTheme,
  };
};


import Shepherd from 'shepherd.js';

let isCssImported = false;

export const useTour = () => {
  if (process.client && !isCssImported) {
    import('shepherd.js/dist/css/shepherd.css');
    isCssImported = true;
  }

  const tour = new Shepherd.Tour({
    useModalOverlay: true, // Escurece o resto da tela
    defaultStepOptions: {
      classes: 'shepherd-custom', // Classe para customização
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: {
        enabled: true,
        label: 'Fechar tour',
      },
    },
  });

  const addSteps = (steps: Shepherd.Step.StepOptions[]) => {
    tour.addSteps(steps);
  };

  const start = () => {
    if (process.client) {
      tour.start();
    }
  };

  return {
    addSteps,
    start,
    tour, // Expõe a instância do tour para controle avançado (ex: tour.next())
  };
};
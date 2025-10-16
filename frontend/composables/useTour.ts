
import Shepherd, { type Step } from 'shepherd.js';

let isCssImported = false;

type TourType = 'firstAccess' | 'firstBet';

export const useTour = () => {
  if (process.client && !isCssImported) {
    import('shepherd.js/dist/css/shepherd.css');
    isCssImported = true;
  }

  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shepherd-custom',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: {
        enabled: true,
        label: 'Fechar tour',
      },
    },
  });
  
  const addSteps = (steps: Step[]) => {
    tour.steps = []; 
    tour.addSteps(steps);
  };

  const start = (tourType: TourType) => {
    if (process.client) {
      
      const onTourEnd = () => {
        const { $stores } = useNuxtApp();
        
        if (tourType === 'firstAccess' && $stores.users.myProfile?.firstAccess) {
          $stores.users.updateAccessFlag('firstAccess');
        }
        
        if (tourType === 'firstBet' && $stores.users.myProfile?.firstBet) {
          $stores.users.updateAccessFlag('firstBet');
        }
      };

      tour.off('cancel', onTourEnd);
      tour.off('complete', onTourEnd);
      
      tour.on('cancel', onTourEnd);
      tour.on('complete', onTourEnd);
      
      tour.start();
    }
  };

  return {
    addSteps,
    start,
    tour,
  };
};
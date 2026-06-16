import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/**
 * PrimeNG theme preset aligned to the Zidium Figma design.
 *
 * The primary ramp is anchored at `500 = #005baa` (Figma `--base/primary`), the
 * color PrimeNG resolves for primary button/control backgrounds in the light
 * scheme. Surface/text/danger fidelity is refined in the feature PRs that render
 * those controls.
 */
export const AppPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e6f0f8',
      100: '#cce1f1',
      200: '#99c3e3',
      300: '#66a5d5',
      400: '#3387c7',
      500: '#005baa',
      600: '#005299',
      700: '#004988',
      800: '#004077',
      900: '#002e55',
      950: '#00203c',
    },
  },
});

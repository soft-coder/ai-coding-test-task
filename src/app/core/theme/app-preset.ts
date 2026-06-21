import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/**
 * PrimeNG theme preset aligned to the Zidium Figma design.
 *
 * The primary ramp is anchored at `500 = #005baa` (Figma `--base/primary`) and the
 * red ramp at `500 = #a9120a` (Figma `--base/danger`) — the colors PrimeNG resolves
 * for primary and danger button backgrounds in the light scheme.
 */
const danger = {
  background: '#a9120a',
  hoverBackground: '#981009',
  activeBackground: '#7f0e08',
  borderColor: '#a9120a',
  hoverBorderColor: '#981009',
  activeBorderColor: '#7f0e08',
  color: '#ffffff',
  hoverColor: '#ffffff',
  activeColor: '#ffffff',
  focusRing: { color: '#a9120a', shadow: 'none' },
};

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
  components: {
    // The danger button resolves to PrimeNG's bright `{red.500}`; pin it to the
    // Figma danger red (#a9120a) so the delete action matches the design.
    button: {
      colorScheme: {
        light: { root: { danger } },
      },
    },
  },
});

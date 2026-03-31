import { grey, green, indigo } from '../util/colors';

const validatedColor = (color) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null;

export const createPalette = (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? grey[900] : grey[50],
    paper: darkMode ? grey[800] : '#ffffff',
  },
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || (darkMode ? indigo[200] : indigo[900]),
    light: indigo[700],
    dark: indigo[950],
    contrastText: '#fff',
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || (darkMode ? green[200] : green[800]),
    light: green[600],
    dark: green[900],
    contrastText: '#fff',
  },
  neutral: {
    main: grey[500],
  },
  geometry: {
    main: '#3bb2d0',
  },
  alwaysDark: {
    main: grey[900],
  },
  text: {
    primary: darkMode ? '#ffffff' : '#212121',
    secondary: darkMode ? '#b0b0b0' : '#757575',
  },
});

export default createPalette;

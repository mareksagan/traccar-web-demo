export const getStatusColor = (status) => {
  switch (status) {
    case 'online':
      return '#4caf50';
    case 'offline':
      return '#f44336';
    case 'unknown':
    default:
      return '#9e9e9e';
  }
};

export const getCategoryColor = (category) => {
  const colors = {
    default: '#607d8b',
    car: '#2196f3',
    truck: '#795548',
    motorcycle: '#ff9800',
    bicycle: '#4caf50',
    bus: '#3f51b5',
    train: '#009688',
    boat: '#00bcd4',
    ship: '#00bcd4',
    plane: '#673ab7',
    helicopter: '#9c27b0',
    person: '#e91e63',
    animal: '#8bc34a',
    scooter: '#ff5722',
    van: '#ffc107',
    camper: '#795548',
    tractor: '#8d6e63',
    crane: '#607d8b',
    trailer: '#9e9e9e',
  };
  return colors[category] || colors.default;
};

export const indigo = {
  50: '#e8eaf6',
  100: '#c5cae9',
  200: '#9fa8da',
  300: '#7986cb',
  400: '#5c6bc0',
  500: '#3f51b5',
  600: '#3949ab',
  700: '#303f9f',
  800: '#283593',
  900: '#1a237e',
};

export const green = {
  50: '#e8f5e9',
  100: '#c8e6c9',
  200: '#a5d6a7',
  300: '#81c784',
  400: '#66bb6a',
  500: '#4caf50',
  600: '#43a047',
  700: '#388e3c',
  800: '#2e7d32',
  900: '#1b5e20',
};

export const grey = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

export const red = {
  500: '#f44336',
  600: '#e53935',
};

export const orange = {
  500: '#ff9800',
};

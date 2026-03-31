import { createStore } from 'solid-js/store';
import { createSignal, createEffect, onCleanup } from 'solid-js';

// Session Store
const [session, setSession] = createStore({
  server: null,
  user: null,
  socket: false,
  includeLogs: false,
  logs: [],
  positions: {},
  history: {},
});

export const sessionActions = {
  updateServer: (server) => setSession('server', server),
  updateUser: (user) => setSession('user', user),
  updateSocket: (connected) => setSession('socket', connected),
  enableLogs: (enabled) => {
    setSession('includeLogs', enabled);
    if (!enabled) setSession('logs', []);
  },
  updateLogs: (logs) => setSession('logs', (prev) => [...prev, ...logs]),
  updatePositions: (positions) => {
    const liveRoutes = session.user?.attributes?.mapLiveRoutes || session.server?.attributes?.mapLiveRoutes || 'none';
    const liveRoutesLimit = session.user?.attributes?.['web.liveRouteLength'] || session.server?.attributes?.['web.liveRouteLength'] || 10;
    
    const newPositions = {};
    const newHistory = { ...session.history };
    
    positions.forEach((position) => {
      newPositions[position.deviceId] = position;
      if (liveRoutes !== 'none') {
        const route = newHistory[position.deviceId] || [];
        const last = route.at(-1);
        if (!last || (last[0] !== position.longitude && last[1] !== position.latitude)) {
          newHistory[position.deviceId] = [
            ...route.slice(1 - liveRoutesLimit),
            [position.longitude, position.latitude],
          ];
        }
      }
    });
    
    setSession('positions', { ...session.positions, ...newPositions });
    if (liveRoutes !== 'none') {
      setSession('history', newHistory);
    } else {
      setSession('history', {});
    }
  },
};

// Devices Store
const [devices, setDevices] = createStore({
  items: {},
  selectedId: null,
  selectTime: null,
});

export const devicesActions = {
  refresh: (items) => {
    const newItems = {};
    items.forEach((item) => (newItems[item.id] = item));
    setDevices('items', newItems);
  },
  update: (items) => {
    const updates = {};
    items.forEach((item) => (updates[item.id] = item));
    setDevices('items', (prev) => ({ ...prev, ...updates }));
  },
  selectId: (id) => {
    setDevices('selectedId', id);
    setDevices('selectTime', Date.now());
  },
  remove: (id) => {
    setDevices('items', (prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  },
};

// Events Store
const [events, setEvents] = createStore({
  items: [],
});

export const eventsActions = {
  add: (newEvents) => setEvents('items', (prev) => [...newEvents, ...prev]),
  clear: () => setEvents('items', []),
};

// Geofences Store
const [geofences, setGeofences] = createStore({
  items: {},
});

export const geofencesActions = {
  refresh: (items) => {
    const newItems = {};
    items.forEach((item) => (newItems[item.id] = item));
    setGeofences('items', newItems);
  },
  update: (items) => {
    const updates = {};
    items.forEach((item) => (updates[item.id] = item));
    setGeofences('items', (prev) => ({ ...prev, ...updates }));
  },
};

// Groups Store
const [groups, setGroups] = createStore({
  items: {},
});

export const groupsActions = {
  refresh: (items) => {
    const newItems = {};
    items.forEach((item) => (newItems[item.id] = item));
    setGroups('items', newItems);
  },
  update: (items) => {
    const updates = {};
    items.forEach((item) => (updates[item.id] = item));
    setGroups('items', (prev) => ({ ...prev, ...updates }));
  },
};

// Drivers Store
const [drivers, setDrivers] = createStore({
  items: {},
});

export const driversActions = {
  refresh: (items) => {
    const newItems = {};
    items.forEach((item) => (newItems[item.id] = item));
    setDrivers('items', newItems);
  },
};

// Maintenances Store
const [maintenances, setMaintenances] = createStore({
  items: {},
});

export const maintenancesActions = {
  refresh: (items) => {
    const newItems = {};
    items.forEach((item) => (newItems[item.id] = item));
    setMaintenances('items', newItems);
  },
};

// Calendars Store
const [calendars, setCalendars] = createStore({
  items: {},
});

export const calendarsActions = {
  refresh: (items) => {
    const newItems = {};
    items.forEach((item) => (newItems[item.id] = item));
    setCalendars('items', newItems);
  },
};

// Errors Store
const [errors, setErrors] = createStore({
  items: [],
});

export const errorsActions = {
  push: (error) => setErrors('items', (prev) => [...prev, error]),
  clear: () => setErrors('items', []),
};

// Motion Store
const [motion, setMotion] = createStore({
  value: true,
});

export const motionActions = {
  setValue: (value) => setMotion('value', value),
};

// Persisted State Helper
export function createPersistedState(key, defaultValue) {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  const initial = stored ? JSON.parse(stored) : defaultValue;
  const [state, setState] = createSignal(initial);
  
  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(state()));
  });
  
  return [state, setState];
}

// Export stores
export { session, devices, events, geofences, groups, drivers, maintenances, calendars, errors, motion };

import { createPersistedState } from '../../stores';

export const useAttributePreference = (key, defaultValue) => {
  return createPersistedState(`preference-${key}`, defaultValue);
};

export const useDeviceAttributes = (deviceId) => {
  return createPersistedState(`device-attrs-${deviceId}`, {});
};

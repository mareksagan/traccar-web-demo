import { useSelector } from 'react-redux';

const containsProperty = (object, key) => {
  if (!object || typeof object !== 'object') return false;
  return Object.prototype.hasOwnProperty.call(object, key) && object[key] !== null;
};

export const usePreference = (key, defaultValue) =>
  useSelector((state) => {
    if (!state.session.user || !state.session.server) return defaultValue;
    
    if (state.session.server.forceSettings) {
      if (containsProperty(state.session.server, key)) {
        return state.session.server[key];
      }
      if (containsProperty(state.session.user, key)) {
        return state.session.user[key];
      }
      return defaultValue;
    }
    if (containsProperty(state.session.user, key)) {
      return state.session.user[key];
    }
    if (containsProperty(state.session.server, key)) {
      return state.session.server[key];
    }
    return defaultValue;
  });

export const useAttributePreference = (key, defaultValue) =>
  useSelector((state) => {
    const userAttrs = state.session.user?.attributes || {};
    const serverAttrs = state.session.server?.attributes || {};
    
    if (state.session.server?.forceSettings) {
      if (containsProperty(serverAttrs, key)) {
        return serverAttrs[key];
      }
      if (containsProperty(userAttrs, key)) {
        return userAttrs[key];
      }
      return defaultValue;
    }
    if (containsProperty(userAttrs, key)) {
      return userAttrs[key];
    }
    if (containsProperty(serverAttrs, key)) {
      return serverAttrs[key];
    }
    return defaultValue;
  });

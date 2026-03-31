export const nativeEnvironment = window.ReactNativeWebView !== undefined;

export const nativePostMessage = (message) => {
  if (nativeEnvironment && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
};

export const generateLoginToken = () => {
  if (nativeEnvironment) {
    nativePostMessage({ action: 'generateToken' });
  }
};

export const handleLoginTokenListeners = new Set();

export const handleNativeNotificationListeners = new Set();

// Listen for messages from native app
if (nativeEnvironment) {
  window.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.token) {
        handleLoginTokenListeners.forEach((listener) => listener(data.token));
      }
      if (data.notification) {
        handleNativeNotificationListeners.forEach((listener) => listener(data));
      }
    } catch {
      // ignore
    }
  });
}

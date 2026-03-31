export const hasDeviceReadPermission = (user, device) => {
  if (!user || !device) return false;
  if (user.administrator) return true;
  if (device.userId === user.id) return true;
  return false;
};

export const hasDeviceWritePermission = (user, device) => {
  if (!user || !device) return false;
  if (user.administrator) return true;
  if (device.userId === user.id) return true;
  return false;
};

export const hasGroupPermission = (user) => {
  return user?.administrator || false;
};

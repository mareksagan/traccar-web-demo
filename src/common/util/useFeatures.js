import { session } from '../../stores';

export default function useFeatures() {
  return {
    disableEvents: false,
    disableGroups: false,
    disableDrivers: false,
    disableMaintenances: false,
    disableCalendars: false,
  };
}

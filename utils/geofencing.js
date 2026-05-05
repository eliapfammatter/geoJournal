import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { sendGeofenceNotification } from './notifications';
import { recordPlaceVisited } from './stats';

export const GEOFENCE_TASK = 'geojournal-geofence';

TaskManager.defineTask(GEOFENCE_TASK, ({ data: { eventType, region }, error }) => {
  if (error) { console.error('Geofence error:', error); return; }
  if (eventType === Location.GeofencingEventType.Enter) {
    sendGeofenceNotification(region.identifier);
    recordPlaceVisited(region.identifier);
  }
});

// places must have { name, latitude, longitude }
export async function startGeofencing(places) {
  const regions = places.map((place) => ({
    identifier: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    radius: 200,
    notifyOnEnter: true,
    notifyOnExit: false,
  }));
  await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
}

export async function stopGeofencing() {
  const active = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
  if (active) await Location.stopGeofencingAsync(GEOFENCE_TASK);
}

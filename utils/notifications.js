import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function sendPhotoSavedNotification(locationStr) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Photo saved!',
      body: locationStr
        ? `Captured at ${locationStr}`
        : 'Your photo has been saved to your journal.',
    },
    trigger: null,
  });
}

export async function sendGeofenceNotification(placeName) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nearby place!',
      body: `You are near ${placeName}`,
    },
    trigger: null,
  });
}

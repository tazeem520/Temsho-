// ============================================================
//  TEMSHO — Mobile System Status Bar Notifications Engine
//  Requests notification permissions and displays alerts on Android
// ============================================================

import { Platform } from 'react-native';

let Notifications = null;
try {
  Notifications = require('expo-notifications');
  
  if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {}

export async function requestNotificationPermission() {
  if (Platform.OS === 'web' || !Notifications) return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (e) {
    return false;
  }
}

export async function showSystemNotification(title, body, data = {}) {
  if (Platform.OS === 'web' || !Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title || 'Temsho Update',
        body: body || '',
        sound: 'default',
        badge: 1,
        data,
      },
      trigger: null, // show immediately
    });
  } catch (e) {
    console.log('Notification error:', e);
  }
}

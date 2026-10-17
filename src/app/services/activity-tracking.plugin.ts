import { PluginListenerHandle, registerPlugin } from '@capacitor/core';

export interface RecordedLocation {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy: number;
}

export interface ActivityTrackingPlugin {
    startTracking(options: {
        activityId: string;
    }): Promise<void>;

    stopTracking(): Promise<void>;

    getRecordedLocations(options: {
        activityId: string;
    }): Promise<{ locations: RecordedLocation[] }>;

    deleteRecordedLocations(options: {
        activityId: string;
    }): Promise<{ deleted: boolean }>;

    requestTrackingPermissions(): Promise<{ granted: boolean }>;

    addListener(
        eventName: 'locationRecorded',
        listenerFunc: (location: RecordedLocation) => void
    ): Promise<PluginListenerHandle>;
}

export const ActivityTracking =
    registerPlugin<ActivityTrackingPlugin>('ActivityTracking');
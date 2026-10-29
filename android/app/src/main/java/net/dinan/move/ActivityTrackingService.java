
package net.dinan.move;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

// import com.google.android.gms.location.*;

import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import android.content.Intent;

@CapacitorPlugin(name = "ActivityTracking")
public class ActivityTrackingService extends Service {
    public static final String ACTION_START = "tracking.START";
    public static final String ACTION_STOP = "tracking.STOP";
    public static final String ACTION_REQUESTLOCATIONS = "tracking.REQUESTLOCATIONS";
    public static final String EXTRA_ACTIVITY_ID = "activityId";
    public static final String ACTION_STREAMLOCATIONS = "tracking.STREAMLOCATIONS";

    // private FusedLocationProviderClient locationClient;
    private android.location.LocationManager locationManager;
    private android.location.LocationListener locationListener;

    private static int locationIndex = 0;

//    private LocationCallback locationCallback;
    private BufferedWriter writer;

    private String activityId;

    private boolean isTracking = false;


  private static String tag = "ACTIVITY_TRACKING_SERVICE";
    private int pendingWrites = 0;

    @Override
    public void onCreate() {
        super.onCreate();
        // locationClient =
        //     LocationServices.getFusedLocationProviderClient(this);
        locationManager = (android.location.LocationManager)
            getSystemService(LOCATION_SERVICE);

        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

      if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        String action = intent.getAction();

        if (ACTION_STOP.equals(action)) {
            stopTracking();
            stopSelf();
            return START_NOT_STICKY;
        }

        if (ACTION_START.equals(action)) {
          Log.d(ActivityTrackingService.tag,"Start command registered");

//            String id = intent.getStringExtra(EXTRA_ACTIVITY_ID);
            // || !id.matches("[a-fA-F0-9-]{1,64}")
//            if (id == null) {
//              Log.w(ActivityTrackingService.tag,"Stopping, since ID is null (to avoid replacing active recording)");
//              stopSelf();
//                return START_NOT_STICKY;
//            }
//
//            // Do not accidentally replace an active recording.
//            if (writer != null) {
//                if (id.equals(activityId)) {
//                  Log.d(ActivityTrackingService.tag,"Writer active, id is same as activity id)");
//                  return START_NOT_STICKY;
//                }
//              Log.d(ActivityTrackingService.tag,"Stopping, since writer isn't null (to avoid replacing active recording)");
//              stopTracking();
//            }

            activityId = intent.getStringExtra(EXTRA_ACTIVITY_ID);
            isTracking = true;
            Notification notification =
                new NotificationCompat.Builder(this, "activity_tracking")
                    .setContentTitle("Activity in progress")
                    .setContentText("Recording your location")
                    .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                    .setOngoing(true)
                    .build();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(
                    1001,
                    notification,
                    android.content.pm.ServiceInfo
                        .FOREGROUND_SERVICE_TYPE_LOCATION
                );
            } else {
                startForeground(1001, notification);
            }

            try {
                File file = new File(
                    getFilesDir(), "activity-" + activityId + ".jsonl"
                );

                writer = new BufferedWriter(
                    new FileWriter(file, true)
                );

                startLocationUpdates();
            } catch (IOException | SecurityException e) {
                Log.e(ActivityTrackingService.tag,"Error caught: " + e.getMessage());
                stopTracking();
                stopSelf();
            }
        }

        if(ACTION_STREAMLOCATIONS.equals(action)){
          streamLocations();
        }

        if(ACTION_REQUESTLOCATIONS.equals(action)) {
          requestLocations();
        }

        return START_NOT_STICKY;
    }

  private void requestLocations() {
    File file = new File(
      getFilesDir(), "activity-" + activityId + ".jsonl"
    );

  }


  private void streamLocations() {
    if(locationIndex == 0) {

    }

  }


  private void startLocationUpdates() {
      if (ContextCompat.checkSelfPermission(
              this, Manifest.permission.ACCESS_FINE_LOCATION)
              != PackageManager.PERMISSION_GRANTED) {
          stopTracking();
          stopSelf();
          return;
      }

      locationListener = this::writeLocation;

      try {
          locationManager.requestLocationUpdates(
              android.location.LocationManager.GPS_PROVIDER,
              3000L,
              0f,
              locationListener,
              getMainLooper()
          );
      } catch (SecurityException e) {
          stopTracking();
          stopSelf();
      }
  }

    private void writeLocation(Location location) {
      Log.d(ActivityTrackingService.tag,"writeLocation");
      if (!isTracking || writer == null) return;

      Log.d(ActivityTrackingService.tag,"writeLocation (attempting to write locations)..");

       try {
            JSONObject point = new JSONObject();
            point.put("index",locationIndex);
            point.put("latitude", location.getLatitude());
            point.put("longitude", location.getLongitude());
            point.put("timestamp", location.getTime());
            point.put("accuracy", location.getAccuracy());

            writer.write(point.toString());
            writer.newLine();

            pendingWrites += 1;

            if (pendingWrites >= 5) {
                writer.flush();
                pendingWrites = 0;

            }

           Intent intent = new Intent("net.dinan.move.LOCATION_RECORDED");
           intent.setPackage(getPackageName());

           intent.putExtra("locationIndex",locationIndex);
           intent.putExtra("latitude", location.getLatitude());
           intent.putExtra("longitude", location.getLongitude());
           intent.putExtra("timestamp", location.getTime());
           intent.putExtra("accuracy", location.getAccuracy());

           locationIndex += 1;

           sendBroadcast(intent);
       } catch (Exception e) {
            // A production version should record/report the failure
            // and expose an error state to the application.
            pendingWrites = 0;
            locationIndex = 0;
        }
    }

    private void stopTracking() {
        // if (locationCallback != null) {
        //     locationClient.removeLocationUpdates(locationCallback);
        //     locationCallback = null;
        // }
      Log.d(ActivityTrackingService.tag,"Stopping tracking...");
      isTracking = false;
      pendingWrites = 0;
      locationIndex = 0;
      if (locationListener != null) {
          Log.d(tag,"Setting locationListener to NULL");
            locationManager.removeUpdates(locationListener);
            locationListener = null;
      }

        if (writer != null) {
          Log.d(tag,"Attempting to close writer.");
            try {
                writer.flush();
                writer.close();
            } catch (IOException ignored) {
            }
            writer = null;
        }
        stopForeground(STOP_FOREGROUND_REMOVE);
    }

    private void createNotificationChannel() {
      Log.d(ActivityTrackingService.tag,"createNotificationChannel");
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        Log.d(ActivityTrackingService.tag,"Creating notif channel, buildcode >= Q");
        NotificationChannel channel = new NotificationChannel(
                "activity_tracking",
                "Activity tracking",
                NotificationManager.IMPORTANCE_LOW
            );

            getSystemService(NotificationManager.class)
                .createNotificationChannel(channel);
        }
    }

    @Override
    public void onDestroy() {
      Log.d(ActivityTrackingService.tag,"onDestroy");
      stopTracking();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
   // private void startLocationUpdates() {
    //     if (ContextCompat.checkSelfPermission(
    //             this, Manifest.permission.ACCESS_FINE_LOCATION)
    //             != PackageManager.PERMISSION_GRANTED
    //         && ContextCompat.checkSelfPermission(
    //             this, Manifest.permission.ACCESS_COARSE_LOCATION)
    //             != PackageManager.PERMISSION_GRANTED) {
    //         stopTracking();
    //         stopSelf();
    //         return;
    //     }

    //     LocationRequest request =
    //         new LocationRequest.Builder(
    //             Priority.PRIORITY_HIGH_ACCURACY, 5000
    //         )
    //             .setMinUpdateIntervalMillis(3000)
    //             .build();

    //     locationCallback = new LocationCallback() {
    //         @Override
    //         public void onLocationResult(LocationResult result) {
    //             for (Location location : result.getLocations()) {
    //                 writeLocation(location);
    //             }
    //         }
    //     };

    //     locationClient.requestLocationUpdates(
    //         request, locationCallback, getMainLooper()
    //     ).addOnFailureListener(error -> {
    //         stopTracking();
    //         stopSelf();
    //     });
    // }

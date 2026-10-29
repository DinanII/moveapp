package net.dinan.move;

import android.content.Intent;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

// Permissions
import android.Manifest;
import android.location.Location;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

// emits
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;

import androidx.core.content.ContextCompat;

@CapacitorPlugin(
  name = "ActivityTracking",
  permissions = {
    @Permission(
      alias = "location",
      strings = {
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION
      }
    )
  }
)
public class ActivityTrackingPlugin extends Plugin {

  private BroadcastReceiver locationReceiver;

  public void load() {
    super.load();

    locationReceiver = new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        JSObject data = new JSObject();
        data.put("locationIndex",intent.getIntExtra("locationIndex",0));
        data.put("latitude", intent.getDoubleExtra("latitude", 0));
        data.put("longitude", intent.getDoubleExtra("longitude", 0));
        data.put("timestamp", intent.getLongExtra("timestamp", 0));
        data.put("accuracy", intent.getFloatExtra("accuracy", 0));

        notifyListeners("locationRecorded", data);
      }
    };

    IntentFilter filter =
      new IntentFilter("net.dinan.move.LOCATION_RECORDED");

    ContextCompat.registerReceiver(
      getContext(),
      locationReceiver,
      filter,
      ContextCompat.RECEIVER_NOT_EXPORTED
    );
  }

  @Override
  protected void handleOnDestroy() {
    if (locationReceiver != null) {
      getContext().unregisterReceiver(locationReceiver);
      locationReceiver = null;
    }

    super.handleOnDestroy();
  }

  @PluginMethod
  public void startTracking(PluginCall call) {
//    String activityId = call.getString("activityId");
//
//    if (activityId == null || activityId.isEmpty()) {
//      call.reject("activityId is required");
//      return;
//    }

    Intent intent = new Intent(
      getContext(), ActivityTrackingService.class
    );
    intent.setAction(ActivityTrackingService.ACTION_START);
//    intent.putExtra(
//      ActivityTrackingService.EXTRA_ACTIVITY_ID, activityId
//    );

    try {
      androidx.core.content.ContextCompat.startForegroundService(
        getContext(), intent
      );
      call.resolve();
    } catch (Exception e) {
      call.reject("Could not start tracking service", e);
    }
  }

  @PluginMethod
  public void stopTracking(PluginCall call) {
    Intent intent = new Intent(
      getContext(), ActivityTrackingService.class
    );
    intent.setAction(ActivityTrackingService.ACTION_STOP);

    getContext().startService(intent);
    call.resolve();
  }

  @PluginMethod
  public void streamLocations(PluginCall call) {
    String activityId = call.getString("activityId");

    if (activityId == null || activityId.isEmpty()) {
      call.reject("activityId is required");
      return;
    }

    Intent intent = new Intent(
      getContext(), ActivityTrackingService.class
    );
    intent.setAction(ActivityTrackingService.ACTION_STREAMLOCATIONS);
    intent.putExtra(
      ActivityTrackingService.EXTRA_ACTIVITY_ID, activityId
    );

    try {
      androidx.core.content.ContextCompat.startForegroundService(
        getContext(), intent
      );
      call.resolve();
    } catch (Exception e) {
      call.reject("Could not start tracking service", e);
    }
  }

  @PluginMethod
  public void getRecordedLocations(PluginCall call) {
    String activityId = call.getString("activityId");

    if (activityId == null || activityId.isEmpty()) {
      call.reject("activityId is required");
      return;
    }

    Intent intent = new Intent(
      getContext(), ActivityTrackingService.class
    );

    intent.setAction(ActivityTrackingService.ACTION_REQUESTLOCATIONS);

    intent.putExtra(
      ActivityTrackingService.EXTRA_ACTIVITY_ID, activityId
    );

    try {
      androidx.core.content.ContextCompat.startForegroundService(
        getContext(), intent
      );
      call.resolve();
    } catch (Exception e) {
      call.reject("Could not start tracking service", e);
    }
  }

  // Permissions
  @PluginMethod
  public void requestTrackingPermissions(PluginCall call) {
    if (getPermissionState("location") == PermissionState.GRANTED) {
      JSObject result = new JSObject();
      result.put("granted", true);
      call.resolve(result);
      return;
    }

    requestPermissionForAlias(
      "location", call, "locationPermissionCallback"
    );
  }

  @PermissionCallback
  private void locationPermissionCallback(PluginCall call) {
    boolean granted =
      getPermissionState("location") == PermissionState.GRANTED;

    JSObject result = new JSObject();
    result.put("granted", granted);
    call.resolve(result);
  }
}

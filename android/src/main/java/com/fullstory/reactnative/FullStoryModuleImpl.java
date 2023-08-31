package com.fullstory.reactnative;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.fullstory.FS;
import com.fullstory.FSOnReadyListener;
import com.fullstory.FSSessionData;

import java.util.UUID;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.lang.reflect.Method;
public class FullStoryModuleImpl {

    public static final String NAME = "FullStory";
    private static final String TAG = "FullStoryModuleImpl";
    public static final boolean reflectionSuccess;
    private static final Method PAGE_VIEW;
    private static final Method UPDATE_PAGE_PROPERTIES;
    private static final Method END_PAGE;

    static {
        Method pageView;
        Method updatePageProperties;
        Method endPage;
        try {
            pageView = FS.class.getMethod("__pageView", UUID.class, String.class, Map.class);
            updatePageProperties = FS.class.getMethod("__updatePageProperties", UUID.class, Map.class);
            endPage = FS.class.getMethod("__endPage", UUID.class);
        } catch (Throwable t) {
            pageView = null;
            updatePageProperties = null;
            endPage = null;
            Log.e(TAG, "Unable to access native FullStory pages API. Pages API will not function correctly. " +
                    "Make sure that your plugin is at least version 1.38; if the issue persists, please contact FullStory Support.");
        }

        PAGE_VIEW = pageView;
        UPDATE_PAGE_PROPERTIES = updatePageProperties;
        END_PAGE = endPage;

        reflectionSuccess = PAGE_VIEW != null && UPDATE_PAGE_PROPERTIES != null && END_PAGE != null;
    }


    public static void anonymize() {
        FS.anonymize();
    }

    public static void identify(String userId, ReadableMap userVars) {
        FS.identify(userId, toMap(userVars));
    }

    public static void setUserVars(ReadableMap userVars) {
        FS.setUserVars(toMap(userVars));
    }

    public static void onReady(Promise promise) {
        if (promise == null) {
            return;
        }

        // we can only invoke the promise callback once, so create an AtomicReference
        // to handle the logic
        final AtomicReference<Promise> promiseOneShot = new AtomicReference(promise);
        FS.setReadyListener(new FSOnReadyListener() {
            @Override
            public void onReady(FSSessionData sessionData) {
                // get the current value and set the new value to null
                Promise promise = promiseOneShot.getAndSet(null);
                if (promise == null) {
                    // this was already run once, so ignore
                    return;
                }

                WritableMap map = Arguments.createMap();

                // add the replay start url
                map.putString("replayStartUrl", sessionData.getCurrentSessionURL());

                // add the replay now url
                map.putString("replayNowUrl", FS.getCurrentSessionURL(true));

                // add the session id
                map.putString("sessionId", FS.getCurrentSession());

                // now resolve the promise
                promise.resolve(map);
            }
        });
    }

    public static void getCurrentSession(Promise promise) {
        if (promise != null) {
            promise.resolve(FS.getCurrentSession());
        }
    }

    public static void getCurrentSessionURL(Promise promise) {
        if (promise != null) {
            promise.resolve(FS.getCurrentSessionURL());
        }
    }

    public static void consent(boolean consented) {
        FS.consent(consented);
    }

    public static void event(String name, ReadableMap properties) {
        FS.event(name, toMap(properties));
    }

    public static void shutdown() {
        FS.shutdown();
    }

    public static void restart() {
        FS.restart();
    }

    public static void log(double level, String message) {
        // Convert the double to an int
        int intLevel = Double.valueOf(level).intValue();
        // React Native LogLevels:
        // Log    = 0, // Clamps to Debug on iOS
        // Debug  = 1,
        // Info   = 2, // Default
        // Warn   = 3,
        // Error  = 4,
        // Assert = 5, // Clamps to Error on Android
        FS.LogLevel actualLevel;
        switch (intLevel) {
            case 0:
                actualLevel = FS.LogLevel.LOG;
                break;
            case 1:
                actualLevel = FS.LogLevel.DEBUG;
                break;
            case 3:
                actualLevel = FS.LogLevel.WARN;
                break;
            case 4:
            case 5:
                actualLevel = FS.LogLevel.ERROR;
                break;
            case 2:
            default:
                // default to INFO
                actualLevel = FS.LogLevel.INFO;
            break;
        }

        // Call through to FS.log with the enum
        FS.log(actualLevel, message);
    }

    public static void resetIdleTimer() {
        FS.resetIdleTimer();
    }

    private static Map toMap(ReadableMap map) {
        if (map == null) {
            return null;
        }

        return map.toHashMap();
    }

    public static void startPage(String uuid, String pageName, ReadableMap pageProperties) {
        if (!reflectionSuccess) {
            return;
        }

        UUID nonce = UUID.fromString(uuid);
        try {
            PAGE_VIEW.invoke(null, nonce, pageName, toMap(pageProperties));
        } catch (Throwable t) {
            // this should never happen
            Log.e(TAG, "Unexpected error while calling startPage. Please contact FullStory Support.");
        }
    }

    public static void updatePage(String uuid, ReadableMap pageProperties) {
        if (!reflectionSuccess) {
            return;
        }
        UUID nonce = UUID.fromString(uuid);

        try {
            UPDATE_PAGE_PROPERTIES.invoke(null, nonce, toMap(pageProperties));
        } catch (Throwable t) {
            // this should never happen
            Log.e(TAG, "Unexpected error while calling updatePage. Please contact FullStory Support.");
        }
    }

    public static void endPage(String uuid) {
        if (!reflectionSuccess) {
            return;
        }
        UUID nonce = UUID.fromString(uuid);
        try {
            END_PAGE.invoke(null, nonce);
        } catch (Throwable t) {
            // this should never happen
            Log.e(TAG, "Unexpected error while calling endPage. Please contact FullStory Support.");
        }
    }
}

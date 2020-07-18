package com.fullstory.reactnative;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.fullstory.FS;
import com.fullstory.FSOnReadyListener;
import com.fullstory.FSSessionData;

import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

public class FullStoryModule extends ReactContextBaseJavaModule {

    public static final String NAME = "FullStory";

    private final ReactApplicationContext reactContext;

    public FullStoryModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public static void anonymize() {
        FS.anonymize();
    }

    @ReactMethod
    public void identify(String userId, ReadableMap userVars) {
        FS.identify(userId, toMap(userVars));
    }

    @ReactMethod
    public static void setUserVars(ReadableMap userVars) {
        FS.setUserVars(toMap(userVars));
    }

    @ReactMethod
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

    @ReactMethod
    public static void getCurrentSession(Promise promise) {
        if (promise != null) {
            promise.resolve(FS.getCurrentSession());
        }
    }

    @ReactMethod
    public static void getCurrentSessionURL(Promise promise) {
        if (promise != null) {
            promise.resolve(FS.getCurrentSessionURL());
        }
    }

    @ReactMethod
    public static void consent(boolean consented) {
        FS.consent(consented);
    }

    @ReactMethod
    public static void event(String name, ReadableMap properties) {
        FS.event(name, toMap(properties));
    }

    @ReactMethod
    public static void shutdown() {
        FS.shutdown();
    }

    @ReactMethod
    public static void restart() {
        FS.restart();
    }

    private static Map toMap(ReadableMap map) {
        if (map == null) {
            return null;
        }

        return map.toHashMap();
    }
}

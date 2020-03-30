
package com.fullstory.reactnative;

import java.util.Map;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import com.fullstory.FS;

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

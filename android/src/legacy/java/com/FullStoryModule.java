package com.fullstory.reactnative;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactContext;

import java.util.Map;
import java.util.HashMap;

import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

public class FullStoryModule extends ReactContextBaseJavaModule {

    FullStoryModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return FullStoryModuleImpl.NAME;
    }

    @ReactMethod
    public static void anonymize() {
        FullStoryModuleImpl.anonymize();
    }

    @ReactMethod
    public static void identify(String userId, ReadableMap userVars) {
        FullStoryModuleImpl.identify(userId, userVars);
    }

    @ReactMethod
    public static void setUserVars(ReadableMap userVars) {
        FullStoryModuleImpl.setUserVars(userVars);
    }

    @ReactMethod
    public static void onReady(Promise promise) {
        FullStoryModuleImpl.onReady(promise);
    }

    @ReactMethod
    public static void getCurrentSession(Promise promise) {
        FullStoryModuleImpl.getCurrentSession(promise);
    }

    @ReactMethod
    public static void getCurrentSessionURL(Promise promise) {
        FullStoryModuleImpl.getCurrentSessionURL(promise);
    }

    @ReactMethod
    public static void consent(boolean consented) {
        FullStoryModuleImpl.consent(consented);
    }

    @ReactMethod
    public static void event(String name, ReadableMap properties) {
        FullStoryModuleImpl.event(name, properties);
    }

    @ReactMethod
    public static void shutdown() {
        FullStoryModuleImpl.shutdown();
    }

    @ReactMethod
    public static void restart() {
        FullStoryModuleImpl.restart();
    }

    @ReactMethod
    public static void log(double level, String message) {
        FullStoryModuleImpl.log(level, message);
    }

    @ReactMethod
    public static void resetIdleTimer() {
        FullStoryModuleImpl.resetIdleTimer();
    }

    @ReactMethod
    public static void createPage(String pageName, ReadableMap pageProperties) {
        FullStoryModuleImpl.createPage(pageName, pageProperties);
    }

    @ReactMethod
    public static void startPage(ReadableMap pageProperties) {
        FullStoryModuleImpl.startPage(pageProperties);
    }

    @ReactMethod
    public static void updatePage(ReadableMap pageProperties) {
        FullStoryModuleImpl.updatePage(pageProperties);
    }

    @ReactMethod
    public static void endPage() {
        FullStoryModuleImpl.endPage();
    }
}

package com.fullstory.reactnative;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class FullStoryModule extends NativeFullStorySpec {

    /**
     * Guards the DeviceEventEmitter call against module invalidation. The FullStory SDK dispatches
     * session-ready callbacks asynchronously on the main thread, so a callback can arrive while
     * (or after) React Native tears down this module and its JS runtime.
     */
    private volatile boolean invalidated = false;

    FullStoryModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public void initialize() {
        super.initialize();
        FullStoryModuleImpl.initSessionListener(sessionData -> {
            if (invalidated) {
                return;
            }
            getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("fsOnSessionStarted", sessionData);
        });
    }

    @Override
    public void invalidate() {
        invalidated = true;
        FullStoryModuleImpl.tearDownSessionListener();
        super.invalidate();
    }

    @Override
    @NonNull
    public String getName() {
        return FullStoryModuleImpl.NAME;
    }

    @Override
    public void anonymize() {
        FullStoryModuleImpl.anonymize();
    }

    @Override
    public void identify(String userId, ReadableMap userVars) {
        FullStoryModuleImpl.identify(userId, userVars);
    }

    @Override
    public void setUserVars(ReadableMap userVars) {
        FullStoryModuleImpl.setUserVars(userVars);
    }

    @Override
    public void onReady(Promise promise) {
        FullStoryModuleImpl.onReady(promise);
    }

    @Override
    public void getCurrentSession(Promise promise) {
        FullStoryModuleImpl.getCurrentSession(promise);
    }

    @Override
    public void getCurrentSessionURL(Promise promise) {
        FullStoryModuleImpl.getCurrentSessionURL(promise);
    }

    @Override
    public void consent(boolean consented) {
        FullStoryModuleImpl.consent(consented);
    }

    @Override
    public void event(String name, ReadableMap properties) {
        FullStoryModuleImpl.event(name, properties);
    }

    @Override
    public void shutdown() {
        FullStoryModuleImpl.shutdown();
    }

    @Override
    public void restart() {
        FullStoryModuleImpl.restart();
    }

    @Override
    public void log(double level, String message) {
        FullStoryModuleImpl.log(level, message);
    }

    @Override
    public void resetIdleTimer() {
        FullStoryModuleImpl.resetIdleTimer();
    }

    @Override
    public void startPage(String nonce, String pageName, ReadableMap pageProperties) {
        FullStoryModuleImpl.startPage(nonce, pageName, pageProperties);
    }

    @Override
    public void updatePage(String uuid, ReadableMap pageProperties) {
        FullStoryModuleImpl.updatePage(uuid, pageProperties);
    }

    @Override
    public void endPage(String uuid) {
        FullStoryModuleImpl.endPage(uuid);
    }
}

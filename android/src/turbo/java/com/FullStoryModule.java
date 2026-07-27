package com.fullstory.reactnative;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;

public class FullStoryModule extends NativeFullStorySpec {

    /**
     * Guards emitOnSessionStarted against module invalidation. The FullStory SDK dispatches
     * session-ready callbacks asynchronously on the main thread, so a callback can arrive while
     * (or after) React Native tears down this module and its JS runtime.
     */
    private final Object emitLock = new Object();
    private boolean invalidated = false;

    FullStoryModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public void initialize() {
        super.initialize();
        /**
         * JavaTurboModule's event-emitter callback has a null-pointer crash on 32-bit Android
         * processes across several RN versions
         * Since SIGSEGV cannot be caught in Java, skip the listener on affected 32-bit builds.
         */
        if (!android.os.Process.is64Bit() && !isTurboEventEmitterSafe()) {
            // Pass null so that no event is emitted, matching the legacy module's behaviour on this path.
            FullStoryModuleImpl.initSessionListener(null);
            return;
        }
        FullStoryModuleImpl.initSessionListener(sessionData -> {
            synchronized (emitLock) {
                if (invalidated) {
                    // The module was torn down after this callback was queued; the event
                    // emitter is no longer safe to touch.
                    return;
                }
                emitOnSessionStarted(sessionData);
            }
        });
    }

    /**
     * Returns true if the running React Native version has the fix for the 32-bit
     * TurboModule event-emitter crash https://github.com/react/react-native/issues/51628

     * Falls back to true if the version cannot be determined, since an inaccessible
     * ReactNativeVersion implies a future RN version that already has the fix.
     */
    private static boolean isTurboEventEmitterSafe() {
        try {
            java.lang.reflect.Field field =
                Class.forName("com.facebook.react.modules.systeminfo.ReactNativeVersion")
                     .getField("VERSION");
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> v = (java.util.Map<String, Object>) field.get(null);
            int major = (int) v.get("major");
            int minor = (int) v.get("minor");
            int patch = (int) v.get("patch");
            // Fixed in: 0.79.6, 0.80.1, 0.81.0+
            return major > 0
                || minor >= 81
                || (minor == 80 && patch >= 1)
                || (minor == 79 && patch >= 6);
        } catch (Exception e) {
            return true;
        }
    }

    @Override
    public void invalidate() {
        synchronized (emitLock) {
            invalidated = true;
        }
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

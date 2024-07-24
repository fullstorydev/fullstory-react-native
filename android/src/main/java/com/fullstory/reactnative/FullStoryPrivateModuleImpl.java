package com.fullstory.reactnative;

import android.util.Log;
import android.view.View;
import com.facebook.react.bridge.UiThreadUtil;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.UIManager;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.common.ViewUtil;
import com.fullstory.FS;

import java.lang.reflect.Method;

public class FullStoryPrivateModuleImpl {

    public static final String NAME = "FullStoryPrivate";
    private static final String TAG = "FullStoryPrivateModuleImpl";

    public static final boolean clickReflectionSuccess;
    private static final Method CLICK_HANDLER;

    static {
        Method clickHandler;

        try {
            clickHandler = FS.class.getMethod("reactNative_exec_onFsPressForward_direct", View.class, boolean.class, boolean.class, boolean.class);
        } catch (Throwable t) {
            clickHandler = null;
            Log.e(TAG, "Unable to access native FullStory click handler API. Click events for React Native 74+ will not function correctly. " +
                    "Make sure that your plugin is at least version 1.49; if the issue persists, please contact FullStory Support.");
        }

        CLICK_HANDLER = clickHandler;

        clickReflectionSuccess = CLICK_HANDLER != null;
    }

    public static void onFSPressForward(final ReactApplicationContext context, final double tag, final boolean isLongPress, final boolean hasPressHandler, final boolean hasLongPressHandler) {
        if (!clickReflectionSuccess) {
            return;
        }

        int reactTag = (int) tag;
        if (reactTag == -1) {
            return;
        }

        UIManager uiManager;

        try {
            uiManager = UIManagerHelper.getUIManager(context, ViewUtil.getUIManagerType(reactTag));
        } catch (Throwable t) {
            // Silently ignore.
            return;
        }

        if (uiManager == null) {
            return;
        }

        Runnable runnable = () -> {
            // This will throw if the view cannot be resolved, so try/catch it.
            View view = null;
            try {
                view = uiManager.resolveView(reactTag);
            } catch (Throwable t) {
                // Silently ignore.
                return;
            }

            if (view == null) {
                return;
            }

            try {
                CLICK_HANDLER.invoke(null, view, isLongPress, hasPressHandler, hasLongPressHandler);
            } catch (Throwable t) {
                // This should never happen, so log the error.
                Log.e(TAG, "Unexpected error while calling the click handler. Please contact FullStory Support.");
            }

        };
        UiThreadUtil.runOnUiThread(runnable);
    }
}

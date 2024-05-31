package com.fullstory.reactnative;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class FullStoryPrivateModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext context;
    FullStoryPrivateModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @Override
    public String getName() {
        return FullStoryPrivateModuleImpl.NAME;
    }

    @ReactMethod
    public void onFSPressForward(final double tag, final boolean isLongPress, final boolean hasPressHandler, final boolean hasLongPressHandler) {
        FullStoryPrivateModuleImpl.onFSPressForward(context, tag, isLongPress, hasPressHandler, hasLongPressHandler);
    }
}

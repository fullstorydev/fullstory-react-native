package com.fullstory.reactnative;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;

public class FullStoryPrivateModule extends NativeFullStoryPrivateSpec {

    private final ReactApplicationContext context;
    FullStoryPrivateModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @Override
    @NonNull
    public String getName() {
        return FullStoryPrivateModuleImpl.NAME;
    }

    @Override
    public void onFSPressForward(final double tag, final boolean isLongPress, final boolean hasPressHandler, final boolean hasLongPressHandler) {
        FullStoryPrivateModuleImpl.onFSPressForward(context, tag, isLongPress, hasPressHandler, hasLongPressHandler);
    }
}

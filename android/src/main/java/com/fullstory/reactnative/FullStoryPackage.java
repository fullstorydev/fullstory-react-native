package com.fullstory.reactnative;

import androidx.annotation.Nullable;

import com.facebook.react.ReactPackage;
import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

public class FullStoryPackage extends TurboReactPackage implements ReactPackage {
    @Nullable
    @Override
    public NativeModule getModule(String name, ReactApplicationContext reactContext) {
        if (FullStoryModuleImpl.NAME.equals(name)) {
            return new FullStoryModule(reactContext);
        } else {
            return null;
        }
    }

    @Override
    public ReactModuleInfoProvider getReactModuleInfoProvider() {
        final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
        boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        moduleInfos.put(
                FullStoryModuleImpl.NAME,
                new ReactModuleInfo(
                        FullStoryModuleImpl.NAME,
                        FullStoryModuleImpl.NAME,
                        false, // canOverrideExistingModule
                        false, // needsEagerInit
                        true, // hasConstants
                        false, // isCxxModule
                        isTurboModule // isTurboModule
        ));

        return new ReactModuleInfoProvider() {
            @Override
            public Map<String, ReactModuleInfo> getReactModuleInfos() {
                return moduleInfos;
            }
        };
    }
}
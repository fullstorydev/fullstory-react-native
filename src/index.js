import { NativeModules } from 'react-native';

const { FullStory } = NativeModules;

const LogLevel = {
    Log: 0, // Clamps to Debug on iOS
    Debug: 1,
    Info: 2, // Default
    Warn: 3,
    Error: 4,
    Assert: 5, // Clamps to Error on Android
}

FullStory.LogLevel = LogLevel;

export default FullStory;
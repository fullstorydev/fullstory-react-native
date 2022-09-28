export type OnReadyResponse = {
    replayStartUrl: string;
    replayNowUrl: string;
    sessionId: string;
};

declare const LogLevel = {
    Log: 0, // Clamps to Debug on iOS
    Debug: 1,
    Info: 2, // Default
    Warn: 3,
    Error: 4,
    Assert: 5 // Clamps to Error on Android
}

export interface UserVars {
    /** Explicitly sets the unique identifier for the user */
    uid?: string;
    /** Displays nice-looking user names */
    displayName?: string;
    /** Activates "Email this user" */
    email?: string;

    /**  Other Simple key/value pairs you'd like to record. */
    [property: string]: string | boolean | number | undefined;
}

declare namespace FullStory {
    let LogLevel: typeof LogLevel;

    function anonymize(): void;

    function identify(string: string, Object: UserVars): void;

    function setUserVars(Object: UserVars): void;

    function onReady(): Promise<OnReadyResponse>;

    function getCurrentSession(): Promise<string>;

    function getCurrentSessionURL(): Promise<string>;

    function consent(boolean: boolean): void;

    function event(string: string, Object: UserVars): void;

    function shutdown(): void;

    function restart(): void;

    function log(number: number, string: string): void;

    function resetIdleTimer(): void;
}

export default FullStory
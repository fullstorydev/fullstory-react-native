declare type LogLevel = "off" | "error" | "warn" | "info" | "debug" | "log";
export declare type FullStoryAndroidProps = {
    logLevel?: LogLevel;
    logcatLevel?: LogLevel;
    enabledVariants?: string;
    recordOnStart?: boolean;
    addDependencies?: boolean;
};
declare type FullStoryIosProps = {};
export declare type FullStoryPluginProps = {
    org: string;
    version: string;
    host?: string;
} & FullStoryAndroidProps & FullStoryIosProps;
export {};

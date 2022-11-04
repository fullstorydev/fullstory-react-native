import { ConfigPlugin } from "@expo/config-plugins";
declare type LogLevel = "off" | "error" | "warn" | "info" | "debug" | "log";
declare type FullStoryCrossPlatformProps = {
    org: string;
    version: string;
    host?: string;
    recordOnStart?: boolean;
};
export declare type FullStoryAndroidProps = {
    logLevel?: LogLevel;
    logcatLevel?: LogLevel;
    enabledVariants?: string;
} & FullStoryCrossPlatformProps;
export declare type FullStoryIosProps = {} & FullStoryCrossPlatformProps;
declare type FullStoryPluginProps = FullStoryAndroidProps & FullStoryIosProps;
declare const _default: ConfigPlugin<FullStoryPluginProps>;
export default _default;

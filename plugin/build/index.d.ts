import { ConfigPlugin } from '@expo/config-plugins';
type LogLevel = 'off' | 'error' | 'warn' | 'info' | 'debug' | 'log';
type FullStoryCrossPlatformProps = {
    org: string;
    version: string;
    host?: string;
    recordOnStart?: boolean;
};
export type FullStoryAndroidProps = {
    logLevel?: LogLevel;
    logcatLevel?: LogLevel;
    enabledVariants?: string;
} & FullStoryCrossPlatformProps;
export type FullStoryIosProps = {
    includeAssets?: {
        [directory: string]: string[];
    };
    workaroundRNSVGCapture?: boolean;
    workaroundWKUserContentControllerRemoveAllUserScripts?: boolean;
} & FullStoryCrossPlatformProps;
type FullStoryPluginProps = FullStoryAndroidProps & FullStoryIosProps;
declare const _default: ConfigPlugin<FullStoryPluginProps>;
export default _default;

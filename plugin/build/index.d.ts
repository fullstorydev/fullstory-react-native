declare type FullStoryAndroidProps = {
    logLevel?: string;
    enabledVariants?: string;
};
declare type FullStoryIosProps = {};
export declare type FullStoryPluginProps = {
    org: string;
    version: string;
    host?: string;
} & FullStoryAndroidProps & FullStoryIosProps;
export {};

import { ConfigPlugin } from "@expo/config-plugins";
import { FullStoryAndroidProps } from ".";
export declare const addFullStoryMavenRepo: (projectBuildGradle: string) => string;
export declare const addFullStoryProjectDependency: (projectBuildGradle: string, version: string) => string;
export declare const addFullStoryGradlePlugin: (appBuildGradle: string, { org, host, logLevel, logcatLevel, enabledVariants, recordOnStart, }: FullStoryAndroidProps) => string;
declare const withFullStoryAndroid: ConfigPlugin<FullStoryAndroidProps>;
export default withFullStoryAndroid;

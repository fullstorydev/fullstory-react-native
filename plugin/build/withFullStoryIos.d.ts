import { ConfigPlugin } from "@expo/config-plugins";
import { FullStoryPluginProps } from ".";
export declare function addFullStoryToPodfile(src: string, version: string): string;
declare const withFullStoryIos: ConfigPlugin<FullStoryPluginProps>;
export default withFullStoryIos;

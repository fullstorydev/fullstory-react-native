import { ConfigPlugin } from '@expo/config-plugins';
import { FullStoryIosProps } from '.';
export declare function addFullStoryToPodfile(src: string, version: string): string;
declare const withFullStoryIos: ConfigPlugin<FullStoryIosProps>;
export default withFullStoryIos;

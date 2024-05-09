import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  onFSPressForward(tag: number, isLongPress: boolean, hasPressHandler: boolean, hasLongPressHandler: boolean): void;
}

export default TurboModuleRegistry.get<Spec>('FullStoryPrivate');

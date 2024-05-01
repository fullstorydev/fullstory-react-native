import { NativeModules } from 'react-native';
import { generateUUID, isTurboModuleEnabled } from './utils';

type PropertiesWithoutPageName = {
  [key: string]: unknown;
} & { pageName?: never };

const FullStory = isTurboModuleEnabled
  ? require('./NativeFullStory').default
  : NativeModules.FullStory;

const { startPage, endPage, updatePage } = FullStory;

type UnknownObj = {
  [key: string]: unknown | UnknownObj;
};

export class FSPage {
  private pageName: string;
  private nonce: string;
  private properties: UnknownObj;

  constructor(pageName: string, properties: PropertiesWithoutPageName = {}) {
    this.pageName = pageName;
    this.properties = properties;
    this.nonce = '';
    this.cleanProperties();
  }

  private static FS_PAGE_NAME_KEY = 'pageName';

  private static isObject(value: unknown) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  private static merge(oldValue: unknown, newValue: unknown) {
    // We can only merge dictionaries and do not perform recursion whenever we
    // encounter a non-dictionary value
    // (see com.fullstory.instrumentation FSPageImpl.java)
    if (!FSPage.isObject(oldValue) || !FSPage.isObject(newValue)) {
      return newValue;
    }
    return FSPage.mergeObjects(oldValue as UnknownObj, newValue as UnknownObj);
  }

  private static mergeObjects(oldObj: UnknownObj, newObj: UnknownObj) {
    // return new object instance on immutable "old" object frozen by RN
    const mergedObj = { ...oldObj };
    for (const key in newObj) {
      const oldInnerValue = oldObj[key];
      if (oldObj[key]) {
        mergedObj[key] = FSPage.merge(oldInnerValue, newObj[key]);
      } else {
        mergedObj[key] = newObj[key];
      }
    }
    return mergedObj;
  }

  private cleanProperties() {
    if (this.properties && this.properties[FSPage.FS_PAGE_NAME_KEY]) {
      delete this.properties[FSPage.FS_PAGE_NAME_KEY];
      console.warn(`${FSPage.FS_PAGE_NAME_KEY} is a reserved property and has been removed.`);
    }
  }

  update(properties: PropertiesWithoutPageName) {
    if (!this.nonce) {
      console.error(
        'Called `updateProperties` on FSPage that has not been `start`-ed. This may ' +
          'be a mistake. `updateProperties` should be called on the same FSPage ' +
          'instance that the corresponding `start` is called on.',
      );
      return;
    }

    this.properties = FSPage.merge(this.properties, properties) as UnknownObj;
    this.cleanProperties();
    updatePage(this.nonce, this.properties);
  }

  start(properties?: PropertiesWithoutPageName) {
    if (properties) {
      this.properties = FSPage.merge(this.properties, properties) as UnknownObj;
      this.cleanProperties();
    }
    this.nonce = generateUUID();
    startPage(this.nonce, this.pageName, this.properties);
  }

  end() {
    if (!this.nonce) {
      console.error(
        'Called `end` on FSPage that has not been `start`-ed. `end` should be ' +
          'called on the same FSPage instance that the corresponding `start` is ' +
          'called on.',
      );
      return;
    }
    endPage(this.nonce);
    this.nonce = '';
  }
}

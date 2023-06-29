import { NativeModules } from "react-native";

const isTurboModuleEnabled = global.__turboModuleProxy != null;

const FullStory = isTurboModuleEnabled
  ? require("./NativeFullStory").default
  : NativeModules.FullStory;

const {
    startPage,
    endPage,
    updatePage,
    getUUID,
  } = FullStory;

export default class FSPage {
    private pageName: string;
    private nonce: string;
    private properties: Object;

    constructor(pageName: string, properties: Object = {}) {
        this.pageName = pageName;
        this.properties = properties;
        this.cleanProperties();
    }

    static FS_PAGE_NAME_KEY = 'pageName';

    static isObject(value) {
        return (value && typeof value === 'object' && !Array.isArray(value));
    }

    static merge(oldValue, newValue) {
        // We can only merge dictionaries and do not perform recursion whenever we
        // encounter a non-dictionary value
        // (see com.fullstory.instrumentation FSPageImpl.java)
        if (!FSPage.isObject(oldValue) || !FSPage.isObject(newValue)) {
            return newValue;
        }
        return FSPage.mergeObjects(oldValue, newValue);
    }

    static mergeObjects(oldObj, newObj) {
        if (!newObj) return oldObj;

        for (const key in newObj) {
            const oldInnerValue = oldObj[key];
            if (oldObj[key]) {
                oldObj[key] = FSPage.merge(oldInnerValue, newObj[key]);
            } else {
                oldObj[key] = newObj[key];
            }
        }
      
        return oldObj;
    }

    cleanProperties() {
        if (this.properties && this.properties[FSPage.FS_PAGE_NAME_KEY]) {
            delete this.properties[FSPage.FS_PAGE_NAME_KEY];
            console.warn(`${FSPage.FS_PAGE_NAME_KEY} is a reserved property and has been removed.`);
        }
    }

    update(properties: Object) {
        if (!this.nonce) {
            console.error(
                "Called `updateProperties` on FSPage that has not been `start`-ed. This may " +
                "be a mistake. `updateProperties` should be called on the same FSPage " +
                "instance that the corresponding `start` is called on."
            );
            return;
        }

        FSPage.merge(this.properties, properties);
        this.cleanProperties();
        updatePage(this.nonce, this.properties);
    }

    start(properties?: Object) {
        if (properties) {
            FSPage.merge(this.properties, properties);
            this.cleanProperties();
        }
        this.nonce = getUUID();
        startPage(this.nonce, this.pageName, this.properties);
    }
    
    end() {
        if (!this.nonce) {
            console.error(
                "Called `end` on FSPage that has not been `start`-ed. `end` should be " +
                    "called on the same FSPage instance that the corresponding `start` is " +
                    "called on."
            );
            return;
        }
        endPage(this.nonce);
        this.nonce = '';
    }

    getPageName() {
        return this.pageName;
    }

    getProperties() {
        return this.properties;
    }
}
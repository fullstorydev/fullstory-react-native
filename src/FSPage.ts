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

export class FSPage {
    private pageName: string;
    private nonce: string;
    private properties: Object;

    constructor(pageName: string, properties: Object = {}) {
        this.pageName = pageName;
        this.properties = properties;
        this.cleanProperties();
    }

    private static FS_PAGE_NAME_KEY = 'pageName';

    private static isObject(value) {
        return (value && typeof value === 'object' && !Array.isArray(value));
    }

    private static merge(oldValue, newValue) {
        // We can only merge dictionaries and do not perform recursion whenever we
        // encounter a non-dictionary value
        // (see com.fullstory.instrumentation FSPageImpl.java)
        if (!FSPage.isObject(oldValue) || !FSPage.isObject(newValue)) {
            return newValue;
        }
        return FSPage.mergeObjects(oldValue, newValue);
    }

    private static mergeObjects(oldObj, newObj) {
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

    update(properties: Object) {
        if (!this.nonce) {
            console.error(
                "Called `updateProperties` on FSPage that has not been `start`-ed. This may " +
                "be a mistake. `updateProperties` should be called on the same FSPage " +
                "instance that the corresponding `start` is called on."
            );
            return;
        }

        this.properties = FSPage.merge(this.properties, properties);
        this.cleanProperties();
        updatePage(this.nonce, this.properties);
    }

    async start(properties?: Object) {
        if (properties) {
            this.properties = FSPage.merge(this.properties, properties);
            this.cleanProperties();
        }
        this.nonce = await getUUID();
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
}

# Changelog

## 1.4.2

Place the `handleCommand` check under the `DEBUG_FS_RN_FABRIC_THIRD_PARTY` preprocessor variable to avoid runtime crashes experienced by some projects.

## 1.4.1

Updated the minimum version for the FullStory `@fullstory/babel-plugin-react-native` babel plugin to `1.1.0` for New Architecture support.

## 1.4.0

Added support for the [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page) (this includes support for Fabric and Turbo Native Modules). Refer to the [New Architecture](https://help.fullstory.com/hc/en-us/articles/360052419133-Getting-Started-with-FullStory-React-Native-Capture#01HHCXMMZQ970DRWFA0XC03ER4) section of the FullStory React Native Getting Started guide for more information about minimum SDK and plugin versions.

## 1.3.0

Add support for FullStory Pages API.
Set up tsconfig and update TypeScript types.

## 1.2.1

Fix Android Turbomodule backward compatability with RN versions `<=0.64`.

## 1.2.0

Add support for Turbo Native Modules with backward compatibility.
Fix expo `recordOnStart` config.
Update gradle configs.

## 1.1.2

Updated the minimum version for the FullStory `@fullstory/babel-plugin-react-native` babel plugin to `1.0.3` to fix attributes in RN 71.
Add dependency overrides to fix `npm audit` warnings.

## 1.1.1

Fixed issues with TypeScript types. Thanks [devon94](https://github.com/devon94) for reporting and supplying a fix.

## 1.1.0

Added support for [Expo Managed Workflows](https://docs.expo.dev/introduction/managed-vs-bare/).

## 1.0.7

Added `FS.resetIdleTimer` to the TypeScript types.

## 1.0.6

Added support for calling `FS.resetIdleTimer`. This release now requires a minimum FullStory plugin version of `1.14.0`.

## 1.0.5

Updated the minimum version for the FullStory `@fullstory/babel-plugin-react-native` babel plugin to 1.0.2, to better work around metro server issues.

## 1.0.4

Updated the minimum versions for the FullStory babel plugins. Added a Typescript declaration for the FullStory base attributes. Added Typescript declarations for the FullStory API.

## 1.0.3

Added the ability to invoke the `log` API from within React Native. See more information [here](https://help.fullstory.com/hc/en-us/articles/360052419133-Getting-Started-with-FullStory-React-Native-Recording#01FM34C43RGW28NMC8PDWC7EZB)

## 1.0.2

Changed how the peer dependency for React Native is declared to better handle strict dependency checking

## 1.0.1

Link to a newer version of @fullstory/babel-plugin-annotate-react in order to fix React.Fragment and provide unimodules support

## 1.0.0

1.0.0 release!

## 0.9.4

Added support for the `onReady` method
Added support for `fsAttribute`, `fsTagName`, `data-component`, `data-element`, and `data-source-file`
Move the NativeProps hooking to this plug-in

## 0.9.3

Added README information about the private beta
Require at least `react-native` version `0.61.0`

## 0.9.2

Require at least version `0.9.2` of `@fullstory/babel-plugin-react-native`

## 0.9.1

README update

## 0.9.0

Initial Release

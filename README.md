# FullStory React Native Plugin

[![CircleCI](https://circleci.com/gh/fullstorydev/fullstory-react-native.svg?style=svg)](https://circleci.com/gh/fullstorydev/fullstory-react-native)

FullStory's React Native plugin exposes access to the FullStory Native Mobile SDK from within a React Native app. This plug-in is intended to be used in conjunction with [FullStory for Mobile Apps](https://www.fullstory.com/mobile-apps/).

## Quick Links

- [FullStory API](https://developer.fullstory.com)
- [Getting Started Guide](https://help.fullstory.com/hc/en-us/articles/360052419133)
- [Email us](mailto:mobile-support@fullstory.com)

## Install the React Native plugin

#### with npm

```
npm i @fullstory/react-native --save
```

#### with yarn

```
yarn add @fullstory/react-native
```

#### with expo-cli

```
expo install @fullstory/react-native
```

## Configuring the babel plugin

`@fullstory/babel-plugin-react-native` is automatically included as a dependency to the FullStory React Native plugin. Please refer to the babel plugin's [README.md](https://github.com/fullstorydev/fullstory-babel-plugin-react-native/blob/master/README.md) for information on how to configure it.

`@fullstory/babel-plugin-annotate-react` is automatically included as a dependency to the FullStory React Native plugin. Please refer to the babel plugin's [README.md](https://github.com/fullstorydev/fullstory-babel-plugin-annotate-react/blob/master/README.md) for information on how to configure it for React Native.

## Importing the React Native plugin

In order to use the FullStory Native Mobile SDK from within a React Native app, importing the React Native plugin is all that is required.

### Importing Example

Here's an example of importing the SDK in a React Native app.

```JSX
import FullStory from '@fullstory/react-native';
```

## Configuring for Expo

> This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

Add the config plugin to the plugins array of your `app.json` or `app.config.json`

```json
{
  "expo": {
    "plugins": [
      [
        "@fullstory/react-native",
        {
          "version": "1.28.0",
          "org": "ABC"
        }
      ]
    ]
  }
}
```

### Plugin Props

Plugins allow for extra customization by passing in an object with properties. If no extra properties are added, defaults will be used. **Certain properties are required.**

| Property        | Platform      | Required                               | Description                                                                                                |
| --------------- | ------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| version         | Android & iOS | ✅                                     | FullStory for Mobile Apps plugin version                                                                   |
| org             | Android & iOS | ✅                                     | Your assigned organization ID                                                                              |
| host            | Android & iOS | Optional. Defaults to: `fullstory.com` | The server url your sessions are sent to                                                                   |
| recordOnStart   | Android & iOS | Optional. Defaults to: `true`          | Setting RecordOnStart to `false` will prevent data capture until you explicitly invoke `FS.restart()` API. |
| enabledVariants | Android       | Optional. Defaults to: `release`       | Specifies which variants to apply FullStory instrumentation                                                |
| logLevel        | Android       | Optional. Defaults to: `info`          | Captures any log statements at or above the specified level                                                |
| logcatLevel     | Android       | Optional. Defaults to: `off`           | Captures any Logcat messages at or above the specified level                                               |
| addDependencies | Android       | Optional. Defaults to: `true`          | Used to prevent FullStory from auto-adding gradle dependencies                                             |

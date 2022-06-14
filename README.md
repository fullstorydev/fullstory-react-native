# FullStory React Native Plugin

[![CircleCI](https://circleci.com/gh/fullstorydev/fullstory-react-native.svg?style=svg)](https://circleci.com/gh/fullstorydev/fullstory-react-native)

FullStory's React Native plugin exposes access to the FullStory Native Mobile SDK from within a React Native app. This plug-in is intended to be used in conjunction with [FullStory for Mobile Apps](https://www.fullstory.com/mobile-apps/) for iOS and/or Android.

This plug-in is intended to be used in conjunction with [FullStory for Mobile Apps](https://www.fullstory.com/mobile-apps/). For more information, please see this [getting started guide](https://help.fullstory.com/hc/en-us/articles/360052419133). Email mobile-support@fullstory.com for additional help.

## Install the React Native plugin

#### with npm

```
npm i @fullstory/react-native --save
```

#### with yarn

```
yarn add @fullstory/react-native
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

# FullStory React Native Plugin

[![CircleCI](https://circleci.com/gh/fullstorydev/fullstory-react-native.svg?style=svg)](https://circleci.com/gh/fullstorydev/fullstory-react-native)

FullStory's React Native plugin exposes access to the FullStory Native Mobile SDK from within a React Native app. More information about the FullStory API can be found at https://developer.fullstory.com.

This plug-in is intended to be used in conjunction with [FullStory for Mobile Apps](https://www.fullstory.com/mobile-apps/). For more information, please see [this](https://help.fullstory.com/hc/en-us/articles/360052419133) getting started guide. Email mobile-support@fullstory.com for additional help.

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

## Using the SDK

Once FullStory is imported, you can make calls to the FullStory Native Mobile SDK.

### Sending custom events

```JavaScript
FullStory.event('Subscribed', {
  uid_str: '750948353',
  plan_name_str: 'Professional',
  plan_price_real: 299,
  plan_users_int: 10,
  days_in_trial_int: 42,
  feature_packs: ['MAPS', 'DEV', 'DATA'],
});
```

### Getting a callback once a session is created

```JavaScript
FullStory.onReady().then(function(result) {
    const replayStartUrl = result.replayStartUrl;
    const replayNowUrl = result.replayNowUrl;
    const sessionId = result.sessionId;
  });
```

### Generating a session replay link

```JavaScript
FullStory.getCurrentSessionURL().then(function(result) {
  const startOfPlayback = result;
});
```

### Using the `fsAttribute` property

Instead of setting attributes via an FS API method, use the `fsAttribute` property that FullStory's babel plugin adds to every React Native `View`.

```JavaScript
<Text fsAttribute={{custom_attr1: 'custom_value1', custom_attr2: 'custom_value2'}}>Text element with custom attributes</Text>
```

### Using the `fsClass` property

Instead of adding and removing classes via an FS API method, use the `fsClass` property that FullStory's babel plugin adds to every React Native `View`.

The 6 built-in `fsClass` string values are:

- "fs-exclude"
- "fs-exclude-without-consent"
- "fs-mask"
- "fs-mask-without-consent"
- "fs-unmask"
- "fs-unmask-with-consent"

```JavaScript
<Text fsClass="fs-unmask">Text element that is unmasked</Text>
```

### Using the `fsTagName` property

Instead of setting the tag name via an FS API method, use the `fsTagName` property that FullStory's babel plugin adds to every React Native `View`.

```JavaScript
<Text fsTagName="custom-tag-name">Text element with a custom tag name</Text>
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
          "org": "ABC",
          "enabledVariants": "all"
        }
      ]
    ]
  }
}
```

### Plugin Props

Plugins allow for extra customization by passing in an object with properties. If no extra properties are added, defaults will be used. **Certain properties are required.**

| Property        | Platform      | Required                               | Description                                                 |
| --------------- | ------------- | -------------------------------------- | ----------------------------------------------------------- |
| version         | Android & iOS | ✅                                     | FullStory for Mobile Apps plugin version                    |
| org             | Android & iOS | ✅                                     | Your assigned organization ID                               |
| host            | Android & iOS | Optional. Defaults to: `fullstory.com` | The server url your sessions are sent to                    |
| enabledVariants | Android       | Optional. Defaults to: `release`       | Specifies which variants to apply FullStory instrumentation |
| logLevel        | Android       | Optional. Defaults to: `info`          | Captures any log statements at or above the specified level |

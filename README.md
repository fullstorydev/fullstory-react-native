# FullStory React Native Plugin

[![CircleCI](https://circleci.com/gh/fullstorydev/fullstory-react-native.svg?style=svg)](https://circleci.com/gh/fullstorydev/fullstory-react-native)

FullStory's React Native plugin exposes access to the FullStory Native Mobile SDK from within a React Native app. More information about the FullStory API can be found at https://developer.fullstory.com.


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

### Generating a session replay link

```JavaScript
FullStory.getCurrentSessionURL().then(function(result) {
  const startOfPlayback = result;
});
```
# FullStory React Native Plugin

[![CircleCI](https://circleci.com/gh/fullstorydev/fullstory-react-native.svg?style=svg)](https://circleci.com/gh/fullstorydev/fullstory-react-native)

FullStory's React Native plugin exposes access to the FullStory Native Mobile SDK from within a React Native app. This plug-in is intended to be used in conjunction with [FullStory for Mobile Apps](https://www.fullstory.com/mobile-apps/) for iOS and/or Android.

## Quick Links

- [Intro to FullStory for Mobile Apps](https://help.fullstory.com/hc/en-us/articles/4414642861463)
- [Getting Started Guide](https://help.fullstory.com/hc/en-us/articles/360052419133)
- [FullStory API](https://developer.fullstory.com)
- [Email us](mailto:mobile-support@fullstory.com)

## Configuring the babel plugin

`@fullstory/babel-plugin-react-native` is automatically included as a dependency to the FullStory React Native plugin. Please refer to the babel plugin's [README.md](https://github.com/fullstorydev/fullstory-babel-plugin-react-native/blob/master/README.md) for information on how to configure it.
We use this babel plugin to add support for touch and UI tracking.

`@fullstory/babel-plugin-annotate-react` is automatically included as a dependency to the FullStory React Native plugin. Please refer to the babel plugin's [README.md](https://github.com/fullstorydev/fullstory-babel-plugin-annotate-react/blob/master/README.md) for information on how to configure it for React Native.
We use this babel plugin to add additional props to React Native components for [selectors](https://help.fullstory.com/hc/en-us/articles/360020622494).

## Importing the React Native plugin

In order to use the FullStory Native Mobile SDK from within a React Native app, importing the React Native plugin is all that is required.

### Importing Example

Here's an example of importing the SDK in a React Native app.

```JSX
import FullStory from '@fullstory/react-native';
```

## Using the SDK

Once FullStory is imported, you can make calls to the FullStory Native Mobile SDK.

### Getting a callback once a session is created

```JavaScript
FullStory.onReady().then(function(result) {
    const replayStartUrl = result.replayStartUrl;
    const replayNowUrl = result.replayNowUrl;
    const sessionId = result.sessionId;
  });
```

### Identifying users and passing custom data to FullStory

On the Web, FullStory offers the [FS.identify](https://help.fullstory.com/hc/en-us/articles/360020828113) and [FS.setUserVars](https://help.fullstory.com/hc/en-us/articles/360020623294) JavaScript functions to enable you to enrich your FullStory data with additional variables for use in searches, segments, and integrations. This functionality is replicated on React Native to allow you to pass user information to FullStory directly from your app. The methods behave identically to their JavaScript counterparts linked above.

```JavaScript
FullStory.identify(uid); // uid is a string containing a unique identifier for the current user
```

You should not use `FullStory.identify` for anonymous or guest users, since you don't actually know who they are (however, you can still attribute custom variables to unidentified users with `FullStory.setUserVars`).

Careful! You can't [re-identify someone](https://help.fullstory.com/hc/en-us/articles/360020622634) once you've given them a unique id with `FullStory.identify`. Attempting to call `FullStory.identify` on an already-identified user will split the session and create a new, separate user. Not using it on the logout screen can help keep different users sharing an app from being mixed up.

**For best practices on using `FullStory.identify`, please visit the [FS.identify](https://help.fullstory.com/hc/en-us/articles/360020828113) documentation.**

If you have all the needed data, it can be easier to call `FullStory.identify(uid, userVars)` and skip a separate call to `FullStory.setUserVars`. Then again, sometimes the custom properties you want to capture in FullStory aren't available upon app load — maybe due to a `fetch` request, for example — in which case, you'd call `FullStory.setUserVars` whenever the data does arrive.

```JavaScript
FullStory.setUserVars(userVars); // userVars is a JSON object
```

What can you capture in this way? Just about anything. Here's an example:

```JavaScript
FullStory.setUserVars({
"displayName" : "Daniel Falko",
"email" : "daniel.falko@example.com",
"pricingPlan" : "free", // is he a freemium, basic, or pro customer?
"popupHelp" : true, // did he turn off the aggressive in-app help?
"totalSpent" : 14.50 // how much has he spent on in-app purchases so far?
});
```

**For best practices on using `FullStory.setUserVars`, please visit the [FS.setUserVars](https://help.fullstory.com/hc/en-us/articles/360020623294) documentation.**

If you would like to programmatically anonymize users for FullStory, you can do so with

```JavaScript
FullStory.anonymize();
```

The data for these anonymous users will still be [captured](https://help.fullstory.com/hc/en-us/articles/360020829573).

### Sending custom events

`FullStory.event` on React Native behaves identically to [FS.event](https://help.fullstory.com/hc/en-us/articles/360020623274) on the web.

```
FullStory.event(eventName, eventProperties);
```

Example usage:

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

### Getting the session replay link

```JavaScript
FullStory.getCurrentSessionURL().then(function(result) {
  const startOfPlayback = result;
});
```

### Getting the session ID

```JavaScript
FullStory.getCurrentSession().then(function(result) {
  const session = result;
});
```

### Shutdown and restarting the session

On the Web, FullStory offers [FS.shutdown and FS.restart](https://help.fullstory.com/hc/en-us/articles/360020623314) JavaScript functions to shutdown and restart capture. Either can be called immediately after the FullStory data capture snippet is executed. This functionality is replicated on React Native, and the methods behave identically to their JavaScript counterparts linked above.

```JavaScript
FullStory.shutdown();
```

```JavaScript
FullStory.restart();
```

### Privacy Consent

[FS.consent](https://help.fullstory.com/hc/en-us/articles/360020623254) on the web gives you the ability to selectively capture parts of your site or application based on explicit user consent.

You can use `FullStory.consent` whenever a user grants or revokes consent to capture data. Depending on a user’s preference, FullStory will either capture or block specially designated elements (known as “consent-required elements”) within that user’s sessions.

```JavaScript
FullStory.consent(userConsents)    // userConsents is an optional boolean parameter indicating whether the user is giving consent (true, default) or revoking consent (false)
```

Consent-required elements are blocked by default. Calling `FullStory.consent()` or `FullStory.consent(true)` will enable capturing of all consent-required elements for the current user from that point forward. Calling `FullStory.consent(false)` will block all consent-required elements for the current user once again (useful when the user has revoked their consent).

**For best practices on using `FullStory.consent`, please visit the [FS.consent](https://help.fullstory.com/hc/en-us/articles/360020623254) documentation.**

### Logging

Using FullStory, [you can see the messages in the user's browser console upon playback](https://help.fullstory.com/hc/en-us/articles/360020828533).
Similar to the [web](https://help.fullstory.com/hc/en-us/articles/360020828133), FullStory offers `FullStory.log` for React Native.

```JavaScript
FullStory.log("Customer logged in successfully");
```

### Using the `fsAttribute` property

Instead of setting attributes via an FS API method, use the `fsAttribute` property that FullStory's babel plugin adds to every React Native `View`.

```JSX
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

```JSX
<Text fsClass="fs-unmask">Text element that is unmasked</Text>
```

### Using the `fsTagName` property

Instead of setting the tag name via an FS API method, use the `fsTagName` property that FullStory's babel plugin adds to every React Native `View`.

```JSX
<Text fsTagName="custom-tag-name">Text element with a custom tag name</Text>
```

## Troubleshooting

- [Troubleshooting Client API (FullStory.event, FullStory.setUserVars, and FullStory.identify) errors](https://help.fullstory.com/hc/en-us/articles/360020624394-Troubleshooting-Client-API-FS-event-FS-setUserVars-and-FS-identify-errors)

## Mobile Privacy

FullStory for Mobile Apps includes and requires Private by Default technology that empowers product teams to debug experiences on native mobile applications while proactively respecting end-user privacy. Session re-creation for mobile apps isn't a screen recording and FullStory never captures screenshots from an end-user's device. Similar to FullStory for the web, where session replay represents a re-creation of a digital experience based on captured changes in the DOM, FullStory's session re-creation for mobile apps is based on drawing operations, where text, images, and personal data are masked at the source by default, such that masked data never reaches FullStory's servers.

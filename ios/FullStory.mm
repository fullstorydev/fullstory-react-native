#import "FullStory.h"

#import <objc/runtime.h>

#import <React/RCTView.h>
#import <React/RCTViewManager.h>
#import <React/RCTComponentData.h>
#import <React/RCTLog.h>

#import "FSReactSwizzle.h"

@implementation FullStory {
	RCTPromiseResolveBlock onReadyPromise;
}

NSString *const PagesAPIError = @"Unable to access native FullStory pages API and call %@. Pages API will not function correctly. Make sure that your plugin is at least version 1.41; if the issue persists, please contact FullStory Support.";

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(anonymize)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		[FS anonymize];
	});
}

RCT_EXPORT_METHOD(identify:(NSString *)uid userVars: (NSDictionary *)userVars)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		[FS identify:uid userVars:userVars];
	});
}

RCT_EXPORT_METHOD(setUserVars:(NSDictionary *)userVars)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		[FS setUserVars:userVars];
	});
}

- (void) getCurrentSession:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
        resolve(FS.currentSession);
    });
}

RCT_REMAP_METHOD(getCurrentSession, getCurrentSessionWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  [self getCurrentSession:resolve reject:reject];
}

- (void) getCurrentSessionURL:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
        resolve(FS.currentSessionURL);
    });
}

RCT_REMAP_METHOD(getCurrentSessionURL, getCurrentSessionURLWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  [self getCurrentSessionURL:resolve reject:reject];
}

RCT_EXPORT_METHOD(consent:(BOOL)consented)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		[FS consent:consented];
	});
}

RCT_EXPORT_METHOD(event:(NSString *)name eventProperties:(NSDictionary *)properties)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		[FS event:name properties:properties];
	});
}

RCT_EXPORT_METHOD(shutdown)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		[FS shutdown];
	});
}

RCT_EXPORT_METHOD(restart)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		[FS restart];
	});
}

RCT_EXPORT_METHOD(log:(nonnull NSNumber *)level str:(NSString *)str)
{
	// React Native LogLevels:
	// Log    = 0, // Clamps to Debug on iOS
	// Debug  = 1,
	// Info   = 2, // Default
	// Warn   = 3,
	// Error  = 4,
	// Assert = 5, // Clamps to Error on Android
	FSEventLogLevel levelValue;
	switch (level.intValue) {
		case 0:
		case 1:
			levelValue = FSLOG_DEBUG;
			break;
		case 3:
			levelValue = FSLOG_WARNING;
			break;
		case 4:
			levelValue = FSLOG_ERROR;
			break;
		case 5:
			levelValue = FSLOG_ASSERT;
			break;
		case 2:
		default:
			// default to INFO
			levelValue = FSLOG_INFO;
		break;
	}

	dispatch_async(dispatch_get_main_queue(), ^{
		[FS logWithLevel:levelValue message:str];
	});
}

RCT_EXPORT_METHOD(resetIdleTimer)
{
	dispatch_async(dispatch_get_main_queue(), ^{
		[FS resetIdleTimer];
	});
}

RCT_EXPORT_METHOD(startPage:(NSString *)nonce pageName:(NSString *)pageName pageProperties:(NSDictionary *)pageProperties)
{
	if (![FS respondsToSelector:@selector(_pageViewWithNonce:name:properties:)]) {
		RCTLogError(PagesAPIError, @"startPage");
	} else {
		NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:nonce];        

		dispatch_async(dispatch_get_main_queue(), ^{
			[FS _pageViewWithNonce:uuid name:pageName properties:pageProperties];
		});
	}
}

RCT_EXPORT_METHOD(endPage:(NSString *)nonce)
{
	if (![FS respondsToSelector:@selector(_endPageWithNonce:)]) {
		RCTLogError(PagesAPIError, @"endPage");
	} else {
		NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:nonce];

		dispatch_async(dispatch_get_main_queue(), ^{
			[FS _endPageWithNonce:uuid];
		});
	}
}

RCT_EXPORT_METHOD(updatePage:(NSString *)nonce pageProperties:(NSDictionary *)pageProperties)
{
	if (![FS respondsToSelector:@selector(_updatePageWithNonce:properties:)]) {
		RCTLogError(PagesAPIError, @"updatePage");
	} else {
		NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:nonce];

		dispatch_async(dispatch_get_main_queue(), ^{
			[FS _updatePageWithNonce:uuid properties:pageProperties];
		});
	}
}

- (void) fullstoryDidStartSession:(NSString *)sessionUrl {
	if (!onReadyPromise)
		return;

	NSMutableDictionary *dict = [NSMutableDictionary new];
	dict[@"replayStartUrl"] = sessionUrl;
	dict[@"replayNowUrl"] = [FS currentSessionURL: true];
	dict[@"sessionId"] = FS.currentSession;
	onReadyPromise(dict);

	onReadyPromise = nil;
}

- (void) onReady:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  	onReadyPromise = resolve;
	FS.delegate = self;

	if (FS.currentSessionURL) {
		/* If we already have a session running, fire the promise
		 * immediately. */
		[self fullstoryDidStartSession:FS.currentSessionURL];
	}
}

RCT_REMAP_METHOD(onReady, onReadyWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
	[self onReady:resolve reject:reject];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (void)log:(double)logLevel message:(NSString *)message {
    NSNumber* _Nonnull level = [NSNumber numberWithInt:logLevel];

    [self log:level str:message];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
	(const facebook::react::ObjCTurboModule::InitParams &)params
{
	return std::make_shared<facebook::react::NativeFullStorySpecJSI>(params);
}
#endif
@end

static const char *_rctview_previous_attributes_key = "associated_object_rctview_previous_attributes_key";

static void set_fsClass(id json, RCTView *view) {
    NSArray <NSString *>* classes = [(NSString *)json componentsSeparatedByString: @","];
    [FS removeAllClasses:view];
    [FS addClasses:view classNames:classes];
}

static void set_fsTagName(id json, RCTView *view) {
   [FS setTagName:view tagName:(NSString *)json];
}

static void set_dataComponent(id json, RCTView *view) {
   [FS setAttribute:view attributeName:@"data-component" attributeValue:(NSString *)json];
}

static void set_dataElement(id json, RCTView *view) {
    [FS setAttribute:view attributeName:@"data-element" attributeValue:(NSString *)json];
}

static void set_dataSourceFile(id json, RCTView *view) {
    [FS setAttribute:view attributeName:@"data-source-file" attributeValue:(NSString *)json];
}

static void set_fsAttribute(id json, RCTView *view) {
    NSDictionary *newAttrs = (NSDictionary *)json;

    /* Clear up all the old attributes first, if they exist. */
    NSSet *oldAttrs = objc_getAssociatedObject(view, _rctview_previous_attributes_key);
    if (oldAttrs) {
        for (NSString *attr in oldAttrs) {
            [FS removeAttribute:view attributeName:attr];
        }
    }

    /* Load in the new attributes. */
    NSMutableSet *newAttrSet = [NSMutableSet new];
    if (newAttrs) {
        for (NSString *attr in newAttrs) {
            [FS setAttribute:view attributeName:attr attributeValue:(NSString *)newAttrs[attr]];
            [newAttrSet addObject:attr];
        }
    }

    /* And set them up for cleanup next time. */
    objc_setAssociatedObject(view, _rctview_previous_attributes_key, newAttrSet, OBJC_ASSOCIATION_RETAIN);
}


@implementation RCTViewManager (FullStory)

+ (NSArray<NSString *> *) propConfig_fsClass {
	return @[@"NSString *", @"__custom__"];
}

- (void) set_fsClass:(id)json forView:(RCTView*)view withDefaultView:(RCTView *)defaultView {
    set_fsClass(json, view);
}

+ (NSArray<NSString *> *) propConfig_dataComponent {
	return @[@"NSString *", @"__custom__"];
}

- (void) set_dataComponent:(id)json forView:(RCTView*)view withDefaultView:(RCTView *)defaultView {
	[FS setAttribute:view attributeName:@"data-component" attributeValue:(NSString *)json];
}

+ (NSArray<NSString *> *) propConfig_dataElement {
	return @[@"NSString *", @"__custom__"];
}

- (void) set_dataElement:(id)json forView:(RCTView*)view withDefaultView:(RCTView *)defaultView {
	[FS setAttribute:view attributeName:@"data-element" attributeValue:(NSString *)json];
}

+ (NSArray<NSString *> *) propConfig_dataSourceFile {
	return @[@"NSString *", @"__custom__"];
}

- (void) set_dataSourceFile:(id)json forView:(RCTView*)view withDefaultView:(RCTView *)defaultView {
	[FS setAttribute:view attributeName:@"data-source-file" attributeValue:(NSString *)json];
}

+ (NSArray<NSString *> *) propConfig_fsTagName {
	return @[@"NSString *", @"__custom__"];
}

- (void) set_fsTagName:(id)json forView:(RCTView*)view withDefaultView:(RCTView *)defaultView {
	set_fsTagName(json, view);
}

+ (NSArray<NSString *> *) propConfig_fsAttribute {
	return @[@"NSDictionary *", @"__custom__"];
}

- (void) set_fsAttribute:(id)json forView:(RCTView*)view withDefaultView:(RCTView *)defaultView {
    set_fsAttribute(json, view);
}
@end

@interface FSReactSwizzleBootstrap : NSObject
@end

@implementation FSReactSwizzleBootstrap
+ (void) load {
	/* class_copyMethodList in RCTComponentData's lookup of NativeProps
	 * can't see the propConfigs that we create in the superclass.  So
	 * we swizzle that to inject our NativeProps directly in there, so
	 * UniModules knows to pass them through.
	 */
	SWIZZLE_BEGIN_INSTANCE(RCTComponentData, @selector(viewConfig), NSDictionary *) {
		NSDictionary<NSString *, id> *r = SWIZZLED_METHOD();
		r[@"propTypes"][@"fsClass"] = @"NSString *";
		r[@"propTypes"][@"dataComponent"] = @"NSString *";
		r[@"propTypes"][@"dataElement"] = @"NSString *";
		r[@"propTypes"][@"dataSourceFile"] = @"NSString *";
		r[@"propTypes"][@"fsTagName"] = @"NSString *";
		r[@"propTypes"][@"fsAttribute"] = @"NSDictionary *";
		return r;
	} SWIZZLE_END;

    // SWIZZLE_BEGIN_INSTANCE(RCTViewComponentView, @selector(handleCommand:args:), void, const NSString *commandName, const NSArray *args) {
    //         if ([commandName isEqual:@"fsAttribute"]) {
    //             set_fsAttribute(args[0], self);
    //         } else if ([commandName isEqualToString:@"fsClass"]) {
    //             set_fsClass(args[0], self);
    //         } else if ([commandName isEqual:@"dataElement"]) {
    //             set_dataElement(args[0], self);
    //         } else if ([commandName isEqualToString:@"dataSourceFile"]) {
    //             set_dataSourceFile(args[0], self);
    //         } else if ([commandName isEqualToString:@"fsTagName"]) {
    //             set_fsTagName(args[0], self);
    //         } else if ([commandName isEqualToString:@"dataComponent"]) {
    //             set_dataComponent(args[0], self);
    //         }
    //     } SWIZZLE_END;

	// SWIZZLE_BEGIN_INSTANCE(RCTTextInputComponentView, @selector(handleCommand:args:), void, const NSString *commandName, const NSArray *args) {
	// 		if ([commandName isEqual:@"fsAttribute"]) {
	// 			set_fsAttribute(args[0], self);
	// 		} else if ([commandName isEqualToString:@"fsClass"]) {
	// 			set_fsClass(args[0], self);
	// 		} else if ([commandName isEqual:@"dataElement"]) {
	// 			set_dataElement(args[0], self);
	// 		} else if ([commandName isEqualToString:@"dataSourceFile"]) {
	// 			set_dataSourceFile(args[0], self);
	// 		}
	// 	} SWIZZLE_END;
}
@end

#import "FullStory.h"

#import <objc/runtime.h>

#import <React/RCTView.h>
#import <React/RCTViewManager.h>
#import <React/RCTComponentData.h>

#import "FSReactSwizzle.h"

@implementation FullStory {
	RCTPromiseResolveBlock onReadyPromise;
}

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

RCT_REMAP_METHOD(getCurrentSession, getCurrentSessionWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		resolve(FS.currentSession);
	});
}

RCT_REMAP_METHOD(getCurrentSessionURL, getCurrentSessionURLWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		resolve(FS.currentSessionURL);
	});
}

RCT_REMAP_METHOD(getCurrentSessionURLNow, getCurrentSessionURLNowWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		resolve([FS currentSessionURL: true]);
	});
}

RCT_EXPORT_METHOD(consent:(BOOL)consented)
{
  dispatch_async(dispatch_get_main_queue(), ^{
		[FS consent:consented];
	});
}

RCT_EXPORT_METHOD(event:(NSString *)name properties:(NSDictionary *)properties)
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

RCT_EXPORT_METHOD(log:(nonnull NSNumber *)level message:(NSString *)message)
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
		[FS logWithLevel:levelValue message:message];
	});
}

RCT_EXPORT_METHOD(resetIdleTimer)
{
	dispatch_async(dispatch_get_main_queue(), ^{
		[FS resetIdleTimer];
	});
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

RCT_REMAP_METHOD(onReady, onReadyWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
	onReadyPromise = resolve;
	FS.delegate = self;

	if (FS.currentSessionURL) {
		/* If we already have a session running, fire the promise
		 * immediately. */
		[self fullstoryDidStartSession:FS.currentSessionURL];
	}
}

@end

static const char *_rctview_previous_attributes_key = "associated_object_rctview_previous_attributes_key";

@implementation RCTViewManager (FullStory)

+ (NSArray<NSString *> *) propConfig_fsClass {
	return @[@"NSString *", @"__custom__"];
}

- (void) set_fsClass:(id)json forView:(RCTView*)view withDefaultView:(RCTView *)defaultView {
	NSArray <NSString *>* classes = [(NSString *)json componentsSeparatedByString: @","];
	[FS removeAllClasses:view];
	[FS addClasses:view classNames:classes];
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
	[FS setTagName:view tagName:(NSString *)json];
}

+ (NSArray<NSString *> *) propConfig_fsAttribute {
	return @[@"NSDictionary *", @"__custom__"];
}

- (void) set_fsAttribute:(id)json forView:(RCTView*)view withDefaultView:(RCTView *)defaultView {
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
}
@end

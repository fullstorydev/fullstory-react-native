#import "FullStory.h"
#import <React/RCTView.h>
#import <React/RCTViewManager.h>

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

@end

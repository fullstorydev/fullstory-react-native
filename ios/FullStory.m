#import "FullStory.h"


@implementation FullStory

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
@end

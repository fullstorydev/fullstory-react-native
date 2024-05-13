#import <React/RCTBridgeModule.h>
#import <FullStory/FS.h>
#import <FullStory/FSDelegate.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "FullStorySpec.h"
#endif

@interface FullStory : NSObject <RCTBridgeModule, FSDelegate>
@end

@interface FullStoryPrivate : NSObject <RCTBridgeModule, FSDelegate>
@end

@interface FS(FSPrivate)
+ (void) _pageViewWithNonce:(NSUUID *)nonce name:(NSString *)pageName properties:(NSDictionary<NSString *, id> *)properties;
+ (void) _updatePageWithNonce:(NSUUID *)nonce properties:(NSDictionary<NSString *, id> *)properties;
+ (void) _endPageWithNonce:(NSUUID *)nonce;
@end

#ifdef RCT_NEW_ARCH_ENABLED
@interface FullStory () <NativeFullStorySpec>
@end

@interface FullStoryPrivate () <NativeFullStoryPrivateSpec>
@end
#endif

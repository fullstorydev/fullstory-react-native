#import <React/RCTBridgeModule.h>
#import <FullStory/FS.h>
#import <FullStory/FSDelegate.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "FullStorySpec.h"
#endif

@interface FullStory : NSObject <RCTBridgeModule, FSDelegate>

@end

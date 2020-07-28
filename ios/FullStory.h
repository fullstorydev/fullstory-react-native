#import <React/RCTBridgeModule.h>
#import <FullStory/FS.h>
#import <FullStory/FSDelegate.h>

@interface FullStory : NSObject <RCTBridgeModule, FSDelegate>

@end

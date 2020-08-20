#import <Foundation/Foundation.h>

#define __DO_SWIZZLE_BLOCK(ARGS...) \
    block = ^(id self, ##ARGS)

#define __DO_SWIZZLE(SEL) { \
    /* convert block to IMP trampoline and replace method implementation */ \
    IMP imp = imp_implementationWithBlock(block); \
    \
    /* Try adding the method if not yet in the current class */ \
    if (!class_addMethod(c, SEL, imp, method_getTypeEncoding(m))) { \
        orig = (OrigFnPtr)method_setImplementation(m, imp); \
    } else { \
        orig = (OrigFnPtr)method_getImplementation(m); \
    } \
} \

#define __DO_METHOD_PTR(RETURN_VALUE, ARGS...) \
    typedef RETURN_VALUE (*OrigFnPtr)(id, SEL, ##ARGS); \
    __block OrigFnPtr orig; \

#define __SWIZZLE_BEGIN(IS_CLASS, CLASS, SELECTOR, RETURN_TYPE, ARGS...) do { \
    /* Front-load some operations */ \
    Class c = objc_getClass(#CLASS); \
    if (!c) { NSLog(@"FS: did not get class " #CLASS); break; } \
    __attribute__((unused)) SEL sel = SELECTOR; \
    RETURN_TYPE(^block)(id, ##ARGS) = nil;\
    Method m = IS_CLASS ? class_getClassMethod(c, SELECTOR) : class_getInstanceMethod(c, SELECTOR); \
    if (IS_CLASS) c = object_getClass(c); \
    __DO_METHOD_PTR(RETURN_TYPE, ##ARGS) \
    \
    for (int i = 0; i < 2; i++) { \
    switch (i) { \
        case 1: \
        __DO_SWIZZLE(SELECTOR); \
        break; \
        case 0: \
        __DO_SWIZZLE_BLOCK(ARGS)

#define SWIZZLE_END ; } } } while(0);

#define SWIZZLE_BEGIN_INSTANCE(CLASS, SELECTOR, RETURN_TYPE, ARGS...) \
    __SWIZZLE_BEGIN(false, CLASS, SELECTOR, RETURN_TYPE, ##ARGS)

#define SWIZZLE_BEGIN_CLASS(CLASS, SELECTOR, RETURN_TYPE, ARGS...) \
    __SWIZZLE_BEGIN(true, CLASS, SELECTOR, RETURN_TYPE, ##ARGS)

#define SWIZZLED_METHOD(ARGS...) \
    orig(self, sel, ##ARGS)


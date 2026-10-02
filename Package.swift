// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "FullStoryReactNative",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "FullStoryReactNative", targets: ["FullStoryReactNative"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
        .package(url: "https://github.com/fullstorydev/fullstory-swift-package-ios.git", from: "1.19.0"),
    ],
    targets: [
        .target(
            name: "FullStoryReactNative",
            dependencies: [
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
                .product(name: "FullStory", package: "fullstory-swift-package-ios"),
            ],
            path: ".",
            sources: [
                "ios/FullStory.h",
                "ios/FullStory.mm",
                "ios/FSReactSwizzle.h",
            ],
            publicHeadersPath: "ios",
            cSettings: [
                .headerSearchPath("ios"),
                .headerSearchPath("."),
            ],
            cxxSettings: [
                .headerSearchPath("ios"),
                .headerSearchPath("."),
                .define("FOLLY_NO_CONFIG"),
                .define("FOLLY_MOBILE", to: "1"),
                .define("FOLLY_USE_LIBCPP", to: "1"),
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                .unsafeFlags(["-Wno-comma", "-Wno-shorten-64-to-32"]),
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
            ],
            linkerSettings: [
                .linkedFramework("UIKit"),
                .linkedFramework("Foundation"),
                .linkedFramework("CoreGraphics"),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const constants_1 = require("./constants");
const withFullStoryAndroid_1 = __importDefault(require("./withFullStoryAndroid"));
const withFullStoryIos_1 = __importDefault(require("./withFullStoryIos"));
const pkg = require("../../package.json");
const withFullStory = (config, pluginConfigs) => {
    if (!pluginConfigs.org) {
        throw new Error("Please specify an 'org' in your plugin arguments.");
    }
    if (!pluginConfigs.version) {
        pluginConfigs.version = constants_1.FULLSTORY_DEFAULT_VERSION;
    }
    return (0, config_plugins_1.withPlugins)(config, [
        [withFullStoryIos_1.default, pluginConfigs],
        [withFullStoryAndroid_1.default, pluginConfigs],
    ]);
};
module.exports = (0, config_plugins_1.createRunOncePlugin)(withFullStory, pkg.name, pkg.version);

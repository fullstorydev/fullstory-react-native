import fs from "fs/promises";
import path from "path";
import {
  addFullStoryMavenRepo,
  addFullStoryProjectDependency,
  addFullStoryGradlePlugin,
} from "../withFullStoryAndroid";
import { FULLSTORY_DEFAULT_VERSION } from "../constants";
import { FullStoryPluginProps } from "..";

const plugConfigs = require("./fixtures/fullstoryConfig.json");

describe("Config Plugin Android Tests", function () {
  let appBuildGradle: string;
  let projectBuildGradle: string;

  beforeAll(async function () {
    projectBuildGradle = await fs.readFile(
      path.resolve(__dirname, "./fixtures/project_build.gradle"),
      { encoding: "utf-8" }
    );

    appBuildGradle = await fs.readFile(
      path.resolve(__dirname, "./fixtures/app_build.gradle"),
      {
        encoding: "utf-8",
      }
    );
  });

  it("Adds FullStory module to project build.gradle", async function () {
    let result = projectBuildGradle;
    result = addFullStoryMavenRepo(result);
    result = addFullStoryProjectDependency(result, FULLSTORY_DEFAULT_VERSION);
    expect(result).toMatchSnapshot();
  });

  it("Adds FullStory module to project build.gradle", async function () {
    let result = appBuildGradle;
    result = addFullStoryGradlePlugin(
      result,
      plugConfigs as FullStoryPluginProps
    );
    expect(result).toMatchSnapshot();
  });
});

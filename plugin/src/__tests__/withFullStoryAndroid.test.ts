import fs from 'fs/promises';
import path from 'path';

import { FullStoryAndroidProps } from '..';
import {
  addFullStoryMavenRepo,
  addFullStoryProjectDependency,
  addFullStoryGradlePlugin,
} from '../withFullStoryAndroid';

const pluginConfigs = require('./fixtures/fullstoryConfig.json');

describe('Config Plugin Android Tests', function () {
  let appBuildGradle: string;
  let projectBuildGradle: string;

  beforeAll(async function () {
    projectBuildGradle = await fs.readFile(
      path.resolve(__dirname, './fixtures/project_build.gradle'),
      { encoding: 'utf-8' },
    );

    appBuildGradle = await fs.readFile(path.resolve(__dirname, './fixtures/app_build.gradle'), {
      encoding: 'utf-8',
    });
  });

  it('Adds Fullstory module to project build.gradle', async function () {
    let result = projectBuildGradle;
    result = addFullStoryMavenRepo(result);
    result = addFullStoryProjectDependency(result, pluginConfigs.version);
    expect(result).toMatchSnapshot();
  });

  it('Newer Fullstory SDK contains serverUrl config', async function () {
    let result = appBuildGradle;
    result = addFullStoryGradlePlugin(result, {
      ...pluginConfigs,
      host: 'staging.fullstory.com',
      version: '1.47.0',
    } as FullStoryAndroidProps);
    expect(result).toContain("serverUrl 'https://staging.fullstory.com'");
  });

  it('Adds Fullstory module to app build.gradle', async function () {
    let result = appBuildGradle;
    result = addFullStoryGradlePlugin(result, pluginConfigs as FullStoryAndroidProps);
    expect(result).toMatchSnapshot();
  });

  it('Sets recordOnStart to false when provided', async function () {
    let result = appBuildGradle;
    result = addFullStoryGradlePlugin(result, {
      ...pluginConfigs,
      recordOnStart: false,
    } as FullStoryAndroidProps);
    expect(result).toContain('recordOnStart false');
  });
});

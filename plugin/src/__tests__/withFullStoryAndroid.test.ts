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

  it('Supports custom configs', async function () {
    let result = appBuildGradle;
    result = addFullStoryGradlePlugin(result, {
      ...pluginConfigs,
      additionalConfigs: {
        android: {
          customBool: true,
          anotherCustomConfig: '1.5.0',
          anotherCustomNumberConfig: 3,
        },
      },
    } as FullStoryAndroidProps);
    expect(result).toContain('customBool true');
    expect(result).toContain("anotherCustomConfig '1.5.0'");
    expect(result).toContain('anotherCustomNumberConfig 3');
  });

  describe('anchoring against other plugins and gradle forms', function () {
    const read = (name: string) =>
      fs.readFile(path.resolve(__dirname, `./fixtures/${name}`), { encoding: 'utf-8' });
    const apply = (src: string) =>
      addFullStoryGradlePlugin(src, pluginConfigs as FullStoryAndroidProps);

    // Brace depth at the line where our block starts; must be 0 (top level).
    const depthAtBlock = (src: string) => {
      let depth = 0;
      for (const line of src.split('\n')) {
        if (line.includes("apply plugin: 'fullstory'")) return depth;
        for (const ch of line.replace(/\/\/.*$/, '')) depth += ch === '{' ? 1 : ch === '}' ? -1 : 0;
      }
      return -1;
    };
    const stripBlockComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '');

    it('does not insert inside a prepended plugins {} block', async function () {
      const result = apply(await read('app_build_plugins_prepended.gradle'));
      expect(depthAtBlock(result)).toBe(0);
      const lines = result.split('\n');
      const androidIdx = lines.findIndex(l => l.includes('com.android.application'));
      const fsIdx = lines.findIndex(l => l.includes('@generated begin @fullstory'));
      expect(fsIdx).toBe(androidIdx + 1);
    });

    it('falls back to after the plugins {} block for the id() form', async function () {
      const result = apply(await read('app_build_plugins_only.gradle'));
      expect(depthAtBlock(result)).toBe(0);
      const lines = result.split('\n');
      const closeIdx = lines.findIndex(l => l === '}');
      expect(lines[closeIdx + 1]).toContain('@generated begin @fullstory');
      expect(result).toContain('id("org.jetbrains.kotlin.android")');
    });

    it('is idempotent for every form', async function () {
      for (const name of [
        'app_build.gradle',
        'app_build_plugins_prepended.gradle',
        'app_build_plugins_only.gradle',
        'app_build_plugins_block_comment.gradle',
      ]) {
        const once = apply(await read(name));
        expect(apply(once)).toBe(once);
      }
    });

    it('replaces an existing block that sits before the plugins {} block', async function () {
      const result = apply(await read('app_build_plugins_existing_block.gradle'));
      expect(result.match(/@generated begin @fullstory/g)).toHaveLength(1);
      expect(result).not.toContain('stale-org');
      expect(depthAtBlock(result)).toBe(0);
      const lines = result.split('\n');
      const closeIdx = lines.findIndex(l => l === '}');
      expect(lines[closeIdx + 1]).toContain('@generated begin @fullstory');
    });

    it('inserts after the last of multiple plugins {} blocks', function () {
      const src =
        'plugins {\n    id("com.example.other-gradle-plugin")\n}\n' +
        'plugins {\n    id("com.android.application")\n}\n\nandroid {\n}\n';
      const result = apply(src);
      expect(depthAtBlock(result)).toBe(0);
      const lines = result.split('\n');
      // Lines 0-2: other plugins {}, 3-5: android plugins {}; ours must follow line 5.
      expect(lines[5]).toBe('}');
      expect(lines[6]).toContain('@generated begin @fullstory');
    });

    it('ignores a commented-out android plugin line', async function () {
      const src =
        '// apply plugin: "com.android.application"\n' +
        (await read('app_build_plugins_only.gradle'));
      const result = apply(src);
      expect(depthAtBlock(result)).toBe(0);
      expect(result.split('\n')[0]).not.toContain('@generated');
    });

    it('ignores a brace inside a block comment', async function () {
      const result = apply(await read('app_build_plugins_block_comment.gradle'));
      expect(depthAtBlock(stripBlockComments(result))).toBe(0);
      const lines = result.split('\n');
      const closeIdx = lines.findIndex(l => l === '}');
      expect(lines[closeIdx + 1]).toContain('@generated begin @fullstory');
    });

    it('matches apply plugin with extra spaces or parentheses', function () {
      for (const line of [
        "apply   plugin:   'com.android.application'",
        'apply plugin : "com.android.application"',
        "apply(plugin: 'com.android.application')",
      ]) {
        const result = apply(`${line}\n\nandroid {\n}\n`);
        const lines = result.split('\n');
        expect(lines[1]).toContain('@generated begin @fullstory');
      }
    });

    it('throws a clear error when no anchor exists', function () {
      expect(() => apply('android { }\n')).toThrow(/couldn't find/);
    });
  });
});

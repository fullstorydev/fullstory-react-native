import { describe, it, expect, afterEach } from '@jest/globals';
import { FSPage } from '../FSPage';
import { NativeModules } from 'react-native';

const SAMPLE_UUID = '64CB2E82-3002-E01B-B58A-E089B79F6223';

jest.mock('../utils', () => ({
  generateUUID: jest.fn().mockImplementation(() => SAMPLE_UUID),
}));

describe('FSPage', () => {
  const SAMPLE_PAGE_NAME = 'sample page name';
  const SAMPLE_PAGE_PROPS = {
    name: 'bob',
    zip: 'twelve',
    baz: { foo: { bar: 123 } },
    bat: { address: 'mark' },
  };
  const SAMPLE_UPDATED_PAGE_PROPS = {
    name: 'bob',
    zip: 12,
    baz: { foo: { hat: 456 }, dar: 'dup' },
    bat: true,
    code: 'tree',
  };
  const PAGE_PROPS_WITH_PAGE_NAME = { ...SAMPLE_PAGE_PROPS, pageName: 'test' };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Page start calls startPage with correct arguments', () => {
    const page = new FSPage(SAMPLE_PAGE_NAME, SAMPLE_PAGE_PROPS);

    page.start();

    const startPage = NativeModules.FullStory.startPage;
    expect(startPage).toBeCalledTimes(1);
    expect(startPage).toBeCalledWith(SAMPLE_UUID, SAMPLE_PAGE_NAME, SAMPLE_PAGE_PROPS);
  });

  it('Page update calls updatePage with correct arguments', () => {
    const page = new FSPage(SAMPLE_PAGE_NAME, SAMPLE_PAGE_PROPS);

    page.start();
    page.update(SAMPLE_PAGE_PROPS);

    const updatePage = NativeModules.FullStory.updatePage;
    expect(updatePage).toBeCalledTimes(1);
    expect(updatePage).toBeCalledWith(SAMPLE_UUID, SAMPLE_PAGE_PROPS);
  });

  it('Page end calls endPage with correct arguments', () => {
    const page = new FSPage(SAMPLE_PAGE_NAME, SAMPLE_PAGE_PROPS);

    page.start();
    page.end();

    const endPage = NativeModules.FullStory.endPage;
    expect(endPage).toBeCalledTimes(1);
    expect(endPage).toBeCalledWith(SAMPLE_UUID);
  });

  it('Page start will remove pageName key', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const page = new FSPage(SAMPLE_PAGE_NAME);

    // @ts-expect-error pageName is not allowed
    page.start(PAGE_PROPS_WITH_PAGE_NAME);

    const startPage = NativeModules.FullStory.startPage;

    expect(startPage).toBeCalledWith(SAMPLE_UUID, SAMPLE_PAGE_NAME, SAMPLE_PAGE_PROPS);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it('Unstarted page will not call update or end page', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const page = new FSPage(SAMPLE_PAGE_NAME);
    page.update(SAMPLE_PAGE_PROPS);
    page.end();

    const updatePage = NativeModules.FullStory.updatePage;
    const endPage = NativeModules.FullStory.endPage;

    expect(updatePage).not.toHaveBeenCalled();
    expect(endPage).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(2);
    errorSpy.mockRestore();
  });

  it('Page update will merge properties correctly ', () => {
    const page = new FSPage(SAMPLE_PAGE_NAME);

    page.start(SAMPLE_PAGE_PROPS);
    page.update(SAMPLE_UPDATED_PAGE_PROPS);

    const updatePage = NativeModules.FullStory.updatePage;

    const expectedMergedObj = {
      name: 'bob',
      zip: 12,
      baz: { foo: { bar: 123, hat: 456 }, dar: 'dup' },
      bat: true,
      code: 'tree',
    };

    expect(updatePage).toHaveBeenCalledWith(SAMPLE_UUID, expectedMergedObj);
  });
});

import { describe, it, expect, afterEach } from '@jest/globals';
import { FSPage } from '../FSPage';
import { NativeModules } from 'react-native';

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
    // @ts-expect-error nonce is a private property
    expect(startPage).toBeCalledWith(page.nonce, SAMPLE_PAGE_NAME, SAMPLE_PAGE_PROPS);
  });

  it('Page update calls updatePage with correct arguments', () => {
    const page = new FSPage(SAMPLE_PAGE_NAME, SAMPLE_PAGE_PROPS);

    page.start();
    page.update(SAMPLE_PAGE_PROPS);

    const updatePage = NativeModules.FullStory.updatePage;
    expect(updatePage).toBeCalledTimes(1);
    // @ts-expect-error nonce is a private property
    expect(updatePage).toBeCalledWith(page.nonce, SAMPLE_PAGE_PROPS);
  });

  it('Page end calls endPage with correct arguments', () => {
    const page = new FSPage(SAMPLE_PAGE_NAME, SAMPLE_PAGE_PROPS);

    page.start();
    // @ts-expect-error nonce is a private property
    const nonceCopy = `${page.nonce}`;
    page.end();

    const endPage = NativeModules.FullStory.endPage;
    expect(endPage).toBeCalledTimes(1);
    expect(endPage).toBeCalledWith(nonceCopy);
  });

  it('Page start will remove pageName key', () => {
    const page = new FSPage(SAMPLE_PAGE_NAME);

    // @ts-expect-error pageName is not allowed
    page.start(PAGE_PROPS_WITH_PAGE_NAME);

    const startPage = NativeModules.FullStory.startPage;
    // @ts-expect-error nonce is a private property
    expect(startPage).toBeCalledWith(page.nonce, SAMPLE_PAGE_NAME, SAMPLE_PAGE_PROPS);
  });

  it('Unstarted page will not call update or end page', () => {
    const page = new FSPage(SAMPLE_PAGE_NAME);
    page.update(SAMPLE_PAGE_PROPS);
    page.end();

    const updatePage = NativeModules.FullStory.updatePage;
    const endPage = NativeModules.FullStory.endPage;

    expect(updatePage).not.toHaveBeenCalled();
    expect(endPage).not.toHaveBeenCalled();
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

    // @ts-expect-error nonce is a private property
    expect(updatePage).toHaveBeenCalledWith(page.nonce, expectedMergedObj);
  });
});

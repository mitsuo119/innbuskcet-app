// PBI-081 / TASK-081-1
// 公開ルート単一ソース（routes.ts）の整合性を検証する。
// TASK-081-3（sitemap-coverage.test）の前段ガードとしても機能する。

import { describe, expect, it } from 'vitest';
import {
  PUBLIC_ROUTES,
  PUBLIC_ROUTE_PATHS,
  SITEMAP_PATTERN_IDS,
  SITEMAP_REFERENCE_CHAPTER_IDS,
} from './routes';

describe('PBI-081 公開ルート単一ソース', () => {
  it('全 path が一意であり重複が無い', () => {
    const set = new Set(PUBLIC_ROUTE_PATHS);
    expect(set.size).toBe(PUBLIC_ROUTE_PATHS.length);
  });

  it('全 path が先頭 `/` で始まり、トップ以外は末尾 `/` を含まない', () => {
    for (const path of PUBLIC_ROUTE_PATHS) {
      expect(path.startsWith('/')).toBe(true);
      if (path !== '/') {
        expect(path.endsWith('/')).toBe(false);
      }
    }
  });

  it('priority が 0.0〜1.0 の範囲に収まる', () => {
    for (const route of PUBLIC_ROUTES) {
      expect(route.priority).toBeGreaterThanOrEqual(0);
      expect(route.priority).toBeLessThanOrEqual(1);
    }
  });

  it('SITEMAP_REFERENCE_CHAPTER_IDS と PUBLIC_ROUTES が整合する', () => {
    const referencePaths = PUBLIC_ROUTE_PATHS.filter((p) => p.startsWith('/reference/'));
    const expected = SITEMAP_REFERENCE_CHAPTER_IDS.map((id) => `/reference/${id}`);
    expect(new Set(referencePaths)).toEqual(new Set(expected));
  });

  it('SITEMAP_PATTERN_IDS と PUBLIC_ROUTES が整合する', () => {
    const patternPaths = PUBLIC_ROUTE_PATHS.filter((p) => /^\/patterns\/\d+$/.test(p));
    const expected = SITEMAP_PATTERN_IDS.map((id) => `/patterns/${id}`);
    expect(new Set(patternPaths)).toEqual(new Set(expected));
  });

  it('トップ（/）と主要静的ルート（/patterns・/reference）を含む', () => {
    expect(PUBLIC_ROUTE_PATHS).toContain('/');
    expect(PUBLIC_ROUTE_PATHS).toContain('/patterns');
    expect(PUBLIC_ROUTE_PATHS).toContain('/reference');
  });
});

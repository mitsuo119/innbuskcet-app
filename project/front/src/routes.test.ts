// PBI-081 / TASK-081-1
// 公開ルート単一ソース（routes.ts）の整合性を検証する。
// TASK-081-3（sitemap-coverage.test）の前段ガードとしても機能する。

import { describe, expect, it } from 'vitest';
import {
  PUBLIC_ROUTES,
  PUBLIC_ROUTE_PATHS,
  SITEMAP_CASE_IDS,
  SITEMAP_PATTERN_IDS,
  SITEMAP_REFERENCE_CHAPTER_IDS,
  CASE_DETAIL_META,
  CASE_DETAIL_META_BY_ID,
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

  it('PBI-079: SITEMAP_CASE_IDS が 20 件・全件一意・case-### 形式である', () => {
    expect(SITEMAP_CASE_IDS).toHaveLength(20);
    expect(new Set(SITEMAP_CASE_IDS).size).toBe(SITEMAP_CASE_IDS.length);
    for (const id of SITEMAP_CASE_IDS) {
      expect(id).toMatch(/^case-\d{3}$/);
    }
  });

  // PBI-079 / TASK-079-2 後半（DAY2）: PUBLIC_ROUTES と SITEMAP_CASE_IDS の対称ペア検証。
  it('PBI-079: SITEMAP_CASE_IDS と PUBLIC_ROUTES（/cases/:id）が完全一致する', () => {
    const casePaths = PUBLIC_ROUTE_PATHS.filter((p) => p.startsWith('/cases/'));
    const expected = SITEMAP_CASE_IDS.map((id) => `/cases/${id}`);
    expect(new Set(casePaths)).toEqual(new Set(expected));
    expect(casePaths).toHaveLength(20);
  });

  it('PBI-079: CASE_DETAIL_META が SITEMAP_CASE_IDS と同集合・難易度分布が均等', () => {
    const metaIds = CASE_DETAIL_META.map((m) => m.id);
    expect(new Set(metaIds)).toEqual(new Set(SITEMAP_CASE_IDS));
    expect(metaIds).toHaveLength(20);

    // 難易度（初級／中級／上級）が各 5〜8 件（佐藤(b) 反映選定基準）。
    const counts = { 初級: 0, 中級: 0, 上級: 0 };
    for (const meta of CASE_DETAIL_META) {
      counts[meta.difficulty] += 1;
    }
    for (const key of Object.keys(counts) as Array<keyof typeof counts>) {
      expect(counts[key]).toBeGreaterThanOrEqual(5);
      expect(counts[key]).toBeLessThanOrEqual(8);
    }

    // 全 20 パターン × 各 1 件で偏りゼロ。
    const patternIds = CASE_DETAIL_META.map((m) => m.patternId);
    expect(new Set(patternIds).size).toBe(20);
    for (const id of patternIds) {
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(20);
    }
  });

  it('PBI-079: CASE_DETAIL_META_BY_ID が全 ID を O(1) で解決できる', () => {
    expect(CASE_DETAIL_META_BY_ID.size).toBe(20);
    for (const id of SITEMAP_CASE_IDS) {
      const meta = CASE_DETAIL_META_BY_ID.get(id);
      expect(meta, `${id} が CASE_DETAIL_META_BY_ID で解決できない`).toBeDefined();
      expect(meta!.id).toBe(id);
    }
  });
});

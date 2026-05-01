import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  LEARNING_STYLES,
  isDeepMode,
  loadLearningStyle,
  saveLearningStyle,
  type LearningStyle,
} from './learningStyle';

const STORAGE_KEY = 'inbasket.learningStyle.v1';

describe('learningStyle（PBI-036 / TASK-007）', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  describe('LEARNING_STYLES 定数', () => {
    it('quick / deep の label と description を持つ', () => {
      expect(LEARNING_STYLES.quick.label).toBe('Quick');
      expect(LEARNING_STYLES.quick.description).toBe('優先順位のみ回答（隙間時間用）');
      expect(LEARNING_STYLES.deep.label).toBe('Deep');
      expect(LEARNING_STYLES.deep.description).toBe('記述あり（じっくり練習）');
    });
  });

  describe('loadLearningStyle', () => {
    it('localStorage が空ならデフォルトの "deep" を返す', () => {
      expect(loadLearningStyle()).toBe('deep');
    });

    it('localStorage に "quick" が保存されていれば "quick" を返す', () => {
      window.localStorage.setItem(STORAGE_KEY, 'quick');
      expect(loadLearningStyle()).toBe('quick');
    });

    it('localStorage に "deep" が保存されていれば "deep" を返す', () => {
      window.localStorage.setItem(STORAGE_KEY, 'deep');
      expect(loadLearningStyle()).toBe('deep');
    });

    it('不正値（"exam" / 任意文字列 / 空文字）はすべて "deep" にフォールバックする', () => {
      window.localStorage.setItem(STORAGE_KEY, 'exam');
      expect(loadLearningStyle()).toBe('deep');
      window.localStorage.setItem(STORAGE_KEY, 'INVALID');
      expect(loadLearningStyle()).toBe('deep');
      window.localStorage.setItem(STORAGE_KEY, '');
      expect(loadLearningStyle()).toBe('deep');
    });
  });

  describe('saveLearningStyle → loadLearningStyle ラウンドトリップ', () => {
    it('"quick" を保存して読み戻せる', () => {
      saveLearningStyle('quick');
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('quick');
      expect(loadLearningStyle()).toBe('quick');
    });

    it('"deep" を保存して読み戻せる', () => {
      saveLearningStyle('deep');
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('deep');
      expect(loadLearningStyle()).toBe('deep');
    });

    it('上書き保存で最新値が反映される', () => {
      saveLearningStyle('deep');
      saveLearningStyle('quick');
      expect(loadLearningStyle()).toBe('quick');
    });
  });

  describe('isDeepMode', () => {
    it('"deep" のとき true を返す', () => {
      expect(isDeepMode('deep')).toBe(true);
    });

    it('"quick" のとき false を返す', () => {
      const style: LearningStyle = 'quick';
      expect(isDeepMode(style)).toBe(false);
    });
  });
});

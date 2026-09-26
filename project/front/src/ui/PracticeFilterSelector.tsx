import { DIFFICULTIES, type Case, type Difficulty } from '../domain/case';
import { filterCases, type PracticeFilter } from '../domain/practiceFilter';
import { PATTERN_DATA } from '../data/patternData';

interface Props {
  cases: readonly Case[];
  filter: PracticeFilter;
  onChange: (filter: PracticeFilter) => void;
}

/** 出題範囲（パターン・難易度）の選択（PBI-109）。 */
export function PracticeFilterSelector({ cases, filter, onChange }: Props) {
  const count = filterCases(cases, filter).length;
  return (
    <fieldset className="practice-filter">
      <legend className="practice-filter__legend">出題範囲</legend>
      <label className="practice-filter__field">
        <span className="practice-filter__label">パターン</span>
        <select
          className="practice-filter__select"
          value={filter.patternId ?? ''}
          onChange={(event) =>
            onChange({
              ...filter,
              patternId: event.target.value === '' ? null : Number(event.target.value),
            })
          }
        >
          <option value="">すべてのパターン</option>
          {PATTERN_DATA.map((pattern) => (
            <option key={pattern.id} value={pattern.id}>
              パターン{pattern.id} {pattern.name}（
              {filterCases(cases, { patternId: pattern.id, difficulty: null }).length}問）
            </option>
          ))}
        </select>
      </label>
      <label className="practice-filter__field">
        <span className="practice-filter__label">難易度</span>
        <select
          className="practice-filter__select"
          value={filter.difficulty ?? ''}
          onChange={(event) =>
            onChange({
              ...filter,
              difficulty: event.target.value === '' ? null : (event.target.value as Difficulty),
            })
          }
        >
          <option value="">すべて</option>
          {DIFFICULTIES.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
      </label>
      <p className="practice-filter__count" aria-live="polite">
        対象：{count}問
      </p>
    </fieldset>
  );
}

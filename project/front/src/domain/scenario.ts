import scenariosData from '../data/scenarios.json';
import type { Case } from './case';
import { parseCase } from './loader';

/** シナリオ演習の共通設定（役職・組織・日時・予定）。 */
export interface ScenarioSetting {
  readonly role: string;
  readonly organization: string;
  readonly members: readonly string[];
  readonly time: string;
  readonly schedule: readonly string[];
  readonly notice: string;
}

/** 共通の設定で関連する複数の案件を続けて解く演習（PBI-108）。 */
export interface Scenario {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly timeLimitMinutes: number;
  readonly setting: ScenarioSetting;
  readonly cases: readonly Case[];
}

export function loadScenarios(): Scenario[] {
  return scenariosData.map((raw, index) => {
    if (!Number.isInteger(raw.timeLimitMinutes) || raw.timeLimitMinutes <= 0) {
      throw new Error(`scenarios.json[${index}] の timeLimitMinutes が不正です (id=${raw.id})`);
    }
    if (raw.cases.length === 0) {
      throw new Error(`scenarios.json[${index}] に案件がありません (id=${raw.id})`);
    }
    return {
      id: raw.id,
      title: raw.title,
      summary: raw.summary,
      timeLimitMinutes: raw.timeLimitMinutes,
      setting: raw.setting,
      cases: raw.cases.map((item, caseIndex) =>
        parseCase(item, caseIndex, `scenarios.json[${index}].cases`),
      ),
    };
  });
}

export const SCENARIOS: readonly Scenario[] = loadScenarios();

export function findScenario(id: string | undefined): Scenario | undefined {
  return id === undefined ? undefined : SCENARIOS.find((scenario) => scenario.id === id);
}

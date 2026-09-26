import type { Scenario } from '../domain/scenario';

/** シナリオ演習の共通設定（PBI-108）。Exam 中に案件の上へ表示する。 */
export function ScenarioBrief({ scenario }: { scenario: Scenario }) {
  const { setting } = scenario;
  return (
    <details className="scenario-brief" open>
      <summary className="scenario-brief__summary">共通設定：{scenario.title}</summary>
      <p className="scenario-brief__text">{setting.role}</p>
      <p className="scenario-brief__text">{setting.organization}</p>
      <h3 className="scenario-brief__heading">登場人物</h3>
      <ul className="scenario-brief__list">
        {setting.members.map((member) => (
          <li key={member}>{member}</li>
        ))}
      </ul>
      <h3 className="scenario-brief__heading">日時と予定</h3>
      <p className="scenario-brief__text">{setting.time}</p>
      <ul className="scenario-brief__list">
        {setting.schedule.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="scenario-brief__notice">{setting.notice}</p>
    </details>
  );
}

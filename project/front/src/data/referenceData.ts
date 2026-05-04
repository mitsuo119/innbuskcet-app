/**
 * インバスケット解説リファレンス定義源（PBI-056 / TASK-401）
 * ref/chapter01-what-is-inbasket.md / chapter02-scoring-criteria.md を
 * 安全な TypeScript 定数として構造化する。
 */

/** 参照章ID */
export type ReferenceChapterId = 'chapter01' | 'chapter02' | 'chapter05' | 'chapter08';

/** リファレンスブロック種別 */
export type ReferenceBlock =
  | ReferenceParagraphBlock
  | ReferenceBulletListBlock
  | ReferenceTableBlock
  | ReferenceNoteBlock
  | ReferenceLinkListBlock;

/** 段落ブロック */
export interface ReferenceParagraphBlock {
  kind: 'paragraph';
  text: string;
}

/** 箇条書きブロック */
export interface ReferenceBulletListBlock {
  kind: 'bullet-list';
  items: string[];
}

/** 表ブロック */
export interface ReferenceTableBlock {
  kind: 'table';
  headers: string[];
  rows: string[][];
}

/** 補足メモブロック */
export interface ReferenceNoteBlock {
  kind: 'note';
  title: string;
  text: string;
}

/** 参照リンクブロック */
export interface ReferenceLinkListBlock {
  kind: 'link-list';
  items: Array<{
    label: string;
    href: string;
    description?: string;
  }>;
}

/** 章内セクション */
export interface ReferenceSection {
  id: string;
  title: string;
  summary?: string;
  blocks: ReferenceBlock[];
}

/** リファレンス章 */
export interface ReferenceChapter {
  id: ReferenceChapterId;
  sourcePath: string;
  title: string;
  description: string;
  learningGoals: string[];
  sections: ReferenceSection[];
}

/** chapter01 / chapter02 / chapter05 / chapter08 の定義源 */
export const REFERENCE_DATA: ReferenceChapter[] = [
  {
    id: 'chapter01',
    sourcePath: 'ref/chapter01-what-is-inbasket.md',
    title: 'インバスケットとは何か',
    description: '試験の正体と、エンジニアが求められる思考シフトを整理する。',
    learningGoals: [
      'インバスケット試験の基本設定を説明できる',
      'エンジニアが躓きやすい理由を把握できる',
      'プレイヤー思考とマネージャー思考の違いを理解できる',
    ],
    sections: [
      {
        id: 'chapter01-overview',
        title: 'インバスケットの正体',
        summary: '正解当てではなく、判断と行動のプロセスを見る試験である。',
        blocks: [
          {
            kind: 'paragraph',
            text: 'インバスケット試験は、架空の管理職に着任した初日に未処理案件を制限時間内で処理するシミュレーションである。',
          },
          {
            kind: 'paragraph',
            text: '評価対象は「承認したか」よりも、なぜそう判断し、誰にどう指示したかというマネージャーとしての行動パターンである。',
          },
          {
            kind: 'table',
            headers: ['項目', '典型的な設定'],
            rows: [
              ['制限時間', '60〜90分'],
              ['案件数', '15〜25件'],
              ['役職', '課長・マネージャー相当'],
              ['状況', '着任初日、前任者不在、すぐに出張へ出る設定'],
            ],
          },
        ],
      },
      {
        id: 'chapter01-engineer-pitfalls',
        title: 'エンジニアが躓く3つの理由',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '唯一の正解を探しがちで、判断の妥当性より解を当てにいってしまう。',
              '自分で解決しようとして、委任や関係者連携を弱く書いてしまう。',
              '完璧に処理しようとして、全案件に反応を書く前に時間切れになる。',
            ],
          },
          {
            kind: 'note',
            title: '重要メモ',
            text: '白紙は 0 点になりやすい。70 点でもよいので、全案件に判断・理由・指示を残すことが優先される。',
          },
        ],
      },
      {
        id: 'chapter01-mindset-shift',
        title: 'プレイヤー思考からマネージャー思考へ',
        blocks: [
          {
            kind: 'table',
            headers: ['プレイヤー思考', 'マネージャー思考'],
            rows: [
              ['自分で解決する', '部下に任せる・関係部署と連携する'],
              ['技術的に正しい答えを出す', '組織として最適な判断をする'],
              ['目の前のタスクに集中する', '全体を俯瞰して優先順位をつける'],
              ['完璧に仕上げてから提出する', '70点でも全案件に対応する'],
              ['詳細な手順を考える', '方針と判断理由を示す'],
            ],
          },
          {
            kind: 'paragraph',
            text: '論理的思考力や問題分析力そのものは武器になる。使いどころを「自分が解く」から「組織で処理する」に切り替えることが鍵になる。',
          },
        ],
      },
    ],
  },
  {
    id: 'chapter02',
    sourcePath: 'ref/chapter02-scoring-criteria.md',
    title: '採点基準を逆算する',
    description: '評価ディメンションを把握し、高得点行動と低評価行動を見分ける。',
    learningGoals: [
      '6つの評価ディメンションを説明できる',
      '高得点行動と低評価行動の差を判断できる',
      '意思決定力が最重要である理由を理解できる',
    ],
    sections: [
      {
        id: 'chapter02-why-scoring-matters',
        title: 'なぜ採点基準を知るべきか',
        blocks: [
          {
            kind: 'paragraph',
            text: 'インバスケットは採点軸が分かると解答の書き方が変わる。何が評価されるかを知ることが最短の攻略法である。',
          },
          {
            kind: 'paragraph',
            text: '多くの試験では評価軸が6つのディメンションに集約されるため、各案件でどの観点を見せるかを意識して書く必要がある。',
          },
        ],
      },
      {
        id: 'chapter02-dimensions',
        title: '6つの評価ディメンション',
        blocks: [
          {
            kind: 'table',
            headers: ['ディメンション', '高得点の要点'],
            rows: [
              ['問題発見力', '表面事象だけでなく背景・原因・案件間の関連性まで見る'],
              ['問題分析力', '関係者・影響範囲・不足情報を整理してから判断する'],
              ['意思決定力', '方向性を明示し、理由つきで判断を示す'],
              ['洞察力', '放置リスクや波及効果、代替案まで先読みする'],
              ['組織活用力', '担当者・期限・報告方法を明確にして委任・連携する'],
              ['ヒューマンスキル', '相手の感情や立場へ配慮した表現で対応する'],
            ],
          },
          {
            kind: 'note',
            title: 'エンジニア視点の読み替え',
            text: '問題発見力は根本原因分析、問題分析力は影響範囲調査、意思決定力は技術選定の根拠提示に近い。既存スキルを管理職文脈へ移す発想が有効。',
          },
        ],
      },
      {
        id: 'chapter02-weight-and-anti-patterns',
        title: '重みづけと低評価行動',
        blocks: [
          {
            kind: 'paragraph',
            text: '一般に意思決定力の配点が最も高い。迷って白紙にするより、理由を添えて判断を示した方が得点につながる。',
          },
          {
            kind: 'bullet-list',
            items: [
              '白紙・未回答で終える',
              '全案件を「検討します」で先送りする',
              '全部自分でやろうとする',
              '何でも上司に判断を仰ぐ',
              '感情的・高圧的な指示を出す',
            ],
          },
          {
            kind: 'note',
            title: '合格の最重要原則',
            text: 'すべての案件に「判断」「理由」「指示」を残し、マネージャーとしての行動パターンを見せる。',
          },
        ],
      },
    ],
  },
  {
    id: 'chapter05',
    sourcePath: 'ref/chapter05-prioritization.md',
    title: '優先順位づけの技術',
    description: '緊急度×重要度で案件を素早く分類し、配点効率を上げる。',
    learningGoals: [
      '緊急度×重要度マトリクスでA/B/C優先度を判断できる',
      '30秒チェックで案件の優先度を決められる',
      '回答文で優先順位の理由を明示できる',
    ],
    sections: [
      {
        id: 'chapter05-priority-matrix',
        title: '緊急度×重要度マトリクス',
        summary: '限られた時間で点を取り切るため、A案件に最も時間を配分する。',
        blocks: [
          {
            kind: 'paragraph',
            text: '全案件に同じ時間を使わず、緊急度と重要度で分類して配分を変える。A案件は4〜5分、B案件は3分、C案件は1〜2分を目安にする。',
          },
          {
            kind: 'table',
            headers: ['緊急度', '重要度', '区分', '対応方針'],
            rows: [
              ['高', '高', 'A', '最優先。即断し、担当者・期限・報告先を明記する'],
              ['高', '低', 'B-1', '短く判断し、必要最小限の指示を出す'],
              ['低', '高', 'B-2', '方針を示し、計画的に処理する'],
              ['低', '低', 'C', '簡潔に処理し、時間をかけすぎない'],
            ],
          },
        ],
      },
      {
        id: 'chapter05-checklist',
        title: '30秒優先度チェック',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '今日・明日中の時間制約があるか',
              '顧客・取引先・法令に影響するか',
              '役員・全社案件など影響範囲が広いか',
              '放置で被害が拡大するか',
              '他案件との関連があるか',
            ],
          },
          {
            kind: 'note',
            title: '答案での明示が加点ポイント',
            text: '「顧客影響が大きく緊急度が高いため最優先で対応する」のように、優先順位と理由を答案に書く。',
          },
        ],
      },
    ],
  },
  {
    id: 'chapter08',
    sourcePath: 'ref/chapter08-case-patterns.md',
    title: '案件パターン別攻略',
    description: '頻出20パターンを分類し、回答骨格を素早く引き出す。',
    learningGoals: [
      '案件を代表パターンに分類できる',
      '各パターンの回答骨格を使い分けられる',
      'パターン詳細画面へ遷移して深掘りできる',
    ],
    sections: [
      {
        id: 'chapter08-pattern-overview',
        title: '代表パターン分類（要点）',
        summary: '案件は約20パターンに分類でき、認識速度が回答速度に直結する。',
        blocks: [
          {
            kind: 'table',
            headers: ['分類', '代表例', '初動の要点'],
            rows: [
              ['対外対応', '顧客クレーム・取引先要求', '初動連絡・事実確認・期限設定'],
              ['人事/部下対応', '退職相談・対立・ハラスメント', '傾聴・公平性・安全確保'],
              ['業務/プロジェクト', '遅延・品質問題・予算承認', '影響分析・リカバリー策'],
              ['リスク/コンプラ', '事故・セキュリティ・不正疑義', '封じ込め・報告・証拠保全'],
            ],
          },
          {
            kind: 'note',
            title: '使い分けの基本',
            text: '案件を読んだらまず分類し、骨格（判断・理由・指示）に案件固有情報を当てはめる。',
          },
        ],
      },
      {
        id: 'chapter08-reference-links',
        title: '参照導線',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: 'パターン一覧へ移動',
                href: '#/patterns',
                description: '20パターン全体を俯瞰する',
              },
              {
                label: '顧客クレーム（例）',
                href: '#/patterns/1',
                description: '対外対応パターンの詳細を確認する',
              },
              {
                label: 'プロジェクト遅延（例）',
                href: '#/patterns/9',
                description: '業務/プロジェクト系の骨格を確認する',
              },
              {
                label: '情報セキュリティインシデント（例）',
                href: '#/patterns/14',
                description: 'リスク系パターンの初動を確認する',
              },
            ],
          },
        ],
      },
    ],
  },
];

/** 章IDからリファレンス章を取得する */
export function findReferenceChapterById(id: ReferenceChapterId): ReferenceChapter | undefined {
  return REFERENCE_DATA.find((chapter) => chapter.id === id);
}

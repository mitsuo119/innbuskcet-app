/**
 * インバスケット解説リファレンス定義源（PBI-056 / TASK-401）
 * ref/chapter01-what-is-inbasket.md / chapter02-scoring-criteria.md を
 * 安全な TypeScript 定数として構造化する。
 */
import scoringGuide from './scoringGuide.json';

/** 参照章ID */
export type ReferenceChapterId =
  | 'chapter01'
  | 'chapter02'
  | 'chapter03'
  | 'chapter04'
  | 'chapter05'
  | 'chapter06'
  | 'chapter07'
  | 'chapter08'
  | 'chapter09'
  | 'chapter10'
  | 'chapter11'
  | 'chapter12';

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
const REFERENCE_DATA_SOURCE: ReferenceChapter[] = [
  {
    id: 'chapter01',
    sourcePath: 'ref/chapter01-what-is-inbasket.md',
    title: 'インバスケットとは何か',
    description: 'インバスケットの形式と、担当者から管理職への思考の切り替えを整理する。',
    learningGoals: [
      'インバスケット演習の基本設定を説明できる',
      '担当者としての癖が答案でつまずきになる理由を把握できる',
      'プレイヤー思考とマネージャー思考の違いを理解できる',
    ],
    sections: [
      {
        id: 'chapter01-overview',
        title: 'インバスケットの形式',
        summary: '正解を一つ当てるより、判断と行動の組み立てを示す形式である。',
        blocks: [
          {
            kind: 'paragraph',
            text: 'インバスケットは、架空の管理職の立場で、たまった未処理案件を制限時間内に処理する演習形式である。着任初日などの設定が使われる。',
          },
          {
            kind: 'paragraph',
            text: '本教材では、結論（承認したか）だけでなく、なぜそう判断し、誰にどう指示したかまで答案に書く練習をする。',
          },
          {
            kind: 'table',
            headers: ['項目', '設定の例（実施者により異なる）'],
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
        title: 'つまずきやすい3つの癖',
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
            text: '白紙の案件には判断の手がかりが残らない。完璧さより、全案件に判断・理由・指示を短くでも残すことを優先する。',
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
              ['完璧に仕上げてから提出する', '完璧でなくても全案件に対応する'],
              ['詳細な手順を考える', '方針と判断理由を示す'],
            ],
          },
          {
            kind: 'paragraph',
            text: '論理的思考力や問題分析力そのものは武器になる。使いどころを「自分が解く」から「組織で処理する」に切り替えることが鍵になる。',
          },
        ],
      },
      {
        id: 'chapter01-related-patterns',
        title: '関連パターン',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: '顧客クレーム（パターン1）',
                href: '/patterns/1',
                description: 'A優先度・並行対応の代表例で「組織で処理する」発想を実体験する',
              },
            ],
          },
        ],
      },
    ],
  },
  scoringGuide as ReferenceChapter,
  {
    id: 'chapter05',
    sourcePath: 'ref/chapter05-prioritization.md',
    title: '優先順位づけの技術',
    description: '緊急度×重要度で案件を素早く分類し、時間の配分を決める。',
    learningGoals: [
      '緊急度×重要度マトリクスでA/B/C優先度を判断できる',
      '30秒チェックで案件の優先度を決められる',
      '回答文で優先順位の理由を明示できる',
    ],
    sections: [
      {
        id: 'chapter05-priority-matrix',
        title: '緊急度×重要度マトリクス',
        summary: '限られた時間を、影響の大きいA案件に多く配分する。',
        blocks: [
          {
            kind: 'paragraph',
            text: '全案件に同じ時間を使わず、緊急度と重要度で分類して配分を変える。本教材では、A案件は4〜5分、B案件は3分、C案件は1〜2分を目安にする。',
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
            title: '優先した理由を答案に書く',
            text: '「顧客影響が大きく緊急度が高いため最優先で対応する」のように、優先順位と理由を答案に書く。',
          },
        ],
      },
      {
        id: 'chapter05-related-patterns',
        title: '関連パターン',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: '予算承認・経費申請（パターン10）',
                href: '/patterns/10',
                description: '金額と決裁権限で優先度が変わる案件で、配分の判断を確認する',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chapter08',
    sourcePath: 'ref/chapter08-case-patterns.md',
    title: '案件パターン別攻略',
    description: '案件を20の型に分類し、回答骨格を素早く引き出す。',
    learningGoals: [
      '案件を代表パターンに分類できる',
      '各パターンの回答骨格を使い分けられる',
      'パターン詳細画面へ遷移して深掘りできる',
    ],
    sections: [
      {
        id: 'chapter08-pattern-overview',
        title: '代表パターン分類（要点）',
        summary: '本教材では案件を20の型に整理する。型を見分けられると、回答の骨格を早く組み立てられる。',
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
                href: '/patterns',
                description: '20パターン全体を俯瞰する',
              },
              {
                label: '顧客クレーム（例）',
                href: '/patterns/1',
                description: '対外対応パターンの詳細を確認する',
              },
              {
                label: 'プロジェクト遅延（例）',
                href: '/patterns/9',
                description: '業務/プロジェクト系の骨格を確認する',
              },
              {
                label: '情報セキュリティインシデント（例）',
                href: '/patterns/14',
                description: 'リスク系パターンの初動を確認する',
              },
            ],
          },
        ],
      },
    ],
  },
  // PBI-080 / TASK-080-3 (Sprint022 DAY3): ref 未公開 8 章（03/04/06/07/09/10/11/12）の解説ページ展開。
  // 各章は ref/chapterXX-*.md をベースに helpful content 原則でオリジナル化し、800 字以上の本文と
  // h2〜h3 階層を維持。title/description は resolveRouteSeo で自動的に章タイトルが注入され重複ゼロ。
  {
    id: 'chapter03',
    sourcePath: 'ref/chapter03-mindset.md',
    title: 'マネージャー思考への切替',
    description:
      'プレイヤー思考からマネージャー思考への発想転換と、陥りやすい落とし穴を整理する。',
    learningGoals: [
      'プレイヤー思考とマネージャー思考の違いを答案行動に落とせる',
      '自分で抱え込まず委任・関係部署活用を選択できる',
      '完璧主義から、全案件に対応する進め方へ切り替えられる',
    ],
    sections: [
      {
        id: 'chapter03-shift',
        title: '発想を切り替える3つの軸',
        summary: '視点・行動・時間配分の3軸で従来の癖を意識的に書き換える。',
        blocks: [
          {
            kind: 'paragraph',
            text: 'インバスケットで問われる管理職の判断は、自分が手を動かす担当者の判断とは前提が異なる。何を任せ、誰に動いてもらうかを言語化する訓練が必要となる。',
          },
          {
            kind: 'table',
            headers: ['軸', 'プレイヤー思考', 'マネージャー思考'],
            rows: [
              ['視点', '個別案件の正解探し', '組織全体での影響と優先度'],
              ['行動', '自分で完結させる', '担当者割当と進捗確認'],
              ['時間配分', '全件に均等な時間', '重要度に応じた配分'],
            ],
          },
          {
            kind: 'note',
            title: '担当者としての強みを活かす',
            text: '論理性や問題分析力はマネージャー業務でも価値を持つ。使う対象を「自分の解」から「組織の解」に切り替える発想で答案に反映する。',
          },
        ],
      },
      {
        id: 'chapter03-pitfalls',
        title: '陥りやすい3つの落とし穴',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '正解が一つあると思い込み、案件ごとに最適解を探して時間を浪費する',
              '部下に任せられず自分で抱え込み、A案件への時間が枯渇する',
              '完璧主義で1案件に深入りし、白紙案件を量産する',
            ],
          },
          {
            kind: 'paragraph',
            text: '対策は、事前に決めた配分（本教材の目安はA案件4分、B案件3分、C案件1〜2分）を時計とともに守ること、判断・理由・指示の3点セットを定型化すること、迷ったら委任先と期限を即決して次の案件に移ることである。',
          },
        ],
      },
      {
        id: 'chapter03-reference-links',
        title: '参照導線',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: '優先順位づけの技術',
                href: '/reference/chapter05',
                description: '時間配分の根拠となる優先度判断を確認する',
              },
              {
                label: '部下の退職・異動の相談（パターン4）',
                href: '/patterns/4',
                description: '傾聴姿勢でマネージャー思考を実体験する関連パターン',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chapter04',
    sourcePath: 'ref/chapter04-time-management.md',
    title: '時間配分とタイムマネジメント',
    description:
      '制限時間（例：60〜90分）の中で全案件を網羅するための時間配分と、序盤・中盤・終盤の使い方を整理する。',
    learningGoals: [
      '案件区分ごとの時間目安を答案に適用できる',
      '序盤の俯瞰時間と終盤の見直し時間を確保できる',
      '時間切れを前提とした優先順位の差し替えができる',
    ],
    sections: [
      {
        id: 'chapter04-allocation',
        title: '案件区分別の時間目安',
        blocks: [
          {
            kind: 'table',
            headers: ['区分', '本教材の目安', '答案の重点'],
            rows: [
              ['A案件', '4〜5分', '判断・理由・指示・期限・報告先まで完備'],
              ['B案件', '3分', '判断と最低限の指示・期限'],
              ['C案件', '1〜2分', '結論を1〜2行で短く'],
              ['俯瞰／見直し', '計5〜10分', '冒頭3分の全体把握＋末尾の白紙チェック'],
            ],
          },
          {
            kind: 'note',
            title: '時間切れを前提に組む',
            text: '全件完璧は不可能と割り切り、A案件に厚く、C案件は短くを徹底する。残り10分で白紙案件があれば、結論1行でも書く。',
          },
        ],
      },
      {
        id: 'chapter04-flow',
        title: '序盤・中盤・終盤の使い方',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '序盤（最初の3〜5分）: 全案件をざっと眺め、優先度A/B/Cの仮ラベルを付ける',
              '中盤（残り時間の大部分）: A案件から着手し、B→Cの順で処理する',
              '終盤（最後の5〜10分）: 白紙チェックと、関連案件の整合性確認を行う',
            ],
          },
          {
            kind: 'paragraph',
            text: '序盤の俯瞰で案件間の関連（同一顧客の二案件、関連プロジェクトの遅延と品質問題など）を把握しておくと、後の答案で一貫性を出せる。',
          },
        ],
      },
      {
        id: 'chapter04-reference-links',
        title: '参照導線',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: '優先順位づけの技術',
                href: '/reference/chapter05',
                description: '配分の前提となる優先度判定を確認する',
              },
              {
                label: '部下の有給・休暇申請（パターン7）',
                href: '/patterns/7',
                description: '短時間定型案件の配分目安を実例で確認する',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chapter06',
    sourcePath: 'ref/chapter06-decision-framework.md',
    title: '意思決定フレームワーク',
    description:
      '判断・理由・指示の3点セットを軸に、情報整理から行動指示までを高速に組み立てる枠組みを整理する。',
    learningGoals: [
      '判断・理由・指示の3点セットで答案を書ける',
      '情報整理→意思決定→行動指示のフローを高速に回せる',
      '不確実性が高い案件で仮判断と再評価を使い分けられる',
    ],
    sections: [
      {
        id: 'chapter06-three-points',
        title: '3点セットで書く',
        summary: '答案を「判断＋理由＋指示」の3要素で組み立てると、読み手が次の行動を確認しやすい。',
        blocks: [
          {
            kind: 'table',
            headers: ['要素', '書くこと', 'NG例'],
            rows: [
              ['判断', '優先度ランクと結論を明示', '「検討します」で終える'],
              ['理由', '重要度・緊急度・影響範囲の根拠', '感情論や個人意見だけ'],
              ['指示', '担当者・期限・報告方法', '誰に何時までかが不明'],
            ],
          },
          {
            kind: 'note',
            title: '型を持つ価値',
            text: '型に当てはめて書くことで、案件ごとの考慮抜けを防ぎ、書く速度と内容の安定を両立できる。',
          },
        ],
      },
      {
        id: 'chapter06-flow',
        title: '情報整理→意思決定→行動指示',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '情報整理: 関係者・期限・既知情報・不足情報を30秒で書き出す',
              '意思決定: 影響範囲と回復可能性で優先度を決める',
              '行動指示: 誰が、いつまでに、何を、どう報告するかを書く',
            ],
          },
          {
            kind: 'paragraph',
            text: '不確実性が高い案件は、確定的な判断ではなく「現時点では○○の方針で進める。N日後に再評価する」と仮判断＋再評価条件を示す。何も決めない答案より、次に確認することと判断の時期が伝わる。',
          },
        ],
      },
      {
        id: 'chapter06-reference-links',
        title: '参照導線',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: '採点基準と振り返りの6観点',
                href: '/reference/chapter02',
                description: '振り返りの6観点と3点セットの対応を確認する',
              },
              {
                label: '複合案件（パターン20）',
                href: '/patterns/20',
                description: '判断・理由・指示の3点セットを複合案件で適用する関連パターン',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chapter07',
    sourcePath: 'ref/chapter07-delegation.md',
    title: '委任と組織活用の技術',
    description: '何を誰に任せるかの判断軸と、委任時に必須の指示要素・フォロー設計を整理する。',
    learningGoals: [
      '委任すべき案件と自分が握る案件を区別できる',
      '委任時に担当・期限・報告方法を漏れなく書ける',
      '関係部署を巻き込む横連携を答案に反映できる',
    ],
    sections: [
      {
        id: 'chapter07-when-to-delegate',
        title: '委任の判断軸',
        blocks: [
          {
            kind: 'table',
            headers: ['案件特性', '推奨アクション'],
            rows: [
              ['定型・ローリスク', '部下に委任し結果報告のみ受ける'],
              ['育成機会あり', '若手担当者を割当て進捗中間レビュー'],
              ['コンプラ／対外発信', '専門部署と連携、自分は窓口に徹する'],
              ['組織横断調整', '関係部署キーマンに事前根回し'],
            ],
          },
          {
            kind: 'note',
            title: '抱え込まない',
            text: '管理職が自分で全部を処理する答案では、組織として動く計画が見えにくい。委任先と期限を書く。',
          },
        ],
      },
      {
        id: 'chapter07-essentials',
        title: '委任時に必須の4要素',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '担当者: 誰に任せるかを名指しで指定する',
              '期限: いつまでに何をするかを明示する',
              '報告方法: 中間と最終の報告タイミングを決める',
              '裁量範囲: 何までは判断してよいか、どこから上申かを示す',
            ],
          },
          {
            kind: 'paragraph',
            text: '委任は「丸投げ」ではない。中間レビューや報告フォーマットを設計しておくことで、想定外を早期に検知し、自分の責任で軌道修正できる体制を整える。',
          },
        ],
      },
      {
        id: 'chapter07-reference-links',
        title: '参照導線',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: '案件パターン別攻略',
                href: '/reference/chapter08',
                description: 'パターンごとの委任先候補を確認する',
              },
              {
                label: '新規取引・営業案件（パターン3）',
                href: '/patterns/3',
                description: '委任先と裁量範囲の設計を実例で確認する',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chapter09',
    sourcePath: 'ref/chapter09-writing-technique.md',
    title: '答案の書き方と文章技術',
    description:
      '読み手に伝わる短文・箇条書き・主語明示など、限られた時間で書き切る文章技術を整理する。',
    learningGoals: [
      '短文＋箇条書きで判断・指示を簡潔に書ける',
      '主語と期限を省略せずに記述できる',
      '感情語を避けた中立的な表現で書ける',
    ],
    sections: [
      {
        id: 'chapter09-style',
        title: '伝わる書き方の基本',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '結論先出し: 優先度と判断を1行目に書く',
              '短文中心: 1文40〜60字を目安にし、冗長な接続詞を削る',
              '箇条書き活用: 指示が複数あるなら箇条書きで分解する',
              '主語明示: 「自分が」「○○氏に」など主体を必ず書く',
            ],
          },
          {
            kind: 'note',
            title: '読み手に優しい書式',
            text: '結論・担当・期限が一目で分かる書式にすると、読み手の負担が減り、指示の抜けにも自分で気付きやすい。',
          },
        ],
      },
      {
        id: 'chapter09-anti-patterns',
        title: '避けるべき表現',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '「検討します」「調整します」のみで具体行動を書かない',
              '「〜と思う」「〜したい」など曖昧な希望表現',
              '感情語（「ひどい」「とんでもない」）や高圧的な指示',
              '主語抜けの命令文（誰がやるのか不明）',
            ],
          },
          {
            kind: 'paragraph',
            text: '感情・推測・装飾を削ぎ、誰がいつまでに何をどう報告するかを淡々と書く。事実と判断が分かれていれば、読み手は次の行動を確認できる。',
          },
        ],
      },
      {
        id: 'chapter09-reference-links',
        title: '参照導線',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: '意思決定フレームワーク',
                href: '/reference/chapter06',
                description: '3点セットと書き方の対応を確認する',
              },
              {
                label: '取引先からの要求（パターン2）',
                href: '/patterns/2',
                description: '事実と判断を切り分けて記述する代表例',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chapter10',
    sourcePath: 'ref/chapter10-practice-exam.md',
    title: '模擬試験の進め方',
    description:
      '模擬試験の準備・実施・振り返りの進め方と、関連する案件を含む3つの演習を収録する。',
    learningGoals: [
      '模擬試験を本番に近い条件で回せる',
      '振り返りで6観点のうち弱いものを特定できる',
      '案件間の関連に気づき、答案に反映できる',
    ],
    sections: [
      {
        id: 'chapter10-flow',
        title: '模試の3段階',
        blocks: [
          {
            kind: 'table',
            headers: ['段階', '実施内容', '所要時間'],
            rows: [
              ['準備', '時間・案件数・振り返りの観点を決める', '5分'],
              ['実施', '時計を見ながら本番同等で解く', '60〜90分'],
              ['振り返り', '6観点別に良かった点と弱点を分類', '20〜30分'],
            ],
          },
          {
            kind: 'note',
            title: '回数より質',
            text: '量をこなすより、1回ごとに弱点を特定し次回の重点課題を決める方が効率的である。',
          },
        ],
      },
      {
        id: 'chapter10-review',
        title: '振り返りの観点',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '時間配分: A案件に十分時間を割けたか、白紙はゼロか',
              '判断の質: 各案件で優先度の根拠を書けたか',
              '指示の具体性: 担当・期限・報告方法が揃っているか',
              '横連携: 関係部署を巻き込めたか、自分で抱え込んでいないか',
            ],
          },
          {
            kind: 'paragraph',
            text: '振り返りは6つの観点に沿って弱点を分類し、次回までに重点的に直す1〜2点を決めると改善が続きやすい。',
          },
        ],
      },
      {
        id: 'chapter10-exercise1',
        title: '演習1：急な顧客トラブル（3件）',
        summary:
          '設定：ITサービス部門の課長として着任2週間目。前任の佐藤課長は体調不良で急に退職した。目安15分で、先に自分の答案を書いてから解答例と比べる。',
        blocks: [
          {
            kind: 'note',
            title: '案件A：大口顧客からのクレーム（営業部 鈴木主任から）',
            text: '本日9時ごろ、大口顧客A物流の田中部長から電話があった。先週金曜に納品した在庫管理システムの更新で、一部の倉庫の在庫データに不整合が出ている。「今週中に改善されなければ契約見直しを検討する」とのこと。開発担当の山田さんによると、原因の特定には最低2日かかる。至急、対応方針を指示してほしい。',
          },
          {
            kind: 'note',
            title: '案件B：有給休暇の申請（開発担当 山田さんから）',
            text: '来週水曜から金曜の3日間、有給休暇を申請します。子どもの学校行事と通院の予定があります。',
          },
          {
            kind: 'note',
            title: '案件C：マネジメント研修の案内（人事部 教育研修課から）',
            text: '来月15日（金）に新任管理職向けマネジメント研修を行う。参加希望は今週金曜までに連絡。業務の都合で参加できない場合は、3か月後の次回に参加できる。',
          },
        ],
      },
      {
        id: 'chapter10-exercise1-answer',
        title: '演習1の解答例と振り返り',
        blocks: [
          {
            kind: 'note',
            title: '案件A（A：最優先）',
            text: '判断：A物流への対応を最優先とし、本日中に初動を行う。理由：大口顧客の業務に影響が出ており、契約見直しの可能性もあるため。指示：午前中に鈴木主任から詳細を聞き、山田さんに原因調査を指示して明日中に中間報告を受ける。本日中に私から田中部長へお詫びと受領の連絡をし、原因が確定していなくても今週木曜に経過（判明した原因・暫定対策・未確認事項）を報告する予定を伝える。部長には本日中に概要と方針を報告する。',
          },
          {
            kind: 'note',
            title: '案件B（B：案件Aとの関連で調整が必要）',
            text: '判断：休暇は取得する前提で、案件Aの調査との両立を本人と相談する。理由：山田さんは案件Aの調査担当で、休暇中の調査体制を決めておく必要がある。日程の変更を求めるのではなく、管理職が体制を整える。指示：今日中に山田さんと話し、休暇前までの調査計画と引き継ぎ先を決める。代わりの担当者を確保し、休暇前の勤務時間内に状況を共有してもらう。扱いに迷う点は人事に確認する。',
          },
          {
            kind: 'note',
            title: '案件C（C：通常対応）',
            text: '参加を希望し、今週中に人事部へ連絡する。着任2週間で引き継ぎが優先だが、来月15日なら調整できると判断した。',
          },
          {
            kind: 'table',
            headers: ['振り返りの観点', '確かめること'],
            rows: [
              ['問題発見力', 'A物流の問題の深刻さと、契約見直しの可能性を捉えたか'],
              ['意思決定力', '具体的な行動と期限を決めたか'],
              ['組織活用力', '鈴木主任・山田さん・部長の役割を示したか'],
              ['洞察力', '案件Aと案件Bに同じ山田さんが関わることに気づいたか'],
              ['ヒューマンスキル', '山田さんの事情に配慮し、休暇の取得を妨げていないか'],
              ['優先順位', 'A→B→Cの順で処理したか'],
            ],
          },
        ],
      },
      {
        id: 'chapter10-exercise2',
        title: '演習2：部下からの相談と期限のある依頼（2件）',
        summary: '設定：マーケティング部の課長。部下は6名。',
        blocks: [
          {
            kind: 'note',
            title: '案件D：個人的な相談（入社2年目 高橋さんから）',
            text: '最近、先輩の中村さんから業務に関係のない雑用を頻繁に頼まれ、自分の業務が回らなくなっています。断ると「若手なんだから当たり前だ」と言われます。正直、精神的にもつらいです。メールでは書きづらいので、直接話したいです。',
          },
          {
            kind: 'note',
            title: '案件E：業績報告と目標設定の提出（部長から）',
            text: '上半期の業績報告書と下半期の目標を、来週月曜までに添付の書式で提出してほしい。',
          },
          {
            kind: 'note',
            title: '解答例：案件D（A：ハラスメントの可能性）',
            text: '判断：高橋さんとの面談を本日から明日中に設定する。理由：「精神的にもつらい」とあり、ハラスメントの可能性もあるため。指示：人目につかない場所で話を聞き、この段階では中村さんへの指導を急がない。相談内容を誰にどこまで共有するかは本人と確認し、必要に応じて人事部の相談窓口と連携する。先に中村さんへ注意すると、相談者が特定されるおそれがある。',
          },
          {
            kind: 'note',
            title: '解答例：案件E（B：期限あり）',
            text: '来週月曜の期限に合わせ、各メンバーに上半期の実績データを水曜までに提出してもらい、木曜と金曜で報告書と目標を作成する。下半期の目標は部の方針と合わせるため、部長に事前の確認を依頼する。',
          },
        ],
      },
      {
        id: 'chapter10-exercise3',
        title: '演習3：予算と人員の判断（2件）',
        summary: '設定：システム開発部の課長。年度予算の残りは500万円。',
        blocks: [
          {
            kind: 'note',
            title: '案件F：追加開発の依頼（プロジェクトリーダー 佐々木さんから）',
            text: 'Bプロジェクトの顧客から、当初の仕様にない追加機能の要望があった。追加費用は約300万円で、顧客は費用を負担する意向だが、納期は変えないでほしいという。現在の人員では納期を守れず、2名の増員が必要。判断をお願いしたい。',
          },
          {
            kind: 'note',
            title: '案件G：資格取得の費用（若手 小林さんから）',
            text: 'クラウド関連の上級資格の取得を目指している。受験費3万円と教材費5万円を部の費用で負担してほしい。次のクラウド案件に活かせると考えている。',
          },
          {
            kind: 'note',
            title: '解答例：案件F（A）',
            text: '判断：追加開発は条件付きで受ける方向で検討し、確認してから最終判断する。理由：顧客が費用を負担すれば売上になるが、納期と品質の両立にリスクがあるため。指示：佐々木さんに、追加機能の範囲と見積もりの精度、増員2名のスキル要件、納期リスクを明日中に整理してもらう。追加契約の条件は営業部と法務部に確認し、増員は他プロジェクトの状況を確かめて社内移動か外部委託を検討する。部長には概要と方針を報告し、追加契約の承認を上申する。納期が難しい場合は、段階的な公開を顧客に提案する。',
          },
          {
            kind: 'note',
            title: '解答例：案件G（C）',
            text: '費用の扱いと決裁権限を規程で確認し、範囲内であれば承認する。次のクラウド案件への効果が見込めるため。小林さんには手配を進めてもらい、取得後に部内で知識を共有する機会を設ける。',
          },
        ],
      },
      {
        id: 'chapter10-self-check',
        title: '自己採点の進め方',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '優先順位は適切か（A・B・Cの判断）',
              '判断が明確か（「検討する」で終わっていないか）',
              '誰に・何を・いつまでにが入っているか',
              '組織を活用しているか（自分で全部やっていないか）',
              '案件間の関連に気づいているか',
              '相手への配慮が分かるか',
              '報告や確認の予定を残したか',
              'すべての案件に回答したか（白紙がないか）',
            ],
          },
          {
            kind: 'note',
            title: '点数は合否の目安ではない',
            text: '各項目を1〜5で自己評価すると、前回との変化を記録できる。合計点は自分の変化を見るためのもので、実際の試験の合否や配点を示すものではない。',
          },
        ],
      },
      {
        id: 'chapter10-reference-links',
        title: '参照導線',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: '採点基準と振り返りの6観点',
                href: '/reference/chapter02',
                description: '振り返りの6観点を確認する',
              },
              {
                label: '部下のパフォーマンス問題（パターン6）',
                href: '/patterns/6',
                description: '模試の振り返り素材として典型的な人事系パターンを確認する',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chapter11',
    sourcePath: 'ref/chapter11-review-and-improve.md',
    title: '弱点分析と継続改善',
    description:
      '模試・本番後の振り返りを定着させ、振り返りの6観点ごとの改善サイクルで本番に向けて精度を上げる。',
    learningGoals: [
      '6観点ごとの弱点を可視化できる',
      '改善サイクルを定型化し継続できる',
      '次回までの重点課題を1〜2点に絞れる',
    ],
    sections: [
      {
        id: 'chapter11-cycle',
        title: '改善サイクルの定型化',
        blocks: [
          {
            kind: 'table',
            headers: ['ステップ', '内容', '成果物'],
            rows: [
              ['記録', '答案と所要時間を残す', '答案ログ'],
              ['採点', '6観点で自己採点する', '弱点リスト'],
              ['原因分析', '弱点が出た理由を特定する', '原因メモ'],
              ['対策', '次回までに試す行動を1〜2点決める', '改善カード'],
            ],
          },
          {
            kind: 'note',
            title: '広げすぎない',
            text: '一度に5項目を改善しようとすると定着しない。次回までは1〜2点に絞って試行→評価する。',
          },
        ],
      },
      {
        id: 'chapter11-weak-points',
        title: 'よくある弱点と対処',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '時間切れで白紙: 序盤の俯瞰時間と区分別配分を再設定する',
              '指示が抽象的: 「誰に・いつまでに・どう報告」を必ず書く型を徹底する',
              '判断の根拠不足: 影響範囲と緊急性を1文で添える型に変える',
              '横連携不足: 関連部署を案件ごとに事前リストアップしておく',
            ],
          },
          {
            kind: 'paragraph',
            text: '弱点は答案に痕跡が残る。1案件だけでも解答例と比較して差分を言語化することで、次回までの重点課題が具体化する。',
          },
        ],
      },
      {
        id: 'chapter11-reference-links',
        title: '参照導線',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: '模擬試験の進め方',
                href: '/reference/chapter10',
                description: '振り返りの素材となる模試運用を確認する',
              },
              {
                label: 'コンプライアンス違反（パターン15）',
                href: '/patterns/15',
                description: '弱点になりやすいリスク系の改善サイクル素材を確認する',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chapter12',
    sourcePath: 'ref/chapter12-exam-day-strategy.md',
    title: '本番当日の戦略',
    description:
      '本番当日の持ち物・心構え・直前準備・終了直前の見直しまで、力を出し切るための行動計画を整理する。',
    learningGoals: [
      '本番前日と当日朝の準備を再現可能にする',
      '緊張下でも時間配分を崩さずに進められる',
      '残り時間ごとの行動を事前に決めておける',
    ],
    sections: [
      {
        id: 'chapter12-pre-exam',
        title: '前日と当日朝の準備',
        blocks: [
          {
            kind: 'bullet-list',
            items: [
              '前日: 持ち物（受験票・筆記用具・腕時計）と会場経路を確認する',
              '前日: 直前に新しい教材は開かず、これまでの自分の型を1度なぞる',
              '当日朝: 軽めの食事をとり、開始30分前には会場入りする',
              '当日朝: 序盤の俯瞰時間と区分別配分を頭の中で復唱する',
            ],
          },
          {
            kind: 'note',
            title: 'コンディション最優先',
            text: '直前の追い込みより睡眠と落ち着きを優先する。本番の集中力が最大の武器となる。',
          },
        ],
      },
      {
        id: 'chapter12-during-exam',
        title: '残り時間ごとの行動',
        blocks: [
          {
            kind: 'table',
            headers: ['残り時間', '行動'],
            rows: [
              ['開始〜5分', '全案件を眺めA/B/C仮ラベル付与'],
              ['5分〜終盤', 'A→B→Cの順に処理'],
              ['残り10分', '白紙案件チェック、最低1行で結論を埋める'],
              ['残り3分', '誤字脱字より抜け漏れの最終確認を優先'],
            ],
          },
          {
            kind: 'paragraph',
            text: '本番では想定外（難しい案件・時間配分のズレ）が起きやすい。事前に決めた残り時間ごとの行動表を心の中で持っておくと、慱てずに切り替えられる。',
          },
        ],
      },
      {
        id: 'chapter12-reference-links',
        title: '参照導線',
        blocks: [
          {
            kind: 'link-list',
            items: [
              {
                label: '時間配分とタイムマネジメント',
                href: '/reference/chapter04',
                description: '残り時間ごとの判断基盤を確認する',
              },
              {
                label: 'プロジェクト遅延・品質問題（パターン9）',
                href: '/patterns/9',
                description: '想定外が起きやすいパターンで残り時間ごとの行動表を当てはめる',
              },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * PBI-083 / TASK-083-2: REFERENCE_DATA は章IDの昇順（chapter01..chapter12）に並べる。
 * REFERENCE_DATA_SOURCE 内の宣言順は歴史的経緯（PBI-056→PBI-080）で非順序のため、
 * 利用側に提供する配列は localeCompare で常に章番号昇順に揃える。
 * これにより ReferencePage.tsx の getChapterNavInfo で計算する prev/next が
 * 章番号通り（例: chapter03 prev=chapter02 / next=chapter04）になる。
 */
export const REFERENCE_DATA: ReferenceChapter[] = [...REFERENCE_DATA_SOURCE].sort((a, b) =>
  a.id.localeCompare(b.id),
);

/** 章IDからリファレンス章を取得する */
export function findReferenceChapterById(id: ReferenceChapterId): ReferenceChapter | undefined {
  return REFERENCE_DATA.find((chapter) => chapter.id === id);
}

/**
 * インバスケット案件パターンデータ（PBI-055 / TASK-301）
 * chapter08-case-patterns.md の全20パターンをTypeScriptデータとして定義する。
 */

/** パターンの標準的な優先度傾向 */
export type PatternPriority = 'A' | 'B' | 'C' | 'situational';

/** パターンカテゴリ */
export type PatternCategory =
  | '対外対応パターン'
  | '人事・部下マネジメントパターン'
  | '業務・プロジェクトパターン'
  | 'リスク・トラブルパターン'
  | '組織・方針パターン'
  | 'その他のパターン';

/** パターンアイテム型定義 */
export interface PatternItem {
  /** パターン番号（1〜20） */
  id: number;
  /** パターン名称 */
  name: string;
  /** パターンカテゴリ */
  category: PatternCategory;
  /** 標準的な優先度傾向 */
  typicalPriority: PatternPriority;
  /** 優先度判定理由・特徴 */
  characteristics: string;
  /** 回答の骨格（ステップ一覧） */
  answerSkeleton: string[];
  /** キーフレーズ（任意） */
  keyPhrases?: string[];
  /** 対応ポイント・注意事項（任意） */
  notes?: string;
}

/** 全20パターンのデータ */
export const PATTERN_DATA: PatternItem[] = [
  {
    id: 1,
    name: '顧客クレーム',
    category: '対外対応パターン',
    typicalPriority: 'A',
    characteristics: '緊急度・重要度ともに高い。最優先案件。初動の遅れは信頼失墜に直結する。',
    answerSkeleton: [
      '顧客への初動対応（謝罪・受領連絡）を指示',
      '事実関係の調査を指示（担当者・期限）',
      '再発防止策の検討を指示',
      '必要に応じて上司・関係部署に報告',
      '顧客への正式回答の期限を設定',
    ],
    keyPhrases: [
      'まず本日中にお詫びと経過報告の連絡を行い…',
      '事実確認の上、○日までに正式回答する方針で…',
    ],
  },
  {
    id: 2,
    name: '取引先からの要求（値引き・仕様変更等）',
    category: '対外対応パターン',
    typicalPriority: 'situational',
    characteristics:
      '自分の一存では決められないことが多い。取引関係維持と自社収益のバランスが重要。',
    answerSkeleton: [
      '要求の背景・意図を確認',
      '自社への影響を分析（コスト、他顧客への波及）',
      '受入可能な範囲を検討',
      '代替案があれば提示',
      '権限を超える場合は上司に提案の形で上申',
    ],
    keyPhrases: ['取引関係の維持と自社の収益のバランスを考慮し…'],
  },
  {
    id: 3,
    name: '新規取引・営業案件',
    category: '対外対応パターン',
    typicalPriority: 'B',
    characteristics: '前向きだが、リスク評価が必要。ビジネス機会として評価しつつ慎重に進める。',
    answerSkeleton: [
      'ビジネス機会としての評価',
      'リソース・リスクの確認',
      '関係部署（営業・法務等）との連携を指示',
      '判断の期限を設定',
    ],
  },
  {
    id: 4,
    name: '部下の退職・異動の相談',
    category: '人事・部下マネジメントパターン',
    typicalPriority: 'A',
    characteristics: 'ヒューマンスキルが最も問われる案件。メールではなく対面で向き合う姿勢が重要。',
    answerSkeleton: [
      'まず直接面談の場を設ける（メールではなく対面）',
      '本人の話をしっかり聴く姿勢を示す',
      '退職理由・不満の本質を探る',
      '組織として対応できることを検討',
      '最終的には本人の意思を尊重する姿勢',
    ],
    keyPhrases: [
      'まず本人と直接面談する時間を設け、じっくり話を聴いた上で…',
      '本人の気持ちを十分に理解した上で、組織として対応できることを検討します',
    ],
  },
  {
    id: 5,
    name: '部下間の対立・人間関係トラブル',
    category: '人事・部下マネジメントパターン',
    typicalPriority: 'B',
    characteristics:
      '事実確認が最重要。片方の言い分だけで判断しない。公平な立場での調整が求められる。',
    answerSkeleton: [
      '双方から個別に事情を聴く',
      '事実と感情を分けて整理',
      '公平な立場で調整する方針を示す',
      '必要に応じてチーム体制の見直しを検討',
    ],
  },
  {
    id: 6,
    name: '部下のパフォーマンス問題',
    category: '人事・部下マネジメントパターン',
    typicalPriority: 'B',
    characteristics: '叱責ではなく、改善支援の姿勢が重要。原因を把握し具体的な支援策を提示する。',
    answerSkeleton: [
      '具体的な事実に基づいて状況を把握',
      '本人と面談し、原因を把握（スキル不足？モチベーション？家庭の事情？）',
      '具体的な改善目標と支援策を提示',
      '定期的なフォローアップの仕組みを作る',
    ],
  },
  {
    id: 7,
    name: '部下の有給・休暇申請',
    category: '人事・部下マネジメントパターン',
    typicalPriority: 'C',
    characteristics: '通常はC案件。業務に支障がなければ承認。回答は簡潔でよい。',
    answerSkeleton: ['業務への影響を確認', '代替要員の確保を指示', '承認'],
    notes: '1〜2行で十分。過度に長い回答は不要。',
  },
  {
    id: 8,
    name: 'ハラスメント報告',
    category: '人事・部下マネジメントパターン',
    typicalPriority: 'A',
    characteristics: 'コンプライアンス案件。自動的にA案件。報告者の安全確保が最優先。',
    answerSkeleton: [
      '報告者の安全を最優先で確保',
      '事実関係を慎重に調査（人事部と連携）',
      '法令に基づいた対応を行う',
      '守秘義務を厳守する旨を関係者に伝達',
      '上位者に報告',
    ],
    notes: '絶対にやってはいけないこと: 報告者を責める、当事者同士で話し合わせる、他の人に漏らす。',
  },
  {
    id: 9,
    name: 'プロジェクト遅延・品質問題',
    category: '業務・プロジェクトパターン',
    typicalPriority: 'A',
    characteristics: 'エンジニアが最も経験のあるパターン。原因の切り分けを明示すると高評価。',
    answerSkeleton: [
      '遅延・品質問題の影響範囲を把握',
      '原因を分析（要因の切り分け）',
      'リカバリー策を指示（増員？スコープ変更？期限延長？）',
      'ステークホルダーへの報告',
      '再発防止策を検討',
    ],
    notes: '技術的な問題の構造化が得意なはず。「原因を切り分ける」プロセスを明示すると高評価。',
  },
  {
    id: 10,
    name: '予算承認・経費申請',
    category: '業務・プロジェクトパターン',
    typicalPriority: 'situational',
    characteristics: '金額と権限の範囲を確認する。費用対効果と予算範囲が判断軸。',
    answerSkeleton: [
      '費用対効果を確認',
      '予算の範囲内か確認',
      '承認/条件付き承認/上申のいずれかを判断',
      '理由を明記',
    ],
  },
  {
    id: 11,
    name: '業務改善提案',
    category: '業務・プロジェクトパターン',
    typicalPriority: 'B',
    characteristics:
      '部下からのボトムアップ提案。前向きに受け止める姿勢が重要。提案者を推進役にする。',
    answerSkeleton: [
      '提案に対する感謝・評価',
      '実現可能性と効果の検討を指示',
      '次のステップ（試行導入、関係者への説明等）',
      '提案者を推進役にする（部下の成長機会）',
    ],
  },
  {
    id: 12,
    name: '会議・セミナーへの参加依頼',
    category: '業務・プロジェクトパターン',
    typicalPriority: 'C',
    characteristics: '通常はC案件。重要な会議なら自ら出席、情報収集目的なら部下に委任。',
    answerSkeleton: [
      '参加のメリットを判断',
      '業務との兼ね合いを確認',
      '参加/不参加/部下に参加させる のいずれかを判断',
    ],
  },
  {
    id: 13,
    name: '事故・災害報告',
    category: 'リスク・トラブルパターン',
    typicalPriority: 'A',
    characteristics: '最優先。人命と安全が第一。被害の拡大防止が急務。',
    answerSkeleton: [
      '人的被害の確認と安全確保（最優先）',
      '被害の拡大防止措置',
      '関係先への報告（上司、関係部署、必要に応じて行政機関）',
      '原因調査と再発防止策',
    ],
  },
  {
    id: 14,
    name: '情報セキュリティインシデント',
    category: 'リスク・トラブルパターン',
    typicalPriority: 'A',
    characteristics: 'エンジニアの知識が活きるパターン。封じ込めと影響範囲の特定が最優先。',
    answerSkeleton: [
      '被害範囲の特定と封じ込め',
      '関係者（情報セキュリティ部門、法務、経営層）への報告',
      '顧客情報が含まれる場合の対外対応',
      '原因調査と再発防止策',
    ],
  },
  {
    id: 15,
    name: 'コンプライアンス違反（不正行為）',
    category: 'リスク・トラブルパターン',
    typicalPriority: 'A',
    characteristics: '自動的にA案件。適切な対応が強く求められる。証拠保全と守秘が重要。',
    answerSkeleton: [
      '事実関係の慎重な確認',
      'コンプライアンス部門・法務部門への相談',
      '上位者への報告',
      '証拠の保全',
      '関係者への守秘義務の徹底',
    ],
  },
  {
    id: 16,
    name: '組織変更・人員配置',
    category: '組織・方針パターン',
    typicalPriority: 'B',
    characteristics: '多くの関係者に影響する。段階的な実施と丁寧な説明が重要。',
    answerSkeleton: [
      '変更の目的・背景を確認',
      '影響を受ける関係者を特定',
      '上位者の方針との整合性を確認',
      '段階的な実施計画を立てる',
      '関係者への丁寧な説明を計画',
    ],
  },
  {
    id: 17,
    name: '上位方針の伝達・対応',
    category: '組織・方針パターン',
    typicalPriority: 'B',
    characteristics: '上から降りてきた方針を部署に展開する。納得感の醸成が鍵。',
    answerSkeleton: [
      '方針の内容を正確に理解',
      '自部署への影響を分析',
      '具体的なアクションプランを策定',
      '部下への説明と納得感の醸成',
    ],
  },
  {
    id: 18,
    name: '他部署からの依頼・調整',
    category: '組織・方針パターン',
    typicalPriority: 'B',
    characteristics: '協力姿勢を見せつつ、自部署の負荷も考慮する。具体的な対応範囲の合意が重要。',
    answerSkeleton: [
      '依頼内容の確認',
      '自部署のリソース状況を確認',
      '協力の方向性を示す（全面協力/部分協力/条件付き）',
      '具体的な対応範囲と期限を合意',
    ],
  },
  {
    id: 19,
    name: '前任者の未完了案件',
    category: 'その他のパターン',
    typicalPriority: 'situational',
    characteristics: 'インバスケット特有の設定。前任者の方針・経緯を確認した上で引き継ぐ。',
    answerSkeleton: [
      '前任者の方針・経緯を確認',
      '継続すべきか見直すべきかを判断',
      '関係者に着任の挨拶と方針を伝達',
    ],
  },
  {
    id: 20,
    name: '複合案件（複数パターンの組み合わせ）',
    category: 'その他のパターン',
    typicalPriority: 'A',
    characteristics:
      '高難度。A案件になりやすい。案件を要素に分解し、優先順位の高い要素から対応する。',
    answerSkeleton: [
      '案件を要素に分解する',
      '優先順位の高い要素から対応する',
      '関連する他の案件と紐づけて対応する',
    ],
  },
];

/** パターンIDから検索する */
export function findPatternById(id: number): PatternItem | undefined {
  return PATTERN_DATA.find((p) => p.id === id);
}

/** パターン名からIDを取得する（"パターン1" → 1） */
export function parsePatternIdFromText(text: string): number | null {
  const match = text.match(/パターン\s*(\d+)/);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return isNaN(id) ? null : id;
}

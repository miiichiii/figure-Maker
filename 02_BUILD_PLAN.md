# 02_BUILD_PLAN

## 方針（最優先）
- Undo/Redo を「SVG全文スナップショット」中心から「差分/アクションベース履歴」中心へ段階移行する。
- 目的は 3 点:
  - 高解像度画像を含む編集でメモリ増大と `localStorage` 容量超過を抑える。
  - 連続操作（drag/resize/rotate）の履歴密度を最適化し、操作体験を維持する。
  - 既存データ破損を避けるため、移行期間はスナップショット経路をフォールバックとして残す。

## 採用アーキテクチャ（Hybrid）
- 履歴単位:
  - `ActionEntry`: 差分（最小変更）を保持。
  - `Checkpoint`: 定期的な軽量スナップショット（例: 20アクションごと）を保持。
- 復元戦略:
  - `checkpoint + action replay` を基本とし、失敗時は従来スナップショットにフォールバック。
- 互換期間:
  - 移行完了までは `history(snapshot)` と `actionHistory` を同時運用（dual-write）。

## Action データ構造
- 共通ヘッダ:
  - `id`, `at`, `type`, `targetId`, `before`, `after`, `meta`
- 初期 action 種別（P0）:
  - `create-node`: 追加（親ID・挿入位置・最小markup）
  - `delete-node`: 削除（復元用markupを保持）
  - `set-attrs`: 属性変更（差分のみ）
  - `set-transform`: `data-base-transform/data-tx/data-ty` 更新
  - `set-text`: text内容/部分スタイル更新
  - `reparent`: group/ungroup/duplicate の親変更
  - `selection`: 選択状態変更（必要最小限）
- バッチ:
  - 1ユーザー操作は `ActionBatch` として束ねる。
  - 例: drag 完了時に複数要素分の `set-transform` を 1 バッチで記録。

## Undo/Redo ロジック
- `apply(action)` と `revert(action)` をペア実装。
- `undo`:
  - 最新 `ActionBatch` を逆順に `revert`。
- `redo`:
  - `ActionBatch` を順に `apply`。
- 失敗時:
  - バッチ単位で中断し、checkpoint または既存 snapshot から再構築。

## Autosave 方針（Action対応）
- タイムド保存:
  - `latest checkpoint + tail actions` を保存対象にする。
- 容量制御:
  - actions件数/bytes上限超過時は checkpoint を前詰めして compaction。
- 互換:
  - 既存 `figureMaker_live_snapshot` は読み取り互換を維持し、段階的に action形式へ移行。

## 導入ステップ（段階導入）
1. `Phase 0: 計測固定`
- 既存 snapshot 方式のメモリ/保存サイズ/操作遅延を計測ログ化。
- 受入: drag連打・画像貼り付け時の基準値が取れる。

2. `Phase 1: Action 定義 + dual-write`
- 操作完了時に `ActionBatch` を生成しつつ、従来 `pushHistory(snapshot)` も継続。
- 受入: 既存 Undo/Redo 挙動が変わらず、actionログが欠損しない。

3. `Phase 2: Action replay 検証経路`
- テスト専用で `checkpoint + actions` 復元を有効化（本番Undoはまだsnapshot）。
- 受入: 主要操作（add/move/resize/rotate/group/paste/text）が再現一致。

4. `Phase 3: Undo/Redo の Action 優先化`
- 本番Undo/Redoを action経路へ切替、失敗時のみ snapshotフォールバック。
- 受入: ユーザー操作の回帰なし、メモリ使用量が現行より低下。

5. `Phase 4: Autosave の Action 化`
- live/timed autosave を `checkpoint + actions` 保存へ切替。
- 受入: `QuotaExceededError` 発生率低下、復元成功率維持。

6. `Phase 5: Snapshot 依存の縮小`
- 大容量snapshotの常時保存を停止し、checkpoint用途に限定。
- 受入: 履歴上限到達時の挙動が安定し、体感性能が維持される。

## 回帰防止ルール
- 既存バグ再発防止（必須）:
  - pasted SVG の座標飛び
  - bbox 同期ズレ
  - mark サイズ/位置崩れ
  - text 編集不能
  - paste 経路の取りこぼし
- 各 Phase で Reviewer が以下を確認:
  - 致命的: データ消失/復元不能/クラッシュ
  - 重要: Undo/Redo不一致、group/ungroup位置崩れ
  - 軽微: ステータス文言、ログ量、操作遅延

## 非目標（この移行でやらない）
- いきなり完全Diff化（全操作を一度に置換しない）
- 外部DB導入（IndexedDB全面移行は別タスク）
- 単一HTML構成の破壊（モジュール分割は別フェーズ）

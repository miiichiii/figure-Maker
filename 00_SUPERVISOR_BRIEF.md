# 00_SUPERVISOR_BRIEF

## 目的
Figure Maker を段階的に完成させる。初回は P0(MVP) 必達、P1 は次回以降。

## 参照順（固定）
1. `00_SUPERVISOR_BRIEF.md`
2. `01_SPEC.md`
3. `02_BUILD_PLAN.md`
4. `30_TODO.md`
5. `10_PROGRESS_LOG.md`

## 運用ルール
- 仕様の正本は `01_SPEC.md`。実装時に仕様を拡張したら同時更新する。
- 出力は原則 `patch/diff` 中心。`index.html` 全文をチャットに貼らない。
- ログは全文会話ではなく要約ログのみを `10_PROGRESS_LOG.md` に追記する。
- 1ステップごとに「決定事項 / 変更点 / 未解決 / 次アクション」を記録する。
- 各ターンで `30_TODO.md` の状態を更新する（`todo/doing/done`）。

## ステップ進行
1. Supervisor が仕様差分を確定
2. Builder が実装
3. Reviewer が致命的/重要/軽微でレビュー
4. Builder が修正
5. Reviewer 再確認

最低 2 ループ回し、P0受け入れ基準を満たしたら終了。

## P0/P1 運用
- P0: MVP。今回必達。
- P1: 仕上げ。未達可。
- 未達項目は必ず `01_SPEC.md` の `Known limitations` に明記。

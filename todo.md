# FlowJo10 Paste Fix TODO

- [x] Step 1: 原因調査
  - 現状の貼り付け経路は主に `PNG/JPEG` 前提で、FlowJo10 で出やすい `image/tiff` 系ペイロードが外部ペーストで十分に扱えていない。
  - 特に Clipboard API フォールバックが `image/png|image/jpeg` のみで、`TIFF` が来ると `unsupported` へ落ちるか表示できない画像として処理される。
- [x] Step 2: 実装修正（MIME判定の拡張）
  - ペースト経路のラスタ画像判定を `TIFF` を含む形式へ拡張する。
- [x] Step 3: 実装修正（TIFFペースト変換）
  - `TIFF` Blob は `UTIF` で `PNG` Data URL に変換してから貼り付ける。
- [x] Step 4: 実装修正（フォールバックの拡張）
  - `navigator.clipboard.read()` 経路でも `TIFF` を受理する。
- [x] Step 5: 表示文言更新
  - `PNG/JPEG` 限定のエラーメッセージを、実際に対応する形式に合わせて更新する。
- [x] Step 6: 動作確認
  - ページロード時エラーがないことを確認し、差分をまとめる。
- [x] Step 7: デバッグ強化（console + blob診断）
  - `?debug=1` で paste payload の `type/size/magic` を `console.debug` 出力。
  - 壊れたラスタ payload は `Route: error` に落として診断情報を Paste Report に残す。

## Text Font Dropdown TODO (2026-03-03)

- [x] Step 1: 現状調査と仕様固定
  - Text tab の既存UI/イベント/履歴処理を確認。
  - 対象フォントを `Arial / Times New Roman / Symbol` に固定。
  - 既存テキスト（他フォント混在）選択時はプルダウンを `mixed/other` 表示にして、ユーザーが明示選択した時だけ上書きする。
- [x] Step 2: UI実装
  - Text tab に `font` プルダウンを追加。
  - `mixed/other` を壊さない表示状態（プレースホルダ項目）を追加。
- [x] Step 3: ロジック実装
  - 選択中テキストへのフォント適用関数を追加。
  - `syncTextControlsFromSelection()` にフォント同期を追加。
  - 履歴 (`pushHistory`) とステータスメッセージを既存パターンに合わせる。
- [x] Step 4: 既存機能との整合確認
  - `addText`, inline text edit, script(super/sub), copy/paste と矛盾しないことを確認。
  - 図タイトル・Markラベル（対象外）が壊れないことを確認。
- [x] Step 5: デバッグ/検証
  - 構文チェック。
  - 可能な範囲で自動デバッグ（Playwright）で操作確認。
  - 差分レビューして完了記録。

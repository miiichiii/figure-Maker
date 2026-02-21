# 02_BUILD_PLAN

## 実装方針
- 単一HTML内に `state` を保持し、SVG DOMを直接更新。
- 主要状態:
  - `tool`: `select` / `direct`
  - `selectedIds`: 選択中ID配列（順序保持）
  - `idMap`: `data-id` 生成管理
  - `history`: undo/redo スタック
  - `autosave`: interval設定と履歴

## データ構造
- 各編集対象要素に `data-id`。
- 移動量は `data-tx/data-ty` + `transform="translate(...)"`。
- スナップショット:
  - `svgMarkup`
  - `selectedIds`
  - `timestamp`

## 選択ロジック
- PointerDown対象から SVG要素を解決。
- 黒矢印: 最外側groupへ昇格。
- 白矢印: 最深要素。
- Shiftでトグル選択。
- マーキー矩形とBBox交差で複数選択。

## Undo/Redo
- 操作完了時に `pushHistory()`。
- 上限100件、超過時は先頭破棄。
- `restoreSnapshot()` でSVG再構築と選択再現。

## 保存/読み込み
- Save SVG: Blob download。
- Open SVG: file input -> parse -> ルートSVG内へ読み込み。
- PDF: `svg2pdf` 実行、失敗時メッセージ。

## 貼り付け方針
- `paste`イベントで `clipboardData.items` を走査。
- `image/png` 優先で `<image>` 化。
- `text/plain` が `<svg` 始まりなら parse して children import。
- 失敗時はステータスメッセージ表示。

## 回帰防止メモ
- リサイズはtransformベースを維持する。属性（`x/y/width/height`）直接更新へ戻すと、貼り付けSVG（親子transformあり）で位置ドリフトが再発する。
- 貼り付け時は `data-id/data-tx/data-ty/data-base-transform` を必ず除去してから再採番する。
- line/polylineは `vector-effect: non-scaling-stroke` を維持し、短縮時の見た目太りを防ぐ。
- Rect/Ellipse/Circle/Path/Polygon も `vector-effect: non-scaling-stroke` を強制し、非等方スケール時の線幅崩れ（縦横差）を防ぐ。
- Markラベルは `data-mark-base-size` を正本にして、グループリサイズ中に毎フレーム `font-size` と補正transformを再適用する。
- Markラベルはリサイズ対象から除外する。Markサイズ変更は `Mark size` 入力のみに統一する。
- 同種バグ再発時は「transform計算の修正」だけで済ませず、`03_REVIEW_CHECKLIST.md` の回帰チェックを同時に追加して再発防止を固定する。

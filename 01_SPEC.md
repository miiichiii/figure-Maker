# 01_SPEC

## 採用仕様（確定）
- 配布形態: 単一 `index.html`（CSS/JS内包、CDN利用可）。
- SVG編集: SVG DOM を直接編集。移動は `transform="translate(x,y)"` を統一採用。
- 要素識別: 全オブジェクトに `data-id` を付与。
- 選択モード:
  - 黒矢印: クリック要素がグループ内なら「最外側の `<g>`」を選択。
  - 白矢印: クリックした最深要素を選択。
  - ツール切替時、キャンバスカーソルを黒/白矢印に連動表示する。
- 複数選択: Shift 追加/解除。
- 範囲選択: マーキー矩形と要素BBoxの交差判定。
- 整列基準: 「選択集合の外接BBox」を基準に左/中央/右・上/中/下。
- Group/Ungroup: 複数選択を `<g>` で包む / `<g>` を解除。
- Duplicate: 選択要素をオフセット複製（ボタンと `Ctrl/Cmd + D`）。
- Clipboard: 内部Copy/Cut/Paste（`Ctrl/Cmd + C/X`、内部Pasteは`Ctrl/Cmd + Shift + V`）。
  - 内部Pasteは可能なら元の親階層（`<g>`）へ復元し、存在しない場合はルートへ配置。
- ラベル: グループ右クリックで A/B/C を付与。`<text class="group-label">` を子として保持。
- Undo/Redo: SVGシリアライズ + 選択IDスナップショット方式。最大100手。
- 履歴セッション境界: `New / Open / Restore` 実行時は履歴を新規セッションにリセット。
- 自動保存: `localStorage` に Off/10/30分。復元は latest と履歴一覧。
- 貼り付け方針:
  - 優先順位は「SVGベクター優先」: `text/html内の<svg>` → `image/svg+xml` → `text/plain(<svg...)` → 画像（`<img>` / `image/png` / `image/jpeg`）。
  - `image/png` / `image/jpeg` は `<image>` として中央配置。
  - `text/html` に `<svg ...>` が含まれる場合はSVGを抽出して取り込み。
  - `text/html` に `<img src=...>` があれば画像として取り込み。
  - `text/plain` が `<svg` で始まる場合は中身要素を取り込み。
  - それ以外は未対応メッセージ。
- 出力:
  - Save SVG: 編集中SVGをダウンロード。
  - Export PDF: jsPDF + svg2pdf を優先。失敗時はエラーメッセージ。
- キャンバスメタ: OpenしたSVGの`viewBox`を保持し、Undo/Redo/Autosave復元でも維持。
- 既定フォント: Arial。
- テキスト編集: `text`要素はダブルクリックでインライン編集（Enter確定 / Escキャンセル）。
- エラー監視:
  - `window.onerror` / `window.onunhandledrejection` を有効化し、`error_id`付きで構造化ログを出力。
  - エラー通知UIでIDを表示し、`error-<id>.json`をダウンロード可能。
  - 直近イベント履歴（max100: click/key/route）をログへ同梱。
  - `last_error` を `localStorage` に保存し、起動時に通知復元。
  - `?debug=1` で詳細ログ、通常は最小ログ。

## P0 (MVP) 必達
- 新規キャンバスと基本図形追加（Rect/Line/Ellipse/Text）。
- 黒矢印/白矢印の選択差。
- Shift複数選択とマーキー範囲選択。
- ドラッグ移動、矢印キー移動（1px、Shift+矢印10px）。
- Align 6種（左/中央/右/上/中/下）。
- Group/Ungroup。
- 右クリック A/B/C ラベル付与。
- Undo/Redo（最低20手、実装は100手）。
- 自動保存 Off/10/30 と復元UI。
- Open SVG / Save SVG / Export PDF。
- PowerPoint由来の貼り付け（PNG or SVGテキスト）対応。

## P1 (仕上げ)
- 等間隔分布（横/縦）: 実装済み。
- PDFエクスポートの品質向上（フォント/複雑要素の再現性改善）: フォールバック実装済み（svg2pdf失敗時にcanvg経由ラスター化）。
- 貼り付け時のより多様なMIME対応（HTML断片等）: 基本実装済み（SVG抽出 / img src）。
- 選択表示のハンドル強化・操作性改善: 簡易BBox + リサイズハンドル（Rect/Line/Ellipse/Text/Image/Group/Polygon/Polyline/Path）実装済み。
- 高度な整列基準（最初の選択要素基準への切替）: 実装済み（Selection Box / First Selected切替）。

## 受け入れ基準
- P0項目がすべて手動操作で確認できる。
- 例外操作（未選択でAlign/Group等）でクラッシュしない。
- Undo/Redoで主要操作（追加/移動/整列/グループ化/貼り付け/読み込み）が戻せる。
- 自動保存から復元できる。

## Known limitations
- P1残項目: PDFはフォールバックで出力安定性を上げたが、ベクター保持を常に保証しない。
- `text/html`貼り付けは `<svg>` / `<img src>` 複数対応だが、複雑な埋め込みCSSや外部参照は完全再現しない。
- PowerPoint/アプリ依存で、ブラウザに渡されるクリップボード形式が画像のみの場合はベクター貼り付けはできず、ラスター貼り付けになる。
- リサイズは `path d` を含めて対応したが、Arcコマンド（A/a）の非等方スケールは近似変換。
- 外部SVGの複雑transformは保持して追加移動できるが、高度な変換行列の完全編集互換は保証しない。
- Open/Paste時は安全性優先で `script` / `foreignObject` などを除去するため、一部SVGの完全再現性は保証しない。
- SVG仕様の一部（filter, mask, script等）の編集互換は保証しない。
- 大規模SVG（数千要素）の性能最適化は対象外。

## 非目標
- Illustrator完全互換。
- 共同編集・リアルタイム同期。
- 外部ビルドツール導入。

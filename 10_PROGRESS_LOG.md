# 10_PROGRESS_LOG

## Log Template (1 step = 1 block)
### Step X - <short title>
- Date: YYYY-MM-DD
- Owner: Supervisor | Builder | Reviewer
- Decisions:
- Changes:
- Open issues:
- Next action:

---

### Step 1 - Initial setup
- Date: 2026-02-18
- Owner: Supervisor
- Decisions: P0/P1を分割し、P0必達で初回実装する。
- Changes: 運用MD群とプロンプト群の作成を開始。
- Open issues: なし。
- Next action: `index.html`にP0実装。

### Step 2 - Builder implementation (Loop 1)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 移動は `translate`、Undoはスナップショット、貼り付けはPNG/SVG text採用。
- Changes: `index.html` にP0機能（選択、範囲選択、整列、Group/Ungroup、ラベル、Undo/Redo、保存、PDF、自動保存、貼り付け）を実装。
- Open issues: `<g>`選択時の可視ハイライトが弱い。
- Next action: Reviewer観点でUI可視性と破綻を確認。

### Step 3 - Reviewer summary (Loop 1)
- Date: 2026-02-18
- Owner: Reviewer
- Decisions: 致命的/重要は未検出。軽微としてグループ選択時の視認性改善を要求。
- Changes: レビュー結果を反映する修正方針を確定。
- Open issues: グループ選択ハイライト。
- Next action: Builderが軽微修正を実施。

### Step 4 - Builder fix (Loop 2)
- Date: 2026-02-18
- Owner: Builder
- Decisions: `<g>`選択時は子要素へハイライトクラスを付与して視認性を確保。
- Changes: `index.html` の選択スタイル適用ロジックを修正（`.fm-group-selected`追加）。
- Open issues: 実ブラウザでの最終手動確認は未実施。
- Next action: Reviewer再確認とP0判定。

### Step 5 - Reviewer summary (Loop 2)
- Date: 2026-02-18
- Owner: Reviewer
- Decisions: P0受け入れ基準に対し実装上の欠落はなし。P1は既知制限として維持。
- Changes: `30_TODO.md` をP0完了状態に更新。
- Open issues: 手元ブラウザ実行の最終確認待ち。
- Next action: 差分提示して初回成果を提出。

### Step 6 - Supervisor scope for next phase
- Date: 2026-02-18
- Owner: Supervisor
- Decisions: 未完のP1から「等間隔分布」「貼り付けMIME拡張」「選択表示強化」を先行実装する。
- Changes: 実装方針を確定し、既存P0を壊さない差分実装に限定。
- Open issues: PDF品質改善は別タスク。
- Next action: Builder実装。

### Step 7 - Builder implementation (P1 partial)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 分布は両端固定の等間隔、貼り付け画像は`data:`URL化、選択表示はBBoxで実装。
- Changes: `Dist H/V`追加、`text/html`貼り付け対応、選択BBoxオーバーレイ追加、保存/履歴/自動保存からUI補助要素を除外。
- Open issues: `text/html`は先頭画像・単一SVG抽出のみ。
- Next action: Reviewer確認とMD更新。

### Step 8 - Reviewer summary (P1 partial)
- Date: 2026-02-18
- Owner: Reviewer
- Decisions: 致命的/重要は未検出。P1一部達成として仕様/TODO更新を要求。
- Changes: `01_SPEC.md` と `30_TODO.md` のP1状態を更新。
- Open issues: PDF品質改善、整列基準切替は未対応。
- Next action: 差分提示して継続開発へ。

### Step 9 - Builder implementation (P1 follow-up)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 整列基準をUI切替化し、PDF出力はベクター優先+ラスターfallbackで安定性を優先。
- Changes: `Align base`セレクトを追加、`alignSelected`を基準切替対応、`exportPdf`にcanvgフォールバック実装。
- Open issues: フォールバック時はラスターPDFとなる。
- Next action: Reviewer確認とTODO反映。

### Step 10 - Reviewer summary (P1 follow-up)
- Date: 2026-02-18
- Owner: Reviewer
- Decisions: 追加したP1項目は要件意図を満たす。Known limitationsにベクター保持制約を明記。
- Changes: `01_SPEC.md` と `30_TODO.md` を更新。
- Open issues: リサイズハンドル等の高度UIは未実装。
- Next action: 次フェーズ実装へ継続。

### Step 11 - Builder implementation (resize handles)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 単一選択時のみ、Rect/Ellipse/Imageに限定して4隅ハンドルでリサイズ対応。
- Changes: 選択ハンドル描画、`resize` interaction、保存時クリーン除去、pointerイベント分岐を実装。
- Open issues: Line/Text/Groupのリサイズは未対応。
- Next action: 仕様Known limitationsへ反映。

### Step 12 - Reviewer summary (resize handles)
- Date: 2026-02-18
- Owner: Reviewer
- Decisions: 操作性改善として有効。対象要素制限を仕様に明記して受け入れ。
- Changes: `01_SPEC.md` を更新（対応範囲と制限を追記）。
- Open issues: ハンドルの比率固定や回転は未対応。
- Next action: 残タスク洗い出しへ進む。

### Step 13 - Builder implementation (robust resize/paste)
- Date: 2026-02-18
- Owner: Builder
- Decisions: リサイズ対象をLine/Text/Groupへ拡張し、Groupは子要素再帰スケーリングで対応。
- Changes: `scaleSingleElement`導入、リサイズ対応要素拡張、`text/html`貼り付けの複数`<svg>`/複数`<img>`対応。
- Open issues: Path/Polygon/Polylineの幾何変形は未対応。
- Next action: 仕様制限更新と構文確認。

### Step 14 - Reviewer summary (robust resize/paste)
- Date: 2026-02-18
- Owner: Reviewer
- Decisions: 既存要件範囲内で改善有効。制限はPath系と複雑HTML再現性に集約。
- Changes: `01_SPEC.md` のKnown limitationsと`30_TODO.md`を更新。
- Open issues: 高度編集（回転/パス編集）は対象外のまま。
- Next action: 実ブラウザ手動テストへ。

### Step 15 - Builder implementation (shape coverage)
- Date: 2026-02-18
- Owner: Builder
- Decisions: リサイズ対象をPolygon/Polylineへ拡張し、Pathのみ未対応へ集約。
- Changes: `isResizableElement`と点列スケーリングを追加。仕様/TODOを更新。
- Open issues: `path d`編集は未対応。
- Next action: 最終差分作成。

### Step 16 - Builder implementation (path resize)
- Date: 2026-02-18
- Owner: Builder
- Decisions: Pathはコマンド単位で座標変換してリサイズ対応。Arcは近似で扱う。
- Changes: `scalePathD`を実装し、Pathをリサイズ対象へ追加。仕様/TODOを更新。
- Open issues: Arcの厳密変換は未対応（近似）。
- Next action: 実ブラウザでPathを含む図形の手動確認。

### Step 17 - Builder implementation (safety/picking)
- Date: 2026-02-18
- Owner: Builder
- Decisions: Open/PasteでSVGサニタイズを実施し、線要素は`pointer-events: stroke`で選択しやすさを優先。
- Changes: `sanitizeSvgTree` / `applyPointerEventPolicy`を追加し、読み込み・貼り付け経路に適用。
- Open issues: サニタイズにより一部高度SVGは簡略化される。
- Next action: 仕様Known limitationsへ反映。

### Step 18 - Builder implementation (duplicate)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 反復作図を高速化するためDuplicateを追加（20pxオフセット）。
- Changes: `duplicateSelected`、`Duplicate`ボタン、`Ctrl/Cmd + D`を実装。仕様/TODOへ反映。
- Open issues: 複製時の連番命名や階層リライト最適化は未対応。
- Next action: 手動回帰テスト観点を整理。

### Step 19 - Builder implementation (transform compatibility)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 既存transformを`base + translate`で保持し、外部SVG編集時の破壊的上書きを回避。
- Changes: `ensureTransformState`導入、`setTranslate/getTranslate`更新、複数HTML貼り付け時にオフセット配置。
- Open issues: 複雑変換行列の厳密編集互換は未保証。
- Next action: 構文確認とパッチ更新。

### Step 20 - Builder implementation (selection hygiene)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 補助UI要素はID付与と編集対象判定から除外して誤選択を防止。
- Changes: `isHelperElement`追加、`assignIds/ensureId/isEditableElement`で除外、複数貼り付け時に一括選択へ改善。
- Open issues: 実ブラウザでの回帰確認は継続中。
- Next action: 最新パッチ化して次の手動テスト項目へ。

### Step 21 - Builder implementation (transform-aware geometry)
- Date: 2026-02-18
- Owner: Builder
- Decisions: geometry計算を画面座標ベースBBoxへ切替し、変換付き要素のAlign/Distributeのズレを抑制。
- Changes: `safeBBox`を改修、`alignSelected/distributeSelected`をdelta移動方式へ変更。
- Open issues: 複雑変換と回転の厳密一致はブラウザ実測で最終確認が必要。
- Next action: 構文確認と差分更新。

### Step 22 - Builder implementation (reentrancy guards)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 重い処理の連打で状態破綻しないよう、Paste/PDFを再入防止する。
- Changes: `isExportingPdf` / `isPasting`フラグ追加、`exportPdf`ボタン無効化、paste全体をtry/catch/finally化。
- Open issues: 実ブラウザで連打操作の体感確認が必要。
- Next action: 構文チェックとパッチ更新。

### Step 23 - Builder implementation (history quality)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 矢印キー連打の履歴肥大を抑えるため、同種移動を履歴上でcoalesceする。
- Changes: `pushHistory`にcoalesceオプション追加、キーボード移動を`move-key`履歴で集約。
- Open issues: 細かな履歴粒度（一定時間区切り）は未導入。
- Next action: 構文確認とパッチ更新。

### Step 24 - Builder implementation (group label geometry)
- Date: 2026-02-18
- Owner: Builder
- Decisions: Groupラベルは幾何計算の対象外にして、整列と選択枠のズレを抑制する。
- Changes: `safeBBox`で`<g>`を子要素union計算へ切替（`.group-label`と補助要素を除外）。
- Open issues: 深いネスト+複雑transformの最終見え方はブラウザで確認継続。
- Next action: 構文チェックと最新パッチ更新。

### Step 25 - Builder implementation (canvas meta persistence)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 外部SVGの作業サイズを維持するため、`viewBox`を履歴/自動保存スナップショットに含める。
- Changes: `canvasMeta`をsnapshot/autosaveに追加、Open/New/Restore/Undoで`viewBox`復元を実装。
- Open issues: width/height属性の厳密互換は`viewBox`基準へ統一。
- Next action: 構文確認と差分更新。

### Step 26 - Builder implementation (sanitizer hardening)
- Date: 2026-02-18
- Owner: Builder
- Decisions: ルートSVG属性もサニタイズ対象に含め、HTML貼り付けは上限20件で過負荷を抑える。
- Changes: `sanitizeSvgAttributes`追加、`sanitizeSvgTree`にroot属性適用、`extractSvgFromHtml/extractImageSrcFromHtml`にslice上限を追加。
- Open issues: 非同期ロードの大量外部画像での体感速度は環境依存。
- Next action: 構文確認とパッチ更新。

### Step 27 - Builder implementation (group-label hygiene)
- Date: 2026-02-18
- Owner: Builder
- Decisions: group-labelは編集対象から完全除外し、Ungroup時に残さない方針で整合性を優先。
- Changes: `isGroupLabel`追加、`setSelection/getTopSelectedElements`でeditable限定、`ungroupSelected`でラベル削除。
- Open issues: ラベルをUngroup後も残したい運用には未対応。
- Next action: 構文確認と差分更新。

### Step 28 - Builder implementation (history session boundary)
- Date: 2026-02-18
- Owner: Builder
- Decisions: New/Open/Restoreは履歴を分離し、別ドキュメント間Undoを禁止する。
- Changes: `resetHistory`追加、`newCanvas/loadSvgText/restoreLatest/restoreFromList`で履歴リセット適用。
- Open issues: 復元直後に直前作業へ戻る用途はサポート外。
- Next action: 構文確認とパッチ更新。

### Step 29 - Builder implementation (internal clipboard)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 外部貼り付けは維持しつつ、アプリ内の反復編集用に内部Clipboardを追加。
- Changes: Copy/Cut/Pasteボタン、`Ctrl/Cmd+C/X`、内部Paste `Ctrl/Cmd+Shift+V` を実装。
- Open issues: 外部システムClipboardへの書き込みは未対応。
- Next action: 構文確認と差分更新。

### Step 30 - Builder implementation (clipboard cleanup)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 内部Clipboardには一時選択クラスを保存しない方針で貼り付け後の表示崩れを防止。
- Changes: `serializeElementForClipboard`を追加し、`fm-selected`等の一時クラス/補助要素を除去して保存。
- Open issues: 親階層への貼り戻し（parentId活用）は未使用。
- Next action: 構文確認と差分更新。

### Step 31 - Builder implementation (clipboard parent restore)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 内部Pasteは可能なら元の親`<g>`へ戻し、不在時は`canvas`へフォールバックする。
- Changes: `resolvePasteParent`を追加し、`importMarkupFragment`で`parentId`を利用。
- Open issues: 親階層が変形済みの場合の見た目位置は相対オフセットで調整継続。
- Next action: 構文確認と差分更新。

### Step 32 - Builder implementation (requested bug fixes)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 右クリックは選択中groupをフォールバック対象にし、BBoxはviewBox原点を反映する。
- Changes: contextmenuハンドラを改善、メニュー自動クローズを左クリック限定へ変更、`safeBBox`座標変換に`minX/minY`を追加。
- Open issues: 深いネスト+複雑transformでの体感はブラウザ実機確認を継続。
- Next action: 構文確認と差分更新。

### Step 33 - Builder implementation (group label relayout)
- Date: 2026-02-18
- Owner: Builder
- Decisions: Groupラベルは常に内容BBox基準で再配置し、整列/リサイズ後の位置ずれを防ぐ。
- Changes: `getGroupContentBBox`群を追加、`getSnapshot`前に`refreshAllGroupLabels`実行、ラベル作成時も内容BBox参照へ変更。
- Open issues: ラベルのフォントサイズ自動調整は未対応。
- Next action: 構文確認とパッチ更新。

### Step 34 - Builder implementation (BBox sync fix)
- Date: 2026-02-18
- Owner: Builder
- Decisions: BBox座標は`getScreenCTM().inverse()`で画面座標からSVG座標へ直接変換し、viewBox比率依存誤差を避ける。
- Changes: `safeBBox`の主要経路をCTM逆変換へ変更。フォールバックのみ旧スケーリング計算を保持。
- Open issues: ブラウザズーム/HiDPI環境での実機確認は継続。
- Next action: 構文確認と差分更新。

### Step 35 - Builder implementation (interaction smoothness)
- Date: 2026-02-18
- Owner: Builder
- Decisions: ドラッグ/リサイズ中は選択装飾更新をRAFで間引きし、操作追従を安定化する。
- Changes: `requestSelectionVisualRefresh`を追加、`updateDrag/updateResize/moveSelection`で適用。`Esc`で選択解除とメニュー閉じを追加。
- Open issues: 超大量要素時の最適化は継続検討。
- Next action: 構文確認とパッチ更新。

### Step 36 - Builder implementation (BBox hard sync)
- Date: 2026-02-18
- Owner: Builder
- Decisions: BBoxは`getScreenCTM`ベースの4隅変換で算出し、ドラッグ/リサイズ中は即時再描画でマウス追従を優先。
- Changes: `safeBBox`を要素行列4隅変換へ改修、`requestSelectionVisualRefresh`にインタラクション時の即時描画分岐を追加。
- Open issues: 極端なブラウザズーム環境での最終実機確認は継続。
- Next action: 構文確認とパッチ更新。

### Step 37 - Builder implementation (nested paste offset)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 内部Paste時のオフセットは親`<g>`座標系に変換して適用し、ネスト/拡大時の見た目を一定化する。
- Changes: `toParentLocalDelta`を追加し、`importMarkupFragment`で`parentId`先のCTMに基づくローカルdeltaを適用。
- Open issues: 親が回転している場合の意図どおり感は実機確認継続。
- Next action: 構文確認とパッチ更新。

### Step 38 - Builder verification (BBox sync)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 修正後のBBox同期は自動テストで数値確認する。
- Changes: Playwrightでdrag時の要素移動量とselection-outline移動量の差分を検証（許容1.5px）、テストはPASS。
- Open issues: 実運用ブラウザ（あなたの環境）で体感確認は引き続き必要。
- Next action: フィードバックに応じて微調整継続。

### Step 39 - Builder implementation (pointer capture)
- Date: 2026-02-18
- Owner: Builder
- Decisions: ポインタが要素外へ出ても操作を継続できるよう、drag/resize/marqueeにPointer Captureを適用。
- Changes: interactionに`pointerId`を保持、`pointerdown`でcapture、`pointermove/up/cancel`でID一致ガードとrelease処理を追加。
- Open issues: OSジェスチャ干渉時の体感確認は継続。
- Next action: 構文確認とパッチ更新。

### Step 40 - Builder implementation (live resize bbox)
- Date: 2026-02-18
- Owner: Builder
- Decisions: リサイズ中のBBoxは実測ではなく計算済み`liveBox`を描画して、ポインタ追従を優先する。
- Changes: interactionに`liveBox`を保持し、`renderSelectionOutlines/renderResizeHandles`で対象要素に優先使用。
- Open issues: リサイズ対象が複数同時の場合のlive表示は未対応（現仕様は単一）。
- Next action: 構文確認と回帰テスト実行。

### Step 41 - Builder fix & verification (resize blow-up)
- Date: 2026-02-18
- Owner: Builder
- Decisions: リサイズの巨大化は「初期BBox固定+更新済み属性の再スケール」が原因。増分スケール方式へ修正する。
- Changes: `updateResize`で適用後に`interaction.originalBox`を新BBoxへ更新。Playwrightのdrag/resize同期テスト2件ともPASS。
- Open issues: 実ブラウザでの最終体感確認は継続。
- Next action: フィードバック対応を継続。

### Step 42 - Builder implementation (aspect lock resize)
- Date: 2026-02-18
- Owner: Builder
- Decisions: リサイズ操作の実用性向上として、Shift押下時は縦横比固定で拡縮する。
- Changes: `beginResize`で初期aspectを保持、`updateResize`に`keepAspect`を追加、`pointermove`の`shiftKey`を連携。
- Open issues: 角ハンドル以外での比率固定は未対象（現状は角のみ）。
- Next action: 構文確認と差分更新。

### Step 43 - Builder implementation (resize tuning)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 実用性向上のため、ハンドル表示サイズをズーム耐性付きで調整し、最小リサイズ制約を導入する。
- Changes: `MIN_RESIZE_SIZE`追加、ハンドルサイズをCTMスケールに応じて調整、`updateResize`の最小幅/高さクランプを強化。
- Open issues: 極端ズーム時の最適値は実機で微調整余地あり。
- Next action: 構文確認とパッチ更新。

### Step 44 - Builder implementation (drag history coalesce window)
- Date: 2026-02-18
- Owner: Builder
- Decisions: drag終了時の連続操作は短時間（400ms）なら履歴をまとめ、Undoの粒度を実用寄りにする。
- Changes: `pushHistory`に`withinMs`窓を追加、`finishDrag`を`drag-move` + `coalesce: true, withinMs: 400`へ変更。
- Open issues: 最適時間窓は利用者の操作速度で調整余地あり。
- Next action: 構文確認とパッチ更新。

### Step 45 - Builder implementation (coalesce safety)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 異なる選択対象の操作はcoalesce対象から除外し、履歴の意図しない結合を防ぐ。
- Changes: `pushHistory`にselectedIds一致条件を追加、矢印キー移動に`withinMs: 300`を適用。
- Open issues: 最適な時間窓は運用に応じて微調整可能。
- Next action: 構文確認とパッチ更新。

### Step 46 - Builder implementation (history UI state)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 誤操作抑止のため、Undo/Redoボタンは履歴状態に応じてdisabledを切り替える。
- Changes: `updateHistoryButtons`を追加し、`pushHistory/resetHistory/undo/redo`で同期更新。
- Open issues: ツールチップ等の補助説明は未追加。
- Next action: 構文確認とパッチ更新。

### Step 47 - Builder implementation (status bar enrichment)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 現在状態の可視性を上げるため、ステータスバーに操作コンテキストを集約表示する。
- Changes: `renderStatus`を追加し、`setStatus`経由で`tool/selection/history/autosave/align`を常時表示。
- Open issues: 表示要素が増えたため、狭い幅での省略表示は今後調整余地あり。
- Next action: 構文確認とパッチ更新。

### Step 48 - Builder implementation (compact status mode)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 狭い画面幅ではstatus文言を圧縮表示し、可読性を優先する。
- Changes: `renderStatus`に`window.innerWidth < 980`分岐を追加、`resize`イベントで再描画。
- Open issues: しきい値(980px)は運用に応じて調整余地あり。
- Next action: 構文確認とパッチ更新。

### Step 49 - Builder implementation (compact toolbar)
- Date: 2026-02-18
- Owner: Builder
- Decisions: 狭幅では低優先UIを折りたたみ、主要操作の可視性を優先する。
- Changes: `body.compact`スタイルを追加し、restore list系を隠す。`renderStatus`でcompactクラスを自動切替。
- Open issues: compact時に隠した復元UIは横幅拡大で再表示。
- Next action: 構文確認とパッチ更新。

### Step 50 - Builder implementation (compact restore UX)
- Date: 2026-02-19
- Owner: Builder
- Decisions: compact時のみ復元詳細UIをトグル表示し、誤操作を避けつつアクセス性を確保する。
- Changes: `toggleAdvanced`の`More/Less`挙動を実装。非compact時は`show-advanced`を自動解除。`Ctrl/Cmd+Shift+R`で`Restore latest`ショートカットを追加。
- Open issues: compact判定しきい値(980px)は利用環境で調整余地あり。
- Next action: 構文チェックと差分更新。

### Step 51 - Reviewer verification (compact restore UX)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 既存機能の回帰を避けるため、compact復元UIとショートカットをヘッドレスで実測確認する。
- Changes: Playwrightで`900px`幅時の`More/Less`表示、`aria-expanded`反映、`Ctrl+Shift+R`でlatest復元を検証しPASS。
- Open issues: ショートカットはブラウザ既定再読み込みと競合しうるため、環境差の体感確認は継続。
- Next action: 次のP1改善（ショートカット可視化/ヘルプ導線）へ進む。

### Step 52 - Builder implementation (vector-first paste)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 画像先行判定を廃止し、SVGベクターを最優先で取り込む。
- Changes: `handlePaste`を`HTML内SVG -> image/svg+xml -> text/plain SVG -> HTML img -> image/png/jpeg`順に変更。未対応時はクリップボードtype一覧をstatus表示。
- Open issues: クリップボードにベクター形式が含まれない場合はラスター貼り付けにフォールバック。
- Next action: 優先順位の回帰テスト実施。

### Step 53 - Reviewer verification (vector-first paste)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: PNGとSVGが同時に存在するクリップボードでSVGが優先されることを確認する。
- Changes: Playwrightで擬似clipboardイベントを注入し、`image/png`同梱時にも`text/html`内SVGが貼り付けられることを確認（PASS）。
- Open issues: 実アプリ（PowerPoint等）がSVGを提供しないケースはAPI制約上回避不可。
- Next action: 実機PowerPointでclipboard type確認。

### Step 54 - Builder implementation (selection/cursor/text/save fixes)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 選択不能要素の改善、ツール状態可視化、保存互換、テキスト編集を同時に修正する。
- Changes: `circle`を選択/リサイズ対象に追加。`pointer-events`適用をstyle属性にも反映。Black/Whiteツールでカスタムカーソル連動。`dblclick`で`text`編集（prompt）。Save SVGをXML宣言付きにし、Object URLのrevokeを遅延化。
- Open issues: PowerPoint側が画像形式のみ提供する環境ではベクター貼り付けは不可。
- Next action: ヘッドレス回帰テスト実施。

### Step 55 - Reviewer verification (selection/cursor/text/save fixes)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 指摘5件を自動検証し、回帰を防ぐ。
- Changes: Playwrightで `circle/text`選択、黒白カーソル差分、テキスト編集ハンドラ、保存SVGの再パース/再読込を検証しPASS。
- Open issues: 実機PowerPointでのclipboard type確認は継続。
- Next action: 実機フィードバックに合わせて追加調整。

### Step 56 - Builder fix (overlap direct-selection cycle)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 白矢印で重なり要素を選べるよう、クリック位置のヒットスタックから順送り選択する。
- Changes: `getEditableTargetsAtPoint` / `pickDirectTargetFromStack` を追加。direct modeで同一点再クリック時に下層要素（例: textの下のcircle）を選択可能にした。
- Open issues: 3層以上の重なりは再クリックで順送り、逆順送りUIは未実装。
- Next action: Reviewer再検証。

### Step 57 - Reviewer verification (critical pass)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 批判的観点で指摘領域を再検証し、未確認点を明示する。
- Changes: Playwrightで「重なり要素の順送り選択」「黒白カーソル」「text dblclick編集」「保存SVGの再読込」「PNGフォールバック原因表示」を検証してPASS。
- Open issues: 実機PowerPointのclipboard typeは環境依存で自動検証不可（手元確認が必要）。
- Next action: 実機結果に応じて貼り付け経路を追加調整。

### Step 58 - Builder implementation (paste diagnostics report)
- Date: 2026-02-19
- Owner: Builder
- Decisions: PowerPoint環境差を切り分けるため、貼り付け経路をユーザーが確認できる機能を追加する。
- Changes: `Paste report`ボタン追加。`handlePaste`で`route/types/note`を記録し、promptで表示。保存SVGの`xmlns:xlink`も明示追加。
- Open issues: 実機PowerPointがSVG payloadを出さない場合は引き続きラスター貼り付け。
- Next action: 実機でPaste reportを確認。

### Step 59 - Reviewer verification (paste diagnostics report)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 追加診断機能が切り分けに使えることを自動確認する。
- Changes: PlaywrightでPNG貼り付け後の`Paste report`内容（route=image-raster/types=image/png）を検証しPASS。
- Open issues: 実アプリ由来のclipboard内容自体は環境依存のため手動確認が必要。
- Next action: 実機検証結果に応じた追加対応。

### Step 60 - Builder implementation (inline text editor)
- Date: 2026-02-19
- Owner: Builder
- Decisions: `prompt`依存を減らし、編集体験を改善するためインライン編集を採用する。
- Changes: `#textEditorInput`を追加。`text`要素のdblclickで編集開始、Enterで確定、Escでキャンセル、blurで確定。`Ctrl/Cmd+Shift+I`でPaste report表示ショートカットを追加。
- Open issues: 複数行テキスト（tspan）専用UIは未対応。
- Next action: 回帰テスト実施。

### Step 61 - Reviewer verification (inline text editor)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 既存機能を壊していないことを重視して再検証する。
- Changes: Playwrightで重なり選択、インラインテキスト編集、保存再読込、Paste reportショートカットを検証しPASS（`reviewer-r48`）。
- Open issues: PowerPoint実機clipboard内容は引き続き手動確認が必要。
- Next action: 実機Paste report収集後の微調整。

### Step 62 - Builder implementation (clean SVG export)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 外部ツール互換性を上げるため、保存SVGから内部管理属性を除去する。
- Changes: `getCleanCanvasMarkup`で`data-id/data-tx/data-ty/data-base-transform`と選択クラスを除去（空classは削除）。
- Open issues: 内部属性を外すため、保存SVGを再読込した際のIDは毎回再採番される。
- Next action: クリーン保存の自動検証。

### Step 63 - Reviewer verification (clean SVG export)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 保存互換の回帰を数値確認する。
- Changes: Playwrightで保存文字列に内部属性が含まれないこと、XMLパース成功、再読込可能を検証しPASS（`reviewer-r49`）。
- Open issues: 実機PowerPointの貼り付けフォーマット差は引き続き手動確認が必要。
- Next action: 実機Paste reportの取得待ち。

### Step 64 - Builder implementation (paste route expansion)
- Date: 2026-02-19
- Owner: Builder
- Decisions: PowerPoint系の取りこぼしを減らすため、SVG payloadの取得経路を増やす。
- Changes: `image/svg+xml` が`clipboard item`で来るケースを`FileReader.readAsText`で取り込み。`text/plain`は`<svg>...</svg>`埋め込み抽出にも対応。
- Open issues: Officeが画像形式しか提供しない場合は引き続きベクター化不可。
- Next action: 新規経路の自動検証。

### Step 65 - Reviewer verification (paste route expansion)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 拡張した2経路（svg item / plain埋め込み）を自動検証で担保する。
- Changes: Playwrightで2ケースともベクター貼り付け成功を確認（`reviewer-r50` PASS）。
- Open issues: 実機PowerPointのclipboard内容は環境依存で手動確認継続。
- Next action: 実機Paste report取得後に優先順位調整。

### Step 66 - Builder implementation (paste report copy)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 実機調査結果の共有を容易にするため、Paste reportをクリップボードへ直接コピー可能にする。
- Changes: `Copy report`ボタンを追加。`copyPasteReport`を実装し、`navigator.clipboard`利用 + promptフォールバック。`Ctrl/Cmd+Shift+J`ショートカットを追加。
- Open issues: 一部ブラウザではclipboard権限によりpromptフォールバックとなる。
- Next action: 自動検証。

### Step 67 - Reviewer verification (paste report copy)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: コピー経路と既存貼り付け経路を同時に回帰確認する。
- Changes: Playwrightでボタン/ショートカット双方のコピー内容（route/types）を検証しPASS（`reviewer-r51`）。既存`reviewer-r50`もPASS。
- Open issues: 実機PowerPoint由来データの手動確認は継続。
- Next action: 実機Paste reportを元に最終調整。

### Step 68 - Builder implementation (report persistence/download)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 実機検証の持ち運びを容易にするため、Paste reportを永続化しファイル保存可能にする。
- Changes: `figureMaker_last_paste_report`へ保存/復元を追加。`Save report`ボタンと`downloadPasteReport`を実装。`Ctrl/Cmd+Shift+K`ショートカットを追加。
- Open issues: ダウンロードの保存先はブラウザ設定依存。
- Next action: 永続化/保存の自動検証。

### Step 69 - Reviewer verification (report persistence/download)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: レポートの再利用性を担保するため、コピー・保存・再読込を検証する。
- Changes: Playwrightで`copy/save/localStorage restore`を検証しPASS（`reviewer-r52`）。既存貼り付け回帰`reviewer-r50`もPASS。
- Open issues: 実機PowerPoint由来のtype差は継続監視。
- Next action: 実機report取得待ち。

### Step 70 - Builder implementation (report history)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 実機比較をしやすくするため、Paste reportを履歴化して参照可能にする。
- Changes: 直近30件の履歴を`figureMaker_paste_report_history`へ保存。`Report history`ボタンと`Ctrl/Cmd+Shift+H`を追加。`Save report`出力に履歴（最大20件）を同梱。
- Open issues: 履歴件数上限(30)は運用に応じて調整余地あり。
- Next action: 履歴保存/復元の自動検証。

### Step 71 - Reviewer verification (report history)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 履歴機能は保存・再読込・出力の三点で検証する。
- Changes: Playwrightで履歴2件保存、history表示、report保存blob、リロード後復元を検証しPASS（`reviewer-r53`）。`reviewer-r52`も再PASS。
- Open issues: 実機PowerPointのフォーマット差は手動確認継続。
- Next action: 実機report収集後の最終調整。

### Step 72 - Builder implementation (report history clear)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 診断運用のやり直しを容易にするため、履歴クリア操作を追加する。
- Changes: `Clear history`ボタン、`clearPasteReportHistory`関数、`Ctrl/Cmd+Shift+L`ショートカットを追加。`last/history`両キーを削除するようにした。
- Open issues: 誤削除防止はconfirmに依存。
- Next action: クリア経路の自動検証。

### Step 73 - Reviewer verification (report history clear)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: ボタン/ショートカット双方の削除経路を検証する。
- Changes: Playwrightで履歴作成後にclearを実行し、localStorageキー削除とステータス反映を確認（`reviewer-r54` PASS）。`reviewer-r53`も再PASS。
- Open issues: 実機PowerPointのclipboard差は引き続き手動確認。
- Next action: 実機report収集待ち。

### Step 74 - Builder implementation (shortcut help)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 操作学習コストを下げるため、主要ショートカットの即時参照導線を追加する。
- Changes: `Shortcuts`ボタンを追加。`showShortcutHelp`実装。`Ctrl/Cmd+/`ショートカットでヘルプ表示できるようにした。
- Open issues: 表示方式はpromptベースのため、将来的に専用パネル化の余地あり。
- Next action: 自動検証。

### Step 75 - Reviewer verification (shortcut help)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: ボタン操作とキーボード操作の両方でヘルプが表示されることを確認する。
- Changes: Playwrightで`shortcutsBtn`と`Ctrl+/`を検証しPASS（`reviewer-r55`）。既存`reviewer-r54`も再PASS。
- Open issues: 実機PowerPoint由来の貼り付け差は継続して手動確認。
- Next action: 実機reportを元に貼り付け最終調整。

### Step 76 - Builder implementation (history copy shortcut)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 診断結果共有をさらに短縮するため、履歴全体のコピー導線を追加する。
- Changes: `Copy history`ボタンを追加。`copyPasteReportHistory`実装。`Ctrl/Cmd+Shift+U`で履歴コピー可能にした。ショートカットヘルプにも追記。
- Open issues: ブラウザ権限制限時はpromptフォールバック。
- Next action: ボタン/ショートカット双方の検証。

### Step 77 - Reviewer verification (history copy shortcut)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 共有導線の信頼性を確保するため、コピー内容の妥当性を確認する。
- Changes: Playwrightで`Copy history`ボタンと`Ctrl/Cmd+Shift+U`のコピー結果（Entries/Route）を検証しPASS（`reviewer-r56`）。`reviewer-r55`も再PASS。
- Open issues: 実機PowerPointのclipboard type差は手動確認継続。
- Next action: 実機report収集後の最終分岐調整。

### Step 78 - Builder implementation (text edit hotkeys)
- Date: 2026-02-19
- Owner: Builder
- Decisions: テキスト編集開始を高速化するため、Enter/F2でインライン編集開始を追加する。
- Changes: `keydown`にEnter/F2の編集起動を追加。`state.textEdit`中はグローバルショートカットを抑止。ショートカットヘルプ文言を更新。
- Open issues: 複数選択時の編集開始は未対応（単一text選択のみ）。
- Next action: 自動検証。

### Step 79 - Reviewer verification (text edit hotkeys)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 編集導線追加に対して、誤動作（ショートカット衝突）も含めて検証する。
- Changes: PlaywrightでEnter/F2編集開始、編集確定、編集中`Ctrl+/`無効化を検証しPASS（`reviewer-r57`）。`reviewer-r56`も再PASS。
- Open issues: 実機PowerPoint由来の貼り付け差は手動確認継続。
- Next action: 実機report取得後の貼り付け最終調整。

### Step 80 - Builder implementation (tool hotkeys)
- Date: 2026-02-19
- Owner: Builder
- Decisions: ツール切替の往復を高速化するため、単キーでBlack/White Arrowを切り替える。
- Changes: `V`=Black Arrow、`A`=White Arrowを`keydown`へ追加。アクティブボタン/カーソル/ステータスを同期。ショートカットヘルプに追記。
- Open issues: テキスト入力中は`state.textEdit`ガードで発火しない設計。
- Next action: 自動検証。

### Step 81 - Reviewer verification (tool hotkeys)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: UI状態同期を重点検証する。
- Changes: Playwrightで`A`/`V`押下時のactiveクラス、カーソル、ステータス文言、ヘルプ記載を検証しPASS（`reviewer-r58`）。`reviewer-r57`も再PASS。
- Open issues: 実機PowerPointのclipboard差は引き続き手動確認。
- Next action: 実機report収集後の最終分岐調整。

### Step 82 - Builder implementation (shape hotkeys)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 作図初動を速くするため、基本図形追加を単キーで実行可能にする。
- Changes: `R/L/E/T`でRect/Line/Ellipse/Text追加を実装。ショートカットヘルプにも追記。
- Open issues: テキスト入力中は`state.textEdit`ガードで無効化される設計。
- Next action: 自動検証。

### Step 83 - Reviewer verification (shape hotkeys)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 追加ショートカットの実体動作とヘルプ整合性を確認する。
- Changes: Playwrightで`R/L/E/T`による図形追加数増加とヘルプ文言を検証しPASS（`reviewer-r59`）。`reviewer-r58`も再PASS。
- Open issues: 実機PowerPointのclipboard差は継続して手動確認。
- Next action: 実機report収集後の最終分岐調整。

### Step 84 - Builder implementation (error telemetry + svg paste fix)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 原因調査容易化を優先し、エラー監視をアプリ標準機能として追加する。
- Changes: `makeErrorId`を追加（`YYYYMMDD-HHMM-xxxx`）。`window.onerror`/`window.onunhandledrejection`を実装し、構造化`console.error`と通知UI表示、`error-<id>.json`ダウンロードを実装。イベントリングバッファ（max100: click/key/route）を追加。`last_error`をlocalStorage保存/復元。`?debug=1`で詳細ログ化。`Open SVG`読込失敗・Autosave JSON parse失敗・Paste失敗でユーザー向け文言を追加。`README.md`にバグ報告テンプレを追加。さらに`handlePaste`で`items`空でもtext payloadを処理し、webアプリ由来SVGの貼り付け不能を修正。
- Open issues: 実機PowerPointのclipboard形式差（画像のみ提供）はWeb API制約により残る。
- Next action: 批判的レビューで受入基準を一括検証。

### Step 85 - Reviewer verification (critical error telemetry)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 指定受入基準を自動テストで網羅確認する。
- Changes: `reviewer-r60-critical`で以下を検証しPASS: ID一意性、`window.onerror`/`onunhandledrejection`、イベントリングバッファ、エラー通知UI、`error-<id>.json`内容（stack/eventHistory）、`last_error`再起動復元、`debug=1`詳細ログ、`items`空のplain SVG貼り付け。既存`reviewer-r59`もPASS。
- Open issues: 実機PowerPointが画像形式しか提供しない場合のベクター貼り付け不可は仕様制約。
- Next action: 実機で`Copy report`を採取し、必要なら貼り付け経路を最終微調整。

### Step 86 - Builder implementation (text edit + arrow + svg paste item route)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 不具合再発を防ぐため、テキスト編集導線と矢印編集導線、string-item貼り付け導線を同時に補強する。
- Changes: `setSelection`で矢印コントロール同期を有効化。`Arrow`追加（Line隣）を確定し、`Arrow size`/`Arrow stroke`を`input/change`の両方で反映。`Q`ショートカットでArrow追加。`dblclick`時のtext解決を`elementsFromPoint`ベースで補強し、対象取得失敗時は選択中textを編集対象にするフォールバックを維持。貼り付けで`clipboardData.items`のstring-kind（`text/plain`/`text/html`/`image/svg+xml`）からSVGを直接取り込む`importSvgFromClipboardStringItems`を追加。
- Open issues: 実機PowerPointがビットマップのみを提供する場合はPNG貼り付けにフォールバックする制約は残る。
- Next action: 批判的レビューで受入基準（text/arrow/svg paste）を再検証。

### Step 87 - Reviewer verification (critical r61)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 直近要望3点を自動テストで厳密確認する。
- Changes: `reviewer-r61-critical`を新規作成しPASS。検証内容: textのdblclick編集開始と確定反映、Arrow作成とmarker/stroke反映、string-kind clipboard item由来SVG貼り付け、`items`空+plain text SVG貼り付け回帰。あわせて`reviewer-r60-critical`/`reviewer-r59`再実行でPASS。
- Open issues: 実機アプリ/OS依存のclipboard type差は手元検証が必要。
- Next action: 実機でPaste reportを取得して、必要なら最終分岐を継続調整。

### Step 88 - Builder implementation (PowerPoint paste error + raster quality)
- Date: 2026-02-19
- Owner: Builder
- Decisions: PowerPoint貼り付けの安定性と品質を優先し、null安全化とラスタ経路の優先順位を修正する。
- Changes: `handlePaste`で`items`を`filter(Boolean)`し、`type`参照はすべてoptional-safe化。`importSvgFromClipboardStringItems`と`listClipboardTypes`をnull安全化し、`Cannot read properties of null (reading 'type')`を解消。さらに`getImageSize`の600x400クランプを撤廃し、ソース寸法を保持。ラスタ貼り付け順序を`image/png|jpeg item`優先に変更し、PowerPoint由来の低解像度HTML画像より高品質なclipboard画像を優先するように変更。
- Open issues: OS/PowerPoint側が低解像度bitmapしかclipboardに載せない場合は、それ以上の解像度はWeb側で復元不能。
- Next action: 批判的レビューでnull安全と高解像度保持を確認。

### Step 89 - Reviewer verification (critical r62)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 今回の不具合再発防止のため、null itemと高解像度貼り付けを自動検証する。
- Changes: `reviewer-r62-critical`を追加しPASS。検証内容: `clipboardData.items`にnull混在でも例外が出ない、1200x900 PNG貼り付けで画像属性が1200x900を保持する。回帰として`reviewer-r61-critical`と`reviewer-r60-critical`も再PASS。
- Open issues: 実機での最終品質はPowerPoint/OS/ブラウザのclipboard提供解像度に依存。
- Next action: 実機Paste reportを確認し、source typesに応じた案内文を追加調整。

### Step 90 - Builder implementation (pointerup null-type crash)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 起動直後エラーを確実に止めるため、pointerイベント処理を状態スナップショット方式に変更する。
- Changes: `window.pointermove`/`window.pointerup`で`state.interaction`をローカル変数`it`へ退避してから参照するよう修正。`pointerup`では`finishDrag()`等で`state.interaction`がnullになっても、後続分岐が壊れないよう`type`/`capturedId`を先に取得して処理する形に変更。
- Open issues: なし（今回の例外再発を抑止）。
- Next action: 連続クリック再現テストと貼り付け回帰テスト。

### Step 91 - Reviewer verification (critical r64)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: ユーザー報告エラー（`index.html:2639`）の再発有無を最優先で確認する。
- Changes: `reviewer-r64-pointerup-crash`を新規作成しPASS。連続クリックでpointerup競合を発生させつつ、`Cannot read properties of null (reading 'type')`が出ないことを確認。貼り付け経路も同時にPASS。既存`reviewer-r62`/`reviewer-r60`/`reviewer-r63`もPASS。`reviewer-r61`は矢印先端仕様変更（tip=size+2）に追従していない旧期待値のため失敗で、機能異常ではない。
- Open issues: `reviewer-r61`の期待値更新（テストメンテ）だけ未対応。
- Next action: テストスイートの期待値統一。

### Step 92 - Reviewer verification (suite alignment)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 継続開発の足場を安定化するため、テスト期待値を現行仕様へ揃える。
- Changes: `reviewer-r61-critical`の矢印期待値を`tip=size+2`仕様に更新（markerWidth/refX=20）。再実行結果: `r60/r61/r62/r63/r64`すべてPASS。
- Open issues: なし。
- Next action: 実機PowerPoint貼り付け（ベクター提供可否）に応じたUI文言の追加検討。

### Step 93 - Builder implementation (paste diagnostics clarity)
- Date: 2026-02-19
- Owner: Builder
- Decisions: PowerPoint貼り付けの実態把握を容易にするため、Paste reportに意味情報と品質ヒントを追加する。
- Changes: `routeToPasteMeaning()`を追加し、`showPasteReport`/`formatPasteReportText`へ`Meaning`行を追加。`image-raster`時は`getPasteQualityHint(width,height)`で低解像度警告（`low-res`）を付与。status文言にも同ヒントを表示。
- Open issues: 実機でclipboardがラスタのみの場合、ベクター化は不可（仕様制約）。
- Next action: 追加診断文言の自動検証。

### Step 94 - Reviewer verification (paste report meaning)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 診断文言の有効性を確認する。
- Changes: `reviewer-r66-paste-report-meaning`を新規作成しPASS（Meaning行表示、low-resヒント表示、status反映）。回帰として`r60/r62/r64`も再PASS。
- Open issues: なし。
- Next action: 実機PowerPointで最終確認を継続。

### Step 95 - Builder implementation (startup stale error + arrow lead)
- Date: 2026-02-19
- Owner: Builder
- Decisions: ユーザー体験を優先し、起動時の過去エラー再表示を停止。矢印先端は「線の先」に見えるように前進させる。
- Changes: `initialize`で`last_error`は通知表示せず内部レコード保持のみとし、読込後に`localStorage.removeItem(LAST_ERROR_KEY)`で再表示ループを停止。`applyArrowStyle`で`lead`を導入（`refX = tip - lead`）し、三角ヘッドを線先へ前進。`markerWidth/viewBox`拡張と`overflow=visible`を設定。
- Open issues: なし。
- Next action: 回帰テストの期待値を新仕様に同期。

### Step 96 - Reviewer verification (critical r67 + suite sync)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 「毎回同じエラーが出る」「矢印先端が後ろ寄り」の再発有無を重点検証する。
- Changes: `reviewer-r67-startup-last-error`を新規作成しPASS（起動時にstale notice非表示、last_error自動クリア）。矢印仕様変更に合わせて`r61/r63`期待値を更新しPASS。`r60/r62/r64/r66`も再PASS。
- Open issues: なし。
- Next action: 実機で矢印見た目の最終微調整要否を確認。

### Step 97 - Builder implementation (copy/paste hardening)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 「コピペが全く機能しない」体感を解消するため、標準ショートカットで内部Pasteへ自動フォールバックする。
- Changes: `Ctrl/Cmd+V`でOSクリップボード貼り付けを優先しつつ、外部pasteイベントが来なかった場合は内部clipboardへ90ms後フォールバックする処理を追加。`copySelected()`は内部clipboard保存に加え、可能な環境では`navigator.clipboard.writeText`へ選択要素のSVGを書き込む。ショートカットヘルプ文言を更新（`Ctrl/Cmd+V`フォールバック説明）。
- Open issues: OS/ブラウザ権限制約でsystem clipboard書き込みが拒否される場合は内部clipboardのみ。
- Next action: hotkeyの自動検証と既存paste回帰。

### Step 98 - Reviewer verification (critical r69)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 標準キー操作での実効性を確認する。
- Changes: `reviewer-r69-copy-paste-hotkeys`を新規作成しPASS（`Ctrl/Cmd+C -> Ctrl/Cmd+V`で内部フォールバック貼り付け成功）。回帰として`r60/r62/r64`も再PASS。
- Open issues: なし。
- Next action: 実機でPowerPoint貼り付けと内部貼り付けの併用操作を確認。

### Step 99 - Builder implementation (paste best-effort unification)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 貼り付け失敗の取りこぼしを減らすため、PasteボタンとCtrl/Cmd+Vを同じbest-effort経路で処理する。
- Changes: `pasteFromClipboardApiFallback()`を追加（`navigator.clipboard.read/readText`でSVG/HTML/SVG text/PNG/JPEGを取得して貼り付け）。`pasteBestEffort()`を追加し、system clipboard API成功なら採用、失敗時のみ内部clipboardへフォールバック。`Paste`ボタンを`pasteBestEffort`へ変更。`Ctrl/Cmd+V`タイマー経路もAPIフォールバックを先行してから内部Pasteするよう更新。
- Open issues: ブラウザ権限でclipboard APIが拒否される場合は内部clipboardフォールバックに依存。
- Next action: 新規best-effort経路の自動検証。

### Step 100 - Reviewer verification (critical r70)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 実使用導線（Pasteボタン/ Ctrl+V）での改善を確認する。
- Changes: `reviewer-r70-paste-best-effort`を新規作成しPASS（モックclipboard APIでPasteボタンとCtrl/Cmd+V双方がSVG貼り付け成功、routeは`clipboard-api-*`）。回帰として`r69/r60/r62`も再PASS。
- Open issues: 実機でのclipboard API許可/拒否挙動の差は残るが、拒否時は内部clipboardで継続可能。
- Next action: 実機手順で最終確認。

### Step 101 - Builder implementation (paste lock hardening + syntax fix)
- Date: 2026-02-19
- Owner: Builder
- Decisions: `Paste is already running` 固着を根治するため、貼り付けロックに回復機構を追加する。
- Changes: `PASTE_LOCK_TIMEOUT_MS`と`pasteLockAt`を追加。`clearPasteLock()`/`tryRecoverPasteLock()`を実装。`handlePaste`と`pasteFromClipboardApiFallback`でロック開始時刻を記録し、`finally`で必ず解除。`readClipboardItemAsText`に1.2秒タイムアウトを追加（`getAsString`無応答対策）。さらに`pasteFromClipboardApiFallback`の`finally`構文崩れを修正して起動時構文エラーを解消。
- Open issues: なし。
- Next action: 連続貼り付けとハングケースの自動検証。

### Step 102 - Reviewer verification (critical r71/r72)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 実ユーザー報告（2回目以降失敗・Paste is already running）の再発有無を最優先確認する。
- Changes: `reviewer-r71-paste-lock-recovery`を追加してPASS（1回目ハング系paste後でも2回目paste成功）。`reviewer-r72-ui-copy-paste` PASS（UI操作で連続Ctrl/Cmd+V貼り付け成功）。あわせて`r70/r66/r64`再PASS。起動時`pageerror`なしも確認。
- Open issues: なし。
- Next action: 実機で2回目以降の貼り付け操作を最終確認。

### Step 103 - Builder implementation (files/png external paste compatibility)
- Date: 2026-02-19
- Owner: Builder
- Decisions: `Types: Files, image/png` 環境を確実に通すため、外部pasteのラスタ検出を多経路化する。
- Changes: `findRasterFileFromClipboard(ev, items)`を追加し、`items.type`一致だけでなく`item.kind=file`と`clipboardData.files`からもPNG/JPEGを検出するよう変更。`image/svg+xml` item parse失敗時は早期returnせず後段フォールバックへ継続。`listClipboardTypes`にも`clipboardData.files`のMIMEを反映。
- Open issues: なし。
- Next action: Files/image/png再現ケースでの自動検証。

### Step 104 - Reviewer verification (critical r73 + lock tuning)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: ユーザー報告2種（`Paste SVG item parse failed`/`Files,image/png unsupported`）を同時に潰せているか確認する。
- Changes: `reviewer-r73-files-png-fallback`を追加してPASS（svg item parse失敗後にfiles/pngでラスタ貼り付け成功）。`r71`が回復閾値不足で一度失敗したため`PASTE_LOCK_TIMEOUT_MS`を900msへ調整後にPASS。`r72/r70`も再PASS。
- Open issues: 実機依存のclipboard提供差は残るが、今回の報告経路は解消。
- Next action: 実機PowerPoint貼り付けで最終確認。

### Step 105 - Builder implementation (files/png strict fallback + text hit policy)
- Date: 2026-02-19
- Owner: Builder
- Decisions: PowerPoint貼り付けの残件を潰すため、MIME不定ファイルも画像として受理する。web app SVG text選択不可はpointer-events方針を強制上書きする。
- Changes: `findRasterFileFromClipboard`を拡張し、`kind=file`でMIME空/`application/octet-stream`でもfileを受理。`clipboardData.files`にも同様のunknown MIME fallbackを追加。`hasPayload`判定に`clipboardData.files.length`を追加。`applyPointerEventPolicy`で既存pointer-events属性/スタイルを削除し、`setProperty(..., \"important\")`で`text/all`を強制適用。
- Open issues: なし。
- Next action: 実機PowerPointとweb app SVGの再確認。

### Step 106 - Reviewer verification (critical r74)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 残件2件（Files,image/png外部paste / text選択不可）の再発有無を確認する。
- Changes: `reviewer-r74-files-unknown-mime-and-text-hit`を追加してPASS（MIME空fileでも画像貼り付け成功、`pointer-events:none !important`付きtextがクリック選択可能）。回帰で`r73/r71/r72`も再PASS。
- Open issues: なし。
- Next action: 実機で最終確認し、未解決があればroute別に追加対応。

### Step 107 - Builder implementation (path-as-text hit policy)
- Date: 2026-02-19
- Owner: Builder
- Decisions: SVGテキストが`<path>`アウトライン化されるケースを選択可能にするため、`path`のhit policyを`all`へ変更する。
- Changes: `applyPointerEventPolicy`で`line/polyline`は`stroke`維持、`path/text/tspan`は`all !important`に変更。これにより、fill-onlyの`path`（実質テキストアウトライン）もクリック選択可能に。
- Open issues: なし。
- Next action: path化テキストの専用検証。

### Step 108 - Reviewer verification (critical r75)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: ユーザー報告「SVGテキスト選択不可」を直接再現する。
- Changes: `reviewer-r75-path-text-hit`を追加してPASS（`pointer-events:none !important`付き`path`と`text/tspan`の双方がWhite Arrowクリックで選択可能）。回帰で`r74/r73/r72/r71`も再PASS。
- Open issues: なし。
- Next action: 実機でグラフSVG再確認。

### Step 109 - Builder implementation (Cmd+V UX + direct target wiring)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 体験改善のため、Cmd+Vで不要なclipboard許可ダイアログを出さない。SVG文字選択改善のため、White Arrowのtext-like補正ロジックをpointerdown導線へ接続する。
- Changes: `pasteBtn`はclipboard APIを呼ばず`pasteInternalClipboard`のみへ変更（許可ダイアログ抑止）。`Cmd/Ctrl+V`の遅延フォールバックから`clipboard.read`呼び出しを除去し、pasteイベント未到達時は内部clipboardのみへフォールバック。`pointerdown`でdirect選択時に`resolveTargetByTool`を適用するよう修正し、`resolveDirectTextLikeTarget`が実際に有効化。さらに`isEditableElement`へ`use/foreignObject`を追加。
- Open issues: 外部貼り付けはブラウザ標準pasteイベント依存（権限ダイアログは発生しない）。
- Next action: Cmd+V/内部Pasteとtext-like選択の一括検証。

### Step 110 - Reviewer verification (critical r76)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: ユーザー指摘2件（Cmd+V体験、text-like選択）を同時に検証する。
- Changes: `reviewer-r76-cmdv-no-prompt-and-textlike`を追加してPASS（Pasteボタン内部Paste動作、Cmd/Ctrl+V内部フォールバック維持、text-like groupのWhite Arrow選択成功）。回帰で`r75/r74/r72`も再PASS。
- Open issues: なし。
- Next action: 実機データで最終確認。

### Step 111 - Builder implementation (paste event sink + bbox nearest pick)
- Date: 2026-02-19
- Owner: Builder
- Decisions: Cmd+V取りこぼしとテキストクリック取りこぼしを同時に減らすため、入力フォーカスと選択ターゲット解決を強化する。
- Changes: `.canvas-wrap`へ`tabindex`を付与し、hidden `#pasteSink`を追加。`focusPasteSink()`を実装して初期化時/フォーカス復帰時/pointerdown時に適用（text編集中は除外）。`paste`リスナーを`window/document/canvasWrap/pasteSink`に配置し、同一イベント重複処理は`WeakSet`で抑止。White Arrowではrawヒット失敗時に`findEditableTargetByBBoxPoint`に加えて`findNearestEditableTargetByPoint`を導入。`pickDirectTargetFromStack`もtext-like優先へ更新。
- Open issues: 実機SVG固有構造で追加の優先順位調整が必要な可能性。
- Next action: 実機で同一データ再確認。

### Step 112 - Reviewer verification (critical sink/bbox)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 新規導線が既存機能を壊していないことを確認する。
- Changes: `r76/r75/r74/r73/r72/r71`を再実行し全PASS。Cmd/Ctrl+V、Files,image/png外部paste、path/text選択、paste lock回復の回帰を確認。
- Open issues: なし。
- Next action: 実機の該当グラフSVGで最終確認を依頼。

### Step 113 - Builder implementation (regression audit: direct target priority)
- Date: 2026-02-19
- Owner: Builder
- Decisions: ループ修正を止めるため、White Arrowで常にrawターゲットを優先してしまう回帰を修正する。
- Changes: `pointerdown`直下のdirect選択ロジックを再構成。`raw/stack`候補に加えて`BBox`候補を常時評価し、text-like候補が存在する場合はそちらを優先。`pickDirectTargetFromStack`も正規化+text-like優先へ更新。これにより、オーバーレイ要素がrawヒットを奪うケースでも文字選択を維持。
- Open issues: 実機SVG固有の階層が極端な場合は追加調整余地あり。
- Next action: overlay+text回帰を専用テストで確認。

### Step 114 - Reviewer verification (critical r78)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: ユーザーの「クリックしてもReadyのまま」症状を再現可能なケースで検証する。
- Changes: `reviewer-r78-direct-text-priority`を追加してPASS（overlay rect存在下でもdirect選択でtext-likeターゲット優先）。`r76/r75/r74/r72`も再PASS。
- Open issues: なし。
- Next action: 実機で同一グラフSVGの再確認。

### Step 115 - Builder implementation (selection coordinate/text stabilization)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 実機症状（貼り付け後の座標違和感・文字選択難）を抑えるため、座標計算とWhite Arrow選択の優先順位を単純化して安定化する。
- Changes: `safeBBox`を`getScreenCTM`でscreen座標へ写像し、`canvas.getScreenCTM().inverse()`でcanvas user座標へ戻す方式に変更（座標系の不一致を解消）。`applySelectionStyles`は`g`選択時に子要素へ`fm-group-selected`を付与しないよう修正し、貼り付け直後`sel:1`時の全体点線ノイズを解消。White Arrowの`resolveDirectTextLikeTarget`/`isTextLikeElement`を絞り込み、`pointerdown`で「近傍text優先（20px）」を追加。さらに通常クリック時は複数選択を単一選択へ収束させるよう修正。
- Open issues: foreignObjectを含む外部SVGはサニタイズ仕様上取り込まないため、FO内文字編集は非対象。
- Next action: 既存Reviewer回帰 + 実機でWhite Arrow文字クリックの最終確認。

### Step 116 - Reviewer verification (critical text/bbox rerun)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 今回変更の主要リスク（paste回帰、text hit回帰、Cmd+V回帰）を再検証する。
- Changes: `reviewer-r71/r72/r73/r74/r75/r76/r78` を再実行し全PASS。加えてヘッドレス再現で「貼り付け直後`sel:1`時に`fm-group-selected`が0件、selection-outlineのみ1件」を確認し、視覚ノイズ修正を検証。
- Open issues: ユーザー実データでpath化文字が混在する場合、White Arrowのクリック位置によってはpath選択になる可能性は残る。
- Next action: ユーザー実データでWhite Arrowクリック（Control/Treatment文字）の最終実機確認。

### Step 117 - Builder implementation (axis label type mismatch fix)
- Date: 2026-02-19
- Owner: Builder
- Decisions: ユーザー報告の「縦軸数字は選べるが Control/Treatment は選べない」は、同じ見た目でもDOM型が`text`と`path`で異なるケースを想定して対処する。
- Changes: White Arrow選択に`label-like`判定を追加。`hasLabelHint`（id/classのaxis/label/tick/title検出）と`isLabelLikePath`（fill-only小型path判定）を実装。`findNearestLabelLikeTargetByPoint`で近傍ラベル候補（text/path）を探索し、direct選択で`g`や非テキスト候補より優先するよう更新。
- Open issues: 極端に密集したpath群では個別glyph選択になる場合がある。
- Next action: 実機データでControl/Treatmentの直接クリック選択を確認。

### Step 118 - Reviewer verification (axis label path priority)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: text/path混在ラベルでの選択優先が回帰を起こしていないか確認する。
- Changes: `reviewer-r75/r76/r78` を再PASS。追加の `reviewer-r80-axis-label-path-priority` で、`pointer-events:none`付きlabel pathでもWhite Arrow選択できることを確認（PASS）。
- Open issues: なし。
- Next action: ユーザー実データで最終確認。

### Step 119 - Builder implementation (managed group-label isolation)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 貼り付けSVGの既存テキストを誤って「アプリ管理ラベル」と見なさないよう、グループラベル管理をclass依存から専用属性へ分離する。
- Changes: CSSクラスを`.fm-group-label`へ変更。`isGroupLabel`を`data-fm-group-label="1"`判定へ変更。`refreshGroupLabelPosition`/`addOrReplaceGroupLabel`の既存ラベル探索を`[data-fm-group-label="1"]`に限定。右クリックA/Bで生成するラベルに`class="fm-group-label"`+`data-fm-group-label="1"`を付与。テキスト編集/マーキー除外の`group-label`判定も`isGroupLabel`へ統一。
- Open issues: 旧版で作成された`class="group-label"`のみのラベルは新管理対象外（必要なら移行処理を追加可能）。
- Next action: 貼り付けSVGに`class="group-label"`が含まれる再現ケースで上書きされないことを確認。

### Step 120 - Reviewer verification (label overwrite regression)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: ユーザー症状（Control/TreatmentがA/Bに置換される）を直接再現する。
- Changes: `reviewer-r81-managed-group-label-only`を追加してPASS。貼り付けSVG内の既存`text.group-label`(Control)は保持され、右クリックAで追加された`data-fm-group-label`のみが`A`として存在することを確認。回帰で`r75/r76/r78`もPASS。
- Open issues: なし。
- Next action: 実機データでControl/Treatmentの保持を最終確認。

### Step 121 - Builder implementation (pasted transform drag coordinate fix)
- Date: 2026-02-19
- Owner: Builder
- Decisions: ユーザー報告「貼り付け要素をBBox移動すると遠くへ飛ぶ」は、親/自身のtransform（特にscale）下で平行移動量をローカル座標へ変換していないことが原因と判断。
- Changes: `setTranslate`を修正し、保持する`data-tx/data-ty`はcanvas基準のまま、適用時に`toParentLocalDelta`で親ローカル平行移動へ変換して`transform`へ反映。さらに`transform`合成順を`translate(...) ${base}`に統一し、base transformのscaleで移動量が増幅/縮小される問題を解消。`ensureTransformState`のpure-translate復元時は`fromParentLocalDelta`でcanvas基準へ逆変換して状態化。
- Open issues: 既存セッション内で古い`data-tx/data-ty`を保持している要素は再貼り付け/再読み込みで新方式に揃う。
- Next action: 貼り付けtransform要素のdrag/resize安定性を回帰検証。

### Step 122 - Reviewer verification (critical transformed move regression)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: transform付き貼り付け要素の移動量がマウス移動と一致するかを数値検証する。
- Changes: `reviewer-r83-paste-transform-drag-stability`を追加してPASS（+30pxドラッグで選択枠移動量が許容範囲）。加えて`reviewer-r82`（transform resize安定性）PASS。回帰として`r71/r72/r73/r74/r75/r76/r81`を再実行し全PASS。
- Open issues: なし。
- Next action: ユーザー実データでBBox移動の最終確認。

### Step 123 - Builder implementation (individual selection false-hit fix)
- Date: 2026-02-19
- Owner: Builder
- Decisions: ユーザー報告「全体は良いが個別選択で同じ問題」は、direct選択候補に透明/非表示要素が混入していることが主因として対処する。
- Changes: `isEditableElement`を強化し、`defs/clipPath/mask/marker/symbol/pattern/metadata`配下を除外。`display:none`/`visibility:hidden`除外。さらに図形要素はfill/strokeの可視性（`none`/`transparent`/`rgba(...,0)`除外）を判定し、透明rect等を編集対象から除外。`applyPointerEventPolicy`は図形/テキストを`visiblePainted`へ変更して、不可視面のヒットを抑制。
- Open issues: 透明だが編集したい要素（完全透明クリック領域）はこの方針で選択対象外。
- Next action: 実機でControl/Treatment近傍の個別クリック挙動を再確認。

### Step 124 - Reviewer verification (invisible target filtering)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 透明要素誤選択が消えていることを専用ケースで検証する。
- Changes: `reviewer-r84-ignore-invisible-selection`を追加してPASS（clipPath path/transparent rectが存在してもControl textを直接選択）。回帰として`r71/r74/r75/r76/r81/r83`を再実行し全PASS。
- Open issues: なし。
- Next action: ユーザー実データで最終確認。

### Step 125 - Builder implementation (PPT files/image/png regression fallback)
- Date: 2026-02-19
- Owner: Builder
- Decisions: `Paste unsupported: Types: Files, image/png` 回帰は、pasteイベントでMIMEは見えるがfile本体が取得できない環境差として対処する。
- Changes: `handlePaste`の`hasPayload`判定に`clipboardData.types`（Files/image/png/jpeg/svg/html/plain）を追加し、types-onlyでも処理継続。`pasteImageFromClipboardApi`を新規追加し、`findRasterFileFromClipboard`で取れない場合に`navigator.clipboard.read()`から画像blobを取得して貼り付けるフォールバックを実装。routeは`clipboard-api-image-fallback`で記録。
- Open issues: OS/ブラウザ設定で`clipboard.read`が禁止の場合はフォールバック不可（従来経路のみ）。
- Next action: 実機PowerPointで再確認。

### Step 126 - Reviewer verification (files,image/png unsupported regression)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 回帰症状（typesはあるが貼れない）をモックで直接再現して検証する。
- Changes: `reviewer-r85-files-type-image-api-fallback`を追加してPASS（items/files空・typesのみでclipboard.read画像貼り付け成功）。回帰として`r71/r73/r74/r76/r81/r84`を再実行し全PASS。
- Open issues: なし。
- Next action: ユーザー実機でPPT貼り付け再確認。

### Step 127 - Builder implementation (PPT paste latency fastpath)
- Date: 2026-02-19
- Owner: Builder
- Decisions: ユーザー報告「貼り付け後5秒待ち」は、文字列itemの読み取りタイムアウト待ちが先行する設計によるため、raster優先条件で早期貼り付けする。
- Changes: `shouldPreferRasterPath`を追加し、`types`が`Files/image/png/jpeg`かつ`getData`側にSVG/HTML/plain payloadがない場合は、先にraster経路へ進むよう`handlePaste`を再順序化。`findRasterFileFromClipboard`成功時は即貼り付けし、失敗時のみ`pasteImageFromClipboardApi`へフォールバック。レポートrouteは互換のため`image-raster`維持し、noteに`fastpath`を追記。
- Open issues: `clipboard.read`非対応/拒否環境ではfastpathのAPIフォールバックは使えないが、file経路は維持。
- Next action: 実機PowerPointで体感遅延改善を確認。

### Step 128 - Reviewer verification (paste latency regression)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 遅延改善が実際にタイムアウト待ちを回避しているかを専用ケースで検証する。
- Changes: `reviewer-r86-raster-fastpath-skips-string-timeout`を追加してPASS（hanging `getAsString` がいても<900msで画像挿入）。回帰として`r71/r73/r74/r76/r81/r84/r85`を再実行し全PASS。
- Open issues: なし。
- Next action: ユーザー実機で貼り付け時間を最終確認。

### Step 129 - Builder implementation (paste latency deep cut)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 3秒遅延は`getData()`同期変換 + `FileReader(dataURL)`完了待ちが原因。PPTの`Files,image/png`ではテキスト経路を後ろへ回し、画像は即表示する方針にする。
- Changes: `shouldPreferRasterPath`を`clipboardData.types`優先判定へ変更（`items`由来の`text/plain`でfastpath阻害しない）。`handlePaste`の`hasPayload`から`getData()`同期呼び出しを除去し、必要時のみ遅延取得へ変更。`pasteRasterImageQuick`を拡張して`Blob`入力対応し、`blob:` URLで即時挿入→非同期でdataURLへ置換する方式に変更。
- Open issues: 貼り付け直後ごく短時間で保存した場合、dataURL置換前の`blob:`参照が残る可能性がある（通常はすぐ置換）。
- Next action: 実機PowerPointで体感待ち時間を再確認。

### Step 130 - Reviewer verification (latency deep cut)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 5秒待ち系の再現シナリオでfastpathが実際に効いているか再検証する。
- Changes: `reviewer-r86-raster-fastpath-skips-string-timeout`を再実行してPASS。`r85/r71/r73/r74/r76`も再PASS。
- Open issues: なし。
- Next action: ユーザー実機で最終確認。

### Step 131 - Builder implementation (web app SVG paste latency cut)
- Date: 2026-02-19
- Owner: Builder
- Decisions: web app SVGの5秒遅延は、`text/html`同期取得とstring item逐次タイムアウト待ちが主因。SVGは`image/svg+xml`/`text/plain`を先に処理し、`text/html`は後段に回す。
- Changes: `handlePaste`を再順序化し、`getData("image/svg+xml")`/`getData("text/plain")`を先行、`getData("text/html")`は必要時のみ取得へ変更。`importSvgFromClipboardStringItems`を優先タイプ選別+並列読取+短タイムアウト（260ms）に変更し、待ち時間を上限制御。`readClipboardItemAsText`はtimeout可変化。
- Open issues: 一部ブラウザ実装で`getData("text/plain")`自体が遅い場合は限界あり。
- Next action: 実機web app SVGで体感遅延を再確認。

### Step 132 - Reviewer verification (web app SVG latency)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: SVG plain payloadがあるのにHTML取得待ちで遅延するケースを再現して検証する。
- Changes: `reviewer-r87-svg-plain-priority-over-html`を追加してPASS（`text/html`を1.2sブロックしても`text/plain` SVGで<650ms貼り付け）。回帰として`r86/r71/r73/r74/r75/r76/r85`を再実行し全PASS。
- Open issues: なし。
- Next action: ユーザー実機で最終確認。

### Step 133 - Builder implementation (desktop-style menubar)
- Date: 2026-02-19
- Owner: Builder
- Decisions: ツールバーの視認性改善のため、既存ボタンは保持しつつ上部にデスクトップ風メニュー（File/Edit/View/Window）を追加する。
- Changes: `menuBar` UIを追加。File(New/Open/Save/PDF), Edit(Undo/Redo/Copy/Cut/Paste Internal/Group/Ungroup), View(Canvas size presets/custom), Window(Shortcuts/Restore latest/Paste report)を実装。メニュー開閉管理（`state.activeMenu`、外側クリック閉じ、Esc閉じ）を追加。`setCanvasSize`/`promptCanvasSize`/`syncCanvasDisplaySizeFromViewBox`を実装し、viewBoxと表示サイズを連動。
- Open issues: compact表示時のメニュー最適化は未実装（現状は共通UI）。
- Next action: 手動でOpen/Save/Canvas sizeの実機確認。

### Step 134 - Reviewer verification (menubar + canvas size)
- Date: 2026-02-19
- Owner: Reviewer
- Decisions: 新規メニュー導線で既存挙動が壊れていないことを確認する。
- Changes: `reviewer-r88-menubar-canvas-size`を追加してPASS（Viewメニューから1600x900へ変更成功）。回帰として`reviewer-r76`もPASS。
- Open issues: なし。
- Next action: ユーザー操作で最終確認。

### Step 135 - Builder implementation (A4 main + menu consolidation)
- Date: 2026-02-19
- Owner: Builder
- Decisions: キャンバスサイズの主軸をA4縦横へ変更し、File操作とPaste report操作はメニュー集約を優先する。
- Changes: Viewメニューを`A4 Portrait/A4 Landscape/Canvas Size...`に変更。デフォルトviewBoxを`794x1123`へ変更。`New/Open SVG/Save SVG/Export PDF`とPaste report関連ボタンをツールバーから削除し、File/Windowメニューへ集約。`runMenuAction`にreport系操作を追加。削除済みボタンID参照で落ちないよう`setupEvents`に`bindClick`ガードを追加。
- Open issues: 旧メニュー検証スクリプト（1200/1600/1920前提）は更新が必要。
- Next action: A4メニュー導線とFile/Report操作の実機確認。

### Step 136 - Builder implementation (pinch zoom + stable bbox visuals)
- Date: 2026-02-19
- Owner: Builder
- Decisions: ドキュメント座標(viewBox)は維持し、表示倍率だけを変える方式でズームを実装する。BBoxはズーム時も見た目サイズを維持する。
- Changes: `viewScale`状態を追加し、`syncCanvasDisplaySizeFromViewBox`で表示サイズに倍率を反映。`Ctrl/⌘ + Wheel`と2本指タッチピンチで`setCanvasZoom`を実行し、アンカー位置を維持したまま拡縮。選択枠/ハンドルは表示スケールから`stroke-width`とハンドルサイズを逆算して一定表示化。
- Open issues: 既存自動テストはズーム操作を未カバー（手動確認が必要）。
- Next action: 実機でピンチ操作とBBox表示安定性を確認。

### Step 137 - Builder implementation (align icons + context menu actions)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 整列UIはテキストより視認性を優先してアイコン化。右クリックメニューはラベル専用から編集アクション中心へ拡張する。
- Changes: `Align L/C/R/T/M/B` と `Dist H/V` をSVGアイコンボタン化（既存`data-align`/`data-distribute`は維持）。右クリックメニューを `Copy/Cut/Paste/Mark(A-Z)/Group/Ungroup/Duplicate` に変更し、状況に応じたdisable制御を追加。`Mark(A-Z)`はグループ解決後に入力ダイアログで1文字を受け取り、`data-fm-group-label`を更新する実装へ変更。
- Open issues: `Mark(A-Z)`は1文字入力方式（一覧サブメニュー方式ではない）。
- Next action: 実機で右クリック導線（特にGroup/UngroupとMark）を最終確認。

### Step 138 - Builder implementation (clear mark action)
- Date: 2026-02-19
- Owner: Builder
- Decisions: マーク削除は既存の管理ラベル（`data-fm-group-label`）のみ対象にし、貼り付け由来テキストを消さない。
- Changes: 右クリックメニューに`Clear Mark`を追加。`clearGroupMark()`を実装し、対象グループの管理ラベルを削除して履歴`label-clear`を積む。メニューのdisable制御を追加し、ラベル未設定時は`Clear Mark`が無効になるよう調整。
- Open issues: なし。
- Next action: 実機でMark→Clear Markの往復操作を確認。

### Step 139 - Builder implementation (resize drift regression fix for pasted transforms)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 貼り付けSVGの`matrix/complex transform`要素は属性再計算ではなく変換ベースでリサイズする。
- Changes: `canvasPointToParentLocal` / `shouldUseTransformResize` / `applyResizeByTransform`を追加。`beginResize`にtransform-resizeモードと開始時transform保存を追加。`updateResize`で対象がcomplex transformの場合は変換ベースで再計算し、位置ドリフトを防止。再現ケース（matrix付きrect/グループ）で連続リサイズ時の左上ドリフト0を確認。
- Open issues: 複数回の独立リサイズでtransform文字列は長くなる傾向がある（挙動は安定）。
- Next action: ユーザー実データで再発有無を確認。

### Step 140 - Builder implementation (stale internal data attrs on pasted SVG)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 外部/内部由来SVGに残った内部管理属性（`data-id/data-tx/data-ty/data-base-transform`）は貼り付け時に無効化し、このアプリ側で再採番・再初期化する。
- Changes: `sanitizeSvgAttributes`で上記4属性を除去。`ensureId`を強化して既存ID衝突時に再採番。`importSvgText`でsanitize→ensureIdの順序に修正。ユーザー提示のSVG文字列をそのまま使った再現テストで、2回貼り付け時のID重複解消とリサイズ時の位置ドリフト0を確認。
- Open issues: なし。
- Next action: ユーザー実操作で同一SVGの再確認。

### Step 141 - Builder implementation (root fix: unify resize by transform)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 「Rectは動くのにPaste要素は飛ぶ」差分は座標系依存の属性更新リサイズが原因。リサイズは全要素でtransformベースに統一する。
- Changes: `beginResize`/`updateResize`を変更し、リサイズ中は開始時のBBoxと開始時transformを基準に毎フレームtransformを再計算する方式へ変更。これで親groupにtransformがある場合や貼り付け要素でも位置ドリフトを抑止。ユーザー提供SVGと親transform配下rectの両ケースでdrift 0を確認（`user-svg-resize: PASS`, `nested-parent-resize: PASS`）。
- Open issues: なし。
- Next action: ユーザー実機で同操作の再確認。

### Step 142 - Builder implementation (line thickness + shared line/arrow stroke control)
- Date: 2026-02-19
- Owner: Builder
- Decisions: 線の短縮時に太って見える問題は、リサイズtransformでstrokeまで拡大されることが要因。line/polylineは非スケーリングstrokeを標準化する。
- Changes: `applyPointerEventPolicy`でline/polylineへ`vector-effect: non-scaling-stroke`を付与。`applyLineStyle`を追加し、Line/Arrow双方の太さ設定を同一入力（`Line/Arrow stroke`）で変更できるよう統一。`addLine`は現在の共通stroke入力値で作成、`arrowStrokeInput`変更は通常Lineにも適用するよう更新。回帰テスト: `line-stroke-control: PASS`, `arrow-stroke-control: PASS`, `user-svg-resize-regression: PASS`。
- Open issues: なし。
- Next action: 実機でLine短縮時の見た目確認。

### Step 143 - Builder implementation (toolbar cleanup + realtime stroke UX)
- Date: 2026-02-19
- Owner: Builder
- Decisions: Copy/Cut/Pasteはメニュー・右クリック・ショートカット導線に集約し、ツールバーは編集主導UIを優先する。Undo/Redoは視認性のためアイコン化する。
- Changes: ツールバーから`Copy/Cut/Paste`ボタンを削除。`Undo/Redo`をSVGアイコンボタンへ変更。イベント登録は`bindClick`でnull安全化。`arrowStrokeInput`の`input/change`処理を`applyStrokeControlToSelectedLines`に統一し、選択中Line/Arrowへリアルタイム反映（複数line選択も対応）。検証: `toolbar-stroke-smoke: PASS`。
- Open issues: なし。
- Next action: 実機で操作体感（Undo/Redoの視認性、stroke入力追従）を確認。

### Step 144 - Builder + Reviewer regression fix (resize stroke/mark lock)
- Date: 2026-02-20
- Owner: Builder, Reviewer
- Decisions: 非等方リサイズ時の線幅崩れとMark変形を「仕様固定の回帰チェック対象」に昇格する。
- Changes:
  - `applyPointerEventPolicy`でRect/Ellipse/Circle/Path/Polygonにも`vector-effect: non-scaling-stroke`を適用。
  - Markラベルに`data-mark-base-size`を導入し、リサイズ中/再配置時に`font-size`を固定再適用。
  - Markラベルをリサイズ対象から除外（誤操作での形状崩れ防止）。
  - `00_SUPERVISOR_BRIEF.md` / `01_SPEC.md` / `02_BUILD_PLAN.md` / `03_REVIEW_CHECKLIST.md` / `30_TODO.md`に再発防止ルールを追記。
- Open issues: 実ブラウザで「全ハンドル非等方リサイズ時の線幅不変」「Mark非変形」の最終確認が必要。
- Next action: transform系変更時はレビューで必ず回帰3点（線幅・Mark・Paste/Undo）を検証する。

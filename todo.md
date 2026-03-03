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

# 知識ベース（Knowledge Base）

開発を進めるなかで調べたこと・設計したこと・再利用できる学びを、**あとから読み返せる形**で貯めていく場所。

- 1記事 = 1テーマ。`kebab-case.md` で作る。
- 各記事の冒頭に「日付 / タグ / 状態 / 元ネタ」を書く。
- 「結論」だけでなく **再利用できる技術・考え方** を残す（次回ゼロから調べ直さないため）。
- Claude 側の永続メモリ（`.claude/.../memory/`）と二層構成。メモリは Claude が毎回自動で読む圧縮メモ、こちらは**人間が読む清書版**。

## 記事一覧

| 記事 | 概要 | タグ |
|---|---|---|
| [軽量ブラウザ3Dの作り方](lightweight-browser-3d.md) | Messenger/abeto を分解。~5.7MB で動くWeb3Dの設計 | WebGL, Three.js, 3D, 最適化 |

---
*運用方針: [feedback-accumulate-knowledge] / [feedback-designed-not-generated]（Claudeメモリ）と連動。*

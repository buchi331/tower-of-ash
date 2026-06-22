# 『創世のヒント』(仮) MVP 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unityで「神の選択で歴史が歪む」ゲームのMVP（★6ステージ）を、頭から尻尾まで遊べる状態で完成させる。

**Architecture:** ロジック（メーター/状態/選択解決/エンディング判定）は純粋C#にしてEditModeテストでTDD。時代・岐路・選択肢はScriptableObjectでデータ駆動。UIはuGUI。単一シーン＋パネル切替。物理・通信・3Dなし。

**Tech Stack:** Unity（最新LTS）, C#, Unity Test Framework (EditMode/NUnit), uGUI, TextMeshPro, ScriptableObject。

**協業前提:** C#スクリプトの内容はこの計画に全文掲載済み（Claudeが書く想定だが手で貼っても可）。`Create:` のうち `.asset`/`.unity`/`.asmdef` や Inspector配線は **Unityエディタ上でNaotoが操作**する。テスト実行は Unity の Test Runner で行う。

**設計の出典:** [spec](../specs/2026-06-23-god-game-design.md) / [各時代リサーチ](../../god-game/era-research.md)

---

## ファイル構成（Unityプロジェクト `god-game/` を新規作成）

```
god-game/                         # ← 灰の塔リポジトリとは別の、独立したUnityプロジェクト+gitリポジトリ
  Assets/
    Scripts/
      GodGame.asmdef              # ランタイムのアセンブリ定義
      Core/
        MeterType.cs             # enum + MeterChange struct
        Meters.cs                # 5メーターの値とクランプ
        GameState.cs             # メーター + フラグ + 履歴
        ChoiceResolver.cs        # 選択をGameStateに適用
        EndingEvaluator.cs       # 最終メーターからエンディングID
      Data/
        ChoiceSO.cs              # 授けもの
        EventSO.cs               # 岐路（選択肢を持つ）
        EraSO.cs                 # 時代（街並み＋イベント）
        EndingSO.cs              # 結末（表示用）
      Game/
        GameController.cs        # 全体の流れ
      UI/
        MeterBarUI.cs
        CityViewUI.cs
        EventPanelUI.cs
        ResultPanelUI.cs
        EndingPanelUI.cs
    Tests/
      EditMode/
        GodGame.EditModeTests.asmdef
        MetersTests.cs
        GameStateTests.cs
        ChoiceResolverTests.cs
        EndingEvaluatorTests.cs
    GameData/                     # ScriptableObjectの.assetを置く
      Eras/  Events/  Choices/  Endings/
    Art/                          # プレースホルダ画像
    Scenes/
      Main.unity
```

各ファイルは1責務。Coreはロジックのみ（UnityEngine依存は最小）、DataはSO定義、UIは表示のみ、Gameが流れの司令塔。

---

## Phase 0: 環境とプロジェクトのセットアップ

### Task 0.1: UnityとプロジェクトをUnityで用意する（エディタ操作）

**Files:** （エディタ操作のため新規ファイルはUnityが生成）

- [ ] **Step 1: Unity Hub と Editor を入れる**

Unity Hub（公式サイト）をインストール → Hubの「Installs」から **最新のLTS**（例: Unity 6 LTS）をインストール。モジュールは「Windows Build Support」だけでよい（このMVPはPCで動けばOK）。

- [ ] **Step 2: 2Dプロジェクトを作る**

Hub →「New project」→ テンプレート **「2D (Core)」** を選択 → Project name: `god-game` → 場所はこのリポジトリの外（例: `C:\Users\buchi\UnityProjects\god-game`）→ Create。
理由: Unityプロジェクトは `Library/` 等の巨大バイナリを生むため、Web版（灰の塔）リポジトリと混ぜない。

- [ ] **Step 3: git初期化とUnity用 .gitignore**

エディタ外（ターミナル）でプロジェクト直下にて:
```bash
cd /c/Users/buchi/UnityProjects/god-game
git init
curl -sL https://raw.githubusercontent.com/github/gitignore/main/Unity.gitignore -o .gitignore
git add .gitignore
git commit -m "chore: init unity project with gitignore"
```
（curlが使えなければ、GitHubの `github/gitignore` の `Unity.gitignore` の内容を手で `.gitignore` に貼る）

- [ ] **Step 4: 設計ドキュメントをこのプロジェクトにも置く**

`god-game/docs/` を作り、[spec](../specs/2026-06-23-god-game-design.md) と [era-research](../../god-game/era-research.md) をコピーして入れる（参照用）。
```bash
mkdir -p docs
# 2ファイルを god-game/docs/ にコピー（手動コピーで可）
git add docs && git commit -m "docs: add design spec and era research"
```

- [ ] **Step 5: フォルダを作る**

Unityの Project ウィンドウで右クリック → Create → Folder で、`Assets/` 下に以下を作成:
`Scripts/Core`, `Scripts/Data`, `Scripts/Game`, `Scripts/UI`, `Tests/EditMode`, `GameData/Eras`, `GameData/Events`, `GameData/Choices`, `GameData/Endings`, `Art`, `Scenes`。

- [ ] **Step 6: TextMeshPro を導入**

メニュー Window → TextMeshPro → Import TMP Essential Resources（ダイアログが出たらImport）。テキスト表示に使う。

### Task 0.2: アセンブリ定義（asmdef）を作る（エディタ操作）

**Files:**
- Create: `Assets/Scripts/GodGame.asmdef`
- Create: `Assets/Tests/EditMode/GodGame.EditModeTests.asmdef`

- [ ] **Step 1: ランタイムasmdef**

Project ウィンドウで `Assets/Scripts` を選択 → 右クリック → Create → Assembly Definition → 名前を `GodGame` にする。

- [ ] **Step 2: テスト用asmdefフォルダ**

メニュー Window → General → Test Runner → タブ「EditMode」→「Create EditMode Test Assembly Folder」を押す。これで `Assets/Tests/EditMode/` にテスト用asmdefが作られる（無ければ手動でフォルダ選択して作成）。名前を `GodGame.EditModeTests` にリネーム。

- [ ] **Step 3: テストasmdefからランタイムasmdefを参照**

`GodGame.EditModeTests.asmdef` を選択 → Inspector の「Assembly Definition References」に `GodGame` を追加 → Apply。これでテストから本体コードを呼べる。

- [ ] **Step 4: 動作確認のための空テスト**

`Assets/Tests/EditMode/SmokeTest.cs` を作成:
```csharp
using NUnit.Framework;

public class SmokeTest
{
    [Test]
    public void TestFrameworkWorks()
    {
        Assert.AreEqual(2, 1 + 1);
    }
}
```

- [ ] **Step 5: Test Runnerで実行**

Test Runner（EditMode）→「Run All」。`TestFrameworkWorks` が **PASS（緑）** になることを確認。
（PASSしたら `SmokeTest.cs` は消してよい）

- [ ] **Step 6: コミット**
```bash
git add Assets/Scripts Assets/Tests
git commit -m "chore: add runtime and editmode test assemblies"
```

---

## Phase 1: コアロジック（TDD）

> ここはエディタ不要でほぼコードのみ。各Taskは「テストを書く→失敗を確認→実装→成功を確認→コミット」。テスト実行は Test Runner（EditMode）の Run All。

### Task 1.1: MeterType と MeterChange

**Files:**
- Create: `Assets/Scripts/Core/MeterType.cs`

- [ ] **Step 1: 型を定義（このTaskはテストより先に型定義。後続テストが参照するため）**
```csharp
public enum MeterType
{
    Technology, // 技術
    Nature,     // 自然
    Equality,   // 平等
    Peace,      // 平和
    Spirit      // 精神/文化
}

[System.Serializable]
public struct MeterChange
{
    public MeterType meter;
    public int delta;
}
```

- [ ] **Step 2: コンパイル確認**

Unityに戻り、コンソール（Window → General → Console）にエラーが出ないことを確認。

- [ ] **Step 3: コミット**
```bash
git add Assets/Scripts/Core/MeterType.cs
git commit -m "feat: add MeterType enum and MeterChange struct"
```

### Task 1.2: Meters（値とクランプ）

**Files:**
- Create: `Assets/Scripts/Core/Meters.cs`
- Test: `Assets/Tests/EditMode/MetersTests.cs`

- [ ] **Step 1: 失敗するテストを書く**
```csharp
using NUnit.Framework;

public class MetersTests
{
    [Test]
    public void NewMeters_DefaultsTo50()
    {
        var m = new Meters();
        Assert.AreEqual(50, m.Get(MeterType.Technology));
    }

    [Test]
    public void Apply_AddsDelta()
    {
        var m = new Meters();
        m.Apply(new MeterChange { meter = MeterType.Technology, delta = 10 });
        Assert.AreEqual(60, m.Get(MeterType.Technology));
    }

    [Test]
    public void Apply_ClampsToMax()
    {
        var m = new Meters();
        m.Apply(new MeterChange { meter = MeterType.Nature, delta = 100 });
        Assert.AreEqual(100, m.Get(MeterType.Nature));
    }

    [Test]
    public void Apply_ClampsToMin()
    {
        var m = new Meters();
        m.Apply(new MeterChange { meter = MeterType.Peace, delta = -100 });
        Assert.AreEqual(0, m.Get(MeterType.Peace));
    }
}
```

- [ ] **Step 2: 失敗を確認**

Test Runner → Run All。`Meters` が未定義でコンパイルエラー or FAIL になることを確認。

- [ ] **Step 3: 実装**
```csharp
using System.Collections.Generic;
using UnityEngine;

public class Meters
{
    public const int Min = 0;
    public const int Max = 100;

    private readonly Dictionary<MeterType, int> values = new Dictionary<MeterType, int>();

    public Meters(int initial = 50)
    {
        foreach (MeterType m in System.Enum.GetValues(typeof(MeterType)))
        {
            values[m] = Mathf.Clamp(initial, Min, Max);
        }
    }

    public int Get(MeterType m) => values[m];

    public void Apply(MeterChange change)
    {
        int next = values[change.meter] + change.delta;
        values[change.meter] = Mathf.Clamp(next, Min, Max);
    }
}
```

- [ ] **Step 4: 成功を確認**

Test Runner → Run All。MetersTests の4件が PASS。

- [ ] **Step 5: コミット**
```bash
git add Assets/Scripts/Core/Meters.cs Assets/Tests/EditMode/MetersTests.cs
git commit -m "feat: add Meters with clamped values (TDD)"
```

### Task 1.3: GameState

**Files:**
- Create: `Assets/Scripts/Core/GameState.cs`
- Test: `Assets/Tests/EditMode/GameStateTests.cs`

- [ ] **Step 1: 失敗するテストを書く**
```csharp
using NUnit.Framework;

public class GameStateTests
{
    [Test]
    public void NewGameState_HasFiveMetersAt50()
    {
        var s = new GameState();
        Assert.AreEqual(50, s.Meters.Get(MeterType.Spirit));
    }

    [Test]
    public void Flags_StartEmpty()
    {
        var s = new GameState();
        Assert.IsFalse(s.Flags.Contains("has_fire"));
    }

    [Test]
    public void History_StartsEmpty()
    {
        var s = new GameState();
        Assert.AreEqual(0, s.History.Count);
    }
}
```

- [ ] **Step 2: 失敗を確認** — Run All で FAIL/コンパイルエラー。

- [ ] **Step 3: 実装**
```csharp
using System.Collections.Generic;

public class GameState
{
    public Meters Meters { get; } = new Meters();
    public HashSet<string> Flags { get; } = new HashSet<string>();
    public List<string> History { get; } = new List<string>();
}
```

- [ ] **Step 4: 成功を確認** — Run All で GameStateTests が PASS。

- [ ] **Step 5: コミット**
```bash
git add Assets/Scripts/Core/GameState.cs Assets/Tests/EditMode/GameStateTests.cs
git commit -m "feat: add GameState (meters, flags, history)"
```

### Task 1.4: Data用ScriptableObjectクラス（先に型だけ用意）

**Files:**
- Create: `Assets/Scripts/Data/ChoiceSO.cs`
- Create: `Assets/Scripts/Data/EventSO.cs`
- Create: `Assets/Scripts/Data/EraSO.cs`
- Create: `Assets/Scripts/Data/EndingSO.cs`

> 後続の ChoiceResolver テストが `ChoiceSO` を使うため、ここで型を定義する。

- [ ] **Step 1: ChoiceSO**
```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "GodGame/Choice")]
public class ChoiceSO : ScriptableObject
{
    public string id;
    public string label;                 // 授けものの名前（ボタン表示）
    [TextArea] public string resultText; // 選んだ後の結末ナレーション
    public MeterChange[] meterChanges;   // メーターの増減
    public string[] grantedFlags;        // 付与するフラグ（任意）
}
```

- [ ] **Step 2: EventSO**
```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "GodGame/Event")]
public class EventSO : ScriptableObject
{
    public string id;
    [TextArea] public string situationText; // 岐路の状況説明
    public ChoiceSO[] choices;              // 2〜3個
}
```

- [ ] **Step 3: EraSO**
```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "GodGame/Era")]
public class EraSO : ScriptableObject
{
    public string id;
    public string displayName; // 例: 石器時代
    public string yearLabel;   // 例: 約700万年前
    public Sprite cityView;    // その時代の街並み（プレースホルダ可）
    public EventSO eventForEra; // MVP: 1時代＝1イベント
}
```

- [ ] **Step 4: EndingSO**
```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "GodGame/Ending")]
public class EndingSO : ScriptableObject
{
    public string id;          // "ideal" / "ash_collapse" / "muddling"
    public string title;
    [TextArea] public string body;
}
```

- [ ] **Step 5: コンパイル確認** — Console にエラーなし。

- [ ] **Step 6: コミット**
```bash
git add Assets/Scripts/Data
git commit -m "feat: add ScriptableObject data types (Era/Event/Choice/Ending)"
```

### Task 1.5: ChoiceResolver

**Files:**
- Create: `Assets/Scripts/Core/ChoiceResolver.cs`
- Test: `Assets/Tests/EditMode/ChoiceResolverTests.cs`

- [ ] **Step 1: 失敗するテストを書く**
```csharp
using NUnit.Framework;
using UnityEngine;

public class ChoiceResolverTests
{
    [Test]
    public void Apply_ChangesMeters_AddsFlag_RecordsHistory()
    {
        var state = new GameState();
        var choice = ScriptableObject.CreateInstance<ChoiceSO>();
        choice.id = "fire";
        choice.meterChanges = new[]
        {
            new MeterChange { meter = MeterType.Technology, delta = 15 },
            new MeterChange { meter = MeterType.Nature, delta = -10 },
        };
        choice.grantedFlags = new[] { "has_fire" };

        ChoiceResolver.Apply(state, choice);

        Assert.AreEqual(65, state.Meters.Get(MeterType.Technology));
        Assert.AreEqual(40, state.Meters.Get(MeterType.Nature));
        Assert.IsTrue(state.Flags.Contains("has_fire"));
        Assert.Contains("fire", state.History);
    }

    [Test]
    public void Apply_NullArrays_DoesNotThrow()
    {
        var state = new GameState();
        var choice = ScriptableObject.CreateInstance<ChoiceSO>();
        choice.id = "noop";
        // meterChanges / grantedFlags は null のまま
        Assert.DoesNotThrow(() => ChoiceResolver.Apply(state, choice));
        Assert.Contains("noop", state.History);
    }
}
```

- [ ] **Step 2: 失敗を確認** — Run All で FAIL/コンパイルエラー。

- [ ] **Step 3: 実装**
```csharp
public static class ChoiceResolver
{
    public static void Apply(GameState state, ChoiceSO choice)
    {
        if (choice.meterChanges != null)
        {
            foreach (var change in choice.meterChanges)
            {
                state.Meters.Apply(change);
            }
        }

        if (choice.grantedFlags != null)
        {
            foreach (var flag in choice.grantedFlags)
            {
                state.Flags.Add(flag);
            }
        }

        state.History.Add(choice.id);
    }
}
```

- [ ] **Step 4: 成功を確認** — Run All で ChoiceResolverTests が PASS。

- [ ] **Step 5: コミット**
```bash
git add Assets/Scripts/Core/ChoiceResolver.cs Assets/Tests/EditMode/ChoiceResolverTests.cs
git commit -m "feat: add ChoiceResolver (apply choice to state) (TDD)"
```

### Task 1.6: EndingEvaluator

**Files:**
- Create: `Assets/Scripts/Core/EndingEvaluator.cs`
- Test: `Assets/Tests/EditMode/EndingEvaluatorTests.cs`

- [ ] **Step 1: 失敗するテストを書く**
```csharp
using NUnit.Framework;

public class EndingEvaluatorTests
{
    [Test]
    public void AllHigh_ReturnsIdeal()
    {
        var m = new Meters(70); // 全軸70
        Assert.AreEqual("ideal", EndingEvaluator.Evaluate(m));
    }

    [Test]
    public void HighTech_LowNature_ReturnsAshCollapse()
    {
        var m = new Meters(50);
        m.Apply(new MeterChange { meter = MeterType.Technology, delta = 40 }); // 90
        m.Apply(new MeterChange { meter = MeterType.Nature, delta = -30 });    // 20
        Assert.AreEqual("ash_collapse", EndingEvaluator.Evaluate(m));
    }

    [Test]
    public void Balanced_ReturnsMuddling()
    {
        var m = new Meters(50); // 全軸50（idealにもashにも当てはまらない）
        Assert.AreEqual("muddling", EndingEvaluator.Evaluate(m));
    }
}
```

- [ ] **Step 2: 失敗を確認** — Run All で FAIL/コンパイルエラー。

- [ ] **Step 3: 実装**
```csharp
public static class EndingEvaluator
{
    public static string Evaluate(Meters m)
    {
        int tech = m.Get(MeterType.Technology);
        int nature = m.Get(MeterType.Nature);
        int peace = m.Get(MeterType.Peace);

        // 技術だけ突出し、自然か平和が崩壊 → 灰の自滅
        if (tech >= 70 && (nature <= 30 || peace <= 30))
        {
            return "ash_collapse";
        }

        // 全軸が高く均衡 → 理想文明
        if (AllAtLeast(m, 60))
        {
            return "ideal";
        }

        return "muddling";
    }

    private static bool AllAtLeast(Meters m, int threshold)
    {
        foreach (MeterType mt in System.Enum.GetValues(typeof(MeterType)))
        {
            if (m.Get(mt) < threshold) return false;
        }
        return true;
    }
}
```

- [ ] **Step 4: 成功を確認** — Run All で EndingEvaluatorTests が PASS。全テスト（Phase 1合計）も緑であることを確認。

- [ ] **Step 5: コミット**
```bash
git add Assets/Scripts/Core/EndingEvaluator.cs Assets/Tests/EditMode/EndingEvaluatorTests.cs
git commit -m "feat: add EndingEvaluator (meters -> ending id) (TDD)"
```

---

## Phase 2: コンテンツ（★6時代のデータをエディタで作る）

> Project ウィンドウで右クリック → Create → GodGame → Choice/Event/Era/Ending で `.asset` を作り、Inspectorに下記の値を入力する。命名は `id` と揃えると探しやすい。

### Task 2.1: 6時代ぶんの Choice / Event / Era アセットを作成

各時代について「ChoiceSOを2〜3個 → それを参照するEventSOを1個 → それを参照するEraSOを1個」の順で作る。値は以下（meterChangesは {meter, delta} の配列）。

- [ ] **Step 1: 時代1「直立二足歩行」**
  - Era: id=`bipedalism`, displayName=`猿人の時代`, yearLabel=`約700万年前`
  - Event: id=`bipedalism_evt`, situation=`森が縮み、草原が広がる。木の上は安全だが、地に降りた者は捕食者に狙われる。神よ、人類に何を促す?`
  - Choices:
    - `bipedalism_stand` label=`立つことを促す` result=`民は立ち上がった。両手が自由になり、遠くを見渡せる。だが産道は狭まり、出産は命がけになった。` changes: Technology +15, Nature -5, Spirit +5 / flags: `stood_up`
    - `bipedalism_tree` label=`木の上に留めさせる` result=`民は森に残った。安全だが、世界はそこで止まったままだ。` changes: Nature +10, Technology -10
    - `bipedalism_quad` label=`地を駆けさせる` result=`速さは得たが、手は塞がれたまま。道具は遠い夢となった。` changes: Technology -5, Peace +5

- [ ] **Step 2: 時代2「農業革命」**
  - Era: id=`agriculture`, displayName=`農耕のはじまり`, yearLabel=`約1万年前`
  - Event: id=`agriculture_evt`, situation=`獲物は減り、人は増えた。「種を蒔けば実る」ことに民は気づきかけている。`
  - Choices:
    - `agri_farm` label=`農耕を授ける` result=`備蓄が定住と人口爆発を生んだ。だが格差・疫病・重労働も芽生えた。` changes: Technology +15, Nature -10, Equality -10, Spirit +5 / flags: `agriculture`
    - `agri_garden` label=`採集の道を残す` result=`民は健康で平等なまま。だが文明は何千年も足踏みする。` changes: Nature +10, Equality +10, Technology -10
    - `agri_calendar` label=`暦を授け、待つことを教える` result=`民は季節を読み、慎ましく実りを得た。` changes: Technology +5, Nature +5, Spirit +5

- [ ] **Step 3: 時代3「文字」**
  - Era: id=`writing`, displayName=`文字の発明`, yearLabel=`約前3300年`
  - Event: id=`writing_evt`, situation=`倉庫の蓄えも、税も、約束も、記憶では追えない。人が死ねば知も消える。`
  - Choices:
    - `writing_record` label=`記録の文字を授ける` result=`知識・法・歴史が蓄積され、文明の記憶装置が生まれた。だが読める者が新たな特権階級になった。` changes: Technology +15, Spirit +10, Equality -10 / flags: `writing`
    - `writing_priest` label=`神官に文字を独占させる` result=`聖典を読めるのは一握り。民は解読されぬ真実にひざまずく。` changes: Spirit +15, Equality -15, Peace -5
    - `writing_oral` label=`文字を与えない` result=`歌と記憶は冴えわたるが、知は世代で目減りし、同じ過ちを繰り返す。` changes: Spirit +5, Technology -10

- [ ] **Step 4: 時代4「産業革命」**
  - Era: id=`industry`, displayName=`産業革命`, yearLabel=`約1760年`
  - Event: id=`industry_evt`, situation=`人と家畜の力では、増える民を養えない。蒸気という巨大な力が眠っている。`
  - Choices:
    - `industry_steam` label=`蒸気の力を解き放つ` result=`生産力が爆発した。だが児童労働とスラム、煤煙が空を灰色に染めた。` changes: Technology +20, Nature -15, Equality -10 / flags: `steam`
    - `industry_law` label=`力と共に人を守る掟も授ける` result=`成長は穏やかになったが、人の尊厳は守られた。` changes: Technology +10, Equality +10, Peace +5
    - `industry_seal` label=`その力を封印する` result=`世界は牧歌的なまま。だが貧しく、飢饉に脆い。` changes: Nature +10, Technology -10

- [ ] **Step 5: 時代5「核分裂」**
  - Era: id=`nuclear`, displayName=`原子力の時代`, yearLabel=`1945年`
  - Event: id=`nuclear_evt`, situation=`原子の中に、無限の力が見つかった。無尽蔵の電力にも、都市を消す兵器にもなる。`
  - Choices:
    - `nuclear_power` label=`電気として授ける` result=`低炭素の巨大な電力。だが何万年も残る廃棄物の影。` changes: Technology +15, Nature +5, Peace +5
    - `nuclear_bomb` label=`兵器として授ける` result=`恐怖が大戦を抑えた。だが世界は一度の誤作動で灰になる均衡に。` changes: Technology +15, Peace -20, Spirit -10 / flags: `nukes`
    - `nuclear_seal` label=`誰にも持たせない` result=`核なき世界。だが安価な大電力を諦め、化石燃料に頼り続けた。` changes: Nature -5, Peace +10, Technology -5

- [ ] **Step 6: 時代6「AI・遺伝子編集」（最終時代）**
  - Era: id=`ai_gene`, displayName=`創造の時代`, yearLabel=`現代`
  - Event: id=`ai_gene_evt`, situation=`人類はついに「考える機械」と「生命を書き換える鋏」を手にした。神の道具を、未熟な人に委ねるか。`
  - Choices:
    - `ai_entrust` label=`AIに最適化を委ねる` result=`戦争も飢えも消えた。だが人類は何も決めなくなった。` changes: Technology +20, Peace +10, Spirit -15 / flags: `ai`
    - `ai_ethics` label=`力の前に戒めを置く` result=`進歩は慎重になったが、人の手綱は保たれた。` changes: Technology +5, Equality +10, Spirit +10
    - `ai_gene` label=`生命の設計を解き放つ` result=`病は消えゆくが、「設計された人」と「自然の人」に種が裂けはじめた。` changes: Technology +15, Equality -20, Nature -5 / flags: `gene`

- [ ] **Step 7: コミット**
```bash
git add Assets/GameData
git commit -m "content: add 6 MVP eras (events + choices)"
```

### Task 2.2: エンディング3種のアセットを作成

- [ ] **Step 1: Ending を3つ作る（Create → GodGame → Ending）**
  - `ideal`: title=`均衡のユートピア` body=`あなたの導きは、技術も自然も人の心も損なわなかった。人類は地球と調和し、静かに栄え続ける。`
  - `ash_collapse`: title=`灰の自滅` body=`力は与えられすぎた。輝かしい技術の塔は、痩せた大地と冷えた心の上で、一夜にして灰となった。`
  - `muddling`: title=`途上の世界` body=`人類はまだ旅の途中にいる。栄光も破滅も決まらぬまま、次の神の声を待っている。`

- [ ] **Step 2: コミット**
```bash
git add Assets/GameData/Endings
git commit -m "content: add 3 MVP endings"
```

### Task 2.3: プレースホルダの街並み画像（Carto風の簡素版）

- [ ] **Step 1: 6枚の簡素なスプライトを用意**

各時代に1枚、見下ろしの街並みを表す画像（PNG）を用意。MVPでは凝らず、Carto風の温かいパレットで「集落→畑のある村→都市→工場の街→現代都市→未来都市」を**簡素な図形**で描く（自作 or 単色＋アイコン的なもの）。`Assets/Art/` に入れ、各 `EraSO.cityView` に割り当てる。
※ 絵で止まらないよう、最初は「色違いの四角＋ラベル」程度で良い。見た目の磨きは Phase 5。

- [ ] **Step 2: コミット**
```bash
git add Assets/Art Assets/GameData/Eras
git commit -m "content: add placeholder city-view sprites for 6 eras"
```

---

## Phase 3: UI（uGUI）

> シーンとUIはエディタで組む。スクリプトは下記を作成し、Inspectorで参照（配線）する。

### Task 3.1: UIスクリプトを作成

**Files:**
- Create: `Assets/Scripts/UI/MeterBarUI.cs`
- Create: `Assets/Scripts/UI/CityViewUI.cs`
- Create: `Assets/Scripts/UI/EventPanelUI.cs`
- Create: `Assets/Scripts/UI/ResultPanelUI.cs`
- Create: `Assets/Scripts/UI/EndingPanelUI.cs`

- [ ] **Step 1: MeterBarUI**
```csharp
using UnityEngine;
using UnityEngine.UI;

public class MeterBarUI : MonoBehaviour
{
    // 5本のバー。順序は MeterType の宣言順（Technology, Nature, Equality, Peace, Spirit）に合わせる
    public Image[] fills;

    public void Render(Meters meters)
    {
        var types = (MeterType[])System.Enum.GetValues(typeof(MeterType));
        for (int i = 0; i < fills.Length && i < types.Length; i++)
        {
            fills[i].fillAmount = meters.Get(types[i]) / 100f;
        }
    }
}
```

- [ ] **Step 2: CityViewUI**
```csharp
using UnityEngine;
using UnityEngine.UI;

public class CityViewUI : MonoBehaviour
{
    public Image cityImage;
    public GameObject smogOverlay; // 自然が低いとき表示する煙オーバーレイ（任意）

    public void Render(EraSO era, Meters meters)
    {
        if (era.cityView != null)
        {
            cityImage.sprite = era.cityView;
        }
        if (smogOverlay != null)
        {
            smogOverlay.SetActive(meters.Get(MeterType.Nature) <= 30);
        }
    }
}
```

- [ ] **Step 3: EventPanelUI**
```csharp
using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class EventPanelUI : MonoBehaviour
{
    public TMP_Text situationText;
    public Button[] choiceButtons;   // 最大3
    public TMP_Text[] choiceLabels;  // ボタンと同数・同順

    public event Action<int> OnChoiceSelected;

    public void Show(EventSO ev)
    {
        gameObject.SetActive(true);
        situationText.text = ev.situationText;

        for (int i = 0; i < choiceButtons.Length; i++)
        {
            bool active = ev.choices != null && i < ev.choices.Length;
            choiceButtons[i].gameObject.SetActive(active);
            if (!active) continue;

            choiceLabels[i].text = ev.choices[i].label;
            int index = i; // クロージャ対策
            choiceButtons[i].onClick.RemoveAllListeners();
            choiceButtons[i].onClick.AddListener(() => OnChoiceSelected?.Invoke(index));
        }
    }

    public void Hide() => gameObject.SetActive(false);
}
```

- [ ] **Step 4: ResultPanelUI**
```csharp
using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ResultPanelUI : MonoBehaviour
{
    public TMP_Text resultText;
    public Button nextButton;

    public void Show(string text, Action onNext)
    {
        gameObject.SetActive(true);
        resultText.text = text;
        nextButton.onClick.RemoveAllListeners();
        nextButton.onClick.AddListener(() =>
        {
            gameObject.SetActive(false);
            onNext?.Invoke();
        });
    }
}
```

- [ ] **Step 5: EndingPanelUI**
```csharp
using UnityEngine;
using TMPro;

public class EndingPanelUI : MonoBehaviour
{
    public TMP_Text titleText;
    public TMP_Text bodyText;

    public void Show(EndingSO ending)
    {
        gameObject.SetActive(true);
        titleText.text = ending.title;
        bodyText.text = ending.body;
    }
}
```

- [ ] **Step 6: コンパイル確認＆コミット**

Console にエラーなしを確認。
```bash
git add Assets/Scripts/UI
git commit -m "feat: add UI components (meter bar, city view, event/result/ending panels)"
```

### Task 3.2: シーンとUIを組む（エディタ操作）

**Files:**
- Create: `Assets/Scenes/Main.unity`

- [ ] **Step 1: シーン作成** — `Assets/Scenes` で Create → Scene → `Main`。ダブルクリックで開く。

- [ ] **Step 2: Canvas** — Hierarchy 右クリック → UI → Canvas（EventSystemも自動生成される）。Canvas Scaler の UI Scale Mode を「Scale With Screen Size」に。

- [ ] **Step 3: メーターバー** — Canvas下に空のUI（Create Empty）`MeterBar` を作り、子に Image を5本（各「背景」＋「Fill」）。各Fillの Image を Image Type=Filled, Fill Method=Horizontal に。`MeterBar` に `MeterBarUI` を付け、`fills` に5本のFillを **Technology→Nature→Equality→Peace→Spirit の順** でドラッグ。各バーの脇に TMPでラベル（技術/自然/平等/平和/精神）。

- [ ] **Step 4: 街並みビュー** — Canvas下に Image `CityView`（画面中央の大きめ枠）。子に半透明の Image `SmogOverlay`（最初は無効化）。`CityView` に `CityViewUI` を付け、`cityImage`=自身のImage、`smogOverlay`=SmogOverlayを割り当て。

- [ ] **Step 5: 岐路パネル** — Canvas下に Panel `EventPanel`（下部）。子に TMP の `SituationText` と、Button×3（各ボタン内に TMP ラベル）。`EventPanel` に `EventPanelUI` を付け、`situationText`/`choiceButtons[3]`/`choiceLabels[3]` を割り当て。

- [ ] **Step 6: 結果パネル** — Canvas下に Panel `ResultPanel`（最初は無効化）。子に TMP `ResultText` と Button `NextButton`（「次の時代へ」）。`ResultPanelUI` を付けて割り当て。

- [ ] **Step 7: エンディングパネル** — Canvas下に Panel `EndingPanel`（最初は無効化）。子に TMP `TitleText` と `BodyText`。`EndingPanelUI` を付けて割り当て。

- [ ] **Step 8: 保存＆コミット**

Ctrl+S でシーン保存。
```bash
git add Assets/Scenes
git commit -m "feat: build Main scene with UI layout"
```

---

## Phase 4: ゲームの流れ（司令塔）

### Task 4.1: GameController を作成

**Files:**
- Create: `Assets/Scripts/Game/GameController.cs`

- [ ] **Step 1: 実装**
```csharp
using System.Collections.Generic;
using UnityEngine;

public class GameController : MonoBehaviour
{
    [Header("Content")]
    public List<EraSO> eras;        // ★6時代を順番に
    public List<EndingSO> endings;  // ideal / ash_collapse / muddling

    [Header("UI")]
    public MeterBarUI meterBar;
    public CityViewUI cityView;
    public EventPanelUI eventPanel;
    public ResultPanelUI resultPanel;
    public EndingPanelUI endingPanel;

    private GameState state;
    private int index;

    private void Start()
    {
        state = new GameState();
        index = 0;
        eventPanel.OnChoiceSelected += HandleChoice;
        ShowCurrentEra();
    }

    private void ShowCurrentEra()
    {
        var era = eras[index];
        cityView.Render(era, state.Meters);
        meterBar.Render(state.Meters);
        eventPanel.Show(era.eventForEra);
    }

    private void HandleChoice(int choiceIndex)
    {
        var era = eras[index];
        var choice = era.eventForEra.choices[choiceIndex];

        ChoiceResolver.Apply(state, choice);
        eventPanel.Hide();
        meterBar.Render(state.Meters);
        cityView.Render(era, state.Meters);
        resultPanel.Show(choice.resultText, GoNext);
    }

    private void GoNext()
    {
        index++;
        if (index >= eras.Count)
        {
            string endingId = EndingEvaluator.Evaluate(state.Meters);
            var ending = endings.Find(e => e.id == endingId);
            if (ending == null) ending = endings[0];
            endingPanel.Show(ending);
        }
        else
        {
            ShowCurrentEra();
        }
    }
}
```

- [ ] **Step 2: コンパイル確認＆コミット**
```bash
git add Assets/Scripts/Game/GameController.cs
git commit -m "feat: add GameController flow (era -> choice -> result -> ending)"
```

### Task 4.2: GameController をシーンに配線（エディタ操作）

- [ ] **Step 1: 空オブジェクトに付ける** — Hierarchyに Create Empty `GameController` → `GameController` スクリプトを付ける。

- [ ] **Step 2: コンテンツを割り当て** — `eras` に時代1→6を **順番通り** にドラッグ。`endings` に ideal/ash_collapse/muddling をドラッグ。

- [ ] **Step 3: UIを割り当て** — `meterBar`/`cityView`/`eventPanel`/`resultPanel`/`endingPanel` に、シーン上の対応オブジェクトをドラッグ。

- [ ] **Step 4: 保存＆コミット**
```bash
git add Assets/Scenes
git commit -m "chore: wire GameController to content and UI in scene"
```

### Task 4.3: 通し動作確認（手動）

- [ ] **Step 1: 再生** — エディタ上部の ▶ Play を押す。

- [ ] **Step 2: 確認項目（Definition of Done）**
  - 時代1の状況文と3つの選択肢が表示される。
  - 選択するとメーターが動き、結果文＋「次の時代へ」が出る。
  - 6時代を順に進める。時代ごとに街並み画像が変わる。
  - 6時代の後にエンディングが表示される。
  - 「技術ばかり伸ばし自然/平和を下げる」選択を続けると **灰の自滅**、「掟・暦・倫理など穏当な選択」を続けると **理想文明** か **途上の世界** に分岐する。
  - Console に赤エラーが出ていない。

- [ ] **Step 3: 不具合があれば修正** — 配線漏れ（NullReference）はInspectorの割り当てを確認。ロジック不整合はPhase 1のテストを追加して再現→修正。

- [ ] **Step 4: コミット（必要なら）**
```bash
git add -A
git commit -m "fix: adjustments after first full playthrough"
```

---

## Phase 5: 仕上げ（最小限）

### Task 5.1: 見た目と手触りの最低限の磨き

- [ ] **Step 1: パレットと配置** — Carto風の温かい配色に整える（背景・パネル・ボタン）。メーターに色（技術=青/自然=緑/平等=青緑/平和=紫/精神=橙 等）。

- [ ] **Step 2: メーター変化を見せる** — 選択直後に増減した軸が分かるよう、簡単な色点滅や差分表示（任意）。

- [ ] **Step 3: タイトル画面（任意・軽量）** — 「はじめる」ボタンだけの簡素なタイトルを `Main` 内のパネルで用意してもよい。

- [ ] **Step 4: コミット**
```bash
git add -A
git commit -m "polish: palette, meter color cues, minimal title"
```

### Task 5.2: MVP完成タグ

- [ ] **Step 1: 全EditModeテストが緑であることを最終確認**（Test Runner → Run All）。

- [ ] **Step 2: 通しプレイで Definition of Done を再確認**（Task 4.3 Step 2）。

- [ ] **Step 3: タグを打つ**
```bash
git tag mvp-v0.1
git commit --allow-empty -m "chore: mark MVP v0.1 complete"
```

---

## 完成の定義（再掲・MVP DoD）

- ★6ステージ（直立二足歩行→農業→文字→産業革命→核分裂→AI）が通しで遊べる。
- 5メーターが選択で増減し、画面に見える。
- 街並みビューが6時代で変化する（簡素でよい）。
- 最低2種のエンディングに到達できる（理想文明 / 灰の自滅、＋途上の世界）。
- 選択に「目に見える結果（結果文＋メーター＋見た目）」が伴う。
- EditModeテストが全て緑。

## この後（MVPの先・別計画）

- 残り12ステージの追加（[era-research.md](../../god-game/era-research.md) から）。
- フラグ駆動の分岐（早期の選択が後の選択肢/文面を変える）。
- 6エンディングへの拡張とIF分岐演出。
- アートの本制作（Carto風に磨く／自作 or 依頼）。
- 音・BGM、バランス調整、セーブ、配布。

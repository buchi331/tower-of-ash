export function TitleScreen({ hasSave, onNew, onContinue }: { hasSave: boolean; onNew: () => void; onContinue: () => void }) {
  return (
    <div className="screen title">
      <div className="title-mark">Tower of Ash</div>
      <h1>灰の塔</h1>
      <p className="muted">煤と呪いの尖塔を登る、短編ローグライク・カードバトル。</p>
      <div className="title-actions">
        {hasSave && <button className="btn primary" onClick={onContinue}>つづきから</button>}
        <button className="btn primary" onClick={onNew}>{hasSave ? 'はじめから' : 'ゲーム開始'}</button>
      </div>
    </div>
  )
}

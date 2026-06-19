export function TitleScreen({ hasSave, onNew, onContinue }: { hasSave: boolean; onNew: () => void; onContinue: () => void }) {
  return (
    <div className="screen title">
      <h1>灰の塔</h1>
      <p className="muted">Tower of Ash</p>
      {hasSave && <button className="btn primary" onClick={onContinue}>つづきから</button>}
      <button className="btn primary" onClick={onNew}>{hasSave ? 'はじめから' : 'ゲーム開始'}</button>
    </div>
  )
}

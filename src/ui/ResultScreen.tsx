export function ResultScreen({ won, floor, onBack }: { won: boolean; floor: number; onBack: () => void }) {
  return (
    <div className="screen title">
      <h1>{won ? '塔を制覇した' : '力尽きた'}</h1>
      <p className="muted">{won ? '灰の王を討ち取った！' : `到達 ${floor + 1} 階`}</p>
      <button className="btn primary" onClick={onBack}>タイトルへ</button>
    </div>
  )
}

import { useGame } from './state/useGame'
import { CombatScreen } from './ui/CombatScreen'
import { RewardScreen } from './ui/RewardScreen'
import { DeckView } from './ui/DeckView'
import { TitleScreen } from './ui/TitleScreen'
import { ResultScreen } from './ui/ResultScreen'
import { TowerProgress } from './ui/TowerProgress'

export default function App() {
  const g = useGame()
  return (
    <div className="app">
      {g.run && (g.screen === 'combat' || g.screen === 'reward') && <TowerProgress run={g.run} />}
      {g.screen === 'title' && <TitleScreen hasSave={g.hasSave} onNew={g.newRun} onContinue={g.continueRun} />}
      {g.screen === 'combat' && g.combat && (
        <CombatScreen combat={g.combat} onPlay={g.play} onEndTurn={g.endTurn} onOpenDeck={g.openDeck} />
      )}
      {g.screen === 'reward' && <RewardScreen rewards={g.rewards} onChoose={g.chooseReward} />}
      {g.screen === 'deck' && g.run && <DeckView run={g.run} onClose={g.closeDeck} />}
      {g.screen === 'win' && g.run && <ResultScreen won floor={g.run.floor} onBack={g.backToTitle} />}
      {g.screen === 'lose' && g.run && <ResultScreen won={false} floor={g.run.floor} onBack={g.backToTitle} />}
    </div>
  )
}

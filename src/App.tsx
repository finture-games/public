import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from './store/game'
import PhoneFrame from './components/PhoneFrame'
import Toasts from './components/Toast'
import Splash from './screens/Splash'
import Login from './screens/Login'
import Consent from './screens/Consent'
import Home from './screens/Home'
import Rules from './screens/Rules'
import CharacterSelect from './screens/CharacterSelect'
import Game from './screens/Game'
import Result from './screens/Result'
import Reflection from './screens/Reflection'
import Evaluation from './screens/Evaluation'
import History from './screens/History'
import ProfileEdit from './screens/ProfileEdit'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const screenEl = (() => {
    switch (screen) {
      case 'splash':
        return <Splash />
      case 'login':
        return <Login />
      case 'consent':
        return <Consent />
      case 'home':
        return <Home />
      case 'rules':
        return <Rules />
      case 'character':
        return <CharacterSelect />
      case 'game':
        return <Game />
      case 'result':
        return <Result />
      case 'reflection':
        return <Reflection />
      case 'evaluation':
        return <Evaluation />
      case 'history':
        return <History />
      case 'profile':
        return <ProfileEdit />
      default:
        return <Splash />
    }
  })()

  return (
    <PhoneFrame>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="min-h-full"
        >
          {screenEl}
        </motion.div>
      </AnimatePresence>
      <Toasts />
    </PhoneFrame>
  )
}

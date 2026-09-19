import { Wordmark } from './components/Wordmark/Wordmark'
import { SocialLinks } from './components/SocialLinks/SocialLinks'
import { useTheme } from './hooks/useTheme'

export function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="landing" data-wordmark-scene aria-labelledby="page-title">
      <h1 id="page-title" className="sr-only">Nick Jensen — njen.io</h1>
      <div className="landing-content">
        <Wordmark theme={theme} onToggleTheme={toggleTheme} />
        <SocialLinks />
      </div>
    </main>
  )
}

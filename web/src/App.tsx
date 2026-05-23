import { useCallback, useState } from 'react'
import { Shell, type Tab } from './components/Shell'
import { WallView } from './components/WallView'
import { AddView } from './components/AddView'
import { useFaces } from './hooks/usePosts'

export default function App() {
  const [tab, setTab] = useState<Tab>('wall')
  const { faces, loading, addFace } = useFaces()

  const handleDone = useCallback(() => setTab('wall'), [])

  if (loading) {
    return (
      <Shell activeTab={tab} onTabChange={setTab} count={0}>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-[var(--muted)]">Loading faces...</div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell activeTab={tab} onTabChange={setTab} count={faces.length}>
      {tab === 'wall' && <WallView faces={faces} />}
      {tab === 'snap' && <AddView onSubmit={addFace} onDone={handleDone} />}
    </Shell>
  )
}

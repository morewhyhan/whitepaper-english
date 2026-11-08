'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react'
import {
  advanceSession,
  createInitialState,
  createSession,
  DEMO_WORDS,
  DEMO_NETWORKS,
  exportJson,
  exportMarkdown,
  getAssociation,
  type Judgement,
  type LearningView,
  normalizeNetworks,
  normalizeWords,
  pageWords,
  parseImport,
  toggleMark,
  type VocabularySession,
  type VocabularyState,
  type VocabularyWord,
} from '../lib/vocabulary'
import { AuthModal, useAuthSession, useSignOut } from '@/modules/auth'
import { useClearJudgements } from '../hooks/use-clear-judgements'
import { useAssociation } from '../hooks/use-association'
import { useDailySession, useSaveDailySession } from '../hooks/use-daily-session'
import { useResetToday } from '../hooks/use-reset-today'
import { useStudyHistory, type StudyHistoryDay } from '../hooks/use-study-history'
import { SettingsPanel } from './settings-panel'
import { useSaveJudgements } from '../hooks/use-save-judgements'
import styles from './vocabulary-screen.module.css'

const STORAGE_KEY = 'whitepaper-vocabulary-v2'

function speakWord(text: string) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 1
  window.speechSynthesis.speak(utterance)
}

type ModalName = 'import' | 'settings' | 'history' | null
type WorkspaceMode = 'vocabulary' | 'writing' | 'grammar'
type WordbookId = 'parallel-world' | 'starter'

type WordbookDefinition = {
  id: WordbookId
  title: string
  subtitle: string
  material: string
}

type ZenLayout = {
  columns: number
  rows: number
  count: number
  paperSide: number
}

const ZEN_WORDS_PER_SHEET = 36

const WORDBOOKS = [
  {
    id: 'parallel-world',
    title: '平行世界',
    subtitle: '英语的平行世界词书',
    material: '原始词书 · 3,975 词条',
  },
  {
    id: 'starter',
    title: '基础词书',
    subtitle: '工作台示例词书',
    material: `示例材料 · ${DEMO_WORDS.length} 词条`,
  },
] satisfies readonly WordbookDefinition[]

export function VocabularyScreen() {
  const today = useMemo(() => formatDate(new Date()), [])
  const fileInput = useRef<HTMLInputElement>(null)
  const paperRef = useRef<HTMLElement>(null)
  const paperMotion = useRef<Animation | null>(null)
  const [parallelState, setParallelState] = useState<VocabularyState>(createInitialState)
  const [starterState, setStarterState] = useState<VocabularyState>(createStarterState)
  const [activeBookId, setActiveBookId] = useState<WordbookId>('parallel-world')
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('vocabulary')
  const [hydrated, setHydrated] = useState(false)
  const [undoSession, setUndoSession] = useState<VocabularySession | null>(null)
  const [modal, setModal] = useState<ModalName>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const { data: authSession } = useAuthSession()
  const signOut = useSignOut()
  const saveJudgements = useSaveJudgements()
  const clearJudgements = useClearJudgements()
  const dailySession = useDailySession(activeBookId, today, Boolean(authSession?.user))
  const saveDailySession = useSaveDailySession()
  const resetTodayMutation = useResetToday()
  const studyHistory = useStudyHistory(
    activeBookId,
    30,
    Boolean(authSession?.user) && (modal === 'history' || settingsOpen),
  )
  const restoredSession = useRef<string | null>(null)
  const [clipOpen, setClipOpen] = useState(false)
  const [clipTarget, setClipTarget] = useState<WorkspaceMode | null>(null)
  const [paste, setPaste] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [shelfOpen, setShelfOpen] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [zenLayout, setZenLayout] = useState<ZenLayout>({
    columns: 1,
    rows: 1,
    count: 1,
    paperSide: 1,
  })

  const state = activeBookId === 'parallel-world' ? parallelState : starterState

  useEffect(() => {
    const loaded = loadState()
    const loadedStarter = createStarterState()
    ensureTodaySession(loaded, today)
    ensureTodaySession(loadedStarter, today)
    // Hydration is the synchronization boundary for browser-local learning state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParallelState(loaded)
    setStarterState(loadedStarter)
    saveState(loaded)
    setHydrated(true)

    const savedBook = window.localStorage.getItem('whitepaper-active-book')
    if (savedBook === 'starter') setActiveBookId('starter')
    setSoundOn(window.localStorage.getItem('whitepaper-sound') !== 'off')
  }, [today])

  useEffect(() => {
    const remote = dailySession.data?.session
    if (!remote || !hydrated || !authSession?.user) return

    const key = `${activeBookId}:${today}`
    if (restoredSession.current === key) return
    restoredSession.current = key

    if (remote.cursor > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUndoSession({
        round: remote.round,
        ids: remote.ids,
        cursor: Math.max(0, remote.cursor - 36),
        missed: remote.missed,
        marks: {},
        mode: state.settings.mode,
        groups: state.settings.groups,
        view: 'scan',
        history: remote.history,
        complete: false,
        peek: false,
      })
    }

    const apply = (current: VocabularyState): VocabularyState => {
      const local = current.sessions[today] ?? createSession(current.words, current.settings)
      if (local.cursor === remote.cursor && local.round === remote.round) return current

      return {
        ...current,
        sessions: {
          ...current.sessions,
          [today]: {
            ...local,
            round: remote.round,
            cursor: remote.cursor,
            ids: remote.ids,
            missed: remote.missed,
            history: remote.history,
            complete: remote.complete,
            marks: {},
          },
        },
      }
    }

    if (activeBookId === 'parallel-world') setParallelState(apply)
    else setStarterState(apply)
  }, [dailySession.data, hydrated, authSession?.user, activeBookId, today])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 2500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const session = hydrated ? state.sessions[today] : createSession(state.words, state.settings)
  const currentWords = pageWords(state.words, session)
  const zenPages = useMemo(() => buildZenPages(state.words, session), [state.words, session])
  const zenMaxWordLength = useMemo(
    () => Math.max(1, ...zenPages.flat().map((word) => word.en.length)),
    [zenPages],
  )

  useEffect(() => {
    if (!zenMode) return
    const updateLayout = () => {
      setZenLayout(
        calculateZenLayout({
          width: window.innerWidth,
          height: window.innerHeight,
          pageCount: zenPages.length,
          maxWordLength: zenMaxWordLength,
        }),
      )
    }
    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [zenMode, zenMaxWordLength, zenPages.length])

  useEffect(() => {
    if (!zenMode) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZenMode(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [zenMode])
  function commit(next: VocabularyState) {
    if (activeBookId === 'parallel-world') {
      setParallelState(next)
      saveState(next)
    } else {
      setStarterState(next)
    }
  }

  function updateSession(updater: (current: VocabularySession) => VocabularySession) {
    const current = state.sessions[today] ?? createSession(state.words, state.settings)
    const next = updater(current)
    commit({ ...state, sessions: { ...state.sessions, [today]: next } })
  }

  function updateSettings(nextSettings: VocabularyState['settings']) {
    const current = state.sessions[today]
    const nextState: VocabularyState = {
      ...state,
      settings: nextSettings,
      sessions: {
        ...state.sessions,
        [today]: current
          ? { ...current, mode: nextSettings.mode, groups: nextSettings.groups }
          : createSession(state.words, nextSettings),
      },
    }
    commit(nextState)
  }

  function handleWordClick(id: string, reverse: boolean) {
    if (soundOn) speakWord(state.words.find((word) => word.id === id)?.en ?? '')
    const mark: Judgement = reverse
      ? session.mode === 'known'
        ? 'unknown'
        : 'known'
      : session.mode
    updateSession((current) => toggleMark(current, id, mark))
  }

  function handleMark(id: string, mark: Judgement) {
    updateSession((current) => {
      const marks = { ...current.marks, [id]: mark }
      return { ...current, marks }
    })
  }

  async function commitCurrentPage(size?: number) {
    if (!authSession?.user) return true

    const currentPage = pageWords(state.words, session, size)
    const judgements = currentPage.map((word) => ({
      word: word.en,
      known:
        (session.marks[word.id] ?? (session.mode === 'known' ? 'unknown' : 'known')) === 'known',
    }))
    if (!judgements.length) return true

    try {
      await saveJudgements.mutateAsync({ bookId: activeBookId, date: today, judgements })
      return true
    } catch {
      setNotice('判定提交失败，请重试')
      return false
    }
  }

  function persistSession(next: VocabularySession) {
    if (!authSession?.user) return

    void saveDailySession.mutate({
      bookId: activeBookId,
      date: today,
      session: {
        round: next.round,
        cursor: next.cursor,
        ids: next.ids,
        missed: next.missed,
        history: next.history,
        complete: next.complete,
      },
    })
  }

  async function handleNext() {
    if (session.complete) return
    if (!(await commitCurrentPage())) return

    const next = advanceSession(session, state.words)
    setUndoSession(session)
    updateSession(() => next)
    persistSession(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  async function handleZenNext() {
    if (session.complete) return
    const pageSize = Math.max(1, zenLayout.count) * ZEN_WORDS_PER_SHEET
    if (!(await commitCurrentPage(pageSize))) return

    const next = advanceSession(session, state.words, { pageSize })
    setUndoSession(session)
    updateSession(() => next)
    persistSession(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  async function handleUndo() {
    if (!undoSession) return

    if (authSession?.user) {
      const page = pageWords(state.words, undoSession)
      try {
        await clearJudgements.mutateAsync({
          bookId: activeBookId,
          date: today,
          words: page.map((word) => word.en),
        })
      } catch {
        setNotice('撤销失败，请重试')
        return
      }
    }

    const next = { ...undoSession, marks: {} }
    updateSession(() => next)
    persistSession(next)
    setUndoSession(null)
    setNotice('已撤销上一页')
  }

  function switchView(view: LearningView) {
    updateSession((current) => ({ ...current, view, peek: false }))
  }

  function switchWordbook(id: WordbookId) {
    window.localStorage.setItem('whitepaper-active-book', id)
    const source = document.querySelector(`[data-wordbook="${id}"]`)
    const paper = paperRef.current
    if (source && paper && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paperMotion.current?.cancel()
      const from = source.getBoundingClientRect()
      const to = paper.getBoundingClientRect()
      paperMotion.current = paper.animate(
        [
          {
            transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height}) rotate(-3deg)`,
            opacity: 0.35,
          },
          { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        ],
        { duration: 460, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      )
    }
    setActiveBookId(id)
    setUndoSession(null)
    const wordbook = WORDBOOKS.find((item) => item.id === id)
    setNotice(`已打开${wordbook?.title ?? '词书'}纸摞`)
  }

  function switchWorkspaceMode(mode: WorkspaceMode) {
    setWorkspaceMode(mode)
    setClipOpen(false)
    setClipTarget(null)
  }

  function enterZenMode() {
    if (session.view !== 'scan') {
      updateSession((current) => ({ ...current, view: 'scan', peek: false }))
    }
    setZenLayout(
      calculateZenLayout({
        width: window.innerWidth,
        height: window.innerHeight,
        pageCount: zenPages.length,
        maxWordLength: zenMaxWordLength,
      }),
    )
    setZenMode(true)
  }

  function chooseClipTarget(target: WorkspaceMode) {
    setClipTarget(target)
    setNotice(
      target === 'vocabulary'
        ? '已生成词汇纸之间的剪贴预览'
        : '已生成带来源标记的剪贴预览，目标模块暂未开放',
    )
  }

  function replaceWordlist(words: VocabularyWord[], networks = DEMO_NETWORKS) {
    const nextState: VocabularyState = {
      ...state,
      words,
      networks,
      sessions: { [today]: createSession(words, state.settings) },
    }
    setUndoSession(null)
    commit(nextState)
    setModal(null)
    setPaste('')
    setNotice(`已导入 ${words.length} 词，开始第 1 轮`)
  }

  function handlePasteImport() {
    try {
      const imported = parseImport(paste)
      replaceWordlist(imported.words, imported.networks ?? DEMO_NETWORKS)
    } catch (error) {
      setNotice(`导入失败：${error instanceof Error ? error.message : '格式无法识别'}`)
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const imported = parseImport(await file.text(), file.name)
      if (window.confirm(`导入 ${imported.words.length} 个词并重新开始今天？`)) {
        replaceWordlist(imported.words, imported.networks ?? DEMO_NETWORKS)
      }
    } catch (error) {
      setNotice(`无法导入：${error instanceof Error ? error.message : '格式无法识别'}`)
    } finally {
      event.target.value = ''
    }
  }

  async function resetToday() {
    if (!window.confirm('确定清空今天的轮次记录，从完整词库重新开始吗？')) return

    if (authSession?.user) {
      try {
        await resetTodayMutation.mutateAsync({ bookId: activeBookId, date: today })
      } catch {
        setNotice('重置失败，请重试')
        return
      }
    }

    updateSession(() => createSession(state.words, state.settings))
    setUndoSession(null)
    setModal(null)
    setNotice('已重新开始今天的学习')
  }

  function download(name: string, content: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (!hydrated) {
    return <main className={styles.loading}>正在打开你的白纸……</main>
  }

  const total = session.ids.length
  const markedUnknown = Object.values(session.marks).filter((mark) => mark === 'unknown').length
  const progress = total ? Math.round((session.cursor * 100) / total) : 100

  return (
    <main className={`${styles.layout} ${zenMode ? styles.zenLayout : ''}`}>
      <header className={styles.top}>
        <div className={styles.brand}>
          白纸 <small>MEMORY, IN THE OPEN.</small>
        </div>
        <div className={styles.topActions}>
          <button
            className={styles.quiet}
            type="button"
            aria-expanded={shelfOpen}
            disabled={workspaceMode !== 'vocabulary'}
            onClick={() => setShelfOpen(!shelfOpen)}
          >
            词书
          </button>
          <button
            className={styles.quiet}
            type="button"
            disabled={workspaceMode !== 'vocabulary'}
            onClick={enterZenMode}
          >
            禅模式
          </button>
          {authSession?.user ? (
            <button
              className={styles.quiet}
              type="button"
              title={authSession.user.email}
              onClick={() => signOut.mutate()}
            >
              退出
            </button>
          ) : (
            <button className={styles.quiet} type="button" onClick={() => setAuthOpen(true)}>
              登录
            </button>
          )}
          <button className={styles.quiet} type="button" onClick={() => setSettingsOpen(true)}>
            设置
          </button>
          <button className={styles.quiet} type="button" onClick={() => setClipOpen(true)}>
            剪到另一张纸
          </button>
        </div>
        <nav className={styles.workspaceNav} aria-label="学习模块">
          <div className={styles.moduleTabs} role="tablist" aria-label="白纸学习模块">
            <button
              className={workspaceMode === 'vocabulary' ? styles.activeModule : undefined}
              type="button"
              role="tab"
              aria-selected={workspaceMode === 'vocabulary'}
              onClick={() => switchWorkspaceMode('vocabulary')}
            >
              背单词
            </button>
            <button
              className={workspaceMode === 'writing' ? styles.activeModule : undefined}
              type="button"
              role="tab"
              aria-selected={workspaceMode === 'writing'}
              onClick={() => switchWorkspaceMode('writing')}
            >
              写作 <span>暂未开放</span>
            </button>
            <button
              className={workspaceMode === 'grammar' ? styles.activeModule : undefined}
              type="button"
              role="tab"
              aria-selected={workspaceMode === 'grammar'}
              onClick={() => switchWorkspaceMode('grammar')}
            >
              学语法 <span>暂未开放</span>
            </button>
          </div>
        </nav>
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      <div className={styles.workspaceBody}>
        {workspaceMode === 'vocabulary' && (
          <div
            className={`${styles.shelfDock} ${shelfOpen ? styles.shelfDockOpen : ''}`}
            onPointerEnter={() => setShelfOpen(true)}
            onPointerLeave={() => setShelfOpen(false)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setShelfOpen(false)
            }}
          >
            <button
              className={styles.shelfHandle}
              type="button"
              aria-label="打开词书"
              aria-expanded={shelfOpen}
              onClick={() => setShelfOpen(true)}
            />
            <WordbookShelf activeBookId={activeBookId} onSelect={switchWordbook} />
          </div>
        )}
        <div className={styles.workspaceContent}>
          {workspaceMode === 'vocabulary' ? (
            <>
              <div className={styles.toolbar}>
                <div className={styles.segment} aria-label="本页学习呈现方式">
                  <button
                    className={session.view === 'scan' ? styles.activeSegment : undefined}
                    type="button"
                    aria-pressed={session.view === 'scan'}
                    onClick={() => switchView('scan')}
                  >
                    九宫格扫词
                  </button>
                  <button
                    className={session.view === 'connect' ? styles.activeSegment : undefined}
                    type="button"
                    aria-pressed={session.view === 'connect'}
                    onClick={() => switchView('connect')}
                  >
                    关联辅助
                  </button>
                </div>
              </div>
              <div className={styles.paperStage}>
                <PaperSurface
                  key={`${session.round}-${session.cursor}-${session.view}`}
                  paperRef={paperRef}
                  ariaLabel="一张可交互的 A4 记忆纸"
                >
                  <div className={styles.paperHeader}>
                    <div>
                      <div className={styles.kicker}>
                        {WORDBOOKS.find((book) => book.id === activeBookId)?.subtitle} ·{' '}
                        {state.words.length} 词条
                      </div>
                      <h1 className={styles.roundHeading}>
                        {session.complete ? '今日清零' : `第 ${session.round} 轮`}
                      </h1>
                      <div className={styles.roundSummary}>
                        {session.complete
                          ? '全部单词已完成本日筛选'
                          : `本轮 ${total} 词 · 同一轮可随时切换学习方式`}
                      </div>
                    </div>
                    <div className={styles.paperRight}>
                      <div className={styles.metric}>
                        {session.complete ? (
                          <>
                            全部 <strong>{state.words.length}</strong> 词已覆盖
                          </>
                        ) : (
                          <>
                            已扫 <strong>{Math.min(session.cursor, total)}</strong> / {total}
                            <br />
                            下一轮待复习 <strong>{session.missed.length + markedUnknown}</strong> 词
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.track} aria-label="本轮进度">
                    <div style={{ width: `${session.complete ? 100 : progress}%` }} />
                  </div>

                  {session.complete ? (
                    <Completion words={state.words.length} rounds={session.history.length} />
                  ) : session.view === 'scan' ? (
                    <ScanView
                      words={currentWords}
                      session={session}
                      onWordClick={handleWordClick}
                    />
                  ) : (
                    <AssociationView
                      words={currentWords}
                      allWords={state.words}
                      session={session}
                      networks={state.networks}
                      onWordClick={handleWordClick}
                      onMark={handleMark}
                      onFocus={(id) => focusWord(id, session, state, commit, today)}
                    />
                  )}

                  <div className={styles.pageFoot}>
                    <span>
                      {session.complete
                        ? 'DAY COMPLETE'
                        : session.view === 'scan'
                          ? 'INSTANT RECALL'
                          : 'ASSOCIATIVE RECALL'}
                    </span>
                    <span>
                      {session.complete
                        ? 'ALL CLEAR'
                        : `${Math.min(session.cursor + 1, total)}—${Math.min(session.cursor + currentWords.length, total)} / ${total}`}
                    </span>
                  </div>
                </PaperSurface>
                <div className={styles.paperAdvance}>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={session.complete}
                    onClick={handleNext}
                    aria-label={
                      session.complete
                        ? '今日已清零'
                        : session.view === 'connect'
                          ? '下一个词'
                          : '下一页'
                    }
                  >
                    {session.complete ? '已清零' : session.view === 'connect' ? '下一词' : '下一页'}
                  </button>
                </div>
              </div>

              <div className={styles.controls}>
                <div className={styles.pageNumber}>
                  {session.complete
                    ? '今日任务完成'
                    : session.view === 'connect'
                      ? `本词 ${Math.min(session.cursor + 1, total)} / ${total}`
                      : `本页 ${Math.min(session.cursor + 1, total)}—${Math.min(session.cursor + currentWords.length, total)} / ${total}`}
                </div>
                <div className={styles.buttonRow}>
                  <button
                    className={styles.plainButton}
                    type="button"
                    disabled={!undoSession}
                    onClick={handleUndo}
                  >
                    撤销上一页
                  </button>
                  <button
                    className={styles.plainButton}
                    type="button"
                    disabled={session.complete}
                    onClick={() =>
                      updateSession((current) => ({ ...current, peek: !current.peek }))
                    }
                  >
                    {session.peek ? '隐藏' : '显示'}未会释义
                  </button>
                </div>
              </div>

              <RoundTrack session={session} onOpen={() => setModal('history')} />
              <p className={styles.helpLine}>
                一张纸、一套轮次。浅绿 = 会，浅红 = 不会。普通点击：标
                {session.mode === 'unknown' ? '不会' : '会'} · Shift＋点击：反向 · 手动推进。
              </p>
            </>
          ) : (
            <>
              <div className={styles.toolbar}>
                <div className={styles.segment} aria-label="当前模块状态">
                  <button className={styles.activeSegment} type="button" disabled>
                    {workspaceMode === 'writing' ? '写作' : '语法'}
                  </button>
                </div>
              </div>
              <div className={styles.paperStage}>
                <UnavailableModule mode={workspaceMode} />
              </div>
            </>
          )}
        </div>
      </div>

      {zenMode && (
        <ZenCanvas
          pages={zenPages}
          session={session}
          layout={zenLayout}
          totalWords={state.words.length}
          onWordClick={handleWordClick}
          onNext={handleZenNext}
          onExit={() => setZenMode(false)}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          session={session}
          history={studyHistory.data ?? []}
          soundOn={soundOn}
          email={authSession?.user.email}
          bookTitle={WORDBOOKS.find((book) => book.id === activeBookId)?.title ?? '平行世界'}
          onToggleSound={() => {
            const next = !soundOn
            setSoundOn(next)
            window.localStorage.setItem('whitepaper-sound', next ? 'on' : 'off')
          }}
          onModeChange={(mode) => updateSettings({ ...state.settings, mode })}
          onReset={resetToday}
          onLogin={() => {
            setSettingsOpen(false)
            setAuthOpen(true)
          }}
          onLogout={() => signOut.mutate()}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {modal && (
        <Modal
          name={modal}
          state={state}
          session={session}
          accountHistory={studyHistory.data ?? []}
          paste={paste}
          onPasteChange={setPaste}
          onClose={() => setModal(null)}
          onChooseFile={() => fileInput.current?.click()}
          onImport={handlePasteImport}
          onExportJson={() =>
            download('whitepaper-vocabulary.json', exportJson(state), 'application/json')
          }
          onExportMarkdown={() =>
            download('whitepaper-vocabulary.md', exportMarkdown(state), 'text/markdown')
          }
          onRestore={() => replaceWordlist(createInitialState().words, DEMO_NETWORKS)}
          onReset={resetToday}
          onModeChange={(mode) => updateSettings({ ...state.settings, mode })}
          onGroupsChange={(groups) => updateSettings({ ...state.settings, groups })}
        />
      )}
      {clipOpen && (
        <ClipDialog
          source={
            workspaceMode === 'vocabulary'
              ? `${WORDBOOKS.find((item) => item.id === activeBookId)?.title ?? '当前'}词汇纸`
              : workspaceMode === 'writing'
                ? '当前写作纸'
                : '当前语法纸'
          }
          selectedTarget={clipTarget}
          onSelect={chooseClipTarget}
          onClose={() => {
            setClipOpen(false)
            setClipTarget(null)
          }}
        />
      )}
      <input
        ref={fileInput}
        type="file"
        accept=".csv,.tsv,.txt,.json"
        hidden
        onChange={handleFileChange}
      />
      {notice && <div className={styles.toast}>{notice}</div>}
    </main>
  )
}

function buildZenPages(words: VocabularyWord[], session: VocabularySession): VocabularyWord[][] {
  const byId = new Map(words.map((word) => [word.id, word]))
  const pages: VocabularyWord[][] = []
  const remainingIds = session.ids.slice(session.cursor)

  for (let index = 0; index < remainingIds.length; index += ZEN_WORDS_PER_SHEET) {
    const page = remainingIds
      .slice(index, index + ZEN_WORDS_PER_SHEET)
      .map((id) => byId.get(id))
      .filter((word): word is VocabularyWord => Boolean(word))
    if (page.length) pages.push(page)
  }

  return pages
}

function calculateZenLayout({
  width,
  height,
  pageCount,
  maxWordLength,
}: {
  width: number
  height: number
  pageCount: number
  maxWordLength: number
}): ZenLayout {
  const padding = Math.max(12, Math.min(42, width * 0.02, height * 0.02))
  const gap = Math.max(12, Math.min(24, width * 0.014))
  const availableWidth = Math.max(1, width - padding * 2)
  const availableHeight = Math.max(1, height - padding * 2)
  const minimumPaperWidth = Math.max(
    width < 720 ? 420 : 500,
    Math.min(620, 320 + maxWordLength * 8),
  )
  let best: ZenLayout & { paperWidth: number; coverage: number } = {
    columns: 1,
    rows: 1,
    count: Math.min(1, pageCount),
    paperSide: Math.min(availableWidth, availableHeight),
    paperWidth: Math.max(1, availableWidth),
    coverage: Math.min(1, pageCount) * Math.min(availableWidth, availableHeight) ** 2,
  }

  for (let columns = 1; columns <= 8; columns += 1) {
    const paperWidth = (availableWidth - gap * (columns - 1)) / columns
    if (paperWidth < minimumPaperWidth) continue

    for (let rows = 1; rows <= 8; rows += 1) {
      const rowHeight = (availableHeight - gap * (rows - 1)) / rows
      const paperSide = Math.min(paperWidth, rowHeight)
      if (paperSide < minimumPaperWidth) continue

      const count = Math.min(pageCount, columns * rows)
      const coverage = count * paperSide ** 2
      if (
        coverage > best.coverage ||
        (coverage === best.coverage && paperSide > best.paperSide) ||
        (coverage === best.coverage && paperSide === best.paperSide && count > best.count)
      ) {
        best = { columns, rows, count, paperSide, paperWidth, coverage }
      }
    }
  }

  return {
    columns: best.columns,
    rows: best.rows,
    count: Math.max(1, best.count),
    paperSide: best.paperSide,
  }
}

function ZenCanvas({
  pages,
  session,
  layout,
  totalWords,
  onWordClick,
  onNext,
  onExit,
}: {
  pages: VocabularyWord[][]
  session: VocabularySession
  layout: ZenLayout
  totalWords: number
  onWordClick: (id: string, reverse: boolean) => void
  onNext: () => void
  onExit: () => void
}) {
  return (
    <div className={styles.zenCanvas} aria-label="禅模式纸张网格">
      <button className={styles.zenExit} type="button" aria-label="退出禅模式" onClick={onExit}>
        × <span>退出禅模式</span>
      </button>
      <div
        className={styles.zenGrid}
        style={{
          gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
        }}
      >
        {session.complete ? (
          <section className={styles.zenSheet} aria-label="禅模式完成纸">
            <Completion words={totalWords} rounds={session.history.length} />
          </section>
        ) : (
          pages
            .slice(0, Math.max(1, layout.count))
            .map((words, index) => (
              <ZenSheet
                key={`${session.round}-${session.cursor}-${index}`}
                words={words}
                session={session}
                index={index}
                paperSide={layout.paperSide}
                onWordClick={onWordClick}
              />
            ))
        )}
      </div>
      <div className={styles.zenAdvance}>
        <button
          className={styles.primaryButton}
          type="button"
          disabled={session.complete}
          onClick={onNext}
          aria-label={session.complete ? '今日已清零' : '下一页'}
        >
          {session.complete ? '已清零' : '下一页'}
        </button>
      </div>
    </div>
  )
}

function ZenSheet({
  words,
  session,
  index,
  paperSide,
  onWordClick,
}: {
  words: VocabularyWord[]
  session: VocabularySession
  index: number
  paperSide: number
  onWordClick: (id: string, reverse: boolean) => void
}) {
  return (
    <PaperSurface
      className={styles.zenSheet}
      role="region"
      ariaLabel={`禅模式第 ${index + 1} 张纸`}
      style={{ width: paperSide, height: paperSide }}
    >
      <div className={styles.zenSheetHeader}>
        <span>WHITEPAPER / {session.round}</span>
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <ScanGrid
        words={words}
        session={session}
        variant="zen"
        sheetIndex={index}
        onWordClick={onWordClick}
      />
      <div className={styles.zenSheetFooter}>INSTANT RECALL</div>
    </PaperSurface>
  )
}

function WordbookShelf({
  activeBookId,
  onSelect,
}: {
  activeBookId: WordbookId
  onSelect: (id: WordbookId) => void
}) {
  return (
    <aside className={styles.shelf} aria-label="词书纸摞">
      <div className={styles.shelfHeading}>
        <span className={styles.shelfLabel}>词书纸摞</span>
        <span className={styles.shelfCount}>2 本</span>
      </div>
      <p className={styles.shelfIntro}>点开一摞纸，右侧就是它当前的活动纸。</p>
      <div className={styles.bookStack}>
        {WORDBOOKS.map((book, index) => (
          <button
            className={`${styles.bookCard} ${activeBookId === book.id ? styles.selectedBook : ''}`}
            type="button"
            key={book.id}
            data-wordbook={book.id}
            aria-pressed={activeBookId === book.id}
            onClick={() => onSelect(book.id)}
          >
            <span className={styles.bookCardEdge}>{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.bookCardTitle}>{book.title}</span>
            <span className={styles.bookCardSubtitle}>{book.subtitle}</span>
            <span className={styles.bookCardMaterial}>{book.material}</span>
            {activeBookId === book.id && <span className={styles.bookCardStatus}>当前活动纸</span>}
          </button>
        ))}
      </div>
      <div className={styles.shelfRule} />
      <p className={styles.shelfNote}>每一摞纸都有自己的学习上下文。切换不会覆盖另一摞。</p>
    </aside>
  )
}

function UnavailableModule({ mode }: { mode: Exclude<WorkspaceMode, 'vocabulary'> }) {
  const isWriting = mode === 'writing'
  return (
    <section className={styles.unavailablePaper} aria-label={isWriting ? '写作页面' : '语法页面'}>
      <div className={styles.unavailableHeader}>
        <span className={styles.kicker}>{isWriting ? 'FREE WRITING PAPER' : 'GRAMMAR PAPER'}</span>
        <span className={styles.unavailableBadge}>暂未开放</span>
      </div>
      <div className={styles.unavailableCenter}>
        <div className={styles.unavailableMark}>{isWriting ? 'W' : 'G'}</div>
        <h1>{isWriting ? '写作白纸' : '语法机制'}</h1>
        <p>
          {isWriting
            ? '这里会是一张可以直接写任何英语的纸。当前先保留页面形态，输入和保存将在第二阶段开放。'
            : '这里会按低级、中级和高级组织语法机制。当前先保留三级入口，实际学习功能暂不开放。'}
        </p>
        {isWriting ? (
          <textarea
            className={styles.previewTextarea}
            disabled
            placeholder="写作功能将在第二阶段开放"
            aria-label="暂未开放的写作输入框"
          />
        ) : (
          <div className={styles.grammarLevels} aria-label="语法等级">
            {['低级语法', '中级语法', '高级语法'].map((level) => (
              <button className={styles.levelCard} type="button" disabled key={level}>
                <span>{level}</span>
                <small>暂未开放</small>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={styles.unavailableFoot}>白纸英语 · 当前只开放词汇学习</div>
    </section>
  )
}

function ClipDialog({
  source,
  selectedTarget,
  onSelect,
  onClose,
}: {
  source: string
  selectedTarget: WorkspaceMode | null
  onSelect: (target: WorkspaceMode) => void
  onClose: () => void
}) {
  const targets = [
    { id: 'vocabulary', label: '词汇纸', detail: '保存为另一张词汇纸的剪贴片段' },
    { id: 'writing', label: '写作纸', detail: '作为写作时可回看的词或句子' },
    { id: 'grammar', label: '语法纸', detail: '作为机制学习的真实情境' },
  ] satisfies Array<{ id: WorkspaceMode; label: string; detail: string }>

  return (
    <div
      className={styles.dialogBackdrop}
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="clip-title">
        <div className={styles.rowBetween}>
          <h2 id="clip-title">剪到另一张纸</h2>
          <button className={styles.quiet} type="button" onClick={onClose}>
            关闭 ×
          </button>
        </div>
        <p>
          当前来源是 <strong>{source}</strong>。这是交互预览，原文不会消失，目标纸会保留来源标记。
        </p>
        <div className={styles.clipTargets}>
          {targets.map((target) => (
            <button
              className={`${styles.clipTarget} ${selectedTarget === target.id ? styles.selectedClip : ''}`}
              type="button"
              aria-pressed={selectedTarget === target.id}
              key={target.id}
              onClick={() => onSelect(target.id)}
            >
              <span>{target.label}</span>
              <small>{target.detail}</small>
            </button>
          ))}
        </div>
        {selectedTarget && (
          <p className={styles.clipNotice}>
            已选目标。当前只生成带来源的交互预览，实际跨纸张保存将在联动规则确定后开放。
          </p>
        )}
      </div>
    </div>
  )
}

function ScanView({
  words,
  session,
  onWordClick,
}: {
  words: VocabularyWord[]
  session: VocabularySession
  onWordClick: (id: string, reverse: boolean) => void
}) {
  return (
    <div className={styles.paperInner}>
      <div className={styles.scanWrap}>
        <ScanGrid words={words} session={session} variant="workspace" onWordClick={onWordClick} />
      </div>
    </div>
  )
}

function ScanGrid({
  words,
  session,
  variant,
  sheetIndex,
  onWordClick,
}: {
  words: VocabularyWord[]
  session: VocabularySession
  variant: 'workspace' | 'zen'
  sheetIndex?: number
  onWordClick: (id: string, reverse: boolean) => void
}) {
  const groupCount = variant === 'zen' ? 4 : Math.max(1, Math.ceil(words.length / 9))
  const rootClass =
    variant === 'zen'
      ? styles.zenSheetGrid
      : `${styles.gridShell} ${session.groups === 6 ? styles.six : ''}`
  const groupClass = variant === 'zen' ? styles.zenQuadrant : styles.nine

  return (
    <div className={rootClass}>
      {Array.from({ length: groupCount }, (_, groupIndex) => (
        <div
          className={groupClass}
          key={`grid-${groupIndex}`}
          role={variant === 'zen' ? 'group' : undefined}
          aria-label={
            variant === 'zen'
              ? `禅模式第 ${(sheetIndex ?? 0) + 1} 张纸第 ${groupIndex + 1} 个九宫格`
              : `第 ${groupIndex + 1} 组九宫格`
          }
        >
          {words.slice(groupIndex * 9, groupIndex * 9 + 9).map((word, wordIndex) => (
            <WordButton
              key={word.id}
              word={word}
              session={session}
              onWordClick={onWordClick}
              style={
                variant === 'zen'
                  ? {
                      gridColumn: (groupIndex % 2) * 3 + (wordIndex % 3) + 1,
                      gridRow: Math.floor(groupIndex / 2) * 3 + Math.floor(wordIndex / 3) + 1,
                    }
                  : undefined
              }
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PaperSurface({
  children,
  paperRef,
  className,
  ariaLabel,
  role,
  style,
}: {
  children: ReactNode
  paperRef?: Ref<HTMLElement>
  className?: string
  ariaLabel: string
  role?: 'region'
  style?: CSSProperties
}) {
  return (
    <section
      ref={paperRef}
      className={`${styles.paper} ${className ?? ''}`.trim()}
      role={role}
      aria-label={ariaLabel}
      style={style}
    >
      {children}
    </section>
  )
}

function AssociationView({
  words,
  allWords,
  session,
  networks,
  onWordClick,
  onMark,
  onFocus,
}: {
  words: VocabularyWord[]
  allWords: VocabularyWord[]
  session: VocabularySession
  networks: VocabularyState['networks']
  onWordClick: (id: string, reverse: boolean) => void
  onMark: (id: string, mark: Judgement) => void
  onFocus: (id: string) => void
}) {
  const word = words[0]
  const remoteNetwork = useAssociation(word?.en ?? '')
  if (!word) return <div className={styles.paperInner} />
  const network = remoteNetwork.data ?? getAssociation(networks, word)
  const mark = session.marks[word.id]

  return (
    <div className={styles.paperInner}>
      <div className={styles.assocWrap}>
        <div className={styles.assocMeta}>
          <span>ONE TARGET · EIGHT ASSOCIATIONS</span>
          <div className={styles.assocPicker}>
            <span>
              第 {session.cursor + 1} / {session.ids.length} 词
            </span>
            <select
              className={styles.picker}
              aria-label="换一个本轮待学词"
              value={word.id}
              onChange={(event) => onFocus(event.target.value)}
            >
              {session.ids.slice(session.cursor, session.cursor + 36).map((id, index) => {
                const choice = allWords.find((item) => item.id === id)
                return choice ? (
                  <option key={id} value={id}>
                    {index + 1}. {choice.en}
                  </option>
                ) : null
              })}
            </select>
          </div>
        </div>
        {network ? (
          <div className={styles.assocBoard}>
            {network.links.map((link) => (
              <div className={styles.assocNode} key={link.word}>
                <div className={styles.assocWord}>{link.word}</div>
                <div className={styles.assocSentence}>{highlight(link.sentence, link.word)}</div>
              </div>
            ))}
            <div className={styles.assocCenter}>
              <button
                className={`${styles.centerChip} ${mark ? markClass(mark) : ''}`}
                type="button"
                title="点击按当前模式判定，Shift+点击反向"
                onClick={(event) => onWordClick(word.id, event.shiftKey)}
              >
                <span className={styles.targetNote}>TARGET WORD</span>
                <span className={styles.targetEn}>{word.en}</span>
                <span className={styles.targetZh}>
                  {mark === 'unknown' ? word.zh || '暂无释义' : '\u00a0'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.assocNoData}>
            <div className={styles.kicker}>NO VERIFIED CONNECTIONS YET</div>
            <h2>{word.en}</h2>
            <p>
              这个词还没有预先校验的 1:8
              英文关联句。关联句不会凭空拼凑；你仍然可以标记它，并继续当前轮次。
            </p>
            <p className={styles.hint}>
              当前词暂时没有可用的关联数据，你仍然可以标记它并继续当前轮次。
            </p>
          </div>
        )}
        <p className={styles.assocHelp}>
          关联辅助只聚焦一个词，保证句子清晰。点「下一词」后仅提交当前词；切回九宫格仍接着同一轮继续。
        </p>
        <div className={styles.assocActionRow}>
          <button
            className={`${styles.actionKnown} ${mark === 'known' ? styles.active : ''}`}
            type="button"
            onClick={() => onMark(word.id, 'known')}
          >
            ✓ 会了
          </button>
          <button
            className={`${styles.actionUnknown} ${mark === 'unknown' ? styles.active : ''}`}
            type="button"
            onClick={() => onMark(word.id, 'unknown')}
          >
            × 不会 · 显示中文
          </button>
        </div>
      </div>
    </div>
  )
}

function WordButton({
  word,
  session,
  onWordClick,
  style,
}: {
  word: VocabularyWord
  session: VocabularySession
  onWordClick: (id: string, reverse: boolean) => void
  style?: CSSProperties
}) {
  const mark = session.marks[word.id]
  const previewUnknown = !mark && session.peek && session.mode === 'unknown'
  const className = [
    styles.word,
    mark ? markClass(mark) : '',
    previewUnknown ? styles.unknownPreview : '',
  ].join(' ')
  return (
    <button
      className={className}
      type="button"
      style={style}
      aria-label={`${word.en}, ${mark || (previewUnknown ? '不会预览' : '未判定')}`}
      title={`普通点击标${session.mode === 'unknown' ? '不会' : '会'}；Shift＋点击反向`}
      onClick={(event) => onWordClick(word.id, event.shiftKey)}
      onContextMenu={(event) => {
        event.preventDefault()
        onWordClick(word.id, true)
      }}
    >
      <span className={`${styles.zh} ${mark === 'unknown' || previewUnknown ? '' : styles.empty}`}>
        {mark === 'unknown' || previewUnknown ? word.zh || '暂无释义' : '—'}
      </span>
      <span className={styles.en}>{word.en}</span>
    </button>
  )
}

function markClass(mark: Judgement) {
  return mark === 'known' ? styles.known : styles.unknown
}

function Completion({ words, rounds }: { words: number; rounds: number }) {
  return (
    <div className={styles.complete}>
      <div className={styles.completionMark}>✓</div>
      <h2>今天，清零了。</h2>
      <p>
        完整词库共 {words} 词，本日已经完成 {rounds} 轮。
      </p>
      <p>这是今日的直觉识别通关，不等于永久掌握。</p>
    </div>
  )
}

function RoundTrack({ session, onOpen }: { session: VocabularySession; onOpen: () => void }) {
  const items = [
    ...session.history.map((history) => ({ ...history, current: false })),
    ...(!session.complete
      ? [
          {
            round: session.round,
            total: session.ids.length,
            missed: session.missed.length,
            current: true,
          },
        ]
      : []),
  ]
  return (
    <section className={styles.roundTrack}>
      <div className={styles.roundTrackHeader}>
        <div>
          <strong>今日轮次</strong> ·{' '}
          {session.complete ? '已完成' : `正在进行第 ${session.round} 轮`}
        </div>
        <button className={styles.quiet} type="button" onClick={onOpen}>
          查看记录
        </button>
      </div>
      <div className={styles.roundItems}>
        {items.map((item) => (
          <div
            className={`${styles.roundStep} ${item.current ? styles.current : ''}`}
            key={item.round}
          >
            <strong>第 {item.round} 轮</strong>
            <span>
              {item.current
                ? `${session.cursor}/${item.total} 已扫`
                : `${item.total} → ${item.missed}`}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Modal({
  name,
  state,
  session,
  accountHistory,
  paste,
  onPasteChange,
  onClose,
  onChooseFile,
  onImport,
  onExportJson,
  onExportMarkdown,
  onRestore,
  onReset,
  onModeChange,
  onGroupsChange,
}: {
  name: Exclude<ModalName, null>
  state: VocabularyState
  session: VocabularySession
  accountHistory: StudyHistoryDay[]
  paste: string
  onPasteChange: (value: string) => void
  onClose: () => void
  onChooseFile: () => void
  onImport: () => void
  onExportJson: () => void
  onExportMarkdown: () => void
  onRestore: () => void
  onReset: () => void
  onModeChange: (mode: 'known' | 'unknown') => void
  onGroupsChange: (groups: 4 | 6) => void
}) {
  return (
    <div
      className={styles.dialogBackdrop}
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vocabulary-dialog-title"
      >
        <div className={styles.rowBetween}>
          <h2 id="vocabulary-dialog-title">
            {name === 'import' ? '导入 / 导出词库' : name === 'settings' ? '学习设置' : '今日轮次'}
          </h2>
          <button className={styles.quiet} type="button" onClick={onClose}>
            关闭 ×
          </button>
        </div>
        {name === 'import' && (
          <>
            <p>粘贴或导入 CSV、TSV、TXT、JSON。每行至少有一个英文词，第二列中文释义可选。</p>
            <button className={styles.filePick} type="button" onClick={onChooseFile}>
              选择文件
            </button>
            <p>或者粘贴：</p>
            <textarea
              value={paste}
              onChange={(event) => onPasteChange(event.target.value)}
              placeholder={'lesson\nexcuse\nlisten to the tape'}
            />
            <button
              className={`${styles.primaryButton} ${styles.full}`}
              type="button"
              onClick={onImport}
            >
              导入并重置今日进度
            </button>
            <div className={styles.divider} />
            <div className={styles.fieldTitle}>导出当前词库</div>
            <div className={styles.exportRow}>
              <button className={styles.filePick} type="button" onClick={onExportJson}>
                下载 JSON
              </button>
              <button className={styles.filePick} type="button" onClick={onExportMarkdown}>
                下载 Markdown
              </button>
            </div>
            <p>当前词库共 {state.words.length} 词。关联句仅随 JSON 一起保留。</p>
            <button className={styles.quiet} type="button" onClick={onRestore}>
              恢复平行世界初始词书
            </button>
          </>
        )}
        {name === 'settings' && (
          <>
            <div className={styles.fieldTitle}>普通点击的判定</div>
            <label>
              <input
                name="clickMode"
                type="radio"
                checked={session.mode === 'unknown'}
                onChange={() => onModeChange('unknown')}
              />{' '}
              点击 = 不会（熟词比较多时）
            </label>
            <label>
              <input
                name="clickMode"
                type="radio"
                checked={session.mode === 'known'}
                onChange={() => onModeChange('known')}
              />{' '}
              点击 = 会（生词比较多时）
            </label>
            <p>Shift + 点击始终执行相反判定。未标记词在翻页时按当前点击模式的默认值计算。</p>
            <div className={styles.divider} />
            <div className={styles.fieldTitle}>每页词数</div>
            <label>
              <input
                name="groups"
                type="radio"
                checked={session.groups === 4}
                onChange={() => onGroupsChange(4)}
              />{' '}
              4 组九宫格 · 36 词
            </label>
            <label>
              <input
                name="groups"
                type="radio"
                checked={session.groups === 6}
                onChange={() => onGroupsChange(6)}
              />{' '}
              6 组九宫格 · 54 词
            </label>
            <p>
              关联辅助每次聚焦并处理一个词；扫词每页处理 36 或 54 词。两者共用同一轮次和错词池。
            </p>
            <div className={styles.divider} />
            <button className={styles.quiet} type="button" onClick={onReset}>
              重新开始今天
            </button>
          </>
        )}
        {name === 'history' && (
          <>
            {accountHistory.length > 0 && (
              <>
                <div className={styles.fieldTitle}>账号按天记录</div>
                {accountHistory.map((day) => (
                  <p key={day.date}>
                    <strong>{day.date}</strong>　{day.words} 词 · 会 {day.known} · 不会{' '}
                    {day.unknown} · 第 {day.rounds} 轮 · {day.complete ? '已完成' : '未完成'}
                  </p>
                ))}
                <div className={styles.divider} />
              </>
            )}
            <p>无论在九宫格扫词还是关联辅助中，所有判定都进入同一份每日记录。</p>
            {session.history.map((history) => (
              <p key={history.round}>
                <strong>第 {history.round} 轮</strong>　{history.total} 词 → 留下 {history.missed}{' '}
                词
              </p>
            ))}
            {!session.history.length && <p>当前还在第一轮。</p>}
            <div className={styles.divider} />
            <p>
              <strong>当前第 {session.round} 轮</strong>　已扫 {session.cursor} /{' '}
              {session.ids.length}，已留下 {session.missed.length} 词。
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function loadState(): VocabularyState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as Partial<VocabularyState>
    if (!Array.isArray(parsed.words) || !parsed.words.length) return createInitialState()
    const defaults = createInitialState()
    const words = normalizeWords(parsed.words)
    if (!words.length) return createInitialState()
    return {
      ...defaults,
      ...parsed,
      words,
      settings: { ...defaults.settings, ...parsed.settings },
      networks: Array.isArray(parsed.networks) ? normalizeNetworks(parsed.networks) : DEMO_NETWORKS,
      sessions: parsed.sessions ?? {},
    }
  } catch {
    return createInitialState()
  }
}

function createStarterState(): VocabularyState {
  return {
    ...createInitialState(),
    words: DEMO_WORDS,
    sessions: {},
  }
}

function ensureTodaySession(state: VocabularyState, today: string) {
  if (!state.sessions[today]) {
    state.sessions[today] = createSession(state.words, state.settings)
  }
}

function saveState(state: VocabularyState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    return
  }
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function focusWord(
  id: string,
  session: VocabularySession,
  state: VocabularyState,
  commit: (next: VocabularyState) => void,
  today: string,
) {
  const index = session.ids.findIndex(
    (wordId, position) => position >= session.cursor && wordId === id,
  )
  if (index < session.cursor) return
  const ids = [...session.ids]
  ;[ids[session.cursor], ids[index]] = [ids[index], ids[session.cursor]]
  commit({ ...state, sessions: { ...state.sessions, [today]: { ...session, ids } } })
}

function highlight(sentence: string, word: string) {
  const parts = sentence.split(new RegExp(`(${escapeRegExp(word)})`, 'ig'))
  return parts.map((part, index) =>
    part.toLowerCase() === word.toLowerCase() ? <strong key={index}>{part}</strong> : part,
  )
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

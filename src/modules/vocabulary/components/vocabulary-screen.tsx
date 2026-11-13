'use client'

import { createPortal } from 'react-dom'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
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
  reconcileStoredWords,
  pageWords,
  pageSize,
  pageStart,
  wordAtCursor,
  parseImport,
  toggleMark,
  type VocabularySession,
  type VocabularyState,
  type VocabularyWord,
} from '../lib/vocabulary'
import { AuthModal, useAuthSession, useSignOut } from '@/modules/auth'
import { signIn } from '@/modules/auth/lib/auth-client'
import { useAssociations, usePrefetchAssociations } from '../hooks/use-association'
import { prefetchSpeech, speakText, warmSpeech } from '../lib/speech'
import { useResetToday } from '../hooks/use-reset-today'
import { useStudyHistory, type StudyHistoryDay } from '../hooks/use-study-history'
import { SettingsPanel } from './settings-panel'
import { useSaveVocabularyDesk, useVocabularyDesk } from '../hooks/use-vocabulary-desk'
import styles from './vocabulary-screen.module.css'
import layout from './workspace-layout.module.css'

function useWordTrashDrag(
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void,
  onTrash: (() => void) | undefined,
  disabled: boolean,
  onAssociate?: (() => void) | undefined,
) {
  const [dragging, setDragging] = useState(false)
  const [overTrash, setOverTrash] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; pointerId: number; active: boolean } | null>(null)
  const over = useRef(false)
  const overAssoc = useRef(false)
  const suppressClick = useRef(false)

  useEffect(() => {
    return () => {
      delete document.body.dataset.wordDrag
      delete document.body.dataset.trashOver
      delete document.body.dataset.assocOver
    }
  }, [])

  function cleanup() {
    drag.current = null
    setDragging(false)
    setOverTrash(false)
    over.current = false
    overAssoc.current = false
    delete document.body.dataset.wordDrag
    delete document.body.dataset.trashOver
    delete document.body.dataset.assocOver
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (disabled || (!onTrash && !onAssociate) || event.button !== 0) return
    const state = { x: event.clientX, y: event.clientY, pointerId: event.pointerId, active: false }
    drag.current = state

    const move = (moveEvent: PointerEvent) => {
      if (!drag.current || moveEvent.pointerId !== state.pointerId) return
      if ((moveEvent.buttons & 1) === 0) {
        cleanup()
        return
      }
      const distance = Math.hypot(moveEvent.clientX - state.x, moveEvent.clientY - state.y)
      if (!state.active && distance < 26) return
      if (!state.active) {
        state.active = true
        setDragging(true)
        document.body.dataset.wordDrag = 'true'
        window.getSelection()?.removeAllRanges()
      }
      moveEvent.preventDefault()
      setPosition({ x: moveEvent.clientX + 14, y: moveEvent.clientY - 16 })

      const hit = (selector: string) => {
        const target = document.querySelector<HTMLElement>(selector)
        if (!target) return false
        const rect = target.getBoundingClientRect()
        return (
          moveEvent.clientX >= rect.left - 18 &&
          moveEvent.clientX <= rect.right + 18 &&
          moveEvent.clientY >= rect.top - 18 &&
          moveEvent.clientY <= rect.bottom + 18
        )
      }
      const isOverTrash = hit('[data-trash-drop="true"]')
      const isOverAssoc = !isOverTrash && hit('[data-assoc-drop="true"]')
      over.current = isOverTrash
      overAssoc.current = isOverAssoc
      setOverTrash(isOverTrash)
      if (isOverTrash) document.body.dataset.trashOver = 'true'
      else delete document.body.dataset.trashOver
      if (isOverAssoc) document.body.dataset.assocOver = 'true'
      else delete document.body.dataset.assocOver
    }

    const up = () => {
      const wasActive = drag.current?.active ?? false
      if (wasActive) {
        if (over.current && onTrash) onTrash()
        else if (overAssoc.current && onAssociate) onAssociate()
        suppressClick.current = true
        window.setTimeout(() => {
          suppressClick.current = false
        }, 0)
      }
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      cleanup()
    }

    const cancel = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      suppressClick.current = true
      cleanup()
    }

    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
  }

  return {
    dragging,
    overTrash,
    position,
    handlePointerDown: onPointerDown,
    handleClick(event: ReactMouseEvent<HTMLButtonElement>) {
      if (suppressClick.current) {
        suppressClick.current = false
        return
      }
      if (disabled) return
      onClick(event)
    },
  }
}

function hasTextSelection() {
  if (typeof window === 'undefined') return false
  const selection = window.getSelection()
  return Boolean(selection && selection.toString().trim())
}

const STORAGE_KEY = 'whitepaper-vocabulary-v2'
const UNDO_STORAGE_KEY = 'whitepaper-undo-stack-v1'
const TRASH_PAGE_SIZE = 24
const TAB_NAMES = ['全部翻译', '上一页', '本页清空', '打乱本页', '造句', '下一页'] as const
type PaperTab = (typeof TAB_NAMES)[number]

function normalizeHistoryStack(stack: VocabularySession[]): VocabularySession[] {
  return stack.map((entry) =>
    entry.historyKind
      ? entry
      : { ...entry, historyKind: entry.view === 'connect' ? 'word' : 'page' },
  )
}

function visualPageOrder(words: VocabularyWord[]): VocabularyWord[] {
  const groups = Math.max(1, Math.ceil(words.length / 9))
  return Array.from({ length: groups }, (_, groupIndex) =>
    words.slice(groupIndex * 9, groupIndex * 9 + 9).map((word, wordIndex) => ({
      word,
      row: Math.floor(groupIndex / 2) * 3 + Math.floor(wordIndex / 3),
      col: (groupIndex % 2) * 3 + (wordIndex % 3),
    })),
  )
    .flat()
    .sort((a, b) => a.row - b.row || a.col - b.col)
    .map((entry) => entry.word)
}

function pageKey(session: VocabularySession) {
  return `${session.round}:${pageStart(session)}`
}

function withCurrentPageMarks(session: VocabularySession): VocabularySession {
  return {
    ...session,
    pageMarks: { ...(session.pageMarks ?? {}), [pageKey(session)]: { ...session.marks } },
  }
}

function withStoredPageMarks(
  session: VocabularySession,
  pageMarks: Record<string, Record<string, Judgement>>,
) {
  const key = pageKey(session)
  return {
    ...session,
    pageMarks,
    marks: { ...(pageMarks[key] ?? session.marks) },
  }
}

function moveItem<T>(items: T[], item: T, targetIndex: number): T[] {
  const from = items.indexOf(item)
  if (from < 0) return items
  const next = [...items]
  next.splice(from, 1)
  next.splice(Math.max(0, Math.min(next.length, targetIndex)), 0, item)
  return next
}

type ModalName = 'import' | 'settings' | 'history' | null
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
  const [tabOrder, setTabOrder] = useState<PaperTab[]>([...TAB_NAMES])
  const [hiddenTabs, setHiddenTabs] = useState<PaperTab[]>([])
  const [dragTab, setDragTab] = useState<PaperTab | null>(null)
  const [dragTop, setDragTop] = useState(0)
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(null)
  const tabRail = useRef<HTMLDivElement>(null)
  const skipTabClick = useRef(false)
  const today = useMemo(() => formatDate(new Date()), [])


  const fileInput = useRef<HTMLInputElement>(null)
  const paperRef = useRef<HTMLElement>(null)
  const paperMotion = useRef<Animation | null>(null)
  const [parallelState, setParallelState] = useState<VocabularyState>(createInitialState)
  const [starterState, setStarterState] = useState<VocabularyState>(createStarterState)
  const [activeBookId, setActiveBookId] = useState<WordbookId>('parallel-world')
  const [hydrated, setHydrated] = useState(false)
  const [deskReady, setDeskReady] = useState(false)
  const [anonymousResolved, setAnonymousResolved] = useState(false)
  const anonymousStarted = useRef(false)
  const deskHydrated = useRef(new Set<string>())
  const deskSaveKey = useRef('')
  const [undoStack, setUndoStack] = useState<VocabularySession[]>([])
  const [redoStack, setRedoStack] = useState<VocabularySession[]>([])
  const redoBaseline = useRef<VocabularySession | null>(null)
  const undoHydrated = useRef(false)
  const [modal, setModal] = useState<ModalName>(null)
  const [trashOpen, setTrashOpen] = useState(false)
  const [trashQuery, setTrashQuery] = useState('')
  const [trashPage, setTrashPage] = useState(0)
  const [confirmRestoreAll, setConfirmRestoreAll] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [sentenceOpen, setSentenceOpen] = useState(false)
  const [sentenceText, setSentenceText] = useState('')
  const [sentenceError, setSentenceError] = useState<string | null>(null)
  const { data: authSession, isPending: authPending } = useAuthSession()
  const signOut = useSignOut()
  const saveDesk = useSaveVocabularyDesk()
  const desk = useVocabularyDesk(activeBookId, authSession?.user?.id)
  const resetTodayMutation = useResetToday()
  const studyHistory = useStudyHistory(
    activeBookId,
    30,
    Boolean(authSession?.user) && (modal === 'history' || settingsOpen),
  )
  const [paste, setPaste] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [shelfOpen, setShelfOpen] = useState(false)
  const [topOpen, setTopOpen] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [zenLayout, setZenLayout] = useState<ZenLayout>({
    columns: 1,
    rows: 1,
    count: 1,
    paperSide: 1,
  })

  const state = activeBookId === 'parallel-world' ? parallelState : starterState

  useEffect(() => {
    const restored = loadState()
    const loaded = restored.state
    const loadedStarter = createStarterState()
    ensureTodaySession(loaded, today)
    ensureTodaySession(loadedStarter, today)
    // Hydration is the synchronization boundary for browser-local learning state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParallelState(loaded)
    setStarterState(loadedStarter)
    if (restored.backupFailed) {
      setNotice('词书更新暂未保存：本地空间不足，请先备份学习数据。')
    } else {
      saveState(loaded)
    }
    setHydrated(true)

    const savedBook = window.localStorage.getItem('whitepaper-active-book')
    if (savedBook === 'starter') setActiveBookId('starter')
    const initialBook = savedBook === 'starter' ? 'starter' : 'parallel-world'
    const initialComplete = loaded.sessions[today]?.complete
    if (initialComplete) removeUndoStack(initialBook, today)
    setUndoStack(initialComplete ? [] : normalizeHistoryStack(loadUndoStack(initialBook, today)))
    undoHydrated.current = true
    setSoundOn(window.localStorage.getItem('whitepaper-sound') !== 'off')
    try {
      const saved = JSON.parse(window.localStorage.getItem('whitepaper-tabs') || '{}')
      if (Array.isArray(saved.order) && Array.isArray(saved.hidden)) {
        const valid = (value: unknown): value is PaperTab =>
          typeof value === 'string' && TAB_NAMES.some((name) => name === value)
        setTabOrder([...new Set<PaperTab>([...saved.order.filter(valid), ...TAB_NAMES])])
        setHiddenTabs(saved.hidden.filter(valid))
      }
    } catch {
      /* Use defaults for invalid local settings. */
    }
  }, [today])

  useEffect(() => {
    if (!undoHydrated.current || !hydrated || authSession?.user) return
    saveUndoStack(activeBookId, today, undoStack)
  }, [undoStack, activeBookId, today, hydrated, authSession])

  useEffect(() => {
    if (!hydrated || authPending || authSession?.user || anonymousStarted.current) return
    anonymousStarted.current = true
    void signIn
      .anonymous()
      .then(() => setAnonymousResolved(true))
      .catch(() => {
        setAnonymousResolved(true)
        // Keep local fallback if anonymous session creation is unavailable.
      })
  }, [hydrated, authPending, authSession])

  useEffect(() => {
    deskHydrated.current.clear()
    setDeskReady(false)
  }, [authSession?.user?.id, activeBookId])

  useEffect(() => {
    if (authPending) {
      setDeskReady(false)
      return
    }
    if (authSession?.user) {
      if (desk.isSuccess || desk.isError) setDeskReady(true)
      return
    }
    if (anonymousResolved) setDeskReady(true)
  }, [authPending, authSession, desk.isSuccess, desk.isError, anonymousResolved])

  useEffect(() => {
    if (!authSession?.user || !hydrated || !desk.isSuccess) return
    if (deskHydrated.current.has(activeBookId)) return
    deskHydrated.current.add(activeBookId)
    const local = activeBookId === 'parallel-world' ? parallelState : starterState
    if (desk.data?.state) {
      const serverState = desk.data.state
      ensureTodaySession(serverState, today)
      if (activeBookId === 'parallel-world') setParallelState(serverState)
      else setStarterState(serverState)
      setUndoStack(
        desk.data.undoDate === today ? normalizeHistoryStack(desk.data.undoStack ?? []) : [],
      )
      setRedoStack(
        desk.data.undoDate === today ? normalizeHistoryStack(desk.data.redoStack ?? []) : [],
      )
      redoBaseline.current = desk.data.state.sessions[today] ?? null
      saveState(serverState)
    } else {
      saveDesk.mutate({
        bookId: activeBookId,
        payload: { state: local, undoStack, redoStack, undoDate: today },
      })
    }
  }, [
    authSession,
    hydrated,
    desk.isSuccess,
    desk.data,
    activeBookId,
    parallelState,
    starterState,
    today,
    saveDesk,
    undoStack,
  ])

  useEffect(() => {
    if (!authSession?.user || !hydrated || !deskHydrated.current.has(activeBookId)) return
    const currentState = activeBookId === 'parallel-world' ? parallelState : starterState
    const currentSession = currentState.sessions[today]
    const saveKey = [
      activeBookId,
      currentSession?.cursor,
      currentSession?.round,
      currentSession?.complete,
      Object.keys(currentSession?.marks ?? {}).length,
      undoStack.length,
      redoStack.length,
      JSON.stringify({
        blankPageDefault: currentState.settings.blankPageDefault,
        autoTrashThreeGreens: currentState.settings.autoTrashThreeGreens,
      }),
    ].join(':')
    if (deskSaveKey.current === saveKey) return
    const timer = window.setTimeout(() => {
      deskSaveKey.current = saveKey
      saveDesk.mutate({
        bookId: activeBookId,
        payload: { state: currentState, undoStack, redoStack, undoDate: today },
      })
    }, 900)
    return () => window.clearTimeout(timer)
  }, [
    authSession,
    hydrated,
    activeBookId,
    parallelState,
    starterState,
    undoStack,
    redoStack,
    saveDesk,
    today,
  ])

  useEffect(() => {
    const flushDesk = () => {
      if (!authSession?.user || document.visibilityState !== 'hidden') return
      if (!deskHydrated.current.has(activeBookId)) return
      const currentState = activeBookId === 'parallel-world' ? parallelState : starterState
      saveDesk.mutate({
        bookId: activeBookId,
        payload: { state: currentState, undoStack, redoStack, undoDate: today },
      })
    }
    document.addEventListener('visibilitychange', flushDesk)
    window.addEventListener('pagehide', flushDesk)
    return () => {
      document.removeEventListener('visibilitychange', flushDesk)
      window.removeEventListener('pagehide', flushDesk)
    }
  }, [
    authSession,
    activeBookId,
    parallelState,
    starterState,
    undoStack,
    redoStack,
    today,
    saveDesk,
  ])

  function saveTabs(order: PaperTab[], hidden: PaperTab[]) {
    setTabOrder(order)
    setHiddenTabs(hidden)
    try {
      window.localStorage.setItem('whitepaper-tabs', JSON.stringify({ order, hidden }))
    } catch {
      /* Keep in-memory preferences. */
    }
  }

  function shufflePage() {
    if (session.view !== 'scan' || session.complete) return
    updateSession((current) => {
      const count = current.groups * 9
      const start = pageStart(current, count)
      const page = current.ids.slice(start, start + count)
      if (page.length < 2) return current
      const shuffled = [...page]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      if (shuffled.every((id, i) => id === page[i])) shuffled.push(shuffled.shift()!)
      const next = {
        ...current,
        ids: [
          ...current.ids.slice(0, start),
          ...shuffled,
          ...current.ids.slice(start + count),
        ],
      }
      return next
    })
  }

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      if (event.clientX <= 26) setShelfOpen(true)
      if (event.clientY <= 18) setTopOpen(true)
      else if (event.clientY > 100) setTopOpen(false)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  useEffect(() => {
    warmSpeech()
  }, [])

  useEffect(() => {
    const clearSelectionOutsidePaper = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-selectable="true"]')) return
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      window.getSelection()?.removeAllRanges()
    }
    document.addEventListener('pointerdown', clearSelectionOutsidePaper, true)
    return () => document.removeEventListener('pointerdown', clearSelectionOutsidePaper, true)
  }, [])

  useEffect(() => {
    if (!trashOpen) {
      setTrashQuery('')
      setTrashPage(0)
      return
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTrashOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [trashOpen])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 2500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const session = hydrated
    ? state.sessions[today]
    : createSession(state.words, state.settings, state.trashedIds)
  const currentWords =
    session.view === 'connect'
      ? [wordAtCursor(state.words, session)].filter((word): word is VocabularyWord => Boolean(word))
      : pageWords(state.words, session)
  const trashedWords = [...state.trashedIds]
    .reverse()
    .map((id) => state.words.find((word) => word.id === id))
    .filter((word): word is VocabularyWord => Boolean(word))
  const normalizedTrashQuery = trashQuery.trim().toLowerCase()
  const filteredTrashedWords = normalizedTrashQuery
    ? trashedWords.filter(
        (word) =>
          word.en.toLowerCase().includes(normalizedTrashQuery) ||
          word.zh.toLowerCase().includes(normalizedTrashQuery),
      )
    : trashedWords
  const trashPageCount = Math.max(1, Math.ceil(filteredTrashedWords.length / TRASH_PAGE_SIZE))
  const safeTrashPage = Math.min(trashPage, trashPageCount - 1)
  const visibleTrashedWords = filteredTrashedWords.slice(
    safeTrashPage * TRASH_PAGE_SIZE,
    safeTrashPage * TRASH_PAGE_SIZE + TRASH_PAGE_SIZE,
  )
  useEffect(() => {
    setTrashPage(0)
  }, [trashQuery])
  useEffect(() => {
    setTrashPage((page) => Math.min(page, trashPageCount - 1))
  }, [trashPageCount])
  useEffect(() => {
    const timer = window.setTimeout(() => {
      prefetchSpeech(
        pageWords(state.words, session)
          .slice(0, 12)
          .map((word) => ({ text: word.en, audio: word.audio })),
      )
    }, 350)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.words, session.cursor, session.round, session.view, session.groups])
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
      if (!authSession?.user) saveState(next)
    } else {
      setStarterState(next)
      if (!authSession?.user) saveState(next)
    }
  }

  function pageContribution(target: VocabularySession) {
    const page = pageWords(state.words, target)
    const trashed = new Set(state.trashedIds)
    const active = page.filter((word) => !trashed.has(word.id))
    const hasRed = active.some((word) => target.marks[word.id] === 'unknown')
    const hasGreen = active.some((word) => target.marks[word.id] === 'known')
    const hasTrash = page.some((word) => trashed.has(word.id))
    const fallback: Judgement =
      hasRed && !hasGreen
        ? 'known'
        : hasGreen && !hasRed
          ? 'unknown'
          : hasTrash
            ? 'unknown'
            : (state.settings.blankPageDefault ?? 'unknown')
    let known = 0
    let unknown = 0
    let archived = 0
    for (const word of page) {
      if (trashed.has(word.id)) {
        archived += 1
        continue
      }
      const judgement = target.marks[word.id] ?? fallback
      if (judgement === 'known') known += 1
      else unknown += 1
    }
    return { known, unknown, trashed: archived, first: target.round === 1 }
  }

  function updateSession(updater: (current: VocabularySession) => VocabularySession) {
    const current =
      state.sessions[today] ?? createSession(state.words, state.settings, state.trashedIds)
    const next = updater(current)
    const pageMarks = {
      ...(next.pageMarks ?? {}),
      ...(current.pageMarks ?? {}),
    }
    if (pageKey(next) === pageKey(current)) {
      pageMarks[pageKey(current)] = { ...next.marks }
    }
    const roundIds = { ...(next.roundIds ?? {}), ...(current.roundIds ?? {}) }
    const pageStats = { ...(next.pageStats ?? {}), ...(current.pageStats ?? {}) }
    const withCache = { ...next, pageMarks, roundIds, pageStats }
    const finalSession =
      pageKey(next) === pageKey(current) ? withCache : withStoredPageMarks(next, pageMarks)
    let cycles = state.cycles
    if (pageKey(next) === pageKey(current) && current.pageStats?.[pageKey(current)]) {
      const old = current.pageStats[pageKey(current)]
      const fresh = pageContribution(next)
      const deltaKnown = fresh.known - old.known
      const deltaUnknown = fresh.unknown - old.unknown
      const deltaTrashed = fresh.trashed - old.trashed
      const cycleId = next.cycleId
      if (cycleId && (deltaKnown || deltaUnknown || deltaTrashed)) {
        cycles = (state.cycles ?? []).map((cycle) =>
          cycle.id === cycleId
            ? {
                ...cycle,
                known: Math.max(0, cycle.known + deltaKnown),
                unknown: Math.max(0, cycle.unknown + deltaUnknown),
                trashed: Math.max(0, cycle.trashed + deltaTrashed),
                firstKnown: Math.max(0, cycle.firstKnown + (fresh.first ? deltaKnown : 0)),
                firstUnknown: Math.max(0, cycle.firstUnknown + (fresh.first ? deltaUnknown : 0)),
                firstTrashed: Math.max(0, cycle.firstTrashed + (fresh.first ? deltaTrashed : 0)),
              }
            : cycle,
        )
      }
      finalSession.pageStats = {
        ...(current.pageStats ?? {}),
        [pageKey(current)]: fresh,
      }
    }
    commit({ ...state, cycles, sessions: { ...state.sessions, [today]: finalSession } })
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
          : createSession(state.words, nextSettings, state.trashedIds),
      },
    }
    commit(nextState)
  }

  function handleWordClick(id: string, green: boolean) {
    if (hasTextSelection() || state.trashedIds.includes(id)) return
    const currentPage = pageWords(state.words, session).filter(
      (word) => !state.trashedIds.includes(word.id),
    )
    const hasRed = currentPage.some((word) => session.marks[word.id] === 'unknown')
    const hasGreen = currentPage.some((word) => session.marks[word.id] === 'known')
    if (green && hasRed) {
      setNotice('本页已标红，先取消红色才能标绿')
      return
    }
    if (!green && hasGreen) {
      setNotice('本页已标绿，先取消绿色才能标红')
      return
    }
    const spoken = state.words.find((word) => word.id === id)
    if (soundOn && spoken) speakText(spoken.en, spoken.audio)
    updateSession((current) => toggleMark(current, id, green ? 'known' : 'unknown'))
  }

  function openAssociationAt(id: string) {
    const index = session.ids.indexOf(id)
    if (index < 0) return
    updateSession((current) => ({
      ...current,
      cursor: index,
      view: 'connect',
      peek: false,
    }))
  }

  function handleTrash(id: string) {
    const word = state.words.find((item) => item.id === id)
    if (!word || state.trashedIds.includes(id)) return
    const current =
      state.sessions[today] ?? createSession(state.words, state.settings, state.trashedIds)
    const nextState: VocabularyState = {
      ...state,
      trashedIds: [...state.trashedIds, id],
      sessions: {
        ...state.sessions,
        [today]: {
          ...current,
          marks: { ...current.marks, [id]: 'known' },
        },
      },
    }
    commit(nextState)
    window.getSelection()?.removeAllRanges()
  }

  function addCustomAssociation(target: string, sentence: string) {
    const text = sentence.trim()
    const word = currentWords[0]
    if (!word || text.length < 4) {
      setSentenceError('句子太短，再写完整一点。')
      return
    }
    if (!text.toLowerCase().includes(word.en.toLowerCase())) {
      setSentenceError(`句子必须包含目标词「${word.en}」。`)
      return
    }
    const key = target.toLowerCase()
    const hiddenCustom = new Set(state.hiddenCustomAssociations ?? [])
    const custom = (state.customAssociations?.[key] ?? []).filter(
      (item) => !hiddenCustom.has(item.id),
    )
    if (custom.length >= 4) {
      setSentenceError('每个目标词最多添加 4 条自定义句。')
      return
    }
    const nextCustom = {
      ...(state.customAssociations ?? {}),
      [key]: [...custom, { id: `custom-${Date.now().toString(36)}`, sentence: text }],
    }
    commit({ ...state, customAssociations: nextCustom })
    setSentenceText('')
    setSentenceError(null)
    setSentenceOpen(false)
  }

  function removeAssociation(target: string, sentence: string, custom: boolean) {
    const key = target.toLowerCase()
    if (custom) {
      const item = (state.customAssociations?.[key] ?? []).find(
        (entry) => entry.sentence === sentence,
      )
      if (!item) return
      const hiddenCustom = new Set(state.hiddenCustomAssociations ?? [])
      hiddenCustom.add(item.id)
      commit({ ...state, hiddenCustomAssociations: [...hiddenCustom] })
        return
    }
    const marker = `${key}\u0000${sentence}`
    const hidden = new Set(state.hiddenAssociationLinks ?? [])
    hidden.add(marker)
    commit({ ...state, hiddenAssociationLinks: [...hidden] })
  }

  function restoreHiddenAssociation(target: string, sentence: string) {
    const marker = `${target.toLowerCase()}\u0000${sentence}`
    commit({
      ...state,
      hiddenAssociationLinks: (state.hiddenAssociationLinks ?? []).filter(
        (item) => item !== marker,
      ),
    })
  }

  function restoreHiddenCustom(id: string) {
    const hidden = new Set(state.hiddenCustomAssociations ?? [])
    const owner = Object.entries(state.customAssociations ?? {}).find(([, items]) =>
      items.some((item) => item.id === id),
    )
    if (!owner) return
    const visible = owner[1].filter((item) => !hidden.has(item.id)).length
    if (visible >= 4) {
      setNotice('每个目标词最多保留 4 条自定义句；先移除一条再还原')
      return
    }
    commit({
      ...state,
      hiddenCustomAssociations: [...hidden].filter((item) => item !== id),
    })
  }

  function restoreTrash(id: string) {
    const word = state.words.find((item) => item.id === id)
    if (!word) return
    const trashedIds = state.trashedIds.filter((item) => item !== id)
    const current = state.sessions[today]
    let nextSession = current
    let message = `「${word.en}」已放回，下一轮继续推送`
    if (current) {
      if (!current.ids.includes(id)) {
        const ids = [...current.ids, id]
        nextSession = {
          ...current,
          ids,
          cursor: current.complete ? current.ids.length : current.cursor,
          complete: false,
        }
        message = `「${word.en}」已放回，稍后继续推送`
      }
    }
    const nextState: VocabularyState = {
      ...state,
      trashedIds,
      sessions: nextSession ? { ...state.sessions, [today]: nextSession } : state.sessions,
    }
    commit(nextState)
  }

  function restoreAllTrash() {
    setConfirmRestoreAll(false)
    const ids = [...state.trashedIds]
    if (!ids.length) return
    const current = state.sessions[today]
    let nextSession = current
    if (current) {
      const missing = ids.filter((id) => !current.ids.includes(id))
      if (missing.length) {
        nextSession = {
          ...current,
          ids: [...current.ids, ...missing],
          cursor: current.complete ? current.ids.length : current.cursor,
          complete: false,
        }
      }
    } else {
      nextSession = createSession(state.words, state.settings, [])
    }
    if (!nextSession) return
    commit({
      ...state,
      trashedIds: [],
      sessions: { ...state.sessions, [today]: nextSession },
    })
    setTrashPage(0)
  }

  function handleClearPage() {
    const currentPage = pageWords(state.words, session)
    if (!currentPage.length) return
    updateSession((current) => {
      const marks = { ...current.marks }
      for (const word of currentPage) {
        if (!state.trashedIds.includes(word.id)) delete marks[word.id]
      }
      return { ...current, marks, peek: false }
    })
  }

  function handleMarkAllUnknown() {
    const currentPage = pageWords(state.words, session)
    if (!currentPage.length) return
    const hasGreen = currentPage.some(
      (word) => !state.trashedIds.includes(word.id) && session.marks[word.id] === 'known',
    )
    if (hasGreen) {
      setNotice('本页已标绿，先取消绿色才能全部翻译')
      return
    }
    updateSession((current) => {
      const marks = { ...current.marks }
      for (const word of currentPage) {
        if (!state.trashedIds.includes(word.id)) marks[word.id] = 'unknown'
      }
      return { ...current, marks, peek: false }
    })
  }

  function advanceWithStats(next: VocabularySession, size = pageSize(session)) {
    const page = pageWords(state.words, session, size)
    const trashed = new Set(state.trashedIds)
    const active = page.filter((word) => !trashed.has(word.id))
    const hasRed = active.some((word) => session.marks[word.id] === 'unknown')
    const hasGreen = active.some((word) => session.marks[word.id] === 'known')
    const hasTrash = page.some((word) => trashed.has(word.id))
    const fallback: Judgement =
      hasRed && !hasGreen
        ? 'known'
        : hasGreen && !hasRed
          ? 'unknown'
          : hasTrash
            ? 'unknown'
            : (state.settings.blankPageDefault ?? 'unknown')
    let known = 0
    let unknown = 0
    let archived = 0
    for (const word of page) {
      if (trashed.has(word.id)) {
        archived += 1
        continue
      }
      const judgement = session.marks[word.id] ?? fallback
      if (judgement === 'known') known += 1
      else unknown += 1
    }

    const isFirstPass = session.round === 1
    const now = new Date().toISOString()
    const cycleId = session.cycleId ?? `legacy-${today}`
    const existing = (state.cycles ?? []).find((cycle) => cycle.id === cycleId)
    const cycleNumber =
      existing?.cycle ?? Math.max(0, ...(state.cycles ?? []).map((cycle) => cycle.cycle)) + 1
    const stat = {
      id: cycleId,
      date: existing?.date ?? today,
      cycle: cycleNumber,
      startedAt: existing?.startedAt ?? now,
      updatedAt: now,
      completed: next.complete,
      totalWords: existing?.totalWords ?? session.ids.length,
      reviewed: (existing?.reviewed ?? 0) + page.length,
      known: (existing?.known ?? 0) + known,
      unknown: (existing?.unknown ?? 0) + unknown,
      trashed: (existing?.trashed ?? 0) + archived,
      firstReviewed: (existing?.firstReviewed ?? 0) + (isFirstPass ? page.length : 0),
      firstKnown: (existing?.firstKnown ?? 0) + (isFirstPass ? known : 0),
      firstUnknown: (existing?.firstUnknown ?? 0) + (isFirstPass ? unknown : 0),
      firstTrashed: (existing?.firstTrashed ?? 0) + (isFirstPass ? archived : 0),
      internalPasses: Math.max(existing?.internalPasses ?? 1, session.round),
    }
    const cycles = existing
      ? (state.cycles ?? []).map((cycle) => (cycle.id === cycleId ? stat : cycle))
      : [...(state.cycles ?? []), stat]
    const nextSession = {
      ...next,
      cycleId,
      pageStats: {
        ...(next.pageStats ?? {}),
        [pageKey(session)]: { known, unknown, trashed: archived, first: isFirstPass },
      },
    }
    const greenStreaks = { ...(state.greenStreaks ?? {}) }
    const cycleGreens = { ...(state.cycleGreens ?? {}) }
    const pageIds = new Set(page.map((word) => word.id))
    const pendingGreens = (cycleGreens[cycleId] ?? []).filter((id) => !pageIds.has(id))
    const autoTrashWords: { id: string; en: string }[] = []
    if (isFirstPass) {
      for (const word of page) {
        if (trashed.has(word.id)) {
          greenStreaks[word.id] = 0
          continue
        }
        const judgement = session.marks[word.id] ?? fallback
        if (judgement === "known") pendingGreens.push(word.id)
        else greenStreaks[word.id] = 0
      }
      cycleGreens[cycleId] = pendingGreens
    }
    const firstRoundFinished = isFirstPass && (next.complete || next.round !== 1)
    if (firstRoundFinished) {
      for (const id of pendingGreens) {
        if (trashed.has(id)) continue
        const streak = (greenStreaks[id] ?? 0) + 1
        greenStreaks[id] = streak
        if (streak >= 3 && state.settings.autoTrashThreeGreens !== false) {
          const word = state.words.find((item) => item.id === id)
          if (word) autoTrashWords.push({ id, en: word.en })
        }
      }
      delete cycleGreens[cycleId]
    }
    const autoTrashIds = autoTrashWords.map((word) => word.id)
    const nextState = {
      ...state,
      trashedIds: [...new Set([...state.trashedIds, ...autoTrashIds])],
      sessions: { ...state.sessions, [today]: nextSession },
      cycles,
      greenStreaks: {
        ...greenStreaks,
        ...Object.fromEntries(autoTrashIds.map((id) => [id, 0])),
      },
      cycleGreens,
    }
    commit(nextState)
    if (autoTrashWords.length) {
      setNotice(`${autoTrashWords.length} 个连续三圈第一轮筛过的词已自动移入垃圾桶`)
    }
    if (next.complete) {
      setUndoStack([])
      setRedoStack([])
      redoBaseline.current = null
      removeUndoStack(activeBookId, today)
    }
  }

  async function handleNext() {
    if (session.complete) return
    const kind = session.view === 'connect' ? 'word' : 'page'
    if (redoStack.length) {
      const redoIndex = redoStack.findLastIndex((entry) => entry.historyKind === kind)
      if (redoIndex >= 0 && session === redoBaseline.current) {
        const pageMarks = {
          ...(session.pageMarks ?? {}),
          [pageKey(session)]: { ...session.marks },
        }
        const next = withStoredPageMarks(
          { ...redoStack[redoIndex], view: session.view, historyKind: undefined },
          pageMarks,
        )
        setRedoStack((stack) => stack.filter((_, index) => index !== redoIndex))
        setUndoStack((stack) => [...stack, { ...session, historyKind: kind }])
        updateSession(() => next)
        redoBaseline.current = next
        return
      }
      setRedoStack([])
      redoBaseline.current = null
    }

    const currentWithCache = withCurrentPageMarks(session)
    const size = pageSize(session)
    if (session.view === 'connect') {
      const ordered = visualPageOrder(pageWords(state.words, session, size))
      const currentId = session.ids[session.cursor]
      const position = ordered.findIndex((word) => word.id === currentId)
      const nextWord = position >= 0 ? ordered[position + 1] : undefined
      if (nextWord) {
        const nextCursor = session.ids.indexOf(nextWord.id)
        if (nextCursor >= 0) {
          const next = { ...currentWithCache, cursor: nextCursor, peek: false }
          setUndoStack((stack) => [...stack, { ...currentWithCache, historyKind: 'word' }])
          updateSession(() => next)
          return
        }
      }
    }
    const pageSession = { ...currentWithCache, cursor: pageStart(session, size) }
    const nextRaw = advanceSession(pageSession, state.words, {
      pageSize: size,
      trashedIds: state.trashedIds,
      blankPageDefault: state.settings.blankPageDefault ?? 'unknown',
    })
    const next = withStoredPageMarks(nextRaw, currentWithCache.pageMarks ?? {})
    const pageSnapshot = { ...currentWithCache, cursor: pageStart(session, size), historyKind: 'page' as const }
    const historyEntries =
      session.view === 'connect'
        ? [{ ...currentWithCache, historyKind: 'word' as const }, pageSnapshot]
        : [pageSnapshot]
    setUndoStack((stack) => [...stack, ...historyEntries])
    advanceWithStats(next, size)
  }

  useEffect(() => {
    const handleNextShortcut = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.isComposing || event.repeat) return
      if (modal || authOpen || settingsOpen || trashOpen || zenMode) return
      if (session.complete) return
      const target = event.target
      if (
        target instanceof Element &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }
      event.preventDefault()
      void handleNext()
    }
    window.addEventListener('keydown', handleNextShortcut)
    return () => window.removeEventListener('keydown', handleNextShortcut)
  }, [modal, authOpen, settingsOpen, trashOpen, zenMode, session, handleNext])

  async function handleZenNext() {
    if (session.complete) return
    const kind = session.view === 'connect' ? 'word' : 'page'
    if (redoStack.length) {
      const redoIndex = redoStack.findLastIndex((entry) => entry.historyKind === kind)
      if (redoIndex >= 0 && session === redoBaseline.current) {
        const pageMarks = {
          ...(session.pageMarks ?? {}),
          [pageKey(session)]: { ...session.marks },
        }
        const next = withStoredPageMarks(
          { ...redoStack[redoIndex], view: session.view, historyKind: undefined },
          pageMarks,
        )
        setRedoStack((stack) => stack.filter((_, index) => index !== redoIndex))
        setUndoStack((stack) => [...stack, { ...session, historyKind: kind }])
        updateSession(() => next)
        redoBaseline.current = next
        return
      }
      setRedoStack([])
      redoBaseline.current = null
    }
    const pageSize = Math.max(1, zenLayout.count) * ZEN_WORDS_PER_SHEET

    const currentWithCache = withCurrentPageMarks(session)
    const nextRaw = advanceSession(
      { ...currentWithCache, cursor: pageStart(session, pageSize) },
      state.words,
      {
        pageSize,
        trashedIds: state.trashedIds,
        blankPageDefault: state.settings.blankPageDefault ?? 'unknown',
      },
    )
    const next = withStoredPageMarks(nextRaw, currentWithCache.pageMarks ?? {})
    setUndoStack((stack) => [
      ...stack,
      { ...currentWithCache, cursor: pageStart(session, pageSize), historyKind: 'page' as const },
    ])
    advanceWithStats(next, pageSize)
  }

  async function handleUndo() {
    const kind = session.view === 'connect' ? 'word' : 'page'
    let index = -1
    for (let i = undoStack.length - 1; i >= 0; i -= 1) {
      if (undoStack[i].historyKind === kind) {
        index = i
        break
      }
    }
    if (index < 0) return
    const previous = undoStack[index]
    const pageMarks = {
      ...(previous.pageMarks ?? {}),
      ...(session.pageMarks ?? {}),
      [pageKey(session)]: { ...session.marks },
    }
    const roundIds = {
      ...(previous.roundIds ?? {}),
      ...(session.roundIds ?? {}),
    }
    const pageStats = {
      ...(previous.pageStats ?? {}),
      ...(session.pageStats ?? {}),
    }
    const next = withStoredPageMarks(
      { ...previous, pageMarks, roundIds, pageStats, view: session.view, historyKind: undefined },
      pageMarks,
    )
    setRedoStack((stack) => [...stack, { ...session, historyKind: kind }])
    setUndoStack((stack) => stack.slice(0, index))
    redoBaseline.current = next
    updateSession(() => next)
  }

  function startTabDrag(event: ReactPointerEvent<HTMLDivElement>, tab: PaperTab, index: number) {
    if (event.button !== 0) return
    const start = { y: event.clientY, moved: false, visible: [...visibleTabs] }
    let targetIndex = index
    const pointerId = event.pointerId

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      setDragTab(null)
      setDragTargetIndex(null)
    }

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return
      if ((moveEvent.buttons & 1) === 0) {
        cleanup()
        return
      }
      const delta = moveEvent.clientY - start.y
      if (!start.moved && Math.abs(delta) < 5) return
      start.moved = true
      moveEvent.preventDefault()
      setDragTab(tab)
      setDragTop(delta)
      const rail = tabRail.current
      const nodes = rail
        ? Array.from(rail.children).filter(
            (node): node is HTMLElement => node instanceof HTMLElement,
          )
        : []
      const pointerY = start.y + delta
      targetIndex = 0
      nodes.forEach((node, nodeIndex) => {
        const rect = node.getBoundingClientRect()
        if (pointerY > rect.top + rect.height / 2)
          targetIndex = Math.min(nodeIndex, start.visible.length - 1)
      })
      setDragTargetIndex(targetIndex)
    }

    const onUp = () => {
      if (start.moved) {
        const nextVisible = moveItem(start.visible, tab, targetIndex)
        saveTabs(
          [...nextVisible, ...tabOrder.filter((item) => hiddenTabs.includes(item))],
          hiddenTabs,
        )
        skipTabClick.current = true
        window.setTimeout(() => {
          skipTabClick.current = false
        }, 0)
      }
      cleanup()
    }

    const onCancel = () => {
      skipTabClick.current = true
      cleanup()
    }

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
  }

  function switchView(view: LearningView) {
    updateSession((current) => ({
      ...current,
      view,
      cursor: view === 'connect' ? pageStart(current) : current.cursor,
      peek: false,
    }))
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
    setUndoStack([])
    setRedoStack([])
    redoBaseline.current = null
    const wordbook = WORDBOOKS.find((item) => item.id === id)
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

  function replaceWordlist(words: VocabularyWord[], networks = DEMO_NETWORKS) {
    const nextState: VocabularyState = {
      ...state,
      words,
      networks,
      greenStreaks: {},
      cycleGreens: {},
      sessions: { [today]: createSession(words, state.settings, state.trashedIds) },
    }
    setUndoStack([])
    setRedoStack([])
    redoBaseline.current = null
    commit(nextState)
    setModal(null)
    setPaste('')
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
    if (authSession?.user) {
      try {
        await resetTodayMutation.mutateAsync({ bookId: activeBookId, date: today })
      } catch {
        setNotice('重置失败，请重试')
        return
      }
    }

    const nextState = {
      ...state,
      cycleGreens: {},
      sessions: {
        ...state.sessions,
        [today]: createSession(state.words, state.settings, state.trashedIds),
      },
    }
    commit(nextState)
    setUndoStack([])
    setRedoStack([])
    redoBaseline.current = null
    setSettingsOpen(false)
    setModal(null)
  }

  function download(name: string, content: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (!hydrated || !deskReady) {
    return <main className={styles.loading}>正在打开你的白纸……</main>
  }

  const total = session.ids.length
  const markedUnknown = Object.values(session.marks).filter((mark) => mark === 'unknown').length
  const progress = total ? Math.round((session.cursor * 100) / total) : 100
  const activeWordCount = Math.max(0, state.words.length - state.trashedIds.length)
  const undoKind = session.view === 'connect' ? 'word' : 'page'
  const canUndo = undoStack.some((entry) => entry.historyKind === undoKind)
  const visibleTabs = tabOrder.filter(
    (tab) => !hiddenTabs.includes(tab) && (tab !== '造句' || session.view === 'connect'),
  )
  const dragFrom = dragTab ? visibleTabs.indexOf(dragTab) : -1
  const dragTo = dragTargetIndex ?? dragFrom

  return (
    <main className={`${styles.layout} ${zenMode ? styles.zenLayout : layout.viewport}`}>
      <header className={`${styles.top}${topOpen ? ` ${styles.topOpen}` : ''}`} data-layout="top">
        <div className={styles.brand}>
          白纸 <small>MEMORY, IN THE OPEN.</small>
        </div>
        <div className={styles.topActions}>
          <button
            className={styles.quiet}
            type="button"
            aria-expanded={shelfOpen}
            onClick={() => setShelfOpen(!shelfOpen)}
          >
            词书
          </button>
          <button className={styles.quiet} type="button" onClick={enterZenMode}>
            禅模式
          </button>
          {authSession?.user && !(authSession.user as { isAnonymous?: boolean }).isAnonymous ? (
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
        </div>
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      <div className={styles.workspaceBody} data-layout="body">
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
        <div className={styles.workspaceContent} data-layout="content">
          <>
            <div className={styles.toolbar} data-layout="modes">
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
                  className={`${session.view === 'connect' ? styles.activeSegment : ''} ${styles.assocDropTarget}`}
                  type="button"
                  aria-pressed={session.view === 'connect'}
                  data-assoc-drop="true"
                  onClick={() => switchView('connect')}
                >
                  关联辅助
                </button>
              </div>
              <button
                className={styles.trashButton}
                data-trash-drop="true"
                type="button"
                aria-label="打开垃圾桶，也可把单词拖到这里"
                aria-expanded={trashOpen}
                onClick={() => setTrashOpen((open) => !open)}
              >
                <span className={styles.trashIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13M10 11v5M14 11v5" />
                  </svg>
                </span>
                <span>{state.trashedIds.length}</span>
              </button>
            </div>
            <div className={styles.paperStage} data-layout="stage">
              <div className={styles.paperFrame} data-layout="frame">
                <PaperSurface
                  key={
                    session.view === 'connect'
                      ? `${session.round}-connect`
                      : `${session.round}-${session.cursor}-${session.view}`
                  }
                  paperRef={paperRef}
                  ariaLabel="一张可交互的 A4 记忆纸"
                >
                  <div className={styles.paperHeader} data-layout="paper-header">
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
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className={styles.track} aria-label="本轮进度">
                    <div style={{ width: `${session.complete ? 100 : progress}%` }} />
                  </div>

                  {session.complete ? (
                    <Completion words={activeWordCount} rounds={session.history.length} />
                  ) : session.view === 'scan' ? (
                    <ScanView
                      words={currentWords}
                      session={session}
                      trashedIds={state.trashedIds}
                      onWordClick={handleWordClick}
                      onTrash={handleTrash}
                      onAssociate={openAssociationAt}
                    />
                  ) : (
                    <AssociationView
                      words={currentWords}
                      allWords={state.words}
                      session={session}
                      networks={state.networks}
                      onWordClick={handleWordClick}
                      onSpeak={speakText}
                      onPrefetch={(text, audio) => prefetchSpeech([{ text, audio }])}
                      onTrash={handleTrash}
                      showDefaultAssociations={state.settings.showDefaultAssociations !== false}
                      customAssociations={state.customAssociations ?? {}}
                      hiddenAssociationLinks={state.hiddenAssociationLinks ?? []}
                      hiddenCustomAssociations={state.hiddenCustomAssociations ?? []}
                      onRemoveLink={removeAssociation}
                    />
                  )}

                  <div className={styles.pageFoot} data-layout="paper-footer">
                    <span>
                      {session.complete
                        ? 'DAY COMPLETE'
                        : session.view === 'scan'
                          ? 'INSTANT RECALL'
                          : 'ASSOCIATIVE RECALL'}
                    </span>
                  </div>
                </PaperSurface>
                <div
                  className={styles.paperAdvance}
                  data-layout="actions"
                  ref={tabRail}
                  onClickCapture={(event) => {
                    if (!skipTabClick.current) return
                    event.preventDefault()
                    event.stopPropagation()
                    skipTabClick.current = false
                  }}
                >
                  {visibleTabs.map((tab, index) => {
                    const dragging = dragTab === tab
                    const previewIndex =
                      dragFrom < dragTo && index > dragFrom && index <= dragTo
                        ? index - 1
                        : dragFrom > dragTo && index >= dragTo && index < dragFrom
                          ? index + 1
                          : index
                    const shift = dragging ? 0 : previewIndex - index
                    return (
                      <div
                        key={tab}
                        data-dragging={dragging}
                        style={{
                          transform: dragging
                            ? `translateY(${dragTop}px)`
                            : shift
                              ? `translateY(calc(${shift} * (clamp(76px, 12cqh, 104px) + 9px)))`
                              : undefined,
                          transition: dragging ? 'none' : undefined,
                        }}
                        onPointerDown={(event) => startTabDrag(event, tab, index)}
                      >
                        {tab === '全部翻译' ? (
                          <button
                            className={styles.peekTab}
                            type="button"
                            disabled={session.complete}
                            onClick={handleMarkAllUnknown}
                          >
                            全部翻译
                          </button>
                        ) : tab === '上一页' ? (
                          <button
                            className={styles.undoTab}
                            type="button"
                            disabled={!canUndo}
                            onClick={handleUndo}
                          >
                            上一页
                          </button>
                        ) : tab === '本页清空' ? (
                          <button
                            className={styles.clearPageButton}
                            type="button"
                            disabled={session.complete}
                            onClick={handleClearPage}
                          >
                            本页清空
                          </button>
                        ) : tab === '打乱本页' ? (
                          <button
                            className={`${styles.peekTab} ${styles.shuffleTab}`}
                            type="button"
                            disabled={
                              session.complete || session.view !== 'scan' || currentWords.length < 2
                            }
                            onClick={shufflePage}
                          >
                            打乱本页
                          </button>
                        ) : tab === '造句' ? (
                          <button
                            className={styles.sentenceTab}
                            type="button"
                            disabled={session.complete}
                            onClick={() => {
                              setSentenceText('')
                              setSentenceError(null)
                              setSentenceOpen(true)
                            }}
                          >
                            造句
                          </button>
                        ) : (
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
                            {session.complete
                              ? '已清零'
                              : session.view === 'connect'
                                ? '下一词'
                                : '下一页'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className={styles.controls} data-layout="page-info">
              <div className={styles.pageNumber}>
                {session.complete
                  ? '今日任务完成'
                  : session.view === 'connect'
                    ? `本词 ${Math.min(session.cursor + 1, total)} / ${total}`
                    : `本页 ${Math.min(pageStart(session) + 1, total)}—${Math.min(pageStart(session) + currentWords.length, total)} / ${total}`}
              </div>
            </div>

            <RoundTrack session={session} onOpen={() => setModal('history')} />
            <p className={styles.helpLine} data-layout="help">
              一张纸、一套轮次。浅绿 = 会，浅红 = 不会。左键标红 · 右键标绿 · 拖入垃圾桶归档。
            </p>
          </>
        </div>
      </div>

      {confirmRestoreAll && (
        <div className={styles.confirmBackdrop} role="presentation">
          <section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="restore-all-title">
            <h2 id="restore-all-title">全部放回？</h2>
            <p>
              将把垃圾桶里的 {trashedWords.length} 个词全部放回。放回后，它们会在之后的轮次继续出现。
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.quiet} type="button" onClick={() => setConfirmRestoreAll(false)}>
                取消
              </button>
              <button className={styles.primaryButton} type="button" onClick={restoreAllTrash}>
                确认全部放回
              </button>
            </div>
          </section>
        </div>
      )}

      {trashOpen && (
        <div
          className={styles.trashBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTrashOpen(false)
          }}
        >
          <section
            className={styles.trashDialog}
            role="dialog"
            aria-modal="true"
            aria-label="垃圾桶"
          >
            <div className={styles.trashDialogHead}>
              <div className={styles.trashHeadLead}>
                <div>
                  <div className={styles.trashKicker}>NOT IN ROTATION</div>
                  <h2 className={styles.trashTitle}>不再推送</h2>
                </div>
                <div className={styles.trashSearch}>
                  <input
                    id="trash-search"
                    type="search"
                    value={trashQuery}
                    placeholder="搜索英文或中文"
                    aria-label="搜索垃圾桶"
                    autoComplete="off"
                    onChange={(event) => setTrashQuery(event.target.value)}
                  />
                </div>
              </div>
              <div className={styles.trashDialogActions}>
                <span className={styles.trashCount}>
                  {normalizedTrashQuery
                    ? `${filteredTrashedWords.length} / ${trashedWords.length} 词`
                    : `${trashedWords.length} 词`}
                </span>
                {trashedWords.length > 0 && (
                  <button
                    className={styles.trashRestoreAll}
                    type="button"
                    onClick={() => setConfirmRestoreAll(true)}
                  >
                    全部放回
                  </button>
                )}
                <button
                  className={styles.trashClose}
                  type="button"
                  aria-label="关闭垃圾桶"
                  onClick={() => setTrashOpen(false)}
                >
                  ×
                </button>
              </div>
            </div>
            <p className={styles.trashHint}>
              把九宫格里的词按住拖到这个垃圾桶会放进这里；放回后会在之后的轮次继续出现。
            </p>
            {trashedWords.length ? (
              filteredTrashedWords.length ? (
                <>
                  <div className={styles.trashGrid}>
                    {visibleTrashedWords.map((word) => (
                      <article className={styles.trashCard} key={word.id}>
                        <div className={styles.trashCardText}>
                          <strong>{word.en}</strong>
                          <small>{word.zh || '暂无释义'}</small>
                        </div>
                        <button type="button" onClick={() => restoreTrash(word.id)}>
                          放回
                        </button>
                      </article>
                    ))}
                  </div>
                  {filteredTrashedWords.length > TRASH_PAGE_SIZE && (
                    <div className={styles.trashPager}>
                      <button
                        type="button"
                        disabled={safeTrashPage === 0}
                        onClick={() => setTrashPage((page) => Math.max(0, page - 1))}
                      >
                        上一页
                      </button>
                      <span>
                        {safeTrashPage + 1} / {trashPageCount}
                      </span>
                      <button
                        type="button"
                        disabled={safeTrashPage >= trashPageCount - 1}
                        onClick={() => setTrashPage((page) => page + 1)}
                      >
                        下一页
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className={styles.trashEmpty}>没有匹配的词。</p>
              )
            ) : (
              <p className={styles.trashEmpty}>垃圾桶是空的。</p>
            )}
            <div className={styles.trashDialogFoot}>
              这里只保存本机当前词书的排除词，不会改变其他词书。
            </div>
          </section>
        </div>
      )}

      {zenMode && (
        <ZenCanvas
          pages={zenPages}
          session={session}
          layout={zenLayout}
          totalWords={activeWordCount}
          onWordClick={handleWordClick}
          onNext={handleZenNext}
          onExit={() => setZenMode(false)}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          hiddenTabs={hiddenTabs}
          tabNames={TAB_NAMES}
          onToggleTab={(tab) =>
            saveTabs(
              tabOrder,
              hiddenTabs.includes(tab)
                ? hiddenTabs.filter((item) => item !== tab)
                : [...hiddenTabs, tab],
            )
          }
          session={session}
          history={studyHistory.data ?? []}
          cycles={state.cycles ?? []}
          showDefaultAssociations={state.settings.showDefaultAssociations !== false}
          onToggleDefaultAssociations={() =>
            updateSettings({
              ...state.settings,
              showDefaultAssociations: state.settings.showDefaultAssociations === false,
            })
          }
          blankPageDefault={state.settings.blankPageDefault ?? 'unknown'}
          onChangeBlankPageDefault={(value) =>
            updateSettings({ ...state.settings, blankPageDefault: value })
          }
          autoTrashThreeGreens={state.settings.autoTrashThreeGreens !== false}
          onToggleAutoTrashThreeGreens={() =>
            updateSettings({
              ...state.settings,
              autoTrashThreeGreens: state.settings.autoTrashThreeGreens === false,
            })
          }
          soundOn={soundOn}
          email={
            authSession?.user && !(authSession.user as { isAnonymous?: boolean }).isAnonymous
              ? authSession.user.email
              : undefined
          }
          bookTitle={WORDBOOKS.find((book) => book.id === activeBookId)?.title ?? '平行世界'}
          onToggleSound={() => {
            const next = !soundOn
            setSoundOn(next)
            window.localStorage.setItem('whitepaper-sound', next ? 'on' : 'off')
          }}
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
          onGroupsChange={(groups) => updateSettings({ ...state.settings, groups })}
        />
      )}
      <input
        ref={fileInput}
        type="file"
        accept=".csv,.tsv,.txt,.json"
        hidden
        onChange={handleFileChange}
      />
      {sentenceOpen && (
        <SentenceDialog
          word={currentWords[0]?.en ?? ''}
          value={sentenceText}
          error={sentenceError}
          onChange={(value) => {
            setSentenceText(value)
            setSentenceError(null)
          }}
          onClose={() => setSentenceOpen(false)}
          onConfirm={() => {
            if (currentWords[0]) addCustomAssociation(currentWords[0].en, sentenceText)
          }}
          removedDefaults={(state.hiddenAssociationLinks ?? [])
            .filter((item) => item.startsWith(`${(currentWords[0]?.en ?? '').toLowerCase()}\u0000`))
            .map((item) => item.split('\u0000')[1] ?? '')
            .filter(Boolean)}
          removedCustoms={(
            state.customAssociations?.[(currentWords[0]?.en ?? '').toLowerCase()] ?? []
          ).filter((item) => (state.hiddenCustomAssociations ?? []).includes(item.id))}
          onRestoreDefault={(sentence) => {
            if (currentWords[0]) restoreHiddenAssociation(currentWords[0].en, sentence)
          }}
          onRestoreCustom={restoreHiddenCustom}
        />
      )}
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

function ScanView({
  words,
  session,
  trashedIds,
  onWordClick,
  onTrash,
  onAssociate,
}: {
  words: VocabularyWord[]
  session: VocabularySession
  trashedIds: string[]
  onWordClick: (id: string, reverse: boolean) => void
  onTrash: (id: string) => void
  onAssociate: (id: string) => void
}) {
  return (
    <div className={styles.paperInner}>
      <div className={styles.scanWrap}>
        <ScanGrid
          words={words}
          session={session}
          trashedIds={trashedIds}
          variant="workspace"
          onWordClick={onWordClick}
          onTrash={onTrash}
          onAssociate={onAssociate}
        />
      </div>
    </div>
  )
}

function ScanGrid({
  words,
  session,
  variant,
  sheetIndex,
  trashedIds = [],
  onWordClick,
  onTrash,
  onAssociate,
}: {
  words: VocabularyWord[]
  session: VocabularySession
  variant: 'workspace' | 'zen'
  sheetIndex?: number
  trashedIds?: string[]
  onWordClick: (id: string, reverse: boolean) => void
  onTrash?: (id: string) => void
  onAssociate?: (id: string) => void
}) {
  const groupCount = variant === 'zen' ? 4 : Math.max(1, Math.ceil(words.length / 9))
  const rootClass =
    variant === 'zen'
      ? styles.zenSheetGrid
      : `${styles.gridShell} ${session.groups === 6 ? styles.six : ''}`
  const groupClass = variant === 'zen' ? styles.zenQuadrant : styles.nine

  return (
    <div className={rootClass} data-layout="word-grid" data-groups={session.groups}>
      {Array.from({ length: groupCount }, (_, groupIndex) => (
        <div
          className={groupClass}
          data-layout="word-group"
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
              trashed={trashedIds.includes(word.id)}
              onWordClick={onWordClick}
              onTrash={onTrash}
              onAssociate={onAssociate}
              style={{
                gridColumn: (groupIndex % 2) * 3 + (wordIndex % 3) + 1,
                gridRow: Math.floor(groupIndex / 2) * 3 + Math.floor(wordIndex / 3) + 1,
              }}
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
      data-layout="paper"
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
  onSpeak,
  onPrefetch,
  onTrash,
  showDefaultAssociations,
  customAssociations,
  hiddenAssociationLinks,
  hiddenCustomAssociations,
  onRemoveLink,
}: {
  words: VocabularyWord[]
  allWords: VocabularyWord[]
  session: VocabularySession
  networks: VocabularyState['networks']
  onWordClick: (id: string, reverse: boolean) => void
  onSpeak: (text: string, audio?: string) => void
  onPrefetch: (text: string, audio?: string) => void
  onTrash: (id: string) => void
  showDefaultAssociations: boolean
  customAssociations: Record<string, Array<{ id: string; sentence: string }>>
  hiddenAssociationLinks: string[]
  hiddenCustomAssociations: string[]
  onRemoveLink: (target: string, sentence: string, custom: boolean) => void
}) {
  const word = words[0]
  const chunkSize = pageSize(session)
  const chunkStart = pageStart(session, chunkSize)
  const chunkWords = useMemo(
    () =>
      session.ids
        .slice(chunkStart, chunkStart + chunkSize)
        .map((id) => allWords.find((item) => item.id === id)?.en)
        .filter((item): item is string => Boolean(item)),
    [allWords, session.ids, chunkStart],
  )
  const nextWords = useMemo(
    () =>
      session.ids
        .slice(chunkStart + chunkSize, chunkStart + chunkSize * 2)
        .map((id) => allWords.find((item) => item.id === id)?.en)
        .filter((item): item is string => Boolean(item)),
    [allWords, session.ids, chunkStart],
  )
  const chunkKey = `${session.round}:${chunkStart}:${session.ids[chunkStart] ?? ''}`
  const batch = useAssociations(chunkWords, chunkKey)
  usePrefetchAssociations(
    nextWords,
    `${session.round}:${chunkStart + chunkSize}:${session.ids[chunkStart + chunkSize] ?? ''}`,
  )
  const network = word
    ? (batch.data?.[word.en.toLowerCase()] ?? getAssociation(networks, word))
    : undefined
  const loading = Boolean(word) && batch.isLoading && !network
  const hiddenCustom = new Set(hiddenCustomAssociations)
  const custom = word
    ? (customAssociations[word.en.toLowerCase()] ?? []).filter((item) => !hiddenCustom.has(item.id))
    : []
  const hidden = new Set(hiddenAssociationLinks)
  const defaultLinks =
    word && showDefaultAssociations
      ? (network?.links ?? []).filter(
          (link) => !hidden.has(`${word.en.toLowerCase()}\u0000${link.sentence}`),
        )
      : []
  const links = [
    ...defaultLinks.map((link) => ({
      ...link,
      custom: false,
      key: `default-${link.word}-${link.sentence}`,
    })),
    ...custom.map((item) => ({
      word: '自定义',
      sentence: item.sentence,
      audio: undefined as string | undefined,
      custom: true,
      key: `custom-${item.id}`,
      wordZh: undefined,
      sentenceZh: undefined,
      zh: undefined,
    })),
  ]
  const hasBoard = links.length > 0 || !showDefaultAssociations
  useEffect(() => {
    if (!network) return
    prefetchSpeech(network.links.map((link) => ({ text: link.sentence, audio: link.audio })))
  }, [network])
  const [showTranslations, setShowTranslations] = useState(false)

  useEffect(() => {
    setShowTranslations(false)
  }, [word?.id])

  const centerDrag = useWordTrashDrag(
    () => {
      setShowTranslations((visible) => !visible)
      if (word) onWordClick(word.id, false)
    },
    () => {
      if (word) onTrash(word.id)
    },
    false,
  )
  if (!word) return <div className={styles.paperInner} />
  const mark = session.marks[word.id]

  return (
    <>
      <div className={styles.paperInner}>
        <div className={styles.assocWrap}>
          {hasBoard ? (
            <div
              className={`${styles.assocBoard} ${links.length > 8 ? styles.assocBoardMany : ''}`}
            >
              {links.map((link) => {
                const fallbackWordZh = allWords.find(
                  (item) => item.en.toLowerCase() === link.word.toLowerCase(),
                )?.zh
                const wordZh = link.wordZh ?? fallbackWordZh
                const sentenceZh = link.sentenceZh

                return (
                  <div className={styles.assocNodeWrap} key={link.key}>
                    <button
                      className={`${styles.assocNode} ${link.custom ? styles.assocNodeCustom : ''}`}
                      data-selectable="true"
                      type="button"
                      aria-label={`朗读：${link.sentence}`}
                      onPointerEnter={() => !link.custom && onPrefetch(link.sentence, link.audio)}
                      onFocus={() => !link.custom && onPrefetch(link.sentence, link.audio)}
                      onClick={() => {
                        if (hasTextSelection()) return
                        onSpeak(link.sentence, link.audio)
                      }}
                    >
                      <span className={styles.assocWord}>
                        {link.word}
                        {showTranslations && wordZh && (
                          <small className={styles.assocWordZh}>
                            {highlightChinese(wordZh, [wordZh])}
                          </small>
                        )}
                      </span>
                      <span className={styles.assocSentence}>
                        {highlight(link.sentence, [link.custom ? word.en : link.word, word.en])}
                      </span>
                      {showTranslations && sentenceZh && (
                        <span className={styles.assocTranslation}>
                          {highlightChinese(
                            sentenceZh,
                            [word.zh, wordZh].filter((value): value is string => Boolean(value)),
                          )}
                        </span>
                      )}
                    </button>
                    <button
                      className={styles.assocRemove}
                      type="button"
                      aria-label={`移除${link.custom ? '自定义句' : '这条关联句'}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onRemoveLink(word.en, link.sentence, link.custom)
                      }}
                    >
                      ×
                    </button>
                  </div>
                )
              })}
              <div className={styles.assocCenter}>
                <button
                  className={`${styles.centerChip} ${mark ? markClass(mark) : ''}`}
                  data-selectable="true"
                  type="button"
                  title="左键翻译并标红，右键标绿；按住可拖到垃圾桶"
                  onPointerDown={centerDrag.handlePointerDown}
                  onContextMenu={(event) => {
                    event.preventDefault()
                    onWordClick(word.id, true)
                  }}
                  onClick={centerDrag.handleClick}
                >
                  <span className={styles.targetNote}>TARGET WORD</span>
                  <span className={styles.targetEn}>{word.en}</span>
                  {showTranslations && (
                    <span className={styles.targetZh}>{word.zh || '暂无释义'}</span>
                  )}
                </button>
              </div>
              {!links.length && (
                <p className={styles.assocEmptyHint}>默认关联已关闭，点右侧“造句”添加一句。</p>
              )}
            </div>
          ) : loading ? (
            <div className={styles.assocBoard} aria-busy="true" aria-label="正在加载关联句">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className={styles.assocNode} key={index}>
                  <span className={styles.assocSkeletonWord} />
                  <span className={styles.assocSkeletonLine} />
                </div>
              ))}
              <div className={styles.assocCenter}>
                <button
                  className={`${styles.centerChip} ${mark ? markClass(mark) : ''}`}
                  data-selectable="true"
                  type="button"
                  title="左键翻译并标红，右键标绿；按住可拖到垃圾桶"
                  onPointerDown={centerDrag.handlePointerDown}
                  onContextMenu={(event) => {
                    event.preventDefault()
                    onWordClick(word.id, true)
                  }}
                  onClick={centerDrag.handleClick}
                >
                  <span className={styles.targetNote}>TARGET WORD</span>
                  <span className={styles.targetEn}>{word.en}</span>
                  <span className={styles.targetZh}>{mark ? word.zh || '暂无释义' : '\u00a0'}</span>
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
        </div>
      </div>
      {centerDrag.dragging &&
        word &&
        createPortal(
          <div
            className={styles.wordGhost}
            style={{ left: centerDrag.position.x, top: centerDrag.position.y }}
            aria-hidden="true"
          >
            {word.en}
          </div>,
          document.body,
        )}
    </>
  )
}

function WordButton({
  word,
  session,
  trashed = false,
  onWordClick,
  onTrash,
  onAssociate,
  style,
}: {
  word: VocabularyWord
  session: VocabularySession
  trashed?: boolean
  onWordClick: (id: string, reverse: boolean) => void
  onTrash?: (id: string) => void
  onAssociate?: (id: string) => void
  style?: CSSProperties
}) {
  const mark = session.marks[word.id]
  const previewUnknown = !mark && session.peek && session.mode === 'unknown'
  const drag = useWordTrashDrag(
    (event) => onWordClick(word.id, false),
    onTrash ? () => onTrash(word.id) : undefined,
    trashed,
    onAssociate ? () => onAssociate(word.id) : undefined,
  )
  const longSingleWord = word.en.length > 11 && !/\s/.test(word.en)
  const className = [
    styles.word,
    longSingleWord ? styles.longWord : '',
    mark ? markClass(mark) : '',
    previewUnknown ? styles.unknownPreview : '',
    trashed ? styles.trashedWord : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <>
      <button
        className={className}
        data-selectable={!trashed}
        type="button"
        style={style}
        disabled={trashed}
        aria-label={
          trashed
            ? `${word.en}，已移入垃圾桶`
            : `${word.en}, ${mark || (previewUnknown ? '不会预览' : '未判定')}`
        }
        title={
          trashed
            ? '已移入垃圾桶，下一轮起不再推送'
            : `左键标红（不会），右键标绿（会）；按住拖到垃圾桶归档`
        }
        onPointerDown={drag.handlePointerDown}
        onClick={drag.handleClick}
        onContextMenu={(event) => {
          event.preventDefault()
          if (!trashed) onWordClick(word.id, true)
        }}
      >
        <span className={`${styles.zh} ${mark || previewUnknown ? '' : styles.empty}`}>
          {mark || previewUnknown ? word.zh || '暂无释义' : '—'}
        </span>
        <span className={styles.en}>{word.en}</span>
      </button>
      {drag.dragging &&
        createPortal(
          <div
            className={styles.wordGhost}
            style={{ left: drag.position.x, top: drag.position.y }}
            aria-hidden="true"
          >
            {word.en}
          </div>,
          document.body,
        )}
    </>
  )
}

function markClass(mark: Judgement) {
  return mark === 'known' ? styles.known : styles.unknown
}

function SentenceDialog({
  word,
  value,
  error,
  onChange,
  onClose,
  onConfirm,
  removedDefaults,
  removedCustoms,
  onRestoreDefault,
  onRestoreCustom,
}: {
  word: string
  value: string
  error: string | null
  onChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
  removedDefaults: string[]
  removedCustoms: Array<{ id: string; sentence: string }>
  onRestoreDefault: (sentence: string) => void
  onRestoreCustom: (id: string) => void
}) {
  return (
    <div
      className={styles.sentenceBackdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={styles.sentenceCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sentence-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) onConfirm()
        }}
      >
        <div className={styles.sentenceKicker}>MAKE A SENTENCE</div>
        <h2 id="sentence-title">给「{word}」造一句</h2>
        <p className={styles.sentenceHint}>句子要包含目标词。确认后会贴到关联纸的空位上。</p>
        <textarea
          className={styles.sentenceInput}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`写一句包含 ${word} 的英文句子…`}
          autoFocus
          rows={4}
          aria-label="新造句"
        />
        {error && <p className={styles.sentenceError}>{error}</p>}
        {(removedDefaults.length > 0 || removedCustoms.length > 0) && (
          <div className={styles.sentenceRemoved}>
            <p>已移除的句子</p>
            {removedDefaults.map((sentence) => (
              <div className={styles.sentenceRemovedRow} key={sentence}>
                <span>{sentence}</span>
                <button type="button" onClick={() => onRestoreDefault(sentence)}>
                  还原
                </button>
              </div>
            ))}
            {removedCustoms.map((item) => (
              <div className={styles.sentenceRemovedRow} key={item.id}>
                <span>{item.sentence}</span>
                <button type="button" onClick={() => onRestoreCustom(item.id)}>
                  还原
                </button>
              </div>
            ))}
          </div>
        )}
        <div className={styles.sentenceActions}>
          <button className={styles.ghostButton} type="button" onClick={onClose}>
            取消
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            disabled={!value.trim()}
            onClick={onConfirm}
          >
            贴到纸上
          </button>
        </div>
      </section>
    </div>
  )
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
    <section className={styles.roundTrack} data-layout="rounds">
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
            <div className={styles.fieldTitle}>鼠标标记</div>
            <p>
              左键标红（不会），右键标绿（会）。一页只能用一种颜色，取消最后一条同色标记后才能换色。
            </p>
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

function readUndoStore(): Record<string, VocabularySession[]> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(UNDO_STORAGE_KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function loadUndoStack(bookId: string, date: string): VocabularySession[] {
  const saved = readUndoStore()[`${bookId}:${date}`]
  return Array.isArray(saved) ? saved : []
}

function saveUndoStack(bookId: string, date: string, stack: VocabularySession[]) {
  try {
    const store = readUndoStore()
    store[`${bookId}:${date}`] = stack
    window.localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Keep the in-memory stack when storage is unavailable.
  }
}

function removeUndoStack(bookId: string, date: string) {
  try {
    const store = readUndoStore()
    delete store[`${bookId}:${date}`]
    window.localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Ignore unavailable storage.
  }
}

function loadState(): { state: VocabularyState; backupFailed: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { state: createInitialState(), backupFailed: false }
    const parsed = JSON.parse(raw) as Partial<VocabularyState>
    if (!Array.isArray(parsed.words) || !parsed.words.length)
      return { state: createInitialState(), backupFailed: false }
    const defaults = createInitialState()
    const words = reconcileStoredWords(parsed.words)
    if (!words.length) return { state: createInitialState(), backupFailed: false }
    const state: VocabularyState = {
      ...defaults,
      ...parsed,
      words,
      settings: { ...defaults.settings, ...parsed.settings },
      networks: Array.isArray(parsed.networks) ? normalizeNetworks(parsed.networks) : DEMO_NETWORKS,
      sessions: parsed.sessions ?? {},
      trashedIds: Array.isArray(parsed.trashedIds) ? parsed.trashedIds : [],
      cycles: Array.isArray(parsed.cycles) ? parsed.cycles : [],
      customAssociations:
        parsed.customAssociations && typeof parsed.customAssociations === 'object'
          ? parsed.customAssociations
          : {},
      hiddenAssociationLinks: Array.isArray(parsed.hiddenAssociationLinks)
        ? parsed.hiddenAssociationLinks
        : [],
      hiddenCustomAssociations: Array.isArray(parsed.hiddenCustomAssociations)
        ? parsed.hiddenCustomAssociations
        : [],
    }
    if (JSON.stringify(parsed.words) !== JSON.stringify(words)) {
      try {
        window.localStorage.setItem(`${STORAGE_KEY}-before-wordbook-migration-${Date.now()}`, raw)
      } catch {
        return { state: { ...state, words: parsed.words }, backupFailed: true }
      }
    }
    return { state, backupFailed: false }
  } catch {
    return { state: createInitialState(), backupFailed: false }
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
    state.sessions[today] = createSession(state.words, state.settings, state.trashedIds)
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

function highlight(sentence: string, words: string[]) {
  const unique = [...new Set(words.filter(Boolean))]
  if (!unique.length) return sentence
  const pattern = unique.map(escapeRegExp).join('|')
  const parts = sentence.split(new RegExp(`(${pattern})`, 'ig'))
  const normalized = new Set(unique.map((word) => word.toLowerCase()))
  return parts.map((part, index) =>
    normalized.has(part.toLowerCase()) ? <strong key={index}>{part}</strong> : part,
  )
}

function highlightChinese(text: string, terms: string[]) {
  const parts = terms
    .flatMap((term) => term.split(/[；;、，,\s]+/))
    .map((term) => term.trim())
    .filter((term) => term.length > 0)
  if (!parts.length) return text
  const unique = [
    ...new Set(
      parts.flatMap((term) => {
        const stem = term.replace(/[的地得]$/, '')
        return stem.length >= 2 && stem !== term ? [term, stem] : [term]
      }),
    ),
  ].sort((a, b) => b.length - a.length)
  const pattern = unique.map(escapeRegExp).join('|')
  const matched = new Set(unique)
  return text
    .split(new RegExp(`(${pattern})`, 'g'))
    .map((part, index) => (matched.has(part) ? <strong key={index}>{part}</strong> : part))
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

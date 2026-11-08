'use client'

import { useMemo, useState } from 'react'
import type { StudyHistoryDay } from '../hooks/use-study-history'
import type { VocabularySession } from '../lib/vocabulary'

type Category = 'account' | 'history' | 'sound' | 'judgement' | 'data' | 'appearance'

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'account', label: '账户' },
  { id: 'history', label: '学习记录' },
  { id: 'sound', label: '发音与声音' },
  { id: 'judgement', label: '判定与操作' },
  { id: 'data', label: '词书与数据' },
  { id: 'appearance', label: '外观' },
]

export function SettingsPanel({
  session,
  history,
  soundOn,
  email,
  bookTitle,
  onToggleSound,
  onModeChange,
  onReset,
  onLogin,
  onLogout,
  onClose,
}: {
  session: VocabularySession
  history: StudyHistoryDay[]
  soundOn: boolean
  email?: string
  bookTitle: string
  onToggleSound: () => void
  onModeChange: (mode: 'known' | 'unknown') => void
  onReset: () => void
  onLogin: () => void
  onLogout: () => void
  onClose: () => void
}) {
  const [active, setActive] = useState<Category>('account')

  const points = useMemo(() => {
    const days = [...history].reverse()
    if (days.length === 0) return ''
    const width = 560
    const height = 140
    return days
      .map((day, index) => {
        const total = day.known + day.unknown
        const ratio = total ? day.known / total : 0
        const x = days.length === 1 ? width / 2 : (index / (days.length - 1)) * width
        const y = height - ratio * height
        return `${x},${y}`
      })
      .join(' ')
  }, [history])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 md:p-8"
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="grid h-[82vh] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:grid-cols-[220px_1fr]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <aside className="border-b border-border bg-muted/30 p-4 md:border-b-0 md:border-r">
          <div className="mb-4 flex items-center justify-between md:block">
            <h2 id="settings-title" className="text-lg font-semibold">
              设置
            </h2>
            <button
              className="text-sm text-muted-foreground md:hidden"
              type="button"
              onClick={onClose}
            >
              关闭 ×
            </button>
          </div>
          <nav className="grid grid-cols-2 gap-1 md:grid-cols-1" aria-label="设置分类">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActive(category.id)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active === category.id
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-0 flex-col">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <strong>{CATEGORIES.find((category) => category.id === active)?.label}</strong>
            <button className="text-sm text-muted-foreground" type="button" onClick={onClose}>
              关闭 ×
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm leading-6 md:px-7">
            {active === 'account' && (
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  当前账号
                </p>
                <p className="text-lg font-medium">{email ?? '访客（进度只在本机）'}</p>
                {email ? (
                  <button className="rounded-lg border px-3 py-2" type="button" onClick={onLogout}>
                    退出登录
                  </button>
                ) : (
                  <button
                    className="rounded-lg bg-foreground px-3 py-2 text-background"
                    type="button"
                    onClick={onLogin}
                  >
                    登录 / 注册
                  </button>
                )}
                <p className="text-muted-foreground">登录后，判定、轮次和学习记录会保存到账号。</p>
              </div>
            )}

            {active === 'history' && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  当前词书每天首轮识别率。点某天看当天词数、会和不会。
                </p>
                {history.length === 0 ? (
                  <p>今天还没有学习记录。</p>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 560 160"
                      className="h-40 w-full rounded-lg border bg-background p-2"
                      role="img"
                      aria-label="首轮识别率曲线"
                    >
                      <polyline
                        points={points}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-foreground"
                      />
                    </svg>
                    <div className="space-y-1">
                      {history.map((day) => (
                        <div
                          key={day.date}
                          className="flex items-center justify-between border-b py-1.5"
                        >
                          <span>{day.date}</span>
                          <span className="text-muted-foreground">
                            {day.words} 词 · 会 {day.known} · 不会 {day.unknown} · 第 {day.rounds}{' '}
                            轮 · {day.complete ? '已完成' : '未完成'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {active === 'sound' && (
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={soundOn} onChange={onToggleSound} />
                  <span>每次点击词条播放美式发音</span>
                </label>
                <p className="text-muted-foreground">
                  使用系统语音；没有可用语音时，判定和翻页照常。
                </p>
              </div>
            )}

            {active === 'judgement' && (
              <div className="space-y-4">
                <p className="font-medium">普通点击的判定</p>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="panel-mode"
                    checked={session.mode === 'unknown'}
                    onChange={() => onModeChange('unknown')}
                  />
                  点击 = 不会
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="panel-mode"
                    checked={session.mode === 'known'}
                    onChange={() => onModeChange('known')}
                  />
                  点击 = 会
                </label>
                <p className="text-muted-foreground">
                  Shift + 点击始终执行相反判定。未点击词按当前模式默认提交。
                </p>
                <p className="text-muted-foreground">每页固定 4 组九宫格，共 36 词。</p>
              </div>
            )}

            {active === 'data' && (
              <div className="space-y-4">
                <p>
                  当前词书：<strong>{bookTitle}</strong>
                </p>
                <p className="text-muted-foreground">
                  同一时间只有一本活动词书。切换词书会保留另一本的进度。
                </p>
                <button
                  className="rounded-lg border border-destructive/40 px-3 py-2 text-destructive"
                  type="button"
                  onClick={onReset}
                >
                  重置今天这本书
                </button>
                <p className="text-muted-foreground">
                  只清空今天当前词书的轮次和判定，历史日期保留。
                </p>
              </div>
            )}

            {active === 'appearance' && (
              <div className="space-y-4">
                <p>当前使用纸张浅色主题，跟随系统配色。</p>
                <p className="text-muted-foreground">字体大小和纸张密度在后续版本提供。</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

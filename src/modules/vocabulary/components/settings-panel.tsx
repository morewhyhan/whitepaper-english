'use client'

import { useMemo, useState } from 'react'
import type { StudyHistoryDay } from '../hooks/use-study-history'
import type { CycleStat, VocabularySession } from '../lib/vocabulary'
import styles from './settings-panel.module.css'
import { LearningStats } from './learning-stats'

type PaperTab = '全部翻译' | '上一页' | '本页清空' | '打乱本页' | '造句' | '下一页'
type Category = 'account' | 'history' | 'stats' | 'sound' | 'association' | 'judgement' | 'data' | 'appearance' | 'tabs'

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'account', label: '账户' },
  { id: 'history', label: '学习记录' },
  { id: 'stats', label: '学习统计' },
  { id: 'association', label: '关联辅助' },
  { id: 'sound', label: '发音与声音' },
  { id: 'judgement', label: '判定与操作' },
  { id: 'tabs', label: '常用标签' },
  { id: 'data', label: '词书与数据' },
  { id: 'appearance', label: '外观' },
]

export function SettingsPanel({
  hiddenTabs,
  tabNames,
  onToggleTab,
  session,
  history,
  cycles,
  soundOn,
  showDefaultAssociations,
  onToggleDefaultAssociations,
  email,
  bookTitle,
  onToggleSound,
  onReset,
  onLogin,
  onLogout,
  onClose,
}: {
  hiddenTabs: readonly PaperTab[]
  tabNames: readonly PaperTab[]
  onToggleTab: (tab: PaperTab) => void
  session: VocabularySession
  history: StudyHistoryDay[]
  cycles: CycleStat[]
  soundOn: boolean
  showDefaultAssociations: boolean
  onToggleDefaultAssociations: () => void
  email?: string
  bookTitle: string
  onToggleSound: () => void
  onReset: () => void
  onLogin: () => void
  onLogout: () => void
  onClose: () => void
}) {
  const [active, setActive] = useState<Category>('account')
  const [confirmReset, setConfirmReset] = useState(false)

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

  const current = CATEGORIES.find((category) => category.id === active) ?? CATEGORIES[0]

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <aside className={styles.side}>
          <div className={styles.brand}>
            <span id="settings-title">设置</span>
            <small>SETTINGS</small>
          </div>
          <nav className={styles.nav} aria-label="设置分类">
            {CATEGORIES.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActive(category.id)}
                className={`${styles.navItem} ${active === category.id ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIndex}>{String(index + 1).padStart(2, '0')}</span>
                {category.label}
              </button>
            ))}
          </nav>
          <p className={styles.sideNote}>一天一张纸。设置只影响当前这张纸的用法。</p>
        </aside>

        <div className={styles.main}>
          <header className={styles.header}>
            <span className={styles.headerTitle}>{current.label}</span>
            <button className={styles.close} type="button" onClick={onClose} aria-label="关闭设置">
              ×
            </button>
          </header>

          <div className={styles.body}>
            {active === 'tabs' && <section className={styles.section}>
              <p className={styles.label}>纸张右侧的常用标签</p>
              <p className={styles.hint}>勾选显示，在纸边上下拖动调整顺序。设置保存在本机。</p>
              {tabNames.map((tab) => <label className={styles.checkRow} key={tab}><input type="checkbox" checked={!hiddenTabs.includes(tab)} onChange={() => onToggleTab(tab)} />{tab}</label>)}
            </section>}
            {active === 'account' && (
              <section className={styles.section}>
                <p className={styles.label}>当前账号</p>
                <p className={styles.value}>{email ?? '访客（进度只在本机）'}</p>
                {email ? (
                  <button className={styles.ghostButton} type="button" onClick={onLogout}>
                    退出登录
                  </button>
                ) : (
                  <button className={styles.primaryButton} type="button" onClick={onLogin}>
                    登录 / 注册
                  </button>
                )}
                <p className={styles.hint}>登录后，判定、轮次和学习记录会保存到账号。</p>
              </section>
            )}

            {active === 'stats' && <LearningStats cycles={cycles} bookTitle={bookTitle} />}

            {active === 'history' && (
              <section className={styles.section}>
                <p className={styles.hint}>当前词书每天首轮识别率。每一行是当天词数和判定。</p>
                {history.length === 0 ? (
                  <p className={styles.value}>今天还没有学习记录。</p>
                ) : (
                  <>
                    <svg
                      className={styles.chart}
                      viewBox="0 0 560 160"
                      role="img"
                      aria-label="首轮识别率曲线"
                    >
                      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <div className={styles.dayList}>
                      {history.map((day) => (
                        <div className={styles.dayRow} key={day.date}>
                          <span>{day.date}</span>
                          <span className={styles.dayMeta}>
                            {day.words} 词 · 会 {day.known} · 不会 {day.unknown} · 第 {day.rounds}{' '}
                            轮 · {day.complete ? '已完成' : '未完成'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {active === 'association' && (
              <section className={styles.section}>
                <p className={styles.label}>默认关联句</p>
                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={showDefaultAssociations}
                    onChange={onToggleDefaultAssociations}
                  />
                  <span>显示内置的 8 条关联句</span>
                </label>
                <p className={styles.hint}>
                  关闭后关联辅助只显示中心词；可以用右侧“造句”标签添加自己的句子。最多保存 4 条自定义句。
                </p>
              </section>
            )}

            {active === 'sound' && (
              <section className={styles.section}>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={soundOn} onChange={onToggleSound} />
                  <span>每次点击词条或关联句时朗读</span>
                </label>
                <p className={styles.hint}>
                  优先使用本地神经语音，首次加载需要一点时间；不可用时自动退回系统英文语音。不提供手动音色选择。
                </p>
              </section>
            )}

            {active === 'judgement' && (
              <section className={styles.section}>
                <p className={styles.label}>鼠标标记</p>
                <p className={styles.value}>左键标红：不会</p>
                <p className={styles.value}>右键标绿：会</p>
                <p className={styles.hint}>
                  一页只能用一种颜色。红页未标词默认会，绿页未标词默认不会；取消本页最后一条颜色后可重新选择。
                </p>
                <p className={styles.hint}>把词拖进垃圾桶等于标绿；垃圾桶词以浅灰色保留在原位。</p>
              </section>
            )}

            {active === 'data' && (
              <section className={styles.section}>
                <p className={styles.label}>当前词书</p>
                <p className={styles.value}>{bookTitle}</p>
                <p className={styles.hint}>
                  同一时间只有一本活动词书。切换词书会保留另一本的进度。
                </p>
                {confirmReset ? (
                  <div className={styles.confirmBox}>
                    <p className={styles.confirmTitle}>确定清空今天这本书的轮次和判定？</p>
                    <p className={styles.hint}>历史日期会保留。</p>
                    <div className={styles.confirmActions}>
                      <button
                        className={styles.dangerButton}
                        type="button"
                        onClick={() => {
                          setConfirmReset(false)
                          onReset()
                        }}
                      >
                        确认重置
                      </button>
                      <button
                        className={styles.ghostButton}
                        type="button"
                        onClick={() => setConfirmReset(false)}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={styles.dangerGhost}
                    type="button"
                    onClick={() => setConfirmReset(true)}
                  >
                    重置今天这本书
                  </button>
                )}
                <p className={styles.hint}>只清空今天当前词书的轮次和判定，历史日期保留。</p>
              </section>
            )}

            {active === 'appearance' && (
              <section className={styles.section}>
                <p className={styles.label}>纸张外观</p>
                <p className={styles.value}>当前使用纸张浅色主题，跟随系统配色。</p>
                <p className={styles.hint}>这一版不提供字体大小和纸张密度调整。</p>
              </section>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

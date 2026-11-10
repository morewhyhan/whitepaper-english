'use client'

import { useMemo, useState } from 'react'
import type { CycleStat } from '../lib/vocabulary'
import styles from './learning-stats.module.css'

type Range = 'today' | 'week' | 'month'
type View = 'date' | 'cycle'

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function startOfWeek(date: Date) {
  const copy = new Date(date)
  const day = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - day)
  return copy
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function rate(known: number, total: number) {
  return total ? known / total : 0
}

export function LearningStats({ cycles, bookTitle }: { cycles: CycleStat[]; bookTitle: string }) {
  const [view, setView] = useState<View>('date')
  const [range, setRange] = useState<Range>('week')
  const today = new Date()

  const filtered = useMemo(() => {
    const min =
      range === 'today'
        ? dateKey(today)
        : dateKey(range === 'week' ? startOfWeek(today) : startOfMonth(today))
    const max = dateKey(today)
    return cycles.filter((cycle) => cycle.date >= min && cycle.date <= max)
  }, [cycles, range, today])

  const days = useMemo(() => {
    const grouped = new Map<string, CycleStat[]>()
    for (const cycle of filtered) {
      const list = grouped.get(cycle.date) ?? []
      list.push(cycle)
      grouped.set(cycle.date, list)
    }
    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, list]) => ({
        date,
        rounds: list.length,
        reviewed: list.reduce((sum, item) => sum + item.reviewed, 0),
        known: list.reduce((sum, item) => sum + item.known, 0),
        unknown: list.reduce((sum, item) => sum + item.unknown, 0),
        trashed: list.reduce((sum, item) => sum + item.trashed, 0),
        firstReviewed: list.reduce((sum, item) => sum + item.firstReviewed, 0),
        firstKnown: list.reduce((sum, item) => sum + item.firstKnown + item.firstTrashed, 0),
      }))
  }, [filtered])

  const shownCycles = useMemo(
    () => [...filtered].sort((a, b) => a.cycle - b.cycle).slice(-12),
    [filtered],
  )
  const totalReviewed = filtered.reduce((sum, cycle) => sum + cycle.reviewed, 0)
  const totalKnown = filtered.reduce((sum, cycle) => sum + cycle.known + cycle.trashed, 0)
  const firstReviewed = filtered.reduce((sum, cycle) => sum + cycle.firstReviewed, 0)
  const firstKnown = filtered.reduce(
    (sum, cycle) => sum + cycle.firstKnown + cycle.firstTrashed,
    0,
  )
  const archived = filtered.reduce((sum, cycle) => sum + cycle.trashed, 0)

  const maxDay = Math.max(1, ...days.map((day) => day.reviewed))
  const maxCycle = Math.max(1, ...shownCycles.map((cycle) => cycle.reviewed))
  const cycleLine = shownCycles
    .map((cycle, index) => {
      const x = shownCycles.length === 1 ? 50 : (index / (shownCycles.length - 1)) * 100
      const y = 40 - rate(cycle.firstKnown + cycle.firstTrashed, cycle.firstReviewed) * 36
      return `${x},${y}`
    })
    .join(' ')
  const linePoints = days
    .map((day, index) => {
      const x = days.length === 1 ? 50 : (index / (days.length - 1)) * 100
      const y = 40 - rate(day.firstKnown, day.firstReviewed) * 36
      return `${x},${y}`
    })
    .join(' ')

  return (
    <section className={styles.stats}>
      <div className={styles.head}>
        <div>
          <p className={styles.kicker}>STUDY LEDGER · THIS WORDBOOK</p>
          <h3>学习统计</h3>
          <p className={styles.sub}>当前词书 · {bookTitle}。只记录每一整本书一轮的汇总，不保留单词明细。</p>
        </div>
        <div className={styles.switch}>
          <button
            type="button"
            className={view === 'date' ? styles.active : ''}
            onClick={() => setView('date')}
          >
            按日期
          </button>
          <button
            type="button"
            className={view === 'cycle' ? styles.active : ''}
            onClick={() => setView('cycle')}
          >
            按轮次
          </button>
        </div>
      </div>

      <div className={styles.kpis}>
        <div><strong>{filtered.length}</strong><span>轮</span></div>
        <div><strong>{totalReviewed}</strong><span>复习词次</span></div>
        <div><strong>{Math.round(rate(totalKnown, totalReviewed) * 100)}%</strong><span>通过率</span></div>
        <div><strong>{archived}</strong><span>归档</span></div>
      </div>

      {view === 'date' ? (
        <>
          <div className={styles.range}>
            {(['today', 'week', 'month'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={range === item ? styles.active : ''}
                onClick={() => setRange(item)}
              >
                {item === 'today' ? '今天' : item === 'week' ? '本周' : '本月'}
              </button>
            ))}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <strong>每日复习与通过率</strong>
              <span>柱：词次 · 线：首次通过率</span>
            </div>
            {days.length ? (
              <>
                <svg className={styles.line} viewBox="0 0 100 44" preserveAspectRatio="none">
                  <polyline points={linePoints} fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <div className={styles.bars}>
                  {days.map((day) => (
                    <div className={styles.barColumn} key={day.date}>
                      <div className={styles.barStack} style={{ height: `${(day.reviewed / maxDay) * 100}%` }}>
                        <span className={styles.knownBar} style={{ flex: day.known + day.trashed }} />
                        <span className={styles.unknownBar} style={{ flex: day.unknown }} />
                      </div>
                      <small>{day.date.slice(5)}</small>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className={styles.empty}>这个时间段还没有完成过整本书的一轮。</p>
            )}
          </div>
        </>
      ) : (
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <strong>每轮构成</strong>
            <span>最近 {shownCycles.length} 轮 · 柱高按复习词次</span>
          </div>
          {shownCycles.length ? (
            <div className={styles.cycleBars}>
              {shownCycles.map((cycle) => (
                <div className={styles.barColumn} key={cycle.id}>
                  <div className={styles.barStack} style={{ height: `${(cycle.reviewed / maxCycle) * 100}%` }}>
                    <span className={styles.knownBar} style={{ flex: cycle.known + cycle.trashed }} />
                    <span className={styles.unknownBar} style={{ flex: cycle.unknown }} />
                  </div>
                  <small>第 {cycle.cycle} 轮</small>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>还没有整本书的轮次数据。</p>
          )}
          {shownCycles.length > 0 && (
            <svg className={styles.line} viewBox="0 0 100 44" preserveAspectRatio="none">
              <polyline points={cycleLine} fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
          <div className={styles.legend}>
            <span><i className={styles.knownDot} />会 / 归档</span>
            <span><i className={styles.unknownDot} />不会</span>
            <span>首次通过率 {Math.round(rate(firstKnown, firstReviewed) * 100)}%</span>
          </div>
        </div>
      )}
    </section>
  )
}

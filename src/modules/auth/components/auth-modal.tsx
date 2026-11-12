'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { authConfig } from '@/config/auth'
import { toast } from 'sonner'
import { useSignIn, useSignUp } from '../hooks/use-auth'
import styles from './auth-modal.module.css'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthMode
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const signIn = useSignIn()
  const signUp = useSignUp()

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (mode === 'register' && password !== confirmPassword) {
      toast.error('密码不匹配')
      return
    }

    if (mode === 'login') {
      signIn.mutate({ email, password })
    } else {
      signUp.mutate({ email, password, name })
    }
  }

  const isLoading = signIn.isPending || signUp.isPending

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={styles.shell} role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <aside className={styles.aside}>
          <div className={styles.brand}>
            <span className={styles.mark}>白</span>
            <div>
              <p className={styles.brandName}>白纸英语</p>
              <p className={styles.brandNote}>MEMORY, IN THE OPEN.</p>
            </div>
          </div>

          <div className={styles.quote}>
            <p className={styles.quoteKicker}>A QUIETER WAY TO REMEMBER</p>
            <h2>
              把词放回
              <br />
              它真正出现的地方。
            </h2>
            <p>不是多背一张表，而是在一个句子里，重新认出一个词。</p>
          </div>

          <p className={styles.asideFoot}>Less noise. More words.</p>
        </aside>

        <section className={styles.formSide}>
          <button className={styles.close} type="button" onClick={onClose} aria-label="关闭登录">
            ×
          </button>

          <div className={styles.heading}>
            <p className={styles.kicker}>{mode === 'login' ? 'WELCOME BACK' : 'NEW SHEET'}</p>
            <h1 id="auth-title">{mode === 'login' ? '欢迎回来' : '创建账户'}</h1>
            <p>{mode === 'login' ? '继续你上次停下的那一页。' : '注册后，进度会跟着账号走。'}</p>
          </div>

          <div className={styles.tabs} role="group" aria-label="登录或注册">
            <button
              type="button"
              aria-pressed={mode === 'login'}
              onClick={() => switchMode('login')}
              className={mode === 'login' ? styles.tabActive : styles.tab}
            >
              登录
            </button>
            <button
              type="button"
              aria-pressed={mode === 'register'}
              onClick={() => switchMode('register')}
              className={mode === 'register' ? styles.tabActive : styles.tab}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'register' && (
              <label className={styles.field}>
                <span>用户名</span>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="你的用户名"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
            )}

            <label className={styles.field}>
              <span>邮箱</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoFocus
              />
            </label>

            <label className={styles.field}>
              <span>密码</span>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="输入密码"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={authConfig.minPasswordLength}
                maxLength={authConfig.maxPasswordLength}
              />
            </label>

            {mode === 'register' && (
              <label className={styles.field}>
                <span>确认密码</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={authConfig.minPasswordLength}
                  maxLength={authConfig.maxPasswordLength}
                />
              </label>
            )}

            <button className={styles.submit} type="submit" disabled={isLoading} aria-live="polite">
              {isLoading ? '处理中…' : mode === 'login' ? '登录' : '创建账户'}
              {!isLoading && <span aria-hidden="true">→</span>}
            </button>
          </form>

        </section>
      </div>
    </div>
  )
}

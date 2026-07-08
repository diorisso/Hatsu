import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import { useSession } from '../session/SessionProvider'
import { useTheme } from '../theme/ThemeProvider'
import { useAccent } from '../theme/AccentProvider'
import { ACCENTS } from '../theme/accents'
import { Avatar } from '../components/Avatar'
import './settings.css'

const MAX_BYTES = 5 * 1024 * 1024

export function SettingsPage() {
  const { user, updateUser } = useSession()
  const { theme, setTheme } = useTheme()
  const { accent, setAccent } = useAccent()

  const [username, setUsername] = useState(user?.username ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [profileNote, setProfileNote] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [bannerBusy, setBannerBusy] = useState(false)
  const [bannerError, setBannerError] = useState<string | null>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwNote, setPwNote] = useState<string | null>(null)
  const [pwError, setPwError] = useState<string | null>(null)
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setBio(user.bio ?? '')
    }
  }, [user])

  const name = user?.username ?? ''
  const avatarUrl = user?.avatarUrl ?? null
  const bannerUrl = user?.bannerUrl ?? null
  const usernameValid = username.trim().length >= 2
  const normalizedBio = bio.trim() ? bio.trim() : null
  const profileDirty =
    username.trim() !== user?.username || normalizedBio !== (user?.bio ?? null)
  const canSaveProfile = usernameValid && profileDirty

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    if (!canSaveProfile) return
    setSavingProfile(true)
    setProfileError(null)
    setProfileNote(null)
    try {
      const updated = await api.users.updateProfile({
        username: username.trim(),
        bio: normalizedBio,
      })
      updateUser(updated)
      setProfileNote('Profile updated.')
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Could not update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setAvatarError('Choose an image file.')
      return
    }
    if (file.size > MAX_BYTES) {
      setAvatarError('Image must be 5 MB or smaller.')
      return
    }
    setAvatarBusy(true)
    setAvatarError(null)
    try {
      const updated = await api.users.uploadAvatar(file)
      updateUser(updated)
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : 'Upload failed. Try again.')
    } finally {
      setAvatarBusy(false)
    }
  }

  async function removeAvatar() {
    setAvatarBusy(true)
    setAvatarError(null)
    try {
      const updated = await api.users.removeAvatar()
      updateUser(updated)
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : 'Could not remove photo.')
    } finally {
      setAvatarBusy(false)
    }
  }

  async function handleBanner(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setBannerError('Choose an image file.')
      return
    }
    if (file.size > MAX_BYTES) {
      setBannerError('Image must be 5 MB or smaller.')
      return
    }
    setBannerBusy(true)
    setBannerError(null)
    try {
      const updated = await api.users.uploadBanner(file)
      updateUser(updated)
    } catch (err) {
      setBannerError(err instanceof ApiError ? err.message : 'Upload failed. Try again.')
    } finally {
      setBannerBusy(false)
    }
  }

  async function removeBanner() {
    setBannerBusy(true)
    setBannerError(null)
    try {
      const updated = await api.users.removeBanner()
      updateUser(updated)
    } catch (err) {
      setBannerError(err instanceof ApiError ? err.message : 'Could not remove banner.')
    } finally {
      setBannerBusy(false)
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault()
    setPwError(null)
    setPwNote(null)
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }
    setSavingPw(true)
    try {
      await api.users.changePassword({ currentPassword, newPassword })
      setPwNote('Password updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : 'Could not change password.')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <section className="page settings">
      <div className="page__head">
        <p className="eyebrow">Account</p>
        <h1 className="page__title">Settings</h1>
      </div>

      <div className="settings__card">
        <h2 className="settings__title">Profile</h2>

        <div className="settings__banner">
          {bannerUrl ? (
            <img className="settings__banner-img" src={bannerUrl} alt="" />
          ) : (
            <div className="settings__banner-empty" />
          )}
          <div className="settings__banner-actions">
            <input ref={bannerRef} type="file" accept="image/*" hidden onChange={handleBanner} />
            <button
              type="button"
              className="ghost-btn"
              disabled={bannerBusy}
              onClick={() => bannerRef.current?.click()}
            >
              {bannerBusy ? 'Working…' : bannerUrl ? 'Change banner' : 'Upload banner'}
            </button>
            {bannerUrl && (
              <button type="button" className="ghost-btn" disabled={bannerBusy} onClick={removeBanner}>
                Remove
              </button>
            )}
          </div>
        </div>
        {bannerError && <p className="settings__error">{bannerError}</p>}

        <div className="settings__avatar">
          <Avatar name={name} src={avatarUrl} size={72} />
          <div className="settings__avatar-actions">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
            <button
              type="button"
              className="ghost-btn"
              disabled={avatarBusy}
              onClick={() => fileRef.current?.click()}
            >
              {avatarBusy ? 'Working…' : avatarUrl ? 'Change photo' : 'Upload photo'}
            </button>
            {avatarUrl && (
              <button type="button" className="ghost-btn" disabled={avatarBusy} onClick={removeAvatar}>
                Remove
              </button>
            )}
          </div>
        </div>
        {avatarError && <p className="settings__error">{avatarError}</p>}

        <form className="settings__form" onSubmit={saveProfile}>
          <label className="field" htmlFor="settings-username">
            <span className="field__label">Username</span>
            <input
              id="settings-username"
              className="field__input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="field" htmlFor="settings-email">
            <span className="field__label">Email</span>
            <input
              id="settings-email"
              className="field__input"
              type="email"
              value={user?.email ?? ''}
              disabled
            />
          </label>
          <label className="field" htmlFor="settings-bio">
            <span className="field__label">Bio</span>
            <textarea
              id="settings-bio"
              className="field__input settings__bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell people about yourself…"
            />
            <span className="field__hint">{500 - bio.length} left</span>
          </label>
          {profileError && <p className="settings__error">{profileError}</p>}
          {profileNote && <p className="settings__note">{profileNote}</p>}
          <div className="settings__actions">
            <button className="btn" type="submit" disabled={!canSaveProfile || savingProfile}>
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="settings__card">
        <h2 className="settings__title">Password</h2>
        <form className="settings__form" onSubmit={savePassword}>
          <label className="field" htmlFor="settings-current">
            <span className="field__label">Current password</span>
            <input
              id="settings-current"
              className="field__input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label className="field" htmlFor="settings-new">
            <span className="field__label">New password</span>
            <input
              id="settings-new"
              className="field__input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
          <label className="field" htmlFor="settings-confirm">
            <span className="field__label">Confirm new password</span>
            <input
              id="settings-confirm"
              className="field__input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          {pwError && <p className="settings__error">{pwError}</p>}
          {pwNote && <p className="settings__note">{pwNote}</p>}
          <div className="settings__actions">
            <button
              className="btn"
              type="submit"
              disabled={savingPw || !currentPassword || !newPassword || !confirmPassword}
            >
              {savingPw ? 'Saving…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>

      <div className="settings__card">
        <h2 className="settings__title">Appearance</h2>

        <div className="settings__row">
          <span className="settings__row-label">Theme</span>
          <div className="settings__seg" role="group" aria-label="Theme">
            <button
              type="button"
              className="settings__seg-btn"
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
            >
              Light
            </button>
            <button
              type="button"
              className="settings__seg-btn"
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="settings__row">
          <span className="settings__row-label">Accent color</span>
          <div className="settings__swatches" role="group" aria-label="Accent color">
            {ACCENTS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="settings__swatch"
                aria-pressed={accent.toLowerCase() === option.value.toLowerCase()}
                aria-label={option.name}
                title={option.name}
                style={{ background: option.value }}
                onClick={() => setAccent(option.value)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

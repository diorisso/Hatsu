import { EntryStatus, GameType } from './types'

export const STATUS_LABEL: Record<EntryStatus, string> = {
  [EntryStatus.Playing]: 'Now Playing',
  [EntryStatus.Completed]: 'Completed',
  [EntryStatus.Backlog]: 'Backlog',
  [EntryStatus.Dropped]: 'Dropped',
}

export const STATUS_COLOR: Record<EntryStatus, string> = {
  [EntryStatus.Playing]: '#71b340',
  [EntryStatus.Completed]: '#3f88c5',
  [EntryStatus.Backlog]: '#f7b538',
  [EntryStatus.Dropped]: '#c1292e',
}

export const STATUS_SORT_ORDER: Record<EntryStatus, number> = {
  [EntryStatus.Playing]: 0,
  [EntryStatus.Backlog]: 1,
  [EntryStatus.Completed]: 2,
  [EntryStatus.Dropped]: 3,
}

export const GAME_TYPE_LABEL: Record<GameType, string> = {
  [GameType.MainGame]: 'Game',
  [GameType.DlcAddon]: 'DLC',
  [GameType.Expansion]: 'Expansion',
  [GameType.Bundle]: 'Bundle',
  [GameType.StandaloneExpansion]: 'Standalone',
  [GameType.Mod]: 'Mod',
  [GameType.Episode]: 'Episode',
  [GameType.Season]: 'Season',
  [GameType.Remake]: 'Remake',
  [GameType.Remaster]: 'Remaster',
  [GameType.ExpandedGame]: 'Expanded',
  [GameType.Port]: 'Port',
  [GameType.Fork]: 'Fork',
  [GameType.Pack]: 'Pack',
  [GameType.Update]: 'Update',
}

export const STATUS_OPTIONS: EntryStatus[] = [
  EntryStatus.Playing,
  EntryStatus.Completed,
  EntryStatus.Backlog,
  EntryStatus.Dropped,
]

export function coverUrl(raw: string | null, size = 't_cover_big'): string | null {
  if (!raw) return null
  const normalized = raw.startsWith('//') ? `https:${raw}` : raw
  return normalized.replace('t_thumb', size)
}

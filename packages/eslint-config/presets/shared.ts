import { Linter } from 'eslint'

import { mergeConfigs } from '../shared/lib/eslint'
import { PackageJson } from '../shared/types'
import { PresetName } from './types'

export interface Meta {
  root: string
  allowDebug: boolean
  readPackageJson(): PackageJson | null
  presets: Set<PresetName>
  imports: {
    extensions: string[]
  }
  typescript: {
    root: string
    tsconfig: string
  }
}

export interface Input<T = never> {
  options?: T
  meta: Meta
}

export interface Preset<T = never> {
  name: PresetName
  options?: T
  updateMeta(input: Input<T>): void
  compile(input: Input<T>): Linter.Config
}

interface CreatePresetParams<T = void> {
  name: PresetName
  updateMeta?(input: Input<T>): void
  compile(input: Input<T>): Linter.Config
}

export const createPreset =
  <T = never>({ name, updateMeta = () => {}, compile }: CreatePresetParams<T>) =>
  (options?: T) => ({ name, options, updateMeta, compile })

export const createMeta = (): Meta => ({
  root: process.cwd(),
  allowDebug: false,
  readPackageJson: () => null,
  presets: new Set(),
  imports: {
    extensions: []
  },
  typescript: {
    root: './',
    tsconfig: 'tsconfig.json'
  }
})

export const compilePresets = (presets: Preset<unknown>[], priority: string[]): Linter.Config => {
  const prioritized = presets.slice().sort((a, b) => priority.indexOf(a.name) - priority.indexOf(b.name))

  const meta = createMeta()

  for (const preset of prioritized) {
    meta.presets.add(preset.name)
    preset.updateMeta({ meta, options: preset.options })
  }

  const configs = prioritized.map((preset) => preset.compile({ meta, options: preset.options }))

  return mergeConfigs(configs)
}

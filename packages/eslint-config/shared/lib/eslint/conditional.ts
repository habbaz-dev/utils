import type { Linter } from 'eslint'

type OnlyCollections<T> = T extends any[] ? T : T extends object ? T : never

function applier<T extends 'rules' | 'settings' | 'extends' | 'parserOptions' | 'overrides'>() {
	return (condition: unknown, entity: OnlyCollections<Linter.Config[T]>): OnlyCollections<Linter.Config[T]> => {
		const fallback = Array.isArray(entity) ? [] : {}
		if (!condition) return fallback as OnlyCollections<Linter.Config[T]>
		return entity
	}
}

export const conditional = {
	rules: applier<'rules'>(),
	settings: applier<'settings'>(),
	extends: applier<'extends'>(),
	parserOptions: applier<'parserOptions'>(),
	overrides: applier<'overrides'>()
}

import { chrome as chromeMock } from 'vitest-chrome'

Object.assign(global, { chrome: chromeMock })

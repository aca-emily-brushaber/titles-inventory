import { setProvider } from '../data-provider'
import { mockProvider } from './mock-provider'

let initialized = false

export function initializeProvider(): void {
  if (initialized) return
  setProvider(mockProvider)
  initialized = true
}

initializeProvider()

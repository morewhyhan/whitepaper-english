export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { warmTts } = await import('./server/vocabulary/tts')
  warmTts()
}

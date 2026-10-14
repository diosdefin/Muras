import ky from './ky.json' with { type: 'json' }
import uz from './uz.json' with { type: 'json' }
import ru from './ru.json' with { type: 'json' }
import en from './en.json' with { type: 'json' }
import { LANGUAGES, translate } from '../data/localization.js'
export const messages = { ky, uz, ru, en }
export function registerLocaleMessages(additions) {
  for (const language of LANGUAGES) messages[language] = { ...messages[language], ...additions[language] }
}
export const tr = (language, key, values) => translate(messages, language, key, values)

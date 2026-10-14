import ky from './ky.json' with {type:'json'}
import uz from './uz.json' with {type:'json'}
import ru from './ru.json' with {type:'json'}
import en from './en.json' with {type:'json'}
import {registerLocaleMessages} from '../../locales/index.js'
export const adminMessages={ky,uz,ru,en}
registerLocaleMessages(adminMessages)

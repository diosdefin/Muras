import {mkdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
// Production has a static informational page, no editor bundle or write API.
export async function writeAdminEntry(root=process.cwd()) {
  await mkdir(resolve(root,'dist/admin'),{recursive:true})
  await writeFile(resolve(root,'dist/admin/index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MURAS — local editor only</title><main><h1>MURAS</h1><p lang="ky">Редактор жергиликтүү режимде гана жеткиликтүү.</p><p lang="ru">Редактор доступен только локально.</p><p lang="uz">Muharrir faqat mahalliy rejimda mavjud.</p><p lang="en">The editor is available locally only: <code>npm run dev:admin</code></p><a href="../">MURAS →</a></main></html>')
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await writeAdminEntry()

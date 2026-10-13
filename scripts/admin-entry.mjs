import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
export async function writeAdminEntry(root=process.cwd()) {
  const html=await readFile(resolve(root,'dist/index.html'),'utf8')
  await mkdir(resolve(root,'dist/admin'),{recursive:true})
  await writeFile(resolve(root,'dist/admin/index.html'),html)
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await writeAdminEntry()

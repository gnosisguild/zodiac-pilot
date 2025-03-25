import { readdir, readFile, stat, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'

const migrateDirectory = async (directory: string) => {
  const listing = await readdir(directory)

  for (const item of listing) {
    const info = await stat(item)

    if (info.isDirectory()) {
      await migrateDirectory(`${directory}/${item}`)
    } else {
      const content = await readFile(item)

      await writeFile(
        item,
        content
          .toString('utf-8')
          .replaceAll('eval("__dirname")', 'import.meta.dirname')
          .replaceAll('__dirname', 'import.meta.dirname'),
      )
    }
  }
}

const prismaRoot = new URL('./prisma/generated/client', import.meta.url)

await migrateDirectory(fileURLToPath(prismaRoot))

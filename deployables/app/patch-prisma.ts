import { readdir, readFile, stat, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'

const migrateDirectory = async (directory: string) => {
  const listing = await readdir(directory)

  for (const item of listing) {
    const info = await stat(`${directory}/${item}`)

    if (info.isDirectory()) {
      await migrateDirectory(`${directory}/${item}`)
    } else if (!item.endsWith('.js')) {
      continue
    } else {
      const content = await readFile(`${directory}/${item}`)

      await writeFile(
        `${directory}/${item}`,
        content
          .toString('utf-8')
          .replaceAll('eval("__dirname")', 'import.meta.dirname')
          .replaceAll('__dirname', 'import.meta.dirname')
          .replaceAll('__filename', 'import.meta.filename'),
      )
    }
  }
}

const prismaRoot = new URL(
  './node_modules/@prisma/client-generated',
  import.meta.url,
)

await migrateDirectory(fileURLToPath(prismaRoot))

import { invariant } from '@epic-web/invariant'
import { getCompanionAppUrl } from '@zodiac/env'
import chalk from 'chalk'
import { config } from 'dotenv'
import fs from 'fs'
import { parseArgs } from 'node:util'

config()

// this script is used to update the release value
// in the manifest.json when released through github
// actions. Meant to be used as a cli script:
//
// node manifest-util.js ./public/manifest.json

const getIframeUrl = () => {
  return `${getCompanionAppUrl()}/`
}

const updateManifest = (templateFileName, outFileName, version) => {
  try {
    console.log(chalk.white.bold('Manifest template file:'))
    console.log(new URL(templateFileName, import.meta.url).pathname)

    const data = fs
      .readFileSync(templateFileName)
      .toString()
      .replaceAll('<COMPANION_APP_URL>', getIframeUrl())

    const manifest = JSON.parse(data)
    manifest['version'] = version.replace('v', '')

    console.log(chalk.white.bold('\nWriting manifest to:'))
    console.log(new URL(outFileName, import.meta.url).pathname)

    fs.writeFileSync(outFileName, JSON.stringify(manifest, undefined, 2))
  } catch (error) {
    console.log(error)
  }
}

const {
  values: { template, outFile, version },
} = parseArgs({
  options: {
    template: {
      type: 'string',
      short: 't',
      description: 'Path to the template file',
    },
    outFile: {
      type: 'string',
      short: 'o',
      description: 'Path to the output file',
    },
    version: {
      type: 'string',
      short: 'v',
      description: 'Version to update the manifest to',
      default: 'v0.0.0',
    },
  },
})

invariant(template != null, 'Path to template file missing')
invariant(outFile != null, 'Path to output file missing')

updateManifest(template, outFile, version)

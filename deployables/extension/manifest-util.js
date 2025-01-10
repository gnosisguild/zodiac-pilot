import { invariant } from '@epic-web/invariant'
import { config } from 'dotenv'
import fs from 'fs'
import { parseArgs } from 'node:util'

config()

// this script is used to update the release value
// in the manifest.json when released through github
// actions. Meant to be used as a cli script:
//
// node manifest-util.js ./public/manifest.json

const updateManifest = (templateFileName, outFileName, version) => {
  const iframeUrl = process.env.CONNECT_IFRAME_URL

  invariant(iframeUrl != null, 'CONNECT_IFRAME_URL is missing')

  try {
    const data = fs
      .readFileSync(templateFileName)
      .toString()
      .replaceAll('<CONNECT_IFRAME_URL>', iframeUrl)

    const manifest = JSON.parse(data)
    manifest['version'] = version.replace('v', '')

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

// const releaseTag = process.env.RELEASE_TAG

updateManifest(template, outFile, version)

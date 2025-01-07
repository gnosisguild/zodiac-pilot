import fs from 'fs'

// this script is used to update the release value
// in the manifest.json when released through github
// actions. Meant to be used as a cli script:
//
// node manifest-util.js ./public/manifest.json

const main = () => {
  const manifestPath = process.argv[2]
  const releaseTag = process.env.RELEASE_TAG
  if (!manifestPath) {
    return console.log('Please provide a path to the manifest file.')
  }
  if (!releaseTag) {
    return console.log('Please provide a RELEASE_TAG env variable.')
  }

  updateManifest(manifestPath, releaseTag)
}

const updateManifest = (manifestFilename, releaseTag) => {
  const version = releaseTag.replace('v', '')

  try {
    const data = fs.readFileSync(manifestFilename)
    const manifest = JSON.parse(data)
    manifest['version'] = version
    fs.writeFileSync(manifestFilename, JSON.stringify(manifest))
  } catch (error) {
    console.log(error)
  }
}

main()

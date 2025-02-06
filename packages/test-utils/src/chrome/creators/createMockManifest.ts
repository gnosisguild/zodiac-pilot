export const createMockManifest = (
  manifest: Partial<chrome.runtime.ManifestV3>,
): chrome.runtime.ManifestV3 => ({
  manifest_version: 3,
  name: 'Test manifest',
  version: '0.0.0-testing',

  ...manifest,
})

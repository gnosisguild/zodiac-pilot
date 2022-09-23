// This script will be added as a content script at document_start to pages of the extension host https://pilot.gnosisguild.org.
// It writes to the global window object so that our landing page can detect that the extension is installed.

;(window as Record<string, any>).zodiacPilotIsActive = true

export {}

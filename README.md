# Zodiac Pilot

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/gnosiguild/CODE_OF_CONDUCT)
[![Static Checks](https://github.com/gnosisguild/zodiac-pilot/actions/workflows/static-checks.yaml/badge.svg)](https://github.com/gnosiguild/zodiac-pilot/actions/workflows/static-checks.yaml)
[![Tests](https://github.com/gnosisguild/zodiac-pilot/actions/workflows/tests.yaml/badge.svg)](https://github.com/gnosiguild/zodiac-pilot/actions/workflows/tests.yaml)
[![Live Tests](https://github.com/gnosisguild/zodiac-pilot/actions/workflows/live-tests.yaml/badge.svg)](https://github.com/gnosiguild/zodiac-pilot/actions/workflows/live-tests.yaml)

Zodiac Pilot is a browser-based tool for Safe accounts that enables users to build and execute multi-step transactions across multiple dapps. It combines modular batching, programmable permissions, and a built-in sandbox environment to simulate transactions before they’re sent onchain. Designed to streamline treasury, governance, and DeFi workflows, Pilot reduces risk and coordination overhead by letting users manage execution directly from a side panel interface. [Available on the Chrome Web Store](https://chrome.google.com/webstore/detail/zodiac-pilot/jklckajipokenkbbodifahogmidkekcb?hl=en&authuser=0)

## Contribute

### Overview

The [extension](./deployables/extension/) folder hosts the code of the browser extension.
The included [README](./deployables/extension/README.md) documents the most important concepts.

To run a development version of the extension from a branch:

```bash
cd extension
pnpm i
pnpm dev
```

The build output is written to extension/public/build.
The `dev` script will watch for changes and automatically rebuild.

To enable the extension in Chrome, follow these steps:

1. Open the Extension Management page by navigating to [chrome://extensions](chrome://extensions).
2. Enable **Developer Mode** by clicking the toggle switch at the top right of the page.
3. Click the **Load unpacked** button and select the `extension/public` directory.

import '@testing-library/jest-dom'
import 'isomorphic-fetch'
import dotenv from 'dotenv'
import { TextEncoder, TextDecoder } from 'util'

// https://stackoverflow.com/a/68468204
Object.assign(global, { TextDecoder, TextEncoder })

// Load environment variables.
dotenv.config()

window.document.body.innerHTML = '<div id="root"></div>'

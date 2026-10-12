// Preload for reproducible offline build QA; this file is never shipped to the browser.
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import tls from 'node:tls'
import { syncBuiltinESMExports } from 'node:module'
const deny = () => { throw new Error('Outbound network disabled for offline-build verification') }
globalThis.fetch = deny
http.request = http.get = https.request = https.get = deny
net.connect = net.createConnection = tls.connect = deny
syncBuiltinESMExports()

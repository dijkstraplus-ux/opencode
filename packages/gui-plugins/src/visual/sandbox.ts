import { Option, Schema } from "effect"

/**
 * The fence language a model writes for generated UI. A dedicated name, so the ```` ```html ```` samples in ordinary
 * answers keep showing as code.
 */
export const VISUAL_LANGUAGE = "visual-html"

/** The type of the message the frame's own script sends with the document's height. */
export const HEIGHT_MESSAGE = "opencode:visual-height"

export const MIN_HEIGHT = 80

export const MAX_HEIGHT = 1200

export const DEFAULT_HEIGHT = 320

// Everything the frame may load is inline or a data or blob URL: no network, no other origin, no form posts. With the
// iframe's `sandbox="allow-scripts"` (an opaque origin) it also has no storage, cookies, popups or access to the app.
const POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "media-src data: blob:",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ")

// Reports the document's height so the frame fits its content; the host clamps whatever arrives. The root's own box,
// not its scrollHeight, which never drops below the frame and so would never let it shrink.
const REPORTER = `new ResizeObserver(() => parent.postMessage({ type: "${HEIGHT_MESSAGE}", height: document.documentElement.getBoundingClientRect().height }, "*")).observe(document.documentElement)`

/**
 * The `srcdoc` for a block's source, a fragment or a whole document. The policy heads the document, so it governs
 * everything the source contains; a policy the source adds can only narrow it. The parser ignores the source's own
 * doctype and `<head>` and merges its `<html>` and `<body>` attributes, so its styles and scripts still apply.
 */
export function sandboxDocument(source: string) {
  return [
    "<!doctype html><html><head>",
    `<meta http-equiv="Content-Security-Policy" content="${POLICY}">`,
    "<style>:root{color-scheme:light;font-family:system-ui,sans-serif}</style>",
    `<script>${REPORTER}</script>`,
    "</head><body>",
    source,
  ].join("\n")
}

const HeightMessage = Schema.Struct({ type: Schema.Literal(HEIGHT_MESSAGE), height: Schema.Finite })

const decodeHeightMessage = Schema.decodeUnknownOption(HeightMessage)

/** The frame height a message from the frame asks for, clamped; undefined for any other message. */
export function readFrameHeight(event: MessageEvent): number | undefined {
  return Option.match(decodeHeightMessage(event.data), {
    onNone: () => undefined,
    onSome: (message) => Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(message.height))),
  })
}

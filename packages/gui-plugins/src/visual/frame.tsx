import { createSignal, onCleanup } from "solid-js"
import { DEFAULT_HEIGHT, readFrameHeight, sandboxDocument } from "./sandbox"

/**
 * A block's generated UI in an opaque-origin frame: its scripts run, but it reaches neither the app, its storage nor the
 * network. The frame's height follows the document's, which the frame's own script reports.
 */
export function VisualFrame(props: { source: string; title: string }) {
  const [height, setHeight] = createSignal(DEFAULT_HEIGHT)
  let frame: HTMLIFrameElement | undefined

  // Only this frame's messages size it; any other window's, including another block's, are ignored.
  const onMessage = (event: MessageEvent) => {
    if (!frame || event.source !== frame.contentWindow) return

    const next = readFrameHeight(event)

    if (next !== undefined) setHeight(next)
  }

  window.addEventListener("message", onMessage)
  onCleanup(() => window.removeEventListener("message", onMessage))

  return (
    <iframe
      ref={frame}
      data-component="visual-frame"
      class="block w-full rounded-md border-0 bg-white"
      style={{ height: `${height()}px` }}
      title={props.title}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      srcdoc={sandboxDocument(props.source)}
    />
  )
}

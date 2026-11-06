import { describe, expect, test } from "bun:test"
import { HEIGHT_MESSAGE, MAX_HEIGHT, MIN_HEIGHT, readFrameHeight, sandboxDocument } from "./sandbox"

describe("sandboxDocument", () => {
  test("puts the policy before the source, so it governs a whole document the model wrote", () => {
    const source = '<!doctype html><html><head><script src="https://example.com/x.js"></script></head><body>Hi</body></html>'
    const doc = sandboxDocument(source)
    const parsed = new DOMParser().parseFromString(doc, "text/html")
    const first = parsed.head.firstElementChild

    expect(doc.startsWith("<!doctype html>")).toBe(true)
    expect(doc.indexOf("Content-Security-Policy")).toBeLessThan(doc.indexOf(source))
    expect(first?.getAttribute("http-equiv")).toBe("Content-Security-Policy")
    expect(first?.getAttribute("content")).toContain("default-src 'none'")
    expect(first?.getAttribute("content")).toContain("form-action 'none'")
    expect(first?.getAttribute("content")).not.toMatch(/https?:|\*/)
    expect(parsed.body.textContent).toContain("Hi")
  })
})

describe("readFrameHeight", () => {
  const height = (data: MessageEventInit["data"]) => readFrameHeight(new MessageEvent("message", { data }))

  test("reads the frame's height message, clamped", () => {
    expect(height({ type: HEIGHT_MESSAGE, height: 412.2 })).toBe(413)
    expect(height({ type: HEIGHT_MESSAGE, height: 1 })).toBe(MIN_HEIGHT)
    expect(height({ type: HEIGHT_MESSAGE, height: 1e9 })).toBe(MAX_HEIGHT)
  })

  test("ignores anything else a frame posts", () => {
    expect(height(undefined)).toBeUndefined()
    expect(height("600")).toBeUndefined()
    expect(height({ type: "other", height: 600 })).toBeUndefined()
    expect(height({ type: HEIGHT_MESSAGE, height: "600" })).toBeUndefined()
    expect(height({ type: HEIGHT_MESSAGE, height: Number.NaN })).toBeUndefined()
    expect(height({ type: HEIGHT_MESSAGE, height: Number.POSITIVE_INFINITY })).toBeUndefined()
  })
})

import { createSignal, onCleanup } from "solid-js"
import { motionTuning } from "@opencode/ui/motion-tuning"
import { CodeBlock, createKeyed, type Plugin } from "@opencode/plugin/gui"
import type Visual from "./index"
import { visualExperiment } from "./experiment"
import { VisualFrame } from "./frame"
import { VISUAL_LANGUAGE } from "./sandbox"

/**
 * Generated UI in the conversation: a ```` ```visual-html ```` block shows its HTML, CSS and scripts running in a
 * sandboxed frame in place of the code, which stays a click away through Copy. Only while the experiment is on: the
 * contribution comes and goes with it, so blocks already on screen switch as the user toggles it.
 */
const setup: Plugin.Setup<typeof Visual> = (ctx) => {
  const [enabled, setEnabled] = createSignal(visualExperiment())
  onCleanup(motionTuning.subscribe(() => setEnabled(visualExperiment())))

  createKeyed(enabled, () => {
    ctx.add(CodeBlock, {
      languages: [VISUAL_LANGUAGE],
      render: (props) => <VisualFrame source={props.code} title={ctx.t("title")} />,
    })
  })
}

export default setup

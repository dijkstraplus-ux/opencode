import { motionTuning } from "@opencode/ui/motion-tuning"

/** Experiment: ```` ```visual-html ```` blocks in Markdown render as sandboxed generated UI. Off by default. */
export const visualExperiment = motionTuning.toggle("visual.html", {
  label: "Enabled",
  group: "Experiments",
  subsection: "Generated visuals",
  description: "visual-html code blocks render as sandboxed UI",
  target: '[data-component="visual-frame"]',
  experiment: true,
  value: false,
})

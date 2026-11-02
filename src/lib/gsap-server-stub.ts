// What the server build gets instead of GSAP. GSAP starts a timer as soon as it
// loads, which Workers forbids while a module is being evaluated, so importing
// it during SSR fails that page's server render. Animations only ever run in
// effects in the browser, so the server just needs the imports to resolve.
const noop = () => undefined

export const gsap = { registerPlugin: noop }
export default gsap
export const ScrollTrigger = {}
export const SplitText = {}
export const useGSAP = noop

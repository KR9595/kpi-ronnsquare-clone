/*
 * Keyframes of the source site's wordmark preloader, copied verbatim from its
 * preloader-data.js. They were exported from a Lottie comp at 25 fps, but the source plays
 * them with GSAP (wordmarkReveal.ts), not with lottie-web.
 *
 * - `shapes.*.pos`: `[frame, x, y]` offsets in Lottie px; `rot`: `[frame, degrees]`.
 * - `letters`: each glyph slides in from `fromX` (Lottie px) between `posStart` and `posEnd`
 *   on the cubic-bezier `bez`, and fades in between `fadeStart` and `fadeEnd`.
 * - `ref`: Lottie px distances used to scale the data to the rendered SVG.
 */

export type Keyframe = readonly number[]

export interface ShapeTrack {
  pos: readonly Keyframe[]
  rot: readonly Keyframe[] | null
}

export interface LetterTrack {
  glyph: string
  posStart: number
  posEnd: number
  fromX: number
  bez: readonly [number, number, number, number]
  fadeStart: number
  fadeEnd: number
}

export interface PreloaderData {
  fps: number
  shapes: Record<'diamond' | 'circle' | 'triangle', ShapeTrack>
  letters: readonly LetterTrack[]
  ref: { lottieDiamondToCircleY: number; lottieSToEX: number }
}

// prettier-ignore
export const PRELOADER_DATA: PreloaderData = {fps:25,shapes:{diamond:{pos:[[0,513.7,288.3],[1,513.7,288.3],[2,507.3,284],[3,490.1,275.1],[4,465.8,267.1],[5,440.1,263.6],[6,420.1,264.2],[7,412.2,265.2],[8,384.4,220.7],[9,392.7,179.2],[10,402.6,111.7],[11,391.5,34.2],[12,367.7,-33.2],[13,341.1,-81.5],[14,326.9,-97.3],[15,316.8,-92.4],[16,302.2,-66.9],[17,289.8,-32.5],[18,279.3,-.2],[19,265.6,-.4],[20,250.5,-.1],[21,237.3,2.2],[22,226.1,4.2],[23,221,6.2],[24,218.9,6.7],[25,220.8,6.3],[26,222.7,5.9],[27,226.9,6.8],[28,235.9,3.8],[29,246.2,2.1],[30,260,.9],[31,276.3,-1],[32,289.2,-1],[33,299.9,-1],[34,305.2,-.1],[35,305.4,.5],[36,299.8,1.4],[37,292.4,1.7],[38,284.8,1.9],[39,273.2,1.8],[40,253.8,1.8],[41,226.4,1.9],[42,189,2],[43,150,2.2],[44,113.6,2],[45,87,1.7],[46,69,1.6],[47,55.8,1.3],[48,42.5,.9],[49,35.4,.7],[50,22.1,.3],[51,14.9,0],[52,12.4,0],[53,7.6,0],[54,5.1,0],[55,3,0],[56,.6,0],[57,0,0]],rot:[[1,224],[7,167.8],[8,128],[9,112.8],[10,90.4],[11,66.1],[12,47.3],[13,30.4],[14,24.5],[15,19.5],[16,10.9],[17,4.4],[18,-1.8],[19,-4.7],[20,-10.2],[21,-14.5],[22,-18.2],[23,-20],[24,-21],[26,-19.7],[27,-17.8],[28,-15.1],[29,-12.2],[30,-8.2],[31,-3.2],[32,2.1],[33,6.1],[34,8.7],[35,9.9],[36,10.8],[39,11.03],[44,7.34],[46,4.6],[48,3.6],[51,0]]},circle:{pos:[[1,7.7,53],[9,185,53],[13,239,-87],[17,284,1],[18,284,1],[23,271,1],[25,271,1],[32,281,1],[34,281,1],[37,264.5,.93],[38,255.63,.88],[39,242.45,.82],[40,224.44,.76],[41,200.23,.68],[42,163.66,.6],[43,124.97,.51],[44,93.64,.42],[45,71.8,.33],[48,30.28,.13],[49,22.05,.09],[50,15.7,.05],[51,10.87,.03],[52,7.28,.02],[54,2,0],[57,0,0]],rot:null},triangle:{pos:[[1,280,-0],[31,280,-0],[32,279,-0],[33,278,-0],[34,275,-0],[35,270,-0],[36,264,-0],[37,257,-0],[38,247,-0],[39,235,-0],[40,215,-0],[41,191,-0],[42,154,-0],[43,116,-0],[44,86,-0],[45,65,-0],[46,49,-0],[47,36,-0],[48,26,-0],[49,18,-0],[50,14,-0],[51,9,-0],[52,5,-0],[53,3,-0],[54,-0,-0]],rot:null}},letters:[{glyph:"n2",posStart:39,posEnd:50,fromX:-130,bez:[.333,0,.502,1],fadeStart:39,fadeEnd:43},{glyph:"n1",posStart:45,posEnd:56,fromX:-120,bez:[.333,0,.502,1],fadeStart:45,fadeEnd:49},{glyph:"e",posStart:39,posEnd:50,fromX:-514,bez:[.333,0,.502,1],fadeStart:39,fadeEnd:43},{glyph:"r2",posStart:42,posEnd:53,fromX:-378,bez:[.333,0,.502,1],fadeStart:42,fadeEnd:46},{glyph:"a",posStart:45,posEnd:56,fromX:-237,bez:[.333,0,.502,1],fadeStart:45,fadeEnd:49},{glyph:"u",posStart:48,posEnd:59,fromX:-153,bez:[.333,0,.502,1],fadeStart:50,fadeEnd:54},{glyph:"r1",posStart:47,posEnd:58,fromX:238,bez:[.039,0,.035,1],fadeStart:47,fadeEnd:51},{glyph:"s",posStart:48,posEnd:59,fromX:289,bez:[.333,0,.182,1],fadeStart:50,fadeEnd:54}],ref:{lottieDiamondToCircleY:298.56,lottieSToEX:975.72}}

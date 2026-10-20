import { useEffect, useRef } from 'react'

// Norbie, drawn on a canvas: the head floats, looks around, and throws a beam
// from its visor. Ported from the two loading studies — the only difference
// between them is the colour of the visor and the beam, so that is a prop.
//
// The drawing is in Norbie's own units (a 280-unit sphere) and scaled down on
// the way out, which is why every dimension below looks so large.
const DIMS = {
  eye: { w: 340, h: 120, r: 60 },
  innerEye: { w: 280, h: 55, r: 60 },
  ear: { w: 34, h: 60, outerR: 25, innerR: 5 },
  nose: { topW: 90, bottomW: 150, h: 220, curveDepth: -30 },
}
const LAYOUT = { eyeY: -70, earY: -45, earX: 220, nostrilOffsetTop: 50 }
LAYOUT.noseTopY = LAYOUT.eyeY + DIMS.eye.h / 2 - 5

const SPHERE_RADIUS = 280
// Screen-space offsets from the studies, read at their globalScale of 0.2.
const BODY_Y = 50
const SHADOW_Y = 180
const FLOAT = { speed: 0.0012, range: 15 }
const BEAM = { length: 500, spread: 1.6, startOpacity: 0.5, swingFactor: 15 }

// Where the head looks, and how long it holds each look — the studies' own
// pace, unhurried. A rate call ends part way round, which is fine: the loop
// reads as looking about, not as a progress bar that must reach the end.
const EASE = 0.04
const LOOK_SEQUENCE = [
  { x: 0, y: 0, wait: 60 },
  { x: -40, y: -40, wait: 60 },
  { x: 40, y: -40, wait: 60 },
  { x: 40, y: 40, wait: 50 },
  { x: -40, y: 40, wait: 50 },
  { x: 0, y: 0, wait: 40 },
]

function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export default function NorbieLoader({ dark = false, scale = 0.08, className = '' }) {
  const canvasRef = useRef(null)
  const darkRef = useRef(dark)
  darkRef.current = dark

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0
    const fit = () => {
      const dpr = window.devicePixelRatio || 1
      const box = canvas.getBoundingClientRect()
      width = box.width
      height = box.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    window.addEventListener('resize', fit)

    let step = 0
    let waited = 0
    let lookX = 0
    let lookY = 0
    let frame = 0

    const draw = () => {
      // The visor colour is the whole difference between the two studies.
      const visor = darkRef.current ? '#A614C3' : '#74C3B7'
      const beamRgb = darkRef.current ? '166, 20, 195' : '116, 195, 183'

      ctx.clearRect(0, 0, width, height)
      const centerX = width / 2
      const centerY = height / 2
      const floatY = Math.sin(Date.now() * FLOAT.speed) * FLOAT.range
      // The studies place the body and its shadow in screen pixels, at their
      // own scale; k carries that composition to whatever size this is drawn
      // at, and LIFT centres the pair — head and shadow — in the canvas
      // rather than leaving the head high and the shadow off the bottom.
      const k = scale / 0.2
      const LIFT = ((BODY_Y + SHADOW_Y) / 2) * k

      const target = LOOK_SEQUENCE[step]
      const dx = target.x - lookX
      const dy = target.y - lookY
      lookX += dx * EASE
      lookY += dy * EASE
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && ++waited > target.wait) {
        step = (step + 1) % LOOK_SEQUENCE.length
        waited = 0
      }

      // Shadow on the ground, a fixed spot the head rises and falls over.
      ctx.save()
      ctx.translate(centerX, centerY + SHADOW_Y * k - LIFT)
      ctx.scale(scale, scale)
      const sink = (floatY + FLOAT.range) / (FLOAT.range * 2)
      ctx.scale(1 + sink * 0.2, 1 + sink * 0.2)
      const shadow = ctx.createRadialGradient(0, 0, SPHERE_RADIUS * 0.08, 0, 0, SPHERE_RADIUS * 0.7)
      shadow.addColorStop(0, `rgba(0,0,0,${(darkRef.current ? 0.5 : 0.4) + sink * 0.2})`)
      shadow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = shadow
      ctx.beginPath()
      ctx.ellipse(0, 0, SPHERE_RADIUS * 0.7, SPHERE_RADIUS * 0.2, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.translate(centerX, centerY + (floatY + BODY_Y) * k - LIFT)
      ctx.scale(scale, scale)

      ctx.beginPath()
      ctx.arc(0, 0, SPHERE_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = '#000000'
      ctx.fill()

      // Turning the head is a squash on each axis, not a rotation.
      ctx.translate(lookX, lookY)
      ctx.scale(Math.cos(lookX / 220), Math.cos(lookY / 220))

      // Nose
      ctx.fillStyle = '#FFFFFF'
      const topHalf = DIMS.nose.topW / 2
      const botHalf = DIMS.nose.bottomW / 2
      const noseTop = LAYOUT.noseTopY
      const ballY = noseTop + DIMS.nose.h - botHalf
      ctx.beginPath()
      ctx.moveTo(-topHalf, noseTop)
      ctx.quadraticCurveTo(-topHalf + DIMS.nose.curveDepth, noseTop + (ballY - noseTop) / 2, -botHalf, ballY)
      ctx.arc(0, ballY, botHalf, Math.PI, 0, true)
      ctx.quadraticCurveTo(topHalf - DIMS.nose.curveDepth, noseTop + (ballY - noseTop) / 2, topHalf, noseTop)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      const nostrilY = noseTop + LAYOUT.nostrilOffsetTop
      ctx.ellipse(-20, nostrilY, 6, 11, -Math.PI / 4.5, 0, Math.PI * 2)
      ctx.ellipse(20, nostrilY, 6, 11, Math.PI / 4.5, 0, Math.PI * 2)
      ctx.fill()

      // Beam — only once the head has turned far enough to throw one.
      const reach = Math.min(1, Math.max(0, (Math.hypot(lookX, lookY) - 10) / 15))
      if (reach > 0.01) {
        ctx.save()
        ctx.translate(0, LAYOUT.eyeY)
        const topW = DIMS.innerEye.w
        const bottomW = topW * BEAM.spread
        const tipX = lookX * BEAM.swingFactor
        const tipY = BEAM.length + lookY * BEAM.swingFactor
        const grad = ctx.createLinearGradient(0, 0, tipX, tipY)
        grad.addColorStop(0, `rgba(${beamRgb}, ${BEAM.startOpacity * reach})`)
        grad.addColorStop(1, `rgba(${beamRgb}, 0)`)
        ctx.fillStyle = grad
        ctx.globalCompositeOperation = 'lighter'
        ctx.beginPath()
        ctx.moveTo(-topW / 2, 0)
        ctx.lineTo(topW / 2, 0)
        ctx.lineTo(tipX + bottomW / 2, tipY)
        ctx.lineTo(tipX - bottomW / 2, tipY)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }

      // Visor
      ctx.fillStyle = '#FFFFFF'
      roundRect(ctx, -DIMS.eye.w / 2, LAYOUT.eyeY - DIMS.eye.h / 2, DIMS.eye.w, DIMS.eye.h, DIMS.eye.r)
      ctx.fill()
      ctx.fillStyle = visor
      roundRect(ctx, -DIMS.innerEye.w / 2, LAYOUT.eyeY - DIMS.innerEye.h / 2, DIMS.innerEye.w, DIMS.innerEye.h, DIMS.innerEye.r)
      ctx.fill()

      // Ears
      ctx.fillStyle = '#FFFFFF'
      const { w, h, outerR: ro, innerR: ri } = DIMS.ear
      const ear = (x, mirror) => {
        const y = LAYOUT.earY - h / 2
        ctx.save()
        ctx.translate(x, 0)
        ctx.scale(mirror, 1)
        ctx.beginPath()
        ctx.moveTo(-w / 2 + ri, y)
        ctx.lineTo(w / 2 - ro, y)
        ctx.quadraticCurveTo(w / 2, y, w / 2, y + ro)
        ctx.lineTo(w / 2, y + h - ro)
        ctx.quadraticCurveTo(w / 2, y + h, w / 2 - ro, y + h)
        ctx.lineTo(-w / 2 + ri, y + h)
        ctx.quadraticCurveTo(-w / 2, y + h, -w / 2, y + h - ri)
        ctx.lineTo(-w / 2, y + ri)
        ctx.quadraticCurveTo(-w / 2, y, -w / 2 + ri, y)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      ear(-LAYOUT.earX, -1)
      ear(LAYOUT.earX, 1)

      ctx.restore()
      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', fit)
    }
  }, [scale])

  return <canvas ref={canvasRef} className={`w-full h-full block ${className}`} />
}

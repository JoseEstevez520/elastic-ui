/**
 * The few colours an image is made of, most present first: its pixels (at a thumbnail's size) are
 * grouped by hue, each counted by how colourful it is, so a grey sky or a white wall does not win
 * over the red of a roof. An image with little colour gives its tones instead.
 */
export async function paletteOf(src: string, count = 4): Promise<string[]> {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = src
  await image.decode()
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  context.drawImage(image, 0, 0, size, size)
  const { data } = context.getImageData(0, 0, size, size)

  const buckets = Array.from({ length: 12 }, () => ({ weight: 0, r: 0, g: 0, b: 0 }))
  const tones = { weight: 0, r: 0, g: 0, b: 0 }
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i]!, data[i + 1]!, data[i + 2]!]
    const max = Math.max(r, g, b) / 255
    const min = Math.min(r, g, b) / 255
    const light = (max + min) / 2
    const chroma = max - min
    const saturation = chroma === 0 ? 0 : chroma / (1 - Math.abs(2 * light - 1))
    // Colourful and neither near black nor near white.
    const weight = saturation * Math.max(0, 1 - Math.abs(light - 0.5) * 1.6)
    if (weight < 0.08) {
      Object.assign(tones, { weight: tones.weight + 1, r: tones.r + r, g: tones.g + g, b: tones.b + b })
      continue
    }
    let hue = 0
    if (chroma) {
      const [R, G, B] = [r / 255, g / 255, b / 255]
      hue = max === R ? ((G - B) / chroma) % 6 : max === G ? (B - R) / chroma + 2 : (R - G) / chroma + 4
    }
    const bucket = buckets[Math.floor(((((hue * 60) % 360) + 360) % 360) / 30)]!
    bucket.weight += weight
    bucket.r += r * weight
    bucket.g += g * weight
    bucket.b += b * weight
  }
  // Only colours that really count against the main one: a trace of olive in a blue photo would
  // muddy its light. What is missing is made of the main colour again.
  const top = Math.max(...buckets.map((b) => b.weight))
  const colours = buckets
    .filter((bucket) => bucket.weight > 0.5 && bucket.weight >= top * 0.25)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count)
    .map(
      (bucket) =>
        `rgb(${Math.round(bucket.r / bucket.weight)} ${Math.round(bucket.g / bucket.weight)} ${Math.round(bucket.b / bucket.weight)})`,
    )
  const tone = tones.weight
    ? `rgb(${Math.round(tones.r / tones.weight)} ${Math.round(tones.g / tones.weight)} ${Math.round(tones.b / tones.weight)})`
    : 'rgb(128 128 128)'
  while (colours.length < count) colours.push(colours[colours.length % Math.max(1, colours.length)] ?? tone)
  return colours
}

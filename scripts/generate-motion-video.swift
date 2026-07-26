import AVFoundation
import CoreVideo
import Foundation

let width = 960
let height = 540
let frames = 120
let frameRate: Int32 = 30
let output = URL(fileURLWithPath: CommandLine.arguments.dropFirst().first ?? "motion-source.mp4")

try? FileManager.default.removeItem(at: output)

let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
let input = AVAssetWriterInput(
  mediaType: .video,
  outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
      AVVideoAverageBitRateKey: 2_200_000,
      AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    ],
  ]
)
input.expectsMediaDataInRealTime = false

let adaptor = AVAssetWriterInputPixelBufferAdaptor(
  assetWriterInput: input,
  sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
  ]
)

guard writer.canAdd(input) else {
  throw NSError(domain: "OpenGlassMotion", code: 1, userInfo: [
    NSLocalizedDescriptionKey: "Unable to add the generated video input.",
  ])
}

writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

func clampByte(_ value: Double) -> UInt8 {
  UInt8(max(0, min(255, Int(value.rounded()))))
}

for frame in 0..<frames {
  while !input.isReadyForMoreMediaData {
    Thread.sleep(forTimeInterval: 0.002)
  }

  var buffer: CVPixelBuffer?
  let status = CVPixelBufferCreate(
    kCFAllocatorDefault,
    width,
    height,
    kCVPixelFormatType_32BGRA,
    [
      kCVPixelBufferCGImageCompatibilityKey: true,
      kCVPixelBufferCGBitmapContextCompatibilityKey: true,
    ] as CFDictionary,
    &buffer
  )

  guard status == kCVReturnSuccess, let pixelBuffer = buffer else {
    throw NSError(domain: "OpenGlassMotion", code: 2, userInfo: [
      NSLocalizedDescriptionKey: "Unable to allocate a generated video frame.",
    ])
  }

  CVPixelBufferLockBaseAddress(pixelBuffer, [])
  guard let base = CVPixelBufferGetBaseAddress(pixelBuffer) else {
    CVPixelBufferUnlockBaseAddress(pixelBuffer, [])
    throw NSError(domain: "OpenGlassMotion", code: 3)
  }

  let rowBytes = CVPixelBufferGetBytesPerRow(pixelBuffer)
  let pixels = base.assumingMemoryBound(to: UInt8.self)
  let phase = Double(frame) / Double(frames) * Double.pi * 2

  for y in 0..<height {
    let normalizedY = Double(y) / Double(height)
    for x in 0..<width {
      let normalizedX = Double(x) / Double(width)
      let redCenterX = 0.28 + sin(phase) * 0.13
      let redCenterY = 0.3 + cos(phase * 1.2) * 0.08
      let goldCenterX = 0.72 + cos(phase * 0.8) * 0.12
      let goldCenterY = 0.54 + sin(phase) * 0.1
      let tealCenterX = 0.48 + sin(phase * 0.55) * 0.18
      let tealCenterY = 0.88 + cos(phase * 0.7) * 0.05

      func glow(_ centerX: Double, _ centerY: Double, _ radius: Double) -> Double {
        let dx = normalizedX - centerX
        let dy = normalizedY - centerY
        return exp(-((dx * dx + dy * dy) / radius))
      }

      let redGlow = glow(redCenterX, redCenterY, 0.055)
      let goldGlow = glow(goldCenterX, goldCenterY, 0.075)
      let tealGlow = glow(tealCenterX, tealCenterY, 0.09)
      let grid =
        (x % 48 == 0 || y % 48 == 0)
          ? 12.0
          : 0.0
      let vignette = max(0.34, 1.0 - hypot(normalizedX - 0.5, normalizedY - 0.5) * 0.82)
      let red = (18 + redGlow * 190 + goldGlow * 116 + grid) * vignette
      let green = (21 + redGlow * 42 + goldGlow * 104 + tealGlow * 78 + grid) * vignette
      let blue = (22 + redGlow * 26 + goldGlow * 24 + tealGlow * 84 + grid) * vignette
      let offset = y * rowBytes + x * 4
      pixels[offset] = clampByte(blue)
      pixels[offset + 1] = clampByte(green)
      pixels[offset + 2] = clampByte(red)
      pixels[offset + 3] = 255
    }
  }

  CVPixelBufferUnlockBaseAddress(pixelBuffer, [])
  let time = CMTime(value: Int64(frame), timescale: frameRate)
  if !adaptor.append(pixelBuffer, withPresentationTime: time) {
    throw writer.error ?? NSError(domain: "OpenGlassMotion", code: 4)
  }
}

input.markAsFinished()
await writer.finishWriting()

if writer.status != .completed {
  throw writer.error ?? NSError(domain: "OpenGlassMotion", code: 5)
}

print(output.path)

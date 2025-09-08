import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Icon metadata
export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

// Icon generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: '#3D52F1',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFC700',
          fontWeight: 800,
          fontFamily: 'system-ui',
          border: '2px solid #111111',
        }}
      >
        WMX
      </div>
    ),
    {
      ...size,
    }
  )
}

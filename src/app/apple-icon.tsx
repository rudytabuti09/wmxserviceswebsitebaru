import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Icon metadata
export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

// Apple Icon generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 72,
          background: '#3D52F1',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFC700',
          fontWeight: 800,
          fontFamily: 'system-ui',
          borderRadius: '20px',
          border: '4px solid #111111',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
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

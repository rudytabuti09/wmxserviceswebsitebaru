import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Icon metadata
export const size = {
  width: 64,
  height: 64,
}

export const contentType = 'image/png'

// Icon generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111111',
          borderRadius: '8px',
          position: 'relative',
        }}
      >
        {/* W - Blue */}
        <div
          style={{
            position: 'absolute',
            left: '6px',
            top: '12px',
            fontSize: '24px',
            fontWeight: 900,
            fontFamily: 'system-ui',
            background: 'linear-gradient(135deg, #0099FF, #004EFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: '#0099FF',
          }}
        >
          W
        </div>
        
        {/* M - Pink */}
        <div
          style={{
            position: 'absolute',
            left: '22px',
            top: '12px',
            fontSize: '24px',
            fontWeight: 900,
            fontFamily: 'system-ui',
            background: 'linear-gradient(135deg, #FF69B4, #E0007A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: '#FF69B4',
          }}
        >
          M
        </div>
        
        {/* X - Yellow */}
        <div
          style={{
            position: 'absolute',
            left: '38px',
            top: '12px',
            fontSize: '24px',
            fontWeight: 900,
            fontFamily: 'system-ui',
            background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: '#FFD700',
          }}
        >
          X
        </div>
        
        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '8px',
            right: '8px',
            height: '2px',
            background: '#FFC700',
            borderRadius: '1px',
          }}
        />
        
        {/* Corner accents */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            width: '3px',
            height: '3px',
            background: '#00FFFF',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '3px',
            height: '3px',
            background: '#FFC700',
            borderRadius: '50%',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}

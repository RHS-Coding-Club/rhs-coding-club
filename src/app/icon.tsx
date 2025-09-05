import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'RHS Coding Club';
export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50px',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '40px',
            padding: '60px',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Icon */}
          <div
            style={{
              fontSize: '120px',
              marginBottom: '20px',
            }}
          >
            💻
          </div>
          
          {/* Text */}
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            RHS
          </div>
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            Coding Club
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

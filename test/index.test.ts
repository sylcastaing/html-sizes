import generateSizes from '../src/index';

describe('generateSizes', () => {
  it('simple usage', () => {
    expect(
      generateSizes({
        '(max-width: 340px)': '100vw',
        '(min-width: 400px)': '35px',
        default: '50vw',
      })
    ).toBe('(max-width: 340px) 100vw, (min-width: 400px) 35px, 50vw');
  });

  it('respect order', () => {
    expect(
      generateSizes({
        default: '50vw',
        '(min-width: 400px)': '35px',
        '(max-width: 340px)': '100vw',
      })
    ).toBe('(min-width: 400px) 35px, (max-width: 340px) 100vw, 50vw');
  });

  it('maxDpr', () => {
    expect(
      generateSizes(
        {
          '(max-width: 340px)': '100vw',
          '(min-width: 400px)': '35px',
          default: '50vw',
        },
        { maxDPR: 2 }
      )
    ).toBe(
      '(min-resolution: 3dppx) and (max-width: 340px) 67vw, (-webkit-min-device-pixel-ratio: 3) and (max-width: 340px) 67vw, (max-width: 340px) 100vw, (min-resolution: 3dppx) and (min-width: 400px) 24px, (-webkit-min-device-pixel-ratio: 3) and (min-width: 400px) 24px, (min-width: 400px) 35px, (min-resolution: 3dppx) 34vw, (-webkit-min-device-pixel-ratio: 3) 34vw, 50vw'
    );
  });

  it('maxDpr with calc', () => {
    expect(
      generateSizes(
        {
          default: 'calc(100vw - 20px)',
        },
        { maxDPR: 2 }
      )
    ).toBe(
      '(min-resolution: 3dppx) calc((100vw - 20px) * 2 / 3), (-webkit-min-device-pixel-ratio: 3) calc((100vw - 20px) * 2 / 3), calc(100vw - 20px)'
    );
  });

  it('dpr compatibility', () => {
    expect(
      generateSizes(
        {
          '(max-width: 500px)': '100vw',
          default: '500px',
        },
        {
          maxDPR: 2,
          dpiCompatibility: true,
        }
      )
    ).toBe(
      '(min-resolution: 3dppx) and (max-width: 500px) 67vw, (-webkit-min-device-pixel-ratio: 3) and (max-width: 500px) 67vw, (min-resolution: 288dpi) and (max-width: 500px) 67vw, (max-width: 500px) 100vw, (min-resolution: 3dppx) 334px, (-webkit-min-device-pixel-ratio: 3) 334px, (min-resolution: 288dpi) 334px, 500px'
    );
  });

  it('unmatched value', () => {
    expect(
      generateSizes(
        {
          // @ts-ignore
          '(max-width: 500px)': '100%',
          default: '500px',
        },
        { maxDPR: 2 }
      )
    ).toBe(
      '(min-resolution: 3dppx) and (max-width: 500px) 100%, (-webkit-min-device-pixel-ratio: 3) and (max-width: 500px) 100%, (max-width: 500px) 100%, (min-resolution: 3dppx) 334px, (-webkit-min-device-pixel-ratio: 3) 334px, 500px'
    );
  });

  it('maxDPR 3 no effect', () => {
    expect(
      generateSizes(
        {
          default: '500px',
        },
        { maxDPR: 3 }
      )
    ).toBe('500px');
  });
});

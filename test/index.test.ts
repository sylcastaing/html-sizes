import generateSizes from '../src/index';

describe('generateSizes', () => {
  it('with simple usage', () => {
    expect(
      generateSizes({
        '(max-width: 340px)': '100vw',
        '(min-width: 400px)': '35px',
        default: '50vw',
      }),
    ).toBe('(max-width: 340px) 100vw, (min-width: 400px) 35px, 50vw');
  });

  it('should respect order', () => {
    expect(
      generateSizes({
        default: '50vw',
        '(min-width: 400px)': '35px',
        '(max-width: 340px)': '100vw',
      }),
    ).toBe('(min-width: 400px) 35px, (max-width: 340px) 100vw, 50vw');
  });

  it('maxDPR 1', () => {
    expect(
      generateSizes(
        {
          '(max-width: 340px)': '100vw',
          '(min-width: 400px)': '35px',
          default: '50vw',
        },
        { maxDPR: 1 },
      ),
    ).toBe(
      '(min-resolution: 3dppx) and (max-width: 340px) 34vw, (-webkit-min-device-pixel-ratio: 3) and (max-width: 340px) 34vw, (min-resolution: 2dppx) and (max-width: 340px) 50vw, (-webkit-min-device-pixel-ratio: 2) and (max-width: 340px) 50vw, (max-width: 340px) 100vw, (min-resolution: 3dppx) and (min-width: 400px) 12px, (-webkit-min-device-pixel-ratio: 3) and (min-width: 400px) 12px, (min-resolution: 2dppx) and (min-width: 400px) 18px, (-webkit-min-device-pixel-ratio: 2) and (min-width: 400px) 18px, (min-width: 400px) 35px, (min-resolution: 3dppx) 17vw, (-webkit-min-device-pixel-ratio: 3) 17vw, (min-resolution: 2dppx) 25vw, (-webkit-min-device-pixel-ratio: 2) 25vw, 50vw',
    );
  });

  it('with simple maxDPR 2', () => {
    expect(
      generateSizes(
        {
          default: '100vw',
        },
        {
          maxDPR: 2,
        },
      ),
    ).toBe('(min-resolution: 3dppx) 67vw, (-webkit-min-device-pixel-ratio: 3) 67vw, 100vw');
  });

  it('with complex maxDPR 2', () => {
    expect(
      generateSizes(
        {
          '(max-width: 340px)': '100vw',
          '(min-width: 400px)': '35px',
          default: '50vw',
        },
        { maxDPR: 2 },
      ),
    ).toBe(
      '(min-resolution: 3dppx) and (max-width: 340px) 67vw, (-webkit-min-device-pixel-ratio: 3) and (max-width: 340px) 67vw, (max-width: 340px) 100vw, (min-resolution: 3dppx) and (min-width: 400px) 24px, (-webkit-min-device-pixel-ratio: 3) and (min-width: 400px) 24px, (min-width: 400px) 35px, (min-resolution: 3dppx) 34vw, (-webkit-min-device-pixel-ratio: 3) 34vw, 50vw',
    );
  });

  it('with maxDPR 3 -> no effect', () => {
    expect(
      generateSizes(
        {
          default: '500px',
        },
        // @ts-ignore
        { maxDPR: 3 },
      ),
    ).toBe('500px');
  });

  it('with maxDpr 2 and calc', () => {
    expect(
      generateSizes(
        {
          default: 'calc(100vw - 20px)',
        },
        { maxDPR: 2 },
      ),
    ).toBe(
      '(min-resolution: 3dppx) calc((100vw - 20px) * 0.67), (-webkit-min-device-pixel-ratio: 3) calc((100vw - 20px) * 0.67), calc(100vw - 20px)',
    );
  });

  it('with maxDpr 2 and min', () => {
    expect(
      generateSizes(
        {
          default: 'min(100vw - 20px, 500px)',
        },
        { maxDPR: 2 },
      ),
    ).toBe(
      '(min-resolution: 3dppx) calc((min(100vw - 20px, 500px)) * 0.67), (-webkit-min-device-pixel-ratio: 3) calc((min(100vw - 20px, 500px)) * 0.67), min(100vw - 20px, 500px)',
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
        },
      ),
    ).toBe(
      '(min-resolution: 3dppx) and (max-width: 500px) 67vw, (-webkit-min-device-pixel-ratio: 3) and (max-width: 500px) 67vw, (min-resolution: 288dpi) and (max-width: 500px) 67vw, (max-width: 500px) 100vw, (min-resolution: 3dppx) 334px, (-webkit-min-device-pixel-ratio: 3) 334px, (min-resolution: 288dpi) 334px, 500px',
    );
  });
});

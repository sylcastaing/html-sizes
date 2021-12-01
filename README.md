# Html Sizes

![npm](https://img.shields.io/npm/v/html-sizes?style=flat-square)
![NPM](https://img.shields.io/npm/l/html-sizes?style=flat-square)
![npm](https://img.shields.io/npm/dm/html-sizes?style=flat-square)

Generate html sizes attributes without painful for your responsive images.

Html sizes support `maxDPR` option to cap images dpr and speed up your website !

You can read this [mozilla tutorial](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) to understand responsive images.

# Install

This library is available on [npm](https://www.npmjs.com/package/html-sizes).

```sh
npm install html-sizes

yarn add html-sizes

pnpm add html-sizes
```

# Usage

Html sizes provide an unique function named `generateSizes`.

```ts
import generateSizes from 'html-sizes';

generateSizes({
  '(max-width: 340px)': '100vw',
  '(min-width: 400px)': '350px',
  default: '50vw',
});

// Return : (max-width: 340px) 100vw, (min-width: 400px) 350px, 50vw
```

## Parameters

```ts
generateSizes(params: SizesParams, options?: SizesOptions);
```

### params (required)

```ts
export interface SizesParams {
  [key: string]: string;
  default: string;
}
```

A map (js object) with all your needed breakpoints and the required default size.

- Keys is your css breakpoints with parenthesis
- Values is your image size (with `vw`, `px`, `calc()`, `min()`, `max()`...)

`generateSizes` respects params attributes order but `default` is always at the end of generated sizes.

### options (optional)

```ts
export interface SizesOptions {
  maxDPR?: MaxDPR; // 1 | 2
  dpiCompatibility?: boolean;
}
```

#### maxDPR

You can pass only `1` or `2` to cap image DPR.

This option add dpr media queries on `sizes` to scale down your image on high dpr devices and reduce image size.

To understand how browser pick the best image with pixel density, you can read this [article](https://imagekit.io/responsive-images/#using-width-descriptor) from imagekit.io.

Scaling is computed on all values and all breakpoints.

**Supported media queries**

- `(min-resolution: 3dppx)`
- `(-webkit-min-device-pixel-ratio: 3)` -> Safari

**Examples**

Simple example with a `100vw` image on a `500px` viewport width.

_Without maxDPR_

```ts
generateSizes({
  default: '100vw',
});

// Return : 100vw
```

| DPR | Sizes | Final image width |
| --- | ----- | ----------------- |
| 1   | 100vw | 500 x 1 = 500px   |
| 2   | 100vw | 500 x 2 = 1000px  |
| 3   | 100vw | 500 x 3 = 1500px  |

_With maxDPR=2_

```ts
generateSizes(
  {
    default: '100vw',
  },
  {
    maxDPR: 2,
  },
);

// Return : (min-resolution: 3dppx) 67vw, (-webkit-min-device-pixel-ratio: 3) 67vw, 100vw
```

| DPR | Sizes               | Final image width       |
| --- | ------------------- | ----------------------- |
| 1   | 100vw               | 500 x 1 = 500px         |
| 2   | 100vw               | 500 x 2 = 1000px        |
| 3   | 67vw (100 \* 2 / 3) | 500 x 3 x 0.67 = 1005px |

On 3x display, images is scale down to 2x.

_With maxDPR=1_

```ts
generateSizes(
  {
    default: '100vw',
  },
  {
    maxDPR: 1,
  },
);

// Return : (min-resolution: 3dppx) 34vw, (-webkit-min-device-pixel-ratio: 3) 34vw, (min-resolution: 2dppx) 50vw, (-webkit-min-device-pixel-ratio: 2) 50vw, 100vw
```

| DPR | Sizes              | Final image width      |
| --- | ------------------ | ---------------------- |
| 1   | 100vw              | 500 x 1 = 500px        |
| 2   | 50vw (100 x 1 / 2) | 500 x 2 x 0.5 = 500px  |
| 3   | 34vw (100 x 1 / 3) | 500 x 3 x 0.34 = 510px |

On 2x and 3x display, images is scale down to 1x.

#### dpiCompatibility

This flag add a new supported media query with DPI for [old browsers](https://caniuse.com/css-media-resolution).

```ts
generateSizes(
{
  '(max-width: 500px)': '100vw',
  default: '500px',
},
{
  maxDPR: 2,
  dpiCompatibility: true,
},
);

// Return : (min-resolution: 3dppx) and (max-width: 500px) 67vw, (-webkit-min-device-pixel-ratio: 3) and (max-width: 500px) 67vw, (min-resolution: 288dpi) and (max-width: 500px) 67vw, (max-width: 500px) 100vw, (min-resolution: 3dppx) 334px, (-webkit-min-device-pixel-ratio: 3) 334px, (min-resolution: 288dpi) 334px, 500px
```


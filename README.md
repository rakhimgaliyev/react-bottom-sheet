[![npm version](https://img.shields.io/npm/v/@rakhimgaliyev/react-bottom-sheet.svg?style=flat-square)](https://www.npmjs.com/package/@rakhimgaliyev/react-bottom-sheet)
[![gzip size][gzip-badge]][unpkg-dist]

**react-bottom-sheet** is implementation of bottom sheet for reactJS platform. Now supports *ONLY* mobile browser including Safari on IOS.

# Installation

```bash
npm i @rakhimgaliyev/react-bottom-sheet
```

or

```bash
yarn add @rakhimgaliyev/react-bottom-sheet
```

# Getting started

## Basic usage

```jsx
import { useState } from "react"
import { BottomSheetDialog } from "@rakhimgaliyev/react-bottom-sheet"

export default function Example() {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button onClick={() => setOpen(true)}>
        open
      </button>
      
      <BottomSheetDialog
        open={open}
        setOpen={setOpen}
      >
        <div style={{height: 300}}>
          content here
        </div>
      </BottomSheetDialog>
    </>
  )
}
```


# API

## props

### open

Type: `boolean`

The required prop

### setOpen

Type: `() => void`

### header

Type: `ReactNode`

### footer

Type: `ReactNode`

[gzip-badge]: https://img.badgesize.io/https:/unpkg.com/@rakhimgaliyev/react-bottom-sheet/dist/react-bottom-sheet.cjs.production.min.js?label=gzip%20size&compression=gzip&style=flat-square
[unpkg-dist]: https://unpkg.com/browse/@rakhimgaliyev/react-bottom-sheet@0.0.2/dist/

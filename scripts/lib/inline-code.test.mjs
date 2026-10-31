import { describe, expect, it } from 'vitest'
import { findInlineCode } from './inline-code.mjs'

describe('findInlineCode', () => {
  it('accepts scripts and stylesheets loaded from files', () => {
    const page = '<head><script type="module" async src="/assets/app.js"></script><link rel="stylesheet" href="/assets/app.css"></head>'
      + '<body><a href="/about" class="onward">About</a><p>style="not markup" and onclick= in text</p></body>'
    expect(findInlineCode(page)).toEqual([])
  })

  it('reports each kind of inline code', () => {
    expect(findInlineCode('<script>alert(1)</script>')).toEqual(['script'])
    expect(findInlineCode('<script type="application/ld+json">{}</script>')).toEqual(['script'])
    expect(findInlineCode('<style>p{}</style>')).toEqual(['style element'])
    expect(findInlineCode('<div class="a" style="color:red"></div>')).toEqual(['style attribute'])
    expect(findInlineCode('<button onclick="go()">Go</button>')).toEqual(['event handler'])
    expect(findInlineCode('<a href="javascript:go()">Go</a>')).toEqual(['javascript URL'])
  })
})

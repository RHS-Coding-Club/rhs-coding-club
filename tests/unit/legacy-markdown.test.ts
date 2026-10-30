import { describe, expect, it } from 'vitest'
import { markdownToDoc } from '../../scripts/legacy/markdown'
import { plainText, richTextField } from '#/lib/rich-text'

describe('markdownToDoc (old site import)', () => {
  const md = [
    '# Title',
    '',
    'Some **bold**, *italic*, `code`, and a [link](https://github.com).',
    '',
    '- one',
    '- two',
    '',
    '1. first',
    '2. second',
    '',
    '```python',
    'print("hi")',
    '```',
    '',
    '---',
    '',
    '> quoted',
  ].join('\n')

  it('maps Markdown onto allowed rich-text nodes and marks', () => {
    const doc = markdownToDoc(md)
    expect(doc.content?.map((n) => n.type)).toEqual([
      'heading',
      'paragraph',
      'bulletList',
      'orderedList',
      'codeBlock',
      'horizontalRule',
      'blockquote',
    ])
    // h1 drops to h2: the page owns the h1.
    expect(doc.content?.[0]?.attrs).toEqual({ level: 2 })
    const marks = doc.content?.[1]?.content?.flatMap(
      (t) => t.marks?.map((m) => m.type) ?? [],
    )
    expect(marks).toEqual(['bold', 'italic', 'code', 'link'])
    expect(doc.content?.[4]).toMatchObject({ attrs: { language: 'python' } })
    expect(plainText(doc)).toContain('print("hi")')
  })

  it('produces a document the site accepts', () => {
    expect(richTextField().safeParse(JSON.stringify(markdownToDoc(md))).success).toBe(
      true,
    )
    expect(markdownToDoc('').content).toEqual([{ type: 'paragraph' }])
  })

  it('drops raw HTML tags and non-https images', () => {
    const doc = markdownToDoc('<b>hi</b>\n\n![x](http://insecure.example/a.png)')
    expect(JSON.stringify(doc)).not.toContain('<b>')
    expect(JSON.stringify(doc)).not.toContain('insecure')
  })
})

import { describe, expect, it } from 'vitest'
import { docToMarkdown, markdownToDoc } from '#/lib/markdown'
import { plainText, richTextField } from '#/lib/rich-text'

describe('markdownToDoc', () => {
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

describe('docToMarkdown', () => {
  it('keeps the structure when a document goes out and comes back', () => {
    const md = [
      '## Title',
      '',
      'Some **bold**, *italic*, `code`, and a [link](https://github.com).',
      '',
      '- one',
      '- two',
      '',
      '3. third',
      '4. fourth',
      '',
      '```python',
      'print("hi")',
      '```',
      '',
      '---',
      '',
      '> quoted',
      '',
      '![a chart](/files/event/x.png)',
    ].join('\n')
    const doc = markdownToDoc(md)
    expect(docToMarkdown(doc).replace(/\n+/g, '\n')).toBe(md.replace(/\n+/g, '\n'))
    expect(markdownToDoc(docToMarkdown(doc))).toEqual(doc)
  })

  it('drops links and images the site would refuse to render', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'click',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
        { type: 'image', attrs: { src: 'http://evil.example/x.png', alt: '' } },
      ],
    }
    expect(docToMarkdown(doc)).toBe('click')
  })
})

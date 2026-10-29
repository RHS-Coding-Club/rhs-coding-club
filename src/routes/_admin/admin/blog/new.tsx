import { createFileRoute } from '@tanstack/react-router'
import { PostEditor } from '#/components/blog/post-editor'

export const Route = createFileRoute('/_admin/admin/blog/new')({
  head: () => ({ meta: [{ title: 'New post · Admin · RHS Coding Club' }] }),
  component: () => (
    <PostEditor
      initial={{
        id: null,
        title: '',
        slug: '',
        summary: '',
        tags: [],
        content: '',
        publishedAt: null,
      }}
    />
  ),
})

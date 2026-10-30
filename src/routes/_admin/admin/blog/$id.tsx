import { createFileRoute, notFound } from '@tanstack/react-router'
import { PostEditor } from '#/components/blog/post-editor'
import { getPostForEditor } from '#/server/blog'

export const Route = createFileRoute('/_admin/admin/blog/$id')({
  loader: async ({ params }) => {
    const post = await getPostForEditor({ data: { id: params.id } })
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? 'Post'} · Admin · RHS Coding Club` }],
  }),
  component: EditPostPage,
})

function EditPostPage() {
  const post = Route.useLoaderData()
  return (
    <PostEditor
      key={post.id}
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        tags: post.tags,
        content: post.content,
        publishedAt: post.publishedAt,
      }}
    />
  )
}

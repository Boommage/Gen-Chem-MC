import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default function CoachMessage({ content }: { content: string }) {
  return (
    <div className="message markdown-message">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { trust: false, maxSize: 10, maxExpand: 1000, strict: 'ignore' }]]}
        components={{ img: () => null }}
      >
        {content}
      </Markdown>
    </div>
  )
}

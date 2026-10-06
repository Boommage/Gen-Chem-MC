import { type FormEvent, useState } from 'react'
import { Icon } from '../components/AppLayout'
import PageHeader from '../components/PageHeader'

const suggestions = [
  'Help me plan for my exam',
  'I don’t know how to start this problem',
  'Reflect on my last study session',
  'Help me understand my study habits',
]

type ChatMessage = {
    role: 'user' | 'assistant'
    content: string
    }
export default function Coach() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  console.log('CURRENT REACT MESSAGES:', messages)
  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = input.trim()
    if (!message) return

    //new message
    const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        }
    //update conversation history
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    try {
        const response = await fetch('http://localhost:8787', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedMessages,
          }),
        })

        console.log('2. HTTP status:', response.status)
        console.log('3. HTTP ok:', response.ok)

        const data = await response.json()

        console.log('4. Backend response:', data)
        console.log('5. AI message:', data.choices?.[0]?.message)
        console.log('6. AI content:', data.choices?.[0]?.message?.content)

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.choices[0].message.content,
        }

        console.log('7. Adding assistant message:', assistantMessage)

        setMessages((current) => [...current, assistantMessage])
      } catch (error) {
        console.error('COACH ERROR:', error)
      }
  }

  return (
    <>
      <PageHeader title="Coach" subtitle="A private space to plan, reflect, and think through your approach." />
      <section className="coach-card" aria-label="Coach conversation">
        <div className="card-privacy"><Icon name="lock" /><span>Private to you unless you choose to share.</span></div>
        <div className="conversation" aria-live="polite">
          <div className="message-row student"><div className="message">I don’t know where to start with this chemistry problem.</div></div>
          <div className="message-row coach"><span className="coach-avatar" aria-hidden="true" /><div className="message">Let’s work through your thinking. What information does the problem give you?</div></div>
          {messages.map((message, index) => (<div className= {`message-row ${message.role === 'user' ? 'student' : 'coach'}`} key={index}> {message.role === 'assistant' && (<span className="coach-avatar" aria-hidden="true" />)}<div className="message">{message.content}</div></div>))}
        </div>
        <div className="suggestions" aria-label="Suggested prompts">
          {suggestions.map((suggestion) => <button className="suggestion-chip" type="button" key={suggestion} onClick={() => setInput(suggestion)}>{suggestion}</button>)}
        </div>
        <form className="message-form" onSubmit={sendMessage}>
          <input className="message-input" aria-label="Message to coach" placeholder="Share what you’re thinking..." value={input} onChange={(event) => setInput(event.target.value)} />
          <button className="send-button" type="submit" disabled={!input.trim()}>Send</button>
        </form>
      </section>
    </>
  )
}

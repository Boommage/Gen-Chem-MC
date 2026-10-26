import json
import urllib.request
import urllib.error

URL = "http://127.0.0.1:8788/"
messages = []

print("\n🧪 GET CHEM — Frontier Tutor")
print("Type your chemistry questions below.")
print("Commands: /reset to start over, /exit to quit.\n")

while True:
    try:
        question = input("You: ").strip()
    except (KeyboardInterrupt, EOFError):
        print("\nGoodbye!")
        break

    if not question:
        continue

    if question.lower() in ("/exit", "/quit"):
        print("Goodbye!")
        break

    if question.lower() == "/reset":
        messages.clear()
        print("Conversation cleared.\n")
        continue

    messages.append({"role": "user", "content": question})

    try:
        payload = json.dumps({"messages": messages}).encode("utf-8")

        request = urllib.request.Request(
            URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(request, timeout=120) as response:
            data = json.load(response)

        answer = data["choices"][0]["message"]["content"]

        print(f"\nFrontier: {answer}\n")

        messages.append({"role": "assistant", "content": answer})

    except (urllib.error.URLError, ValueError, KeyError, IndexError) as error:
        messages.pop()
        print(f"\nRequest failed: {error}\n")

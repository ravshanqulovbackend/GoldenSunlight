"""Admin-facing "suggest a reply" helper for the support inbox.

Deliberately NOT a customer-facing chatbot: this only drafts a reply for an
admin/superadmin to review, edit, and send themselves via the normal
`SupportMessageCreateView` flow (`AdminSupportSuggestReplyView` below never
writes a `SupportMessage`). Keeping this separation is the point — it's what
keeps a hallucinated fact from ever reaching a customer unreviewed.
"""
import anthropic
from django.conf import settings

# Kept small on purpose — this is a short-draft task (classification-adjacent),
# not open-ended reasoning, so a cheaper/faster model is the right default here
# even though the rest of the codebase has no other AI call to compare against.
MAX_HISTORY_MESSAGES = 20
MAX_OUTPUT_TOKENS = 400

SYSTEM_PROMPT = """You are a support-reply assistant for GoldenSunlight, a hygiene \
and household cleaning products company based in Dubai, UAE. The company \
manufactures and distributes wet wipes, feminine hygiene products, baby \
products, and cleaning supplies under the brands Sunlight, Peri, Rio, Natural \
Fresh, and Comforta.

Your job: read the customer's message and the recent conversation history, \
then draft a suggested reply for a human support agent to review, edit, and \
send. You do NOT send anything yourself — you only produce a draft.

Facts you may rely on:
- Currency: AED. Payment methods: cash on delivery, card. No Click/Payme/Uzum.
- Orders are picked up in-store — there is no home delivery fee to quote.
- If asked about a specific order status, price, stock level, or anything \
else not given to you in the conversation or the facts block below, do NOT \
guess or invent it — write the draft with a placeholder like "[agent: insert \
order status]" instead of a number or fact you are not sure of.

Style:
- Match the customer's language (English or Arabic) and tone: polite, warm, \
concise. No corporate filler, no over-apologizing.
- Keep replies short — 2-4 sentences unless the question genuinely needs more.
- Never promise something the company hasn't confirmed (refunds, replacement \
timelines, discounts) unless it's stated in the facts given to you.

Escalation — when to flag instead of drafting a normal reply:
- Complaints about damaged/wrong products, refund requests, or anything \
implying legal/safety risk: draft a short acknowledgment and start your reply \
with "[needs human review before sending]" on its own first line.
- If the message is abusive, spam, or unrelated to the business: reply with \
exactly "[not a support question — no draft needed]" and nothing else.

Output only the drafted reply text (in the customer's language) — no preamble, \
no explanation of what you did, no quotation marks around it."""


class SupportAIError(Exception):
    """Raised for both "not configured" and "upstream call failed" — the view
    maps both to a user-facing error, so callers don't need to tell them apart."""


def _build_transcript(messages):
    """`messages` — a `SupportMessage` queryset/list, oldest first."""
    lines = []
    for msg in messages[-MAX_HISTORY_MESSAGES:]:
        who = "Customer" if msg.sender_id == msg.customer_id else "Agent"
        text = msg.message.strip() if msg.message else "[image]"
        lines.append(f"{who}: {text}")
    return "\n".join(lines)


def generate_suggested_reply(messages):
    """`messages` — the customer's full conversation, oldest first, with at
    least one message. Returns the drafted reply text (str)."""
    if not settings.ANTHROPIC_API_KEY:
        raise SupportAIError("AI replies are not configured (ANTHROPIC_API_KEY is unset).")

    transcript = _build_transcript(messages)
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    try:
        response = client.messages.create(
            model=settings.SUPPORT_AI_MODEL,
            max_tokens=MAX_OUTPUT_TOKENS,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"Conversation so far (oldest first):\n\n{transcript}\n\n"
                            "Draft the agent's next reply.",
            }],
        )
    except anthropic.APIError as exc:
        raise SupportAIError(f"AI request failed: {exc}") from exc

    return "".join(block.text for block in response.content if block.type == "text").strip()

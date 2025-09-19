# AI Agent Design

This document covers the design of the LangChain-powered AI agents in CryptoPulse AI.

## LangChain Agent Executor

We use LangChain’s `AgentExecutor` to provide the LLM with a set of tools it can use to perform actions. The agent can decide which tool to call at each step of its reasoning process.

For example, if a user asks, *“What’s a good entry for BTC today?”*, the agent might first call `get_price("BTC/USDT")` to get the current price, then use that information to formulate a response.

### Tool Definition Example

Here is how we define tools for the agent:

```python
def get_price(symbol: str) -> str:
    price = exchange.fetch_ticker(symbol)['last']
    return f"The price of {symbol} is {price} USD"

def place_order(symbol: str, side: str, amount: float) -> str:
    order = exchange.create_order(symbol, 'market', side.lower(), amount)
    return f"Executed {side} order for {amount} {symbol}: ID {order['id']}"

tools = [
    Tool(
        name="GetPrice",
        func=get_price,
        description="Fetches the current price of a cryptocurrency symbol."
    ),
    Tool(
        name="PlaceOrder",
        func=place_order,
        description="Places a market order for a given symbol, side, and amount."
    )
]

agent = initialize_agent(tools, llm, agent="conversational-react-description", verbose=True)
```

## Google Gemini API Integration

We call the Google Gemini API for language understanding and reasoning. Prompts include system/context instructions and the dynamic user query. We follow best practices for prompting:

*   Provide clear descriptions of the functions (tools) the model can call.
*   Limit token usage to control costs and latency.
*   Include relevant data in the prompt to ground the model's responses.

**Crucially, the LLM is never given raw secrets or allowed to trade without confirmation.** Keys and sensitive information remain on the backend, inaccessible to the LLM.

## Trading Workflow

The trading workflow is modeled as a repeatable loop of steps that the LLM can assist with:

1.  **Create a watchlist.**
2.  **Note key catalysts** (news, events).
3.  **Mark support/resistance levels.**
4.  **Plan trades.**
5.  **Track order flow.**
6.  **Conduct a post-mortem review.**

Gemini can help at each stage by summarizing data (price feeds, news sentiment, charts) into actionable insights.

## Model Fine-Tuning (Long-term)

In the long term, we may fine-tune a private LLM on logged trading interactions or research data to improve its responses. All training data would be sanitized for privacy.
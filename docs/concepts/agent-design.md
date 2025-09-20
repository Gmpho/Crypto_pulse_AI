# AI Agent Design

This document covers the design of the LangChain-powered AI agents in CryptoPulse AI.

## LangChain Agent Executor

We use LangChain’s `AgentExecutor` to provide the LLM with a set of tools it can use to perform actions. The agent can decide which tool to call at each step of its reasoning process.

This “ReAct” loop (thinking → tool call → observation → answer) is managed by LangChain. When the LLM suggests a tool, the agent code executes it and feeds the result back. In production, we incorporate OpenAI’s function-calling natively (passing JSON schemas for each function) to achieve a similar effect. Memory and multi-step reasoning (“chain-of-thought”) ensure the agent can handle complex queries (e.g. multi-coin comparisons or conditional orders) by iterating through tools.

### Tool Definition Example

Here is how we define tools for the agent:

```python
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI

def get_price(symbol): ... # calls CCXT
def place_order(symbol, side, amount): ... # uses Binance API

tools = [
    Tool(name="GetPrice", func=get_price,
    description="Get latest price for a symbol"),
    Tool(name="PlaceOrder", func=place_order, description="Place a market order")
    # ... more tools ...
]

llm = OpenAI(model_name="gpt-4", temperature=0)
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
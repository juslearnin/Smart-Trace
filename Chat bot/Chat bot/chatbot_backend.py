#load dependencies
import os
import json
import sqlite3
import requests
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.tools import tool
from langgraph.checkpoint.sqlite import SqliteSaver

from langchain_huggingface.chat_models import ChatHuggingFace
from langchain_huggingface.llms import HuggingFaceEndpoint

# actual Hugging Face Access Token
HUGGINGFACEHUB_ACCESS_TOKEN = "____"  # Replace with your actual token

# -------------------
# 1. LLM
# -------------------
hf_endpoint_llm = HuggingFaceEndpoint(
    # Llama 3.3 70B is currently the most powerful model available on the free serverless tier.
    # Alternatives: "Qwen/Qwen2.5-72B-Instruct" or "mistralai/Mixtral-8x7B-Instruct-v0.1"
    repo_id="meta-llama/Llama-3.3-70B-Instruct",
    task="text-generation",
    huggingfacehub_api_token=HUGGINGFACEHUB_ACCESS_TOKEN,
    max_new_tokens=512,
    temperature=0.1,
    # The 70B model is large; a slightly higher timeout helps prevent connection errors
    timeout=300,
)

# Wrap the HuggingFaceEndpoint with ChatHuggingFace for tool binding
llm = ChatHuggingFace(llm=hf_endpoint_llm)

# Path to the local JSON database file
JSON_DB_PATH = "order.json"

# -------------------
# 2. Tools
# -------------------

#!pip install ddgs
search_tool = DuckDuckGoSearchRun(region="us-en")

@tool
def get_order_details(order_id: str) -> dict:
    """
    Fetch the status and details of a specific order from the local JSON database.
    """
    # PRINT 1: Confirm the tool is actually starting
    print(f"DEBUG: Tool called with order_id='{order_id}'")
    
    try:
        if not os.path.exists(JSON_DB_PATH):
            # PRINT 2: Check if file is missing
            print(f"DEBUG: File '{JSON_DB_PATH}' was NOT found in {os.getcwd()}")
            return {"error": "Database file not found."}

        with open(JSON_DB_PATH, 'r') as f:
            orders_db = json.load(f)
        
        target_id = str(order_id).strip()
        
        for order in orders_db:
            if str(order.get("order_id")) == target_id:
                print(f"DEBUG: Found order {target_id}")
                return order
        
        print(f"DEBUG: Order {target_id} not found in DB.")     
        return {"error": f"Order ID '{target_id}' not found."}
        
    except Exception as e:
        # PRINT 3: The critical error
        print(f"DEBUG: CRITICAL ERROR: {e}")
        return {"error": f"Failed to read database: {str(e)}"}


@tool
def calculator(first_num: float, second_num: float, operation: str) -> dict:
    """
    Perform a basic arithmetic operation on two numbers.
    Supported operations: add, sub, mul, div
    """
    try:
        if operation == "add":
            result = first_num + second_num
        elif operation == "sub":
            result = first_num - second_num
        elif operation == "mul":
            result = first_num * second_num
        elif operation == "div":
            if second_num == 0:
                return {"error": "Division by zero is not allowed"}
            result = first_num / second_num
        else:
            return {"error": f"Unsupported operation '{operation}'"}

        return {"first_num": first_num, "second_num": second_num, "operation": operation, "result": result}
    except Exception as e:
        return {"error": str(e)}




@tool
def get_stock_price(symbol: str) -> dict:
    """
    Fetch latest stock price for a given symbol (e.g. 'AAPL', 'TSLA')
    using Alpha Vantage with API key in the URL.
    """
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey=C9PE94QUEW9VWGFM"
    r = requests.get(url)
    return r.json()


tools = [search_tool, get_stock_price, calculator, get_order_details]
llm_with_tools = llm.bind_tools(tools)
# -------------------
# 3. State
# -------------------
class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


# -------------------
# 4. Nodes
# -------------------

def chat_node(state: ChatState):
    """
    LLM node. 
    It injects the System Prompt at the start of the context window.
    If state['messages'] is empty (start of session), the LLM will see 
    ONLY the System Prompt and generate the welcome message automatically.
    """
    system_message = SystemMessage(
        content="""You are a helpful customer support AI assistant for a pharmaceutical company. 
        Your primary goal is to assist users in tracking their medication orders. 

        INSTRUCTIONS:
        1. If this is the start of the conversation, politely welcome the user and immediately ask them to enter their 'Order ID'.
        2. If the user provides an Order ID (e.g., 1001), YOU MUST use the 'get_order_details' tool to look up the status in the 'orders.json' database.
        3. If the user asks about cancelling an order, YOU MUST follow the cancellation process given below.
            **Official Cancellation Process:**
            1. Log in to your account at www.pharma-portal.com.
            2. Navigate to the 'My Orders' section in the top right dashboard.
            3. Select the specific Order ID you wish to cancel.
            4. Click the red 'Request Cancellation' button.
            *Note: If the button is greyed out, your order has already been processed for shipping. In that case, please contact immediate support at 1-800-PHARMA-HELP.*
        
        4. Do not discuss stocks or math unless explicitly asked."""
    )
    
    # We create a new list with SystemMessage at the front + existing history
    # We do not save SystemMessage to the DB (it is transient logic)
    messages = [system_message] + state["messages"]
    
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

tool_node = ToolNode(tools)

# -------------------
# 5. Checkpointer
# -------------------
conn = sqlite3.connect(database="chatbot.db", check_same_thread=False)
checkpointer = SqliteSaver(conn=conn)

# -------------------
# 6. Graph
# -------------------
graph = StateGraph(ChatState)
graph.add_node("chat_node", chat_node)
graph.add_node("tools", tool_node)

graph.add_edge(START, "chat_node")

graph.add_conditional_edges("chat_node",tools_condition)
graph.add_edge('tools', 'chat_node')

chatbot = graph.compile(checkpointer=checkpointer)

# -------------------
# 7. Helper
# -------------------
def retrieve_all_threads():
    all_threads = set()
    for checkpoint in checkpointer.list(None):
        all_threads.add(checkpoint.config["configurable"]["thread_id"])
    return list(all_threads)

print("loaded")



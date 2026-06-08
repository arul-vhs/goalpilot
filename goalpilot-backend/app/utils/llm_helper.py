import os
import time
import logging
from langchain_google_genai import ChatGoogleGenerativeAI

logger = logging.getLogger(__name__)

def normalize_content(content):
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        text_parts = []
        for part in content:
            if isinstance(part, str):
                text_parts.append(part)
            elif isinstance(part, dict):
                text = part.get("text", "")
                if text:
                    text_parts.append(text)
        return "".join(text_parts)
    else:
        return str(content)

def invoke_llm_with_fallback(prompt_or_messages, tools=None, **kwargs):
    """
    Invokes Gemini/Gemma LLM with retries (exponential backoff) and fallback models
    (e.g., gemini-3.5-flash, gemma-4-31b-it) if gemini-2.5-flash experiences errors or is overloaded.
    """
    models = ["gemini-2.5-flash", "gemini-3.5-flash", "gemma-4-31b-it", "gemini-2.5-pro"]
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")

    last_exception = None
    for model_name in models:
        retries = 3
        backoff = 1.0  # initial sleep duration in seconds
        for attempt in range(retries):
            try:
                # We control retries ourselves, so set max_retries to 1
                llm = ChatGoogleGenerativeAI(
                    model=model_name,
                    google_api_key=api_key,
                    max_retries=1,
                    **kwargs
                )
                if tools:
                    runnable = llm.bind_tools(tools)
                else:
                    runnable = llm
                
                response = runnable.invoke(prompt_or_messages)
                if hasattr(response, "content"):
                    response.content = normalize_content(response.content)
                return response
            except Exception as e:
                last_exception = e
                logger.warning(
                    f"LLM invoke failed (model={model_name}, attempt={attempt+1}/{retries}): {str(e)}"
                )
                if attempt < retries - 1:
                    time.sleep(backoff)
                    backoff *= 2.0
                else:
                    logger.warning(f"Retries exhausted for {model_name}. Moving to next fallback model if available.")
                    
    # If all models failed, raise the last encountered error
    raise last_exception

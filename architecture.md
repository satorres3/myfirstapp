

# AI Agents Architecture

This document outlines the architecture for the AI agents and assistants within the portal. The design emphasizes modularity, scalability, and configurability.

## 1. Core Architecture: RAG with LangChain

The foundation of our AI assistants is a **Retrieval-Augmented Generation (RAG)** pipeline, orchestrated using the [LangChain](https://www.langchain.com/) framework. This approach allows the AI to provide context-aware answers based on a dedicated knowledge base, rather than relying solely on its pre-trained data.

The flow for a typical query is as follows:

1.  **User Query**: A user submits a question through the chat interface.
2.  **Query Embedding**: The user's query is converted into a numerical vector representation (an embedding) using a sentence-transformer model.
3.  **Similarity Search**: This query vector is used to search a vector database (e.g., FAISS, Pinecone) to find the most relevant document chunks from the container's knowledge base.
4.  **Context Augmentation**: The retrieved document chunks (the "context") are combined with the original user query and a system prompt.
5.  **LLM Generation**: This augmented prompt is sent to the selected Large Language Model (LLM) (e.g., Gemini, GPT-4, Llama).
6.  **Response**: The LLM generates a response based on the provided context, which is then streamed back to the user.

## 2. Knowledge Base

Each container has an isolated knowledge base. This ensures data privacy and contextual relevance.

-   **Data Ingestion**: Documents (PDF, Markdown, TXT, etc.) can be uploaded through the container view. These documents are chunked into smaller, manageable pieces.
-   **Embedding**: Each chunk is passed through an embedding model (e.g., `all-MiniLM-L6-v2`) to create a vector.
-   **Vector Store**: These vectors are stored and indexed in a vector database.
    -   **Local Development**: We use [FAISS](https://faiss.ai/) for its speed and simplicity, storing the index on the file system.
    -   **Production**: For scalability, cloud-based solutions like [Pinecone](https://www.pinecone.io/) or a self-hosted Milvus instance are recommended.

## 3. Model Switching Logic

The portal supports multiple AI providers to avoid vendor lock-in and leverage the best model for a given task.

-   **Configuration**: API keys and model names for various providers (Google, OpenAI, Anthropic, etc.) are stored securely in the `AIProviderSettings` model in the database.
-   **Dynamic Selection**: Users can select which model to use from a dropdown in the chat interface. The selection is passed with the API request.
-   **Unified Wrapper**: A centralized API wrapper class is used to handle requests to different providers. This class normalizes the input/output and manages provider-specific requirements, rate limits, and error handling.
-   **Fallbacks**: The system can be configured to fall back to a secondary model if the primary choice is unavailable.

## 4. Customization and Training

While the core models are pre-trained, the system's behavior can be customized:

-   **System Prompts**: The `Container` model allows for custom system prompts to define the AI's persona, tone, and objectives (e.g., "You are a helpful assistant for the HR container. Your tone should be professional and friendly.").
-   **Fine-Tuning (Advanced)**: For highly specific tasks, models can be fine-tuned. This involves preparing a dataset of prompt-completion pairs from container data and using the provider's API to train a custom model. The ID of this fine-tuned model can then be stored and used within the portal.

## 5. Example Agent Flow: Onboarding Assistant

1.  **Setup**: An HR manager uploads employee handbooks, policy documents, and onboarding FAQs to the "Human Resources" container's knowledge base.
2.  **Interaction**: A new employee opens the chat assistant in the HR container view and asks, "What is the company's policy on remote work?"
3.  **RAG Pipeline**:
    -   The question is embedded.
    -   The system retrieves the top 3 most relevant sections from the policy documents.
    -   The prompt sent to the selected LLM (e.g., Gemini 1.5 Flash) looks something like this:
        ```
        System: You are an HR assistant. Use the following context to answer the user's question.

        Context:
        [Chunk from Remote Work Policy Doc...]
        [Chunk from Employee Handbook...]

        User: What is the company's policy on remote work?
        ```
4.  **Response**: The LLM synthesizes the information from the provided context and generates a clear, concise answer for the new employee.

## 6. Container Catalog

Navigation within the portal is driven by a catalog of `ContainerConfig` objects. Each configuration specifies a `route`, `icon`, display `name`, and optional `allowed_roles`. When a user visits the hub page, the server filters the catalog by the user's groups and returns the allowed entries via the `/api/container-configs/` endpoint. The front end uses this response to render the grid of container cards, enabling administrators to add or reorder container experiences without redeploying code.

## 7. Gemini Retry Strategy

Calls to the Gemini API include a retry layer to reduce transient failures. When a request returns a network error or 5xx status, the portal retries up to three times with exponential backoff (e.g., 1s, 2s, 4s). Each attempt is logged so operators can monitor error rates and adjust retry thresholds as needed.
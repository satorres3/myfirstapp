Portal Scalability and Deployment Guide
=======================================

Scalability
-----------
* Use horizontal scaling with Docker containers behind a load balancer.
* Cache frequent queries in Redis and add database indexes for heavy tables.
* Offload long-running jobs to asynchronous workers via Celery or Django Channels.
* Serve static assets and media through a CDN.

Language model packages
-----------------------
* Adding ``langchain`` and ``langchain-community`` provides modular chains, memory, and
  vector store integrations to manage multiple providers consistently.
* LangChain simplifies retrieval-augmented generation pipelines and switching
  between models.
* Alternatives such as ``LlamaIndex`` or ``Haystack`` can be considered when a
  lighter or more opinionated framework is preferred.

Navigation between pages
------------------------
* Current pages reload individually; adopting client-side routing (e.g. React
  Router) can enable smoother transitions without full page loads.
* Lazy load plugin modules and wrap them in error boundaries so a failing
  module does not crash the workspace.

Azure deployment
----------------
* Build the Vite front-end and host it with **Azure Static Web Apps**.
* Run the Django backend on **Azure App Service** or **Azure Container Apps**.
* Recommended workflow:
  1. Build the backend image from ``Dockerfile`` and push to Azure Container Registry.
  2. Deploy the image with environment variables like ``DATABASE_URL`` and ``REDIS_URL``.
  3. Configure a Static Web App to serve the ``dist/`` output and proxy API
     calls to the backend.
* Use GitHub Actions or Azure Pipelines for automated builds and deployments.


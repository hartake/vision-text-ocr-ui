# GCP Cloud Deployment Design: vision-text-ui

## 1. Executive Summary

This document outlines and compares potential Google Cloud Platform (GCP) services for hosting the `vision-text-ui` frontend application. The backend is assumed to be running on a separate cloud platform (Azure), making Cross-Origin Resource Sharing (CORS) a key consideration.

The primary goal is to select a hosting solution that is cost-effective (prioritizing the free tier), scalable, and simple to manage for a static React application.

**Recommendation:** For this project, **Google Cloud Storage (GCS)** is the recommended solution due to its simplicity, performance, and extremely low cost for hosting static assets. **Google Cloud Run** is the recommended alternative if future server-side logic is anticipated.

---

## 2. Brainstormed Deployment Options

We will evaluate three primary GCP services for hosting the user interface.

### Option A: Google Cloud Storage (GCS) for Static Website Hosting

#### Overview
Google Cloud Storage is a globally available, highly durable object storage service. While its primary use is for storing data like images, backups, and logs, it has a feature that allows it to serve static files (HTML, CSS, JavaScript, images) directly to the web.

#### Core Concepts (The 20% for 80% Relevance)
*   **Buckets:** The fundamental containers that hold your data. A bucket is a globally unique name (e.g., `vision-text-ui-prod`). Your project files will be stored inside a bucket.
*   **Objects:** The individual files you store in a bucket (e.g., `index.html`, `main.js`).
*   **Static Website Configuration:** A special setting on a GCS bucket that tells it to serve an `index.html` file when a user accesses the root and an `404.html` (or other specified file) for errors.
*   **Public Access (IAM):** To make a website public, you must configure Identity and Access Management (IAM) to grant `allUsers` the `Storage Object Viewer` role. This allows anyone on the internet to view the files in your bucket.

#### Deployment Workflow
1.  **Build the React App:** Run `npm run build` locally to generate the static `build/` (or `dist/`) directory.
2.  **Create a GCS Bucket:** Create a new, globally unique bucket using the GCP console or `gcloud` CLI.
3.  **Upload Files:** Copy the contents of the `build/` directory into the GCS bucket.
    ```bash
    gsutil cp -r build/* gs://your-bucket-name/
    ```
4.  **Set Public Permissions:** Make the bucket's contents publicly readable.
    ```bash
    gsutil iam ch allUsers:objectViewer gs://your-bucket-name
    ```
5.  **Configure for Web:** Set the main page and error page.
    ```bash
    gsutil web set -m index.html -e 404.html gs://your-bucket-name
    ```

#### Pros & Cons
*   **Pros:**
    *   **Extremely Low Cost:** Very high probability of staying within the free tier.
    *   **Simplest Setup:** Easiest and fastest deployment method.
    *   **High Performance:** Integrates seamlessly with Google's global network and can be fronted by a CDN for even better performance.
*   **Cons:**
    *   **Static Content Only:** Cannot run any server-side code (e.g., Node.js, Python).

#### When to Choose GCS
Choose GCS for any "static" site, which includes most client-side JavaScript frameworks like React, Vue, and Angular, where no server-side rendering is required.

---

### Option B: Google Cloud Run

#### Overview
Cloud Run is a fully managed serverless platform that allows you to run stateless containers. It automatically scales your application up or down based on traffic, including scaling down to zero, meaning you pay nothing if it's not being used.

#### Core Concepts (The 20% for 80% Relevance)
*   **Containerization (`Dockerfile`):** Your application, including its environment and dependencies, is packaged into a container image. A `Dockerfile` is the recipe for building this image. For a React app, this typically involves a multi-stage build: one stage to build the static assets, and a final stage with a lightweight web server (like Nginx) to serve those assets.
*   **Serverless:** You don't manage any servers, virtual machines, or clusters. You deploy your container, and GCP handles everything else.
*   **Scale to Zero:** This is the key cost-saving feature. If your UI has no traffic, Cloud Run scales the container count to zero, and you incur no cost. It quickly starts a new container when a request comes in.
*   **Artifact Registry:** A private repository for storing your container images (like Docker Hub). You push your image here, and Cloud Run pulls from it.

#### Deployment Workflow
1.  **Build the React App:** Run `npm run build`.
2.  **Create a `Dockerfile`:** Add a `Dockerfile` to your project root to define the container image.
3.  **Build & Push Container Image:** Build the image and push it to Google Artifact Registry.
    ```bash
    gcloud builds submit --tag gcr.io/your-project-id/vision-text-ui
    ```
4.  **Deploy to Cloud Run:** Deploy the container image from the registry.
    ```bash
    gcloud run deploy vision-text-ui --image gcr.io/your-project-id/vision-text-ui --platform managed --region us-central1 --allow-unauthenticated
    ```

#### Pros & Cons
*   **Pros:**
    *   **Excellent Free Tier & Cost Model:** The "scale to zero" feature is ideal for projects with variable or no traffic.
    *   **Flexible:** Can run both a static site and a full backend service. Provides a clear path to add server-side logic later.
    *   **Fully Managed:** No infrastructure overhead.
*   **Cons:**
    *   **More Complex Setup:** Requires knowledge of containers and Dockerfiles.
    *   **Cold Starts:** The first request after scaling to zero may have slightly higher latency.

#### When to Choose Cloud Run
Choose Cloud Run when you want a serverless, container-based workflow, or if you have a static site that might need server-side capabilities in the future.

---

### Option C: Google App Engine (Standard Environment)

#### Overview
App Engine is a Platform-as-a-Service (PaaS) that simplifies application deployment. You provide your code and a configuration file, and App Engine handles the infrastructure, scaling, and versioning for you.

#### Core Concepts (The 20% for 80% Relevance)
*   **`app.yaml`:** The main configuration file. It tells App Engine what runtime to use (e.g., `nodejs20`), how to handle URL routing, and which files are static vs. dynamic. For a React app, you configure it to serve the static files from the `build` directory.
*   **Platform-as-a-Service (PaaS):** A higher level of abstraction than containers. You don't think about Dockerfiles or web servers; you just provide the application code and configuration, and the platform figures out how to run it.
*   **Services & Versions:** App Engine allows you to structure a large application into multiple "services" (microservices). When you deploy, you create a new "version" of that service. App Engine lets you easily split traffic between versions for testing or rollbacks.

#### Deployment Workflow
1.  **Build the React App:** Run `npm run build`.
2.  **Create `app.yaml`:** Add an `app.yaml` file to your project root.
    ```yaml
    runtime: nodejs20
    handlers:
      # Serve all static files from the build directory
      - url: /
        static_files: build/index.html
        upload: build/index.html
      - url: /(.*)
        static_files: build/\1
        upload: build/(.*)
    ```
3.  **Deploy:** Run a single command to deploy the application.
    ```bash
    gcloud app deploy
    ```

#### Pros & Cons
*   **Pros:**
    *   **Very Simple Deployment:** The `gcloud app deploy` command is famously easy.
    *   **Fully Managed:** No infrastructure to manage.
    *   **Built-in Versioning:** Easy to manage multiple versions and split traffic.
*   **Cons:**
    *   **Less Flexible:** More opinionated than Cloud Run. You are limited to the runtimes App Engine provides.
    *   **Potentially Higher Cost:** The free tier is based on instance-hours, not requests. An app that is always on might be more expensive than Cloud Run's scale-to-zero model.

#### When to Choose App Engine
Choose App Engine when you want the absolute simplest deployment experience for a web application and don't want to deal with containers. It's a great PaaS for traditional web apps.

---

## 3. Final Consideration: CORS

Because the frontend and backend are on different domains (GCP vs. Azure), the Azure backend **must** be configured to handle CORS. The backend needs to respond with a `Access-Control-Allow-Origin` header that includes the URL of the deployed GCP frontend. Without this, all API calls from the browser will fail.

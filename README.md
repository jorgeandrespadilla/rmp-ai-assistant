# AI Rate My Professor

This project is a Rate My Professor AI Assistant that can understand and respond to complex queries about professors and courses. This app was built using Next.js, TypeScript, Python, PostgreSQL, OpenAI and Pinecone.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Python 3.10 or higher

### Installation

1. Clone the repository.
2. Create a copy of the `.env.local.example` file and rename it to `.env.local`. Fill in the environment variables with your Firebase project configuration.
3. Configure the environment for running the Next.js app:
   - Install the dependencies by running `npm install`.
4. Configure the environment for running the Python scripts:
   - Create a Python virtual environment by running `python -m venv venv`.
   - Activate the virtual environment in your terminal by running `venv/Scripts/activate` on Windows or `source venv/bin/activate` on macOS and Linux.
   - Install the required Python packages by running `pip install -r requirements.txt`.
   
### Running the Next.js App

Start the development server by running `npm run dev`. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Running the Scripts

To run the Python scripts, you need to activate the virtual environment by running `source venv/bin/activate` in your terminal. You can deactivate the virtual environment by running `deactivate`.

1. RAG Ingestion Script: This script ingests the Rate My Professor reviews into Pinecone.
   - Run the script by running `python scripts/rag_ingestion.py`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

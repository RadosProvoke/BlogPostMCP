# BlogPostMCP

This is a GitHub-hosted MCP server that generates .docx blog posts from summarized transcript content via a simple POST API.

## Endpoint

POST /generate-docx

**Payload:**

```json
{
  "title": "Blog Title",
  "content": "Summarized blog content..."
}

swagger: '2.0'
info:
  title: BlogPostMCP
  version: 1.0.0
host: blogpostmcpapp-fhd2aeghdca3hdak.canadacentral-01.azurewebsites.net
basePath: /
schemes:
  - https
consumes:
  - application/json
produces:
  - application/json
paths:
  /generate-blogpost:
    post:
      summary: Generate a blog post from transcript
      description: Submit transcript text to generate a blog post.
      operationId: generateBlogPost
      parameters:
        - name: body
          in: body
          required: true
          schema:
            type: object
            properties:
              transcriptText:
                type: string
                description: Transcript content as plain text or base64
      responses:
        '200':
          description: Blog post generated successfully
          schema:
            type: object
            properties:
              title:
                type: string
              url:
                type: string
securityDefinitions: {}

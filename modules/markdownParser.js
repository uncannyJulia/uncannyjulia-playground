/**
 * Vanilla JavaScript Markdown Parser
 * Supports basic markdown formatting without external dependencies
 */

class MarkdownParser {
  constructor() {
    this.rules = [
      // Headers (must be first to avoid conflicts)
      { regex: /^### (.+)$/gm, replacement: '<h3>$1</h3>' },
      { regex: /^## (.+)$/gm, replacement: '<h2>$1</h2>' },
      { regex: /^# (.+)$/gm, replacement: '<h1>$1</h1>' },
      
      // Bold and italic
      { regex: /\*\*\*(.+?)\*\*\*/g, replacement: '<strong><em>$1</em></strong>' },
      { regex: /\*\*(.+?)\*\*/g, replacement: '<strong>$1</strong>' },
      { regex: /\*(.+?)\*/g, replacement: '<em>$1</em>' },
      
      // Links
      { regex: /\[([^\]]+)\]\(([^)]+)\)/g, replacement: '<a href="$2" target="_blank">$1</a>' },
      
      // Code blocks (before inline code)
      { regex: /```([^`]+)```/g, replacement: '<pre><code>$1</code></pre>' },
      
      // Inline code
      { regex: /`([^`]+)`/g, replacement: '<code>$1</code>' },
      
      // Horizontal rules
      { regex: /^---$/gm, replacement: '<hr>' },
      
      // Line breaks (double space + newline or double newline)
      { regex: /  \n/g, replacement: '<br>' },
      { regex: /\n\n/g, replacement: '</p><p>' },
    ];
  }

  /**
   * Parse markdown text to HTML
   * @param {string} markdown - The markdown text to parse
   * @returns {string} - The parsed HTML
   */
  parse(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    let html = markdown;

    // Handle lists first (before other rules)
    html = this.parseLists(html);

    // Apply basic formatting rules
    this.rules.forEach(rule => {
      html = html.replace(rule.regex, rule.replacement);
    });

    // Wrap content in paragraphs if it doesn't start with a block element
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<pre')) {
      html = '<p>' + html + '</p>';
    }

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
  }

  /**
   * Parse markdown lists (unordered and ordered)
   * @param {string} text - The text to parse
   * @returns {string} - Text with lists converted to HTML
   */
  parseLists(text) {
    const lines = text.split('\n');
    const result = [];
    let inList = false;
    let listType = null;
    let listItems = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for unordered list item
      const unorderedMatch = trimmed.match(/^[•\-\*\+]\s+(.+)$/);
      // Check for ordered list item
      const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);

      if (unorderedMatch) {
        if (!inList || listType !== 'ul') {
          // Start new unordered list
          if (inList) {
            result.push(this.closeList(listType, listItems));
          }
          inList = true;
          listType = 'ul';
          listItems = [];
        }
        listItems.push(unorderedMatch[1]);
      } else if (orderedMatch) {
        if (!inList || listType !== 'ol') {
          // Start new ordered list
          if (inList) {
            result.push(this.closeList(listType, listItems));
          }
          inList = true;
          listType = 'ol';
          listItems = [];
        }
        listItems.push(orderedMatch[1]);
      } else {
        // Not a list item
        if (inList) {
          result.push(this.closeList(listType, listItems));
          inList = false;
          listType = null;
          listItems = [];
        }
        result.push(line);
      }
    }

    // Close any remaining list
    if (inList) {
      result.push(this.closeList(listType, listItems));
    }

    return result.join('\n');
  }

  /**
   * Close a list and return HTML
   * @param {string} listType - 'ul' or 'ol'
   * @param {string[]} items - Array of list items
   * @returns {string} - HTML list
   */
  closeList(listType, items) {
    const listItems = items.map(item => `<li>${item}</li>`).join('');
    return `<${listType}>${listItems}</${listType}>`;
  }

  /**
   * Escape HTML characters in text
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Parse markdown from a file path and return HTML
   * @param {string} filePath - Path to markdown file
   * @returns {Promise<string>} - Promise resolving to HTML
   */
  async parseFile(filePath) {
    try {
      // Check if we're running on file:// protocol (local file access)
      if (window.location.protocol === 'file:' && filePath.includes('vita.md')) {
        // Return embedded vita content to avoid CORS issues
        return this.getEmbeddedVita();
      }
      
      const response = await fetch(filePath);
      const markdown = await response.text();
      return this.parse(markdown);
    } catch (error) {
      console.error('Error loading markdown file:', error);
      
      // Fallback for specific known files
      if (filePath.includes('vita.md')) {
        return this.getEmbeddedVita();
      }
      
      return `<p>Error loading content from ${filePath}</p>`;
    }
  }

  /**
   * Get embedded vita content (fallback for CORS issues)
   * @returns {string} - HTML content
   */
  getEmbeddedVita() {
    const vitaMarkdown = `# Julia's Professional Profile

Machine learning engineer with dual expertise in **clinical psychology** and **AI development**.
Specializes in translating human workflows into autonomous systems. Experience building
AI departments and infrastructure from scratch, with a focus on LLMs, graph-based systems,
and explainable AI solutions.

## Professional Experience

### KRISENCHAT GGMBH, BERLIN
**Senior AI Solutions Architect** | *2025 - Present*
- Lead AI strategy and implementation across the organization
- Guide the development of graph-based RAG systems and agentic solutions

**Machine Learning Engineer & Project Lead** | *2021 - 2024*
- Built and led AI/ML department from scratch
- Developed systems serving 350+ counselors handling 15,000+ monthly sessions
- Implemented LLM applications for clinical documentation and decision support
- Transformed infrastructure for ML readiness, created ETL pipelines and MLOps systems

### MOODBASE E.G. I.G. & ETHICAL TECHNOLOGIES FOR MENTAL HEALTH UG
**Founding Engineer** | *2024 - Present*
- Established AI infrastructure and data architecture for mental health startups
- Implemented knowledge graph systems and agentic chatbot applications

### XEMANTIC, BERLIN
**Freelance Engineer & Project Lead** | *2021 - Present*
- Deliver end-to-end AI solutions for multiple clients
- Contributed open-source projects in graph reasoning and generative AI
- Secure funding for innovative technical initiatives

## Education

### UNIVERSITY OF BASEL
**PhD Candidate, Clinical Psychology and Epidemiology** | *2022 - 2025 (expected)*
- Research: Agentic AI for autonomous diagnostic systems

### UNIVERSITY OF BERN
**Certificate of Advanced Studies, Advanced Machine Learning** | *2022 - 2023*
- Focus: Graph Neural Networks, mathematical foundations of AI

### INTERNATIONAL PSYCHOANALYTIC UNIVERSITY, BERLIN
**Master of Clinical Psychology** | *2019 - 2021*

## Technical Skills

**AI/ML:** LLM deployment & fine-tuning, RAG systems, Explainable AI, Graph Neural Networks, MLOps

**Programming:** Python, JavaScript, R, PostgreSQL, Kotlin (learning Rust)

**Frameworks:** TensorFlow, oLLaMa, VLLM, LangChain, FastAPI, Node.js, Next.js

**Infrastructure:** GCP, Terraform, Kubernetes, CI/CD pipelines

## Languages

**German** (Native) | **English** (Fluent) | **Russian** (Moderate)`;

    return this.parse(vitaMarkdown);
  }
}
/**
 * Creates and manages a permanent side panel for displaying node details
 * Always visible and shows debug info
 */
export class SidePanel {
  constructor() {
    this.panel = null;
    this.contentArea = null;
    this.debugSection = null;
    this.currentNodeId = null;
    this.detailsData = {};
    this.graphStats = {
      totalNodes: 0,
      visibleNodes: 0,
      expandedNodes: 0,
      nodeTypes: {}
    };

    // Create the panel element
    this.createPanel();

    // Show initial debug content
    this.showDebugInfo();

    console.log('Permanent side panel initialized');
  }

  /**
   * Creates the side panel DOM structure
   */
  createPanel() {
    // Create the panel container
    this.panel = document.createElement('div');
    this.panel.className = 'side-panel';
    this.panel.id = 'node-side-panel';

    // Create header
    const header = document.createElement('div');
    header.className = 'panel-header';

    // Title area
    this.titleElement = document.createElement('h2');
    this.titleElement.className = 'panel-title';
    this.titleElement.textContent = 'Graph Explorer';
    header.appendChild(this.titleElement);

    this.panel.appendChild(header);

    // Create content area
    this.contentArea = document.createElement('div');
    this.contentArea.className = 'panel-content';

    // Add initial placeholder
    this.contentArea.innerHTML = `
      <div class="info-section">
        <p>Double-click any node to view its details here.</p>
      </div>
    `;

    this.panel.appendChild(this.contentArea);

    // Add debug section
    this.debugSection = document.createElement('div');
    this.debugSection.className = 'debug-section';
    this.debugSection.innerHTML = '<h3>Debug Information</h3><div id="debug-content"></div>';
    this.contentArea.appendChild(this.debugSection);

    // Add to document
    document.body.appendChild(this.panel);

    console.log('Permanent side panel created:', this.panel);
  }

  /**
   * Shows details for a specific node
   * @param {Object} node - The node data object
   */
  showNode(node) {
    if (!node) return;

    console.log('Showing node details:', node);
    this.currentNodeId = node.id;

    // Update title
    this.titleElement.textContent = node.text;

    // Clear previous content (except debug section)
    this.contentArea.innerHTML = '';

    // Create basic info section
    const infoSection = document.createElement('div');
    infoSection.className = 'info-section';

    // Type badge
    const typeBadge = document.createElement('span');
    typeBadge.className = `type-badge ${node.type.replace(/\s+/g, '-')}`;
    typeBadge.textContent = node.type;
    infoSection.appendChild(typeBadge);

    // Node ID
    const idElement = document.createElement('div');
    idElement.className = 'node-id';
    idElement.textContent = `ID: ${node.id}`;
    infoSection.appendChild(idElement);

    this.contentArea.appendChild(infoSection);

    // Add details section (placeholder for future content)
    const detailsSection = document.createElement('div');
    detailsSection.className = 'details-section';

    // Check if we have existing details for this node
    if (this.detailsData[node.id]) {
      detailsSection.innerHTML = this.detailsData[node.id];
    } else {
      // Placeholder message
      detailsSection.innerHTML = `
        <p class="placeholder-text">
          Additional details for "${node.text}" can be added here.
        </p>
        <p class="placeholder-text">
          Properties:
        </p>
        <pre>${JSON.stringify(node, null, 2)}</pre>
      `;
    }

    this.contentArea.appendChild(detailsSection);

    // Add debug section back
    this.updateDebugSection();
  }

  /**
   * Updates graph statistics
   * @param {Object} stats - Current graph statistics
   */
  updateStats(stats) {
    this.graphStats = stats;
    this.updateDebugSection();
  }

  /**
   * Updates or creates the debug section
   */
  updateDebugSection() {
    // Create debug section if it doesn't exist
    if (!this.debugSection) {
      this.debugSection = document.createElement('div');
      this.debugSection.className = 'debug-section';
      this.contentArea.appendChild(this.debugSection);
    }

    // Update content
    this.debugSection.innerHTML = `
      <h3>Debug Information</h3>
      <ul class="debug-list">
        <li>Total Nodes: <span class="debug-count">${this.graphStats.totalNodes}</span></li>
        <li>Visible Nodes: <span class="debug-count">${this.graphStats.visibleNodes}</span></li>
        <li>Expanded Nodes: <span class="debug-count">${this.graphStats.expandedNodes}</span></li>
      </ul>
      
      <h3>Node Types</h3>
      <ul class="debug-list">
        ${Object.entries(this.graphStats.nodeTypes).map(([type, count]) => 
          `<li>${type}: <span class="debug-count">${count}</span></li>`
        ).join('')}
      </ul>
      
      <h3>Current Node</h3>
      <p>${this.currentNodeId ? `ID: ${this.currentNodeId}` : 'None selected'}</p>
    `;
  }

  /**
   * Shows debug information in the panel
   */
  showDebugInfo() {
    this.titleElement.textContent = 'Graph Explorer';

    // Create basic debug info
    this.updateDebugSection();
  }

  /**
   * Updates the content for a specific node
   * @param {string} nodeId - The ID of the node to update
   * @param {string} htmlContent - The HTML content to set
   */
  setNodeContent(nodeId, htmlContent) {
    this.detailsData[nodeId] = htmlContent;

    // If this node is currently shown, update the display
    if (this.currentNodeId === nodeId) {
      const detailsSection = this.contentArea.querySelector('.details-section');
      if (detailsSection) {
        detailsSection.innerHTML = htmlContent;
        this.updateDebugSection();
      }
    }
  }

  /**
   * Load details from a JSON file
   * @param {Object} detailsData - Object mapping node IDs to HTML content
   */
  loadDetails(detailsData) {
    this.detailsData = detailsData;
  }
}
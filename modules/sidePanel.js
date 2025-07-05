/**
 * Creates and manages a permanent side panel for displaying node details
 * Always visible and shows debug info
 */
class SidePanel {
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

    // Initialize debug content but don't change title
    this.updateDebugSection();

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
    this.titleElement.textContent = 'Graph of Life';
    header.appendChild(this.titleElement);

    this.panel.appendChild(header);

    // Create content area
    this.contentArea = document.createElement('div');
    this.contentArea.className = 'panel-content';

    // Add controls and instructions
    this.contentArea.innerHTML = `
      <div class="controls-section">
        <button id="resetZoom" class="control-btn">Reset Zoom</button>
        <button id="showAll" class="control-btn">Show All Nodes</button>
        <button id="resetView" class="control-btn">Reset to Life Events</button>
      </div>
      
      <div class="manual-section">
        <p><strong>Click:</strong> Show details & expand connections</p>
        <p><strong>Double-click:</strong> Zoom to node</p>
        <p><strong>Shift+Drag:</strong> Fix node position</p>
        <p><strong>Mouse wheel:</strong> Zoom in/out</p>
        <p><strong>Drag background:</strong> Pan around</p>
      </div>
      
      <div class="info-section">
        <p class="node-placeholder">Click any node to view its details here.</p>
      </div>
      
      <div class="extra-section">
        <div class="orange-separator"></div>
        <div class="extra-content">
          <p class="extra-placeholder">Additional information will appear here when available.</p>
        </div>
      </div>
    `;

    this.panel.appendChild(this.contentArea);

    // Add debug section (initially hidden)
    this.debugSection = document.createElement('div');
    this.debugSection.className = 'debug-section';
    this.debugSection.style.display = 'none';
    this.debugSection.innerHTML = `
      <h3>Properties</h3>
      <div id="node-properties"></div>
      <h4>Graph Stats</h4>
      <ul class="debug-list" id="debug-stats"></ul>
    `;
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

    // Keep title as "Graph of Life" - don't change it

    // Update only the node details section
    const infoSection = this.contentArea.querySelector('.info-section');
    console.log('Info section found:', infoSection);
    if (!infoSection) return;
    
    // Clear the info section - no longer showing node text here
    infoSection.innerHTML = '<p class="node-placeholder">Node selected - details shown below</p>';
    console.log('Info section cleared, node details moved to properties');

    // Update extra section with node type and additional info
    const extraContent = this.contentArea.querySelector('.extra-content');
    console.log('Extra content found:', extraContent);
    if (extraContent) {
      extraContent.innerHTML = `
        <div class="node-title-section">
          <h4 style="color: #ff9900; margin: 0 0 10px 0; font-size: 16px;">${node.text}</h4>
        </div>
        <p><strong>Type:</strong> ${node.type}</p>
        <p><strong>Node ID:</strong> ${node.id}</p>
        <p style="margin-top: 10px; font-size: 11px; color: #888;">
          This node represents a ${node.type.toLowerCase()} in the life journey graph.
        </p>
      `;
      console.log('Extra content updated with node title');
    } else {
      console.log('Extra content section not found!');
    }

    // Update debug section with node properties
    const nodeProperties = document.getElementById('node-properties');
    if (nodeProperties) {
      nodeProperties.innerHTML = `
        <p><strong>ID:</strong> ${node.id}</p>
        <p><strong>Type:</strong> ${node.type}</p>
        <pre>${JSON.stringify(node, null, 2)}</pre>
      `;
    }

    // Update the current node
    this.currentNodeId = node.id;
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
    // Keep title as "Graph of Life" - don't change it

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
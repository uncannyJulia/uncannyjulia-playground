/**
 * Creates and manages a side panel for displaying node details
 */
export class SidePanel {
  constructor() {
    this.panel = null;
    this.contentArea = null;
    this.currentNodeId = null;
    this.isVisible = false;
    this.detailsData = {};

    // Create the panel element
    this.createPanel();
  }

  /**
   * Creates the side panel DOM structure
   */
  createPanel() {
    // Create the panel container
    this.panel = document.createElement('div');
    this.panel.className = 'side-panel';
    this.panel.style.display = 'none';

    // Create header
    const header = document.createElement('div');
    header.className = 'panel-header';

    // Title area
    this.titleElement = document.createElement('h2');
    this.titleElement.className = 'panel-title';
    this.titleElement.textContent = 'Node Details';
    header.appendChild(this.titleElement);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'panel-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close panel');
    closeButton.addEventListener('click', () => this.hide());
    header.appendChild(closeButton);

    this.panel.appendChild(header);

    // Create content area
    this.contentArea = document.createElement('div');
    this.contentArea.className = 'panel-content';
    this.panel.appendChild(this.contentArea);

    // Add to document
    document.body.appendChild(this.panel);
  }

  /**
   * Shows the panel with details for a specific node
   * @param {Object} node - The node data object
   */
  show(node) {
    if (!node) return;

    this.currentNodeId = node.id;

    // Update title
    this.titleElement.textContent = node.text;

    // Clear previous content
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
          Double-click on this node again to edit details.
        </p>
      `;
    }

    this.contentArea.appendChild(detailsSection);

    // Show the panel
    this.panel.style.display = 'block';
    this.isVisible = true;

    // Add visible class for transition
    setTimeout(() => {
      this.panel.classList.add('visible');
    }, 10);
  }

  /**
   * Hides the panel
   */
  hide() {
    this.panel.classList.remove('visible');

    // Wait for transition to complete before hiding
    setTimeout(() => {
      this.panel.style.display = 'none';
      this.isVisible = false;
      this.currentNodeId = null;
    }, 300);
  }

  /**
   * Toggles the panel visibility for a node
   * @param {Object} node - The node data object
   */
  toggle(node) {
    if (this.isVisible && this.currentNodeId === node.id) {
      this.hide();
    } else {
      this.show(node);
    }
  }

  /**
   * Updates the content for a specific node
   * @param {string} nodeId - The ID of the node to update
   * @param {string} htmlContent - The HTML content to set
   */
  setNodeContent(nodeId, htmlContent) {
    this.detailsData[nodeId] = htmlContent;

    // If this node is currently shown, update the display
    if (this.isVisible && this.currentNodeId === nodeId) {
      const detailsSection = this.contentArea.querySelector('.details-section');
      if (detailsSection) {
        detailsSection.innerHTML = htmlContent;
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
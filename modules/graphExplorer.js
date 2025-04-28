import * as d3 from 'd3';

/**
 * Manages the progressive disclosure of nodes in the graph
 * Shows life event nodes initially, then reveals/hides connected nodes on click
 */
export class GraphExplorer {
  constructor(fullGraphData) {
    this.fullData = JSON.parse(JSON.stringify(fullGraphData)); // Deep copy
    this.visibleNodeIds = new Set();
    this.expandedNodeIds = new Set();
    this.hiddenConnectionsMap = new Map(); // Store hidden connections for toggle functionality

    // Initialize with the visible subset
    this.visibleData = this.createInitialGraph();

    // Callbacks
    this.onGraphChange = null;
  }

  /**
   * Creates the initial visible graph with life event nodes
   */
  createInitialGraph() {
    // Start with emptied graph
    const visibleGraph = {
      nodes: [],
      links: []
    };

    // Find life event nodes to show initially
    const lifeEventNodes = this.fullData.nodes.filter(node => node.type === 'skill');

    // Add life event nodes to visible set
    lifeEventNodes.forEach(node => {
      this.visibleNodeIds.add(node.id);
      visibleGraph.nodes.push(node);
    });

    // Add links between visible nodes
    this.fullData.links.forEach(link => {
      if (this.visibleNodeIds.has(link.source) && this.visibleNodeIds.has(link.target)) {
        visibleGraph.links.push(link);
      }
    });

    return visibleGraph;
  }

  /**
   * Toggles the expansion state of a node
   * If expanded, collapses its connections
   * If collapsed, expands to show connections
   */
  toggleNode(nodeId) {
    if (this.expandedNodeIds.has(nodeId)) {
      return this.collapseNode(nodeId);
    } else {
      return this.expandNode(nodeId);
    }
  }

  /**
   * Expands the graph to show nodes connected to the given node
   */
  expandNode(nodeId) {
    if (this.expandedNodeIds.has(nodeId)) {
      return { expanded: true, changed: false }; // Already expanded
    }

    // Mark this node as expanded
    this.expandedNodeIds.add(nodeId);

    // Find all connected nodes that aren't visible yet
    const newNodes = [];
    const newLinks = [];
    const nodeConnections = { nodes: [], links: [] };

    // Find all connections to this node
    this.fullData.links.forEach(link => {
      let sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      let targetId = typeof link.target === 'object' ? link.target.id : link.target;

      // If link connects to our node
      if (sourceId === nodeId || targetId === nodeId) {
        // Get the id of the other node
        const connectedId = sourceId === nodeId ? targetId : sourceId;

        // Create a deep copy of the link to store
        const linkCopy = JSON.parse(JSON.stringify(link));

        // If not yet visible, add it
        if (!this.visibleNodeIds.has(connectedId)) {
          // Find the node object
          const nodeObj = this.fullData.nodes.find(n => n.id === connectedId);
          if (nodeObj) {
            // Create a deep copy
            const nodeCopy = JSON.parse(JSON.stringify(nodeObj));
            newNodes.push(nodeCopy);
            nodeConnections.nodes.push(nodeCopy);
            this.visibleNodeIds.add(connectedId);
          }

          // Add this link
          newLinks.push(linkCopy);
          nodeConnections.links.push(linkCopy);
        } else if (!this.visibleData.links.some(l =>
          (l.source === sourceId && l.target === targetId) ||
          (l.source.id === sourceId && l.target.id === targetId))) {
          // Link not yet visible but both nodes are
          newLinks.push(linkCopy);
          nodeConnections.links.push(linkCopy);
        }
      }
    });

    // Store connections for this node for possible later collapse
    this.hiddenConnectionsMap.set(nodeId, nodeConnections);

    if (newNodes.length === 0 && newLinks.length === 0) {
      return { expanded: true, changed: false }; // Nothing new to add
    }

    // Add new elements to visible data
    this.visibleData.nodes = [...this.visibleData.nodes, ...newNodes];
    this.visibleData.links = [...this.visibleData.links, ...newLinks];

    // Fix reference issues between links and nodes
    this.resolveReferences();

    // Notify of graph change
    if (this.onGraphChange) {
      this.onGraphChange(this.visibleData, newNodes, newLinks, nodeId, true);
    }

    return { expanded: true, changed: true };
  }

  /**
   * Collapses a previously expanded node
   * Removes its connections from the visible graph
   */
  collapseNode(nodeId) {
    if (!this.expandedNodeIds.has(nodeId)) {
      return { expanded: false, changed: false }; // Not expanded
    }

    // Get the connections that were added for this node
    const connections = this.hiddenConnectionsMap.get(nodeId);
    if (!connections) {
      return { expanded: false, changed: false }; // No stored connections
    }

    // Mark as not expanded
    this.expandedNodeIds.delete(nodeId);

    // Get IDs of nodes to remove
    const nodeIdsToRemove = connections.nodes.map(n => n.id);
    const removedNodes = [...connections.nodes];
    const removedLinks = [...connections.links];

    // Check if these nodes can be removed (they might be connected to other expanded nodes)
    const canRemoveNode = {};
    nodeIdsToRemove.forEach(id => {
      canRemoveNode[id] = true;
    });

    // Check each expanded node's connections
    this.expandedNodeIds.forEach(expandedId => {
      if (expandedId === nodeId) return; // Skip the node we're collapsing

      const expandedConnections = this.hiddenConnectionsMap.get(expandedId);
      if (!expandedConnections) return;

      // Check if any nodes we want to remove are connected to other expanded nodes
      expandedConnections.nodes.forEach(node => {
        if (canRemoveNode[node.id]) {
          canRemoveNode[node.id] = false; // Cannot remove this node
        }
      });
    });

    // Filter nodes to only include those that can be safely removed
    const finalNodesToRemove = nodeIdsToRemove.filter(id => canRemoveNode[id]);

    // Remove nodes that are only connected to this node
    this.visibleData.nodes = this.visibleData.nodes.filter(node =>
      !finalNodesToRemove.includes(node.id));

    // Update the visible nodes set
    finalNodesToRemove.forEach(id => {
      this.visibleNodeIds.delete(id);
    });

    // Remove links
    const linksToRemove = connections.links.map(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return { sourceId, targetId };
    });

    this.visibleData.links = this.visibleData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;

      return !linksToRemove.some(l =>
        (l.sourceId === sourceId && l.targetId === targetId) ||
        (l.sourceId === targetId && l.targetId === sourceId));
    });

    // Fix reference issues between links and nodes
    this.resolveReferences();

    // Notify of graph change
    if (this.onGraphChange) {
      this.onGraphChange(this.visibleData, [], [], nodeId, false, removedNodes, removedLinks);
    }

    return { expanded: false, changed: true };
  }

  /**
   * Make sure links reference node objects, not just IDs
   */
  resolveReferences() {
    // Create lookup map for nodes
    const nodeMap = {};
    this.visibleData.nodes.forEach(node => {
      nodeMap[node.id] = node;
    });

    // Ensure links reference actual node objects
    this.visibleData.links = this.visibleData.links.map(link => {
      const source = typeof link.source === 'object' ? link.source.id : link.source;
      const target = typeof link.target === 'object' ? link.target.id : link.target;

      return {
        ...link,
        source: nodeMap[source],
        target: nodeMap[target]
      };
    });
  }

  /**
   * Returns the current visible graph data
   */
  getVisibleGraph() {
    return this.visibleData;
  }

  /**
   * Reveals the entire graph
   */
  showFullGraph() {
    this.visibleNodeIds = new Set(this.fullData.nodes.map(n => n.id));
    this.expandedNodeIds = new Set(this.fullData.nodes.map(n => n.id));
    this.visibleData = JSON.parse(JSON.stringify(this.fullData));
    this.resolveReferences();

    if (this.onGraphChange) {
      this.onGraphChange(this.visibleData, [], []);
    }
  }

  /**
   * Check if a node has unexplored connections
   */
  hasUnexploredConnections(nodeId) {
    // This now checks if there are ANY connections, not just unexplored ones
    return this.fullData.links.some(link => {
      const source = typeof link.source === 'object' ? link.source.id : link.source;
      const target = typeof link.target === 'object' ? link.target.id : link.target;
      return (source === nodeId || target === nodeId);
    });
  }

  /**
   * Check if a node is currently expanded
   */
  isNodeExpanded(nodeId) {
    return this.expandedNodeIds.has(nodeId);
  }
}
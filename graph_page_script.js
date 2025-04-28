// Import D3 modules using ES Module syntax
import * as d3 from 'd3';

// Import custom modules
import { nodeShapes, applyNodeStyles } from './modules/shapes.js';
import { addTextToNodes, updateTextVisibility } from './modules/textUtils.js';
import { GraphExplorer } from './modules/graphExplorer.js';
import { SidePanel } from './modules/sidePanel.js';

// Main app initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('D3 is loaded and working');

  // Get the container dimensions
  const container = d3.select("#chartId");

  // Set initial dimensions based on the current window
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Create responsive SVG that fills its container
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "black")
    .style("display", "block"); // Remove any default margins

  // Create a container group for all graph elements
  const graphGroup = svg.append('g');

  // Create groups for links and nodes to maintain proper layering
  const linksGroup = graphGroup.append('g').attr('class', 'links');
  const nodesGroup = graphGroup.append('g').attr('class', 'nodes');

  // Initialize the side panel
  const sidePanel = new SidePanel();

  // Create arrow markers for links
  svg.append("defs").selectAll("marker")
    .data(["arrow"])
    .enter().append("marker")
    .attr("id", d => d)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#999");

  // Add indicator for expandable nodes
  svg.append("defs")
    .append("g")
    .attr("id", "expandIcon")
    .attr("fill", "#fff")
    .attr("stroke", "none")
    .html('<circle r="6" fill="#000" stroke="#fff"/><path d="M-3,0 h6 M0,-3 v6" stroke="#fff" stroke-width="1.5"/>');

  // Add indicator for collapsible nodes
  svg.append("defs")
    .append("g")
    .attr("id", "collapseIcon")
    .attr("fill", "#fff")
    .attr("stroke", "none")
    .html('<circle r="6" fill="#000" stroke="#fff"/><path d="M-3,0 h6" stroke="#fff" stroke-width="1.5"/>');

  // Create zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .on('zoom', (event) => {
      graphGroup.attr('transform', event.transform);

      // Update text visibility based on zoom level
      if (nodeGroup) {
        updateTextVisibility(nodeGroup, event.transform.k);
      }
    });

  svg.call(zoom);

  // Fixed radius for all nodes
  const nodeRadius = 35;

  // Variables to hold current simulation and graph elements
  let simulation;
  let nodeGroup;
  let links;
  let graphExplorer;

  // Load external JSON data
  const loadData = async () => {
    try {
      const response = await fetch('graph_data.json');
      const graphData = await response.json();
      console.log('Data loaded successfully');

      // Initialize graph explorer with life events as starting nodes
      graphExplorer = new GraphExplorer(graphData);

      // Set up callback for when graph changes
      graphExplorer.onGraphChange = (newGraphData, newNodes, newLinks, toggledNodeId, isExpanded, removedNodes, removedLinks) => {
        updateGraph(newGraphData, newNodes, newLinks, toggledNodeId, isExpanded, removedNodes, removedLinks);
      };

      // Create initial graph
      initializeGraph(graphExplorer.getVisibleGraph());
    } catch (error) {
      console.error('Error loading data:', error);
      console.log('Failed to load data, check if graph_data.json exists');
    }
  };

  // Function to initialize node positions based on relative coordinates
  function initializeNodePositions(graphData) {
    graphData.nodes.forEach(node => {
      if (node.fixed && node.relativeX !== undefined && node.relativeY !== undefined) {
        // Convert relative positions to absolute and fix the nodes
        node.fx = width * node.relativeX;
        node.fy = height * node.relativeY;
        // Also set initial position for better starting point
        node.x = node.fx;
        node.y = node.fy;
      }
    });
  }

  // Main function to build the graph
  function initializeGraph(graphData) {
    // Initialize node positions before starting the simulation
    initializeNodePositions(graphData);

    // Create the force simulation centered in the window
    simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('collide', d3.forceCollide().radius(80)) // Increased radius to prevent overlap with text
      .force('center', d3.forceCenter(width / 2, height / 2)); // Center in window

    // Create the links
    links = linksGroup.selectAll('line')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('class', d => `link ${d.type}`)
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => {
        // Use dashed lines for certain relationship types
        return ['perspective', 'philosophy', 'thinking'].includes(d.type) ? '5,5' : null;
      })
      .attr('marker-end', 'url(#arrow)');

    // Create a group for each node
    nodeGroup = nodesGroup.selectAll('g.node')
      .data(graphData.nodes)
      .enter()
      .append('g')
      .attr('class', d => d.fixed ? 'node fixed-node' : 'node')
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragging)
        .on('end', dragEnded));

    // Create shapes based on node type
    nodeGroup.append('path')
      .attr('d', d => {
        // Get node type with a fallback
        const nodeType = d.type || 'interest';
        // Get the shape configuration
        const shapeConfig = nodeShapes[nodeType] || nodeShapes['interest'];
        // Return the path data
        return shapeConfig(nodeRadius).path;
      })
      .attr('fill', '#000000');

    // Apply the appropriate stroke styles based on node type
    applyNodeStyles(nodeGroup);

    // Add expand/collapse icons to nodes
    updateNodeIcons();

    // Add hover title to nodes
    nodeGroup.append('title')
      .text(d => `${d.text} (${d.type})${d.fixed ? ' [Fixed]' : ''}`);

    // Add text labels below nodes
    addTextToNodes(nodeGroup, nodeRadius);

    // Function to update dimensions and constraints
    const updateDimensions = () => {
      // Get new window dimensions
      width = window.innerWidth;
      height = window.innerHeight;

      // Update SVG size to match window
      svg.attr("width", width)
         .attr("height", height);

      // Update fixed node positions based on new dimensions
      graphData.nodes.forEach(node => {
        if (node.fixed && node.relativeX !== undefined && node.relativeY !== undefined) {
          node.fx = width * node.relativeX;
          node.fy = height * node.relativeY;
          // Also update current position for a smoother transition
          node.x = node.fx;
          node.y = node.fy;
        }
      });

      // Update simulation center
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
      simulation.alpha(0.3).restart();
    };

    // Add window resize listener
    window.addEventListener('resize', updateDimensions);

    // Update positions on simulation tick with boundary constraints
    simulation.on('tick', () => {
      // Constrain nodes within boundaries
      graphData.nodes.forEach(d => {
        if (!d.fixed) { // Only constrain non-fixed nodes
          const padding = nodeRadius * 2;
          d.x = Math.max(padding, Math.min(width - padding, d.x || 0));
          d.y = Math.max(padding, Math.min(height - padding, d.y || 0));
        }
      });

      links
        .attr('x1', d => d.source.x || 0)
        .attr('y1', d => d.source.y || 0)
        .attr('x2', d => d.target.x || 0)
        .attr('y2', d => d.target.y || 0);

      nodeGroup
        .attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Add click handler for node expansion/collapse and selection
    nodeGroup.on('click', (event, d) => {
      event.stopPropagation();

      // Clear previous selection
      d3.selectAll('.selected-node').classed('selected-node', false);

      // Mark this node as selected
      d3.select(event.currentTarget).classed('selected-node', true);

      // Toggle node connections
      if (graphExplorer.hasUnexploredConnections(d.id)) {
        const result = graphExplorer.toggleNode(d.id);

        // Zoom to this node when expanding
        if (result.expanded && result.changed) {
          // Gentle zoom to the node
          zoomToNode(d, 1.5);
        }
      }
    });

    // Double-click to open side panel
    nodeGroup.on('dblclick', (event, d) => {
      event.stopPropagation();

      // Open side panel with node details
      sidePanel.toggle(d);
    });

    // Double-click on background to reset zoom
    svg.on('dblclick', () => {
      svg.transition().duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    });

    // Clear selection when clicking on background
    svg.on('click', () => {
      d3.selectAll('.selected-node').classed('selected-node', false);
    });

    // Connect button events
    document.getElementById('resetZoom').addEventListener('click', () => {
      svg.transition().duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    });

    document.getElementById('showAll').addEventListener('click', () => {
      graphExplorer.showFullGraph();
    });
  }

  // Function to update the graph when nodes are expanded/collapsed
  function updateGraph(newGraphData, newNodes, newLinks, toggledNodeId, isExpanded, removedNodes = [], removedLinks = []) {
    // Update simulation with new data
    simulation.nodes(newGraphData.nodes);
    simulation.force('link').links(newGraphData.links);

    // Update links
    links = linksGroup.selectAll('line')
      .data(newGraphData.links);

    // Handle new links
    const linksEnter = links.enter()
      .append('line')
      .attr('class', d => `link ${d.type}`)
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => {
        return ['perspective', 'philosophy', 'thinking'].includes(d.type) ? '5,5' : null;
      })
      .attr('marker-end', 'url(#arrow)');

    // Handle removed links
    links.exit()
      .transition()
      .duration(300)
      .attr('stroke-opacity', 0)
      .remove();

    // Merge and transition links
    links = linksEnter.merge(links);

    links.transition()
      .duration(500)
      .attr('stroke-opacity', 0.6);

    // Update nodes
    nodeGroup = nodesGroup.selectAll('g.node')
      .data(newGraphData.nodes, d => d.id);

    // Handle new nodes
    const nodeEnter = nodeGroup.enter()
      .append('g')
      .attr('class', d => d.fixed ? 'node fixed-node' : 'node')
      .attr('opacity', 0)
      .attr('transform', d => {
        // Position new nodes near their connected node
        const connectedNode = findConnectedNode(d.id, newGraphData.links, newGraphData.nodes);
        if (connectedNode) {
          d.x = connectedNode.x + (Math.random() - 0.5) * 60;
          d.y = connectedNode.y + (Math.random() - 0.5) * 60;
          return `translate(${d.x},${d.y})`;
        }
        return `translate(${width/2},${height/2})`;
      })
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragging)
        .on('end', dragEnded));

    // Add node shapes
    nodeEnter.append('path')
      .attr('d', d => {
        const nodeType = d.type || 'interest';
        const shapeConfig = nodeShapes[nodeType] || nodeShapes['interest'];
        return shapeConfig(nodeRadius).path;
      })
      .attr('fill', '#000000');

    // Apply node styles
    applyNodeStyles(nodeEnter);

    // Add titles
    nodeEnter.append('title')
      .text(d => `${d.text} (${d.type})${d.fixed ? ' [Fixed]' : ''}`);

    // Add text labels
    addTextToNodes(nodeEnter, nodeRadius);

    // Handle removed nodes
    nodeGroup.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();

    // Add click handlers to new nodes
    nodeEnter.on('click', (event, d) => {
      event.stopPropagation();

      // Clear previous selection
      d3.selectAll('.selected-node').classed('selected-node', false);

      // Mark this node as selected
      d3.select(event.currentTarget).classed('selected-node', true);

      // Toggle node connections
      if (graphExplorer.hasUnexploredConnections(d.id)) {
        const result = graphExplorer.toggleNode(d.id);

        // Zoom to this node when expanding
        if (result.expanded && result.changed) {
          zoomToNode(d, 1.5);
        }
      }
    })
    .on('dblclick', (event, d) => {
      event.stopPropagation();

      // Open side panel with node details
      sidePanel.toggle(d);
    });

    // Transition new nodes in
    nodeEnter.transition()
      .duration(500)
      .attr('opacity', 1);

    // Merge node groups
    nodeGroup = nodeEnter.merge(nodeGroup);

    // Update expand/collapse icons
    updateNodeIcons();

    // Restart simulation with slight jiggle
    simulation.alpha(0.3).restart();
  }

  // Function to zoom to a specific node
  function zoomToNode(node, scale = 2) {
    const x = node.x || 0;
    const y = node.y || 0;

    svg.transition()
      .duration(500)
      .call(zoom.transform,
        d3.zoomIdentity
          .translate(width/2 - x*scale, height/2 - y*scale)
          .scale(scale)
      );
  }

  // Find a connected node that's already in the graph
  function findConnectedNode(nodeId, links, nodes) {
    for (const link of links) {
      const sourceId = link.source.id || link.source;
      const targetId = link.target.id || link.target;

      if (sourceId === nodeId) {
        // Find the target node
        return nodes.find(n => n.id === targetId || n.id === targetId.id);
      }

      if (targetId === nodeId) {
        // Find the source node
        return nodes.find(n => n.id === sourceId || n.id === sourceId.id);
      }
    }
    return null;
  }

  // Update expand/collapse icons on nodes
  function updateNodeIcons() {
    // Remove all existing icons
    nodesGroup.selectAll('.expand-icon, .collapse-icon').remove();

    // Add icons to nodes
    nodeGroup.each(function(d) {
      if (graphExplorer.hasUnexploredConnections(d.id)) {
        const isExpanded = graphExplorer.isNodeExpanded(d.id);

        // Add either expand or collapse icon
        d3.select(this)
          .append('use')
          .attr('href', isExpanded ? '#collapseIcon' : '#expandIcon')
          .attr('class', isExpanded ? 'collapse-icon' : 'expand-icon')
          .attr('x', 0)
          .attr('y', 0)
          .attr('transform', `translate(${nodeRadius * 0.8}, ${-nodeRadius * 0.8})`);
      }
    });
  }

  // Drag functions
  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    // Store current position
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragging(event, d) {
    // Update position during drag
    const padding = nodeRadius * 2;
    d.fx = Math.max(padding, Math.min(width - padding, event.x));
    d.fy = Math.max(padding, Math.min(height - padding, event.y));
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);

    if (event.sourceEvent.shiftKey) {
      // If shift key is pressed, fix node at current position and store relative coordinates
      d.fixed = true;
      // Update visual appearance for fixed nodes
      d3.select(event.sourceEvent.target.parentNode)
        .classed('fixed-node', true)
        .select('path')
        .attr('stroke-width', 2.5);
      // Keep the node fixed where it was dragged
      d.fx = d.fx;
      d.fy = d.fy;
      // Store relative position for responsiveness
      d.relativeX = d.fx / width;
      d.relativeY = d.fy / height;
    } else if (!d.fixed) {
      // Only release non-fixed nodes
      d.fx = null;
      d.fy = null;
    }
  }

  // Initialize the application by loading data
  loadData();
});
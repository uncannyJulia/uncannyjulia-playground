import * as d3 from 'd3';

/**
 * Creates and adds properly formatted and positioned text to nodes
 * @param {Selection} nodeGroup - D3 selection of node groups
 * @param {number} radius - Base radius of the node
 */
export function addTextToNodes(nodeGroup, radius) {
  nodeGroup.each(function(d) {
    const node = d3.select(this);
    const text = d.text;

    // Create background container group for the text
    const textContainer = node.append('g')
      .attr('class', 'text-container');

    // Add the text with improved formatting
    addFormattedText(textContainer, text, radius * 1.8);
  });
}

/**
 * Adds formatted text with a background to a container
 * @param {Selection} container - D3 selection to append text to
 * @param {string} text - The text content
 * @param {number} width - Maximum width before wrapping
 */
function addFormattedText(container, text, width) {
  // Split text into words
  const words = text.split(/\s+/).reverse();
  const lineHeight = 1.2; // em units
  const padding = 4; // pixels of padding around text
  const lines = [];
  let line = [];
  let lineNumber = 0;

  // Create temporary text element to measure text width
  const tempText = container.append('text')
    .style('font-size', '12px')
    .style('visibility', 'hidden');

  // Process the words into lines that fit within the width
  while (words.length > 0) {
    const word = words.pop() || '';
    line.push(word);

    tempText.text(line.join(' '));
    if (tempText.node().getComputedTextLength() > width && line.length > 1) {
      line.pop();
      lines.push(line.join(' '));
      line = [word];
    }
  }

  // Add the last line
  if (line.length > 0) {
    lines.push(line.join(' '));
  }

  // Remove the temporary text
  tempText.remove();

  // Calculate total height needed
  const totalHeight = lines.length * lineHeight + 0.5; // em units

  // Position the text container 30px below the node center
  container.attr('transform', 'translate(0, 42)');

  // Create background for text
  const textElement = container.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#fff')
    .attr('stroke', 'none')
    .attr('font-size', '12px')
    .attr('pointer-events', 'none');

  // Add background rectangles for each line
  lines.forEach((lineText, i) => {
    // Add text line
    const tspan = textElement.append('tspan')
      .attr('x', 0)
      .attr('y', i * lineHeight + 'em')
      .text(lineText);

    // Measure this line to create accurate background
    const tspanNode = tspan.node();
    if (tspanNode) {
      const tspanWidth = tspanNode.getComputedTextLength();
      const tspanHeight = 16; // Approximate line height in pixels

      // Add background rectangle for this text line
      container.insert('rect', 'text')
        .attr('x', -tspanWidth/2 - padding)
        .attr('y', (i * lineHeight * 16) - tspanHeight/2)
        .attr('width', tspanWidth + padding*2)
        .attr('height', tspanHeight + padding)
        .attr('fill', '#000')
        .attr('rx', 3)
        .attr('ry', 3);
    }
  });
}

/**
 * Updates text visibility based on zoom level
 * @param {Selection} nodeGroup - D3 selection of node groups
 * @param {number} scale - Current zoom scale
 */
export function updateTextVisibility(nodeGroup, scale) {
  nodeGroup.selectAll('.text-container')
    .style('visibility', scale < 0.6 ? 'hidden' : 'visible')
    .style('opacity', Math.min(scale, 1));
}
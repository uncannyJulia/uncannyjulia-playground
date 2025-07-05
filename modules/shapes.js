/**
 * Generates points for a regular polygon
 * @param {number} sides - Number of sides
 * @param {number} radius - Radius of the polygon
 * @returns {Array} Array of [x,y] point coordinates
 */
function regularPolygon(sides, radius) {
  const points = [];
  const angleStep = (Math.PI * 2) / sides;
  const startAngle = -Math.PI / 2; // Start at the top

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    points.push([
      radius * Math.cos(angle),
      radius * Math.sin(angle)
    ]);
  }

  return points;
}

/**
 * Converts points array to SVG path data
 * @param {Array} points - Array of [x,y] coordinates
 * @returns {string} SVG path data string
 */
function pointsToPath(points) {
  return `M${points.map(p => p.join(',')).join('L')}Z`;
}

/**
 * Node shape definitions with custom border styles
 */
const nodeShapes = {
  // Hexagon for interests with double stroke
  'interest': (radius) => ({
    path: pointsToPath(regularPolygon(6, radius * 0.3)),
    strokeStyle: 'double',
    fill: '#000000'
  }),

  // Heptagon for life events with dashed stroke
  'life event': (radius) => ({
    path: pointsToPath(regularPolygon(7, radius * 0.3)),
    strokeStyle: 'dashed',
    fill: '#000000'
  }),

  // Octagon for skills with solid stroke
  'skill': (radius) => ({
    path: pointsToPath(regularPolygon(8, radius * 0.3)),
    strokeStyle: 'solid',
    fill: '#000000'
  })
};

/**
 * Applies the appropriate stroke style to a node element
 * @param {Selection} selection - D3 selection of node elements
 */
function applyNodeStyles(selection) {
  selection.each(function(d) {
    const node = d3.select(this);
    const path = node.select('path');
    const nodeType = d.type || 'interest';
    const strokeStyle = nodeShapes[nodeType]?.(0).strokeStyle || 'solid';

    // Apply the stroke based on node type
    if (strokeStyle === 'double') {
      // For double stroke with more space between lines

      // First create an outer stroke (wider)
      path
        .style('stroke', '#fff')
        .style('stroke-width', 6); // Much wider outer stroke

      // Clone the path to create the double stroke effect
      const pathNode = path.node();
      if (pathNode) {
        const parentNode = pathNode.parentNode;

        // Create middle area (black space between lines)
        const middlePath = pathNode.cloneNode(true);
        parentNode.appendChild(middlePath);
        d3.select(middlePath)
          .style('stroke', '#000')
          .style('stroke-width', 4)
          .style('stroke-dasharray', null);

        // Create inner stroke (white line inside)
        const innerPath = pathNode.cloneNode(true);
        parentNode.appendChild(innerPath);
        d3.select(innerPath)
          .style('stroke', '#fff')
          .style('stroke-width', 2)
          .style('stroke-dasharray', null);
      }
    }
    else if (strokeStyle === 'dashed') {
      path
        .style('stroke', '#fff')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '4,2');
    }
    else {
      // Default solid stroke
      path
        .style('stroke', '#fff')
        .style('stroke-width', d.fixed ? 2.5 : 1.5)
        .style('stroke-dasharray', null);
    }
  });
}
import { useRef, useEffect } from 'react';
import NodeCard from './NodeCard.jsx';

export default function SkillTree({ nodes, onNodeSelect, selectedNode, scores }) {
  const svgRef = useRef(null);

  // Sort main nodes by sequence, append remediation nodes at the end
  const mainNodes = nodes.filter((n) => n.sequence_order < 9999);
  const remediationNodes = nodes.filter((n) => n.sequence_order === 9999);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  }, [nodes]);

  return (
    <div className="relative w-full h-full overflow-auto p-8">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {/* SVG bezier lines are drawn dynamically via useEffect — 
            GitHub Copilot can generate this by typing: 
            // draw bezier curve between consecutive node cards using their DOM positions */}
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {mainNodes.map((node) => {
          const remediations = remediationNodes.filter((r) => r.parent_node_id === node.id);
          return (
            <div key={node.id} className="flex flex-col items-center gap-4">
              <NodeCard
                node={node}
                onSelect={onNodeSelect}
                isSelected={selectedNode?.id === node.id}
                score={scores?.[node.id]}
              />
              {remediations.length > 0 && (
                <div className="flex gap-4 ml-16 border-l-2 border-orange-600 pl-6">
                  {remediations.map((rNode) => (
                    <NodeCard
                      key={rNode.id}
                      node={rNode}
                      onSelect={onNodeSelect}
                      isSelected={selectedNode?.id === rNode.id}
                      score={scores?.[rNode.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

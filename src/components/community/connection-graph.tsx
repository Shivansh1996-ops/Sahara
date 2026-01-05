"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import type { PeerNode, PeerConnection } from "@/types";

interface ConnectionGraphProps {
  nodes: PeerNode[];
  connections: PeerConnection[];
  currentUserId?: string;
  onNodeClick?: (node: PeerNode) => void;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  anonymousName: string;
  avatarSeed: string;
  connectionCount: number;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: D3Node | string;
  target: D3Node | string;
}

export function ConnectionGraph({
  nodes,
  connections,
  currentUserId,
  onNodeClick,
}: ConnectionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<PeerNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width || 400, height: height || 400 });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // D3 force simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Container for zoom/pan
    const container = svg.append("g");

    // Prepare data
    const d3Nodes: D3Node[] = nodes.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
    }));

    const d3Links: D3Link[] = connections.map((c) => ({
      source: c.fromUserId,
      target: c.toUserId,
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(d3Nodes)
      .force("link", d3.forceLink<D3Node, D3Link>(d3Links)
        .id((d) => d.id)
        .distance(80)
        .strength(0.5))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35));

    // Draw links
    const links = container.append("g")
      .selectAll("line")
      .data(d3Links)
      .join("line")
      .attr("stroke", "#c4d4c0")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    // Draw nodes
    const nodeGroups = container.append("g")
      .selectAll<SVGGElement, D3Node>("g")
      .data(d3Nodes)
      .join("g")
      .attr("cursor", "pointer");

    // Add drag behavior
    nodeGroups.call(d3.drag<SVGGElement, D3Node>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));

    // Node circles
    nodeGroups.append("circle")
      .attr("r", (d) => 20 + Math.min(d.connectionCount * 2, 10))
      .attr("fill", (d) => d.id === currentUserId ? "#8fbc8f" : "#e8f0e8")
      .attr("stroke", (d) => d.id === currentUserId ? "#5a8a5a" : "#c4d4c0")
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        event.stopPropagation();
        const node = nodes.find((n) => n.id === d.id);
        if (node) {
          setSelectedNode(node);
          onNodeClick?.(node);
        }
      })
      .on("mouseenter", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", 3)
          .attr("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");
      })
      .on("mouseleave", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", 2)
          .attr("filter", "none");
      });

    // Node labels
    nodeGroups.append("text")
      .text((d) => d.anonymousName.slice(0, 8))
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .attr("font-size", "10px")
      .attr("fill", "#5a7a5a")
      .attr("pointer-events", "none");

    // Node emoji (avatar placeholder)
    nodeGroups.append("text")
      .text("🌱")
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("font-size", "16px")
      .attr("pointer-events", "none");

    // Update positions on tick
    simulation.on("tick", () => {
      links
        .attr("x1", (d) => (d.source as D3Node).x!)
        .attr("y1", (d) => (d.source as D3Node).y!)
        .attr("x2", (d) => (d.target as D3Node).x!)
        .attr("y2", (d) => (d.target as D3Node).y!);

      nodeGroups.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, connections, currentUserId, dimensions, onNodeClick]);

  const handleZoom = useCallback((factor: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as never,
      factor
    );
  }, []);

  const handleReset = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      d3.zoom<SVGSVGElement, unknown>().transform as never,
      d3.zoomIdentity
    );
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-beige-50 rounded-xl">
        <p className="text-sage-500">No connections yet. Be the first to connect!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-64 md:h-80 bg-gradient-to-br from-beige-50 to-sage-50 rounded-xl overflow-hidden"
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleZoom(1.3)}
          className="bg-white/80 hover:bg-white"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleZoom(0.7)}
          className="bg-white/80 hover:bg-white"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="bg-white/80 hover:bg-white"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Selected Node Modal */}
      <Modal
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        title={selectedNode?.anonymousName || "User"}
      >
        {selectedNode && (
          <div className="flex flex-col items-center gap-4">
            <Avatar seed={selectedNode.avatarSeed} size="xl" />
            <div className="text-center">
              <p className="text-lg font-medium text-sage-800">
                {selectedNode.anonymousName}
              </p>
              <p className="text-sm text-sage-500">
                {selectedNode.connectionCount} connection{selectedNode.connectionCount !== 1 ? "s" : ""}
              </p>
            </div>
            {selectedNode.id !== currentUserId && (
              <Button variant="soft" className="w-full">
                Connect
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

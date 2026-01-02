
import React, { useEffect, useRef } from 'react';
import { select, arc, easeLinear, interpolateString } from 'd3';

const Visualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Use modular named imports to resolve "Property does not exist on type 'typeof d3'" errors
    const svg = select(svgRef.current);
    const width = 240;
    const height = 240;
    const centerX = width / 2;
    const centerY = height / 2;

    svg.selectAll("*").remove();

    // Add glowing filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "blueGlow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Outer rotating rings
    const gRings = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);

    const ring1 = gRings.append("path")
      .attr("d", arc()({innerRadius: 90, outerRadius: 94, startAngle: 0, endAngle: Math.PI}) as string)
      .attr("fill", "rgba(34, 211, 238, 0.6)")
      .attr("filter", "url(#blueGlow)");

    const ring2 = gRings.append("path")
      .attr("d", arc()({innerRadius: 82, outerRadius: 84, startAngle: Math.PI, endAngle: Math.PI * 2}) as string)
      .attr("fill", "rgba(34, 211, 238, 0.3)");

    const animateRings = () => {
      ring1.transition().duration(4000).ease(easeLinear)
        .attrTween("transform", () => interpolateString("rotate(0)", "rotate(360)"))
        .on("end", animateRings);
      ring2.transition().duration(6000).ease(easeLinear)
        .attrTween("transform", () => interpolateString("rotate(0)", "rotate(-360)"));
    };
    animateRings();

    // Central pulsing orb
    const gCore = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
    
    const core = gCore.append("circle")
      .attr("r", 45)
      .attr("fill", "rgba(34, 211, 238, 0.1)")
      .attr("stroke", "rgba(34, 211, 238, 0.5)")
      .attr("stroke-width", 1)
      .attr("filter", "url(#blueGlow)");

    const animateCore = () => {
      core.transition().duration(2000).attr("r", 55).attr("opacity", 0.1)
        .transition().duration(2000).attr("r", 45).attr("opacity", 0.5)
        .on("end", animateCore);
    };
    animateCore();

    // Data spikes
    const gSpikes = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
    const updateSpikes = () => {
        gSpikes.selectAll("line").remove();
        for(let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const len = 60 + Math.random() * 35;
            gSpikes.append("line")
                .attr("x1", Math.cos(angle) * 35)
                .attr("y1", Math.sin(angle) * 35)
                .attr("x2", Math.cos(angle) * len)
                .attr("y2", Math.sin(angle) * len)
                .attr("stroke", "rgba(34, 211, 238, 0.4)")
                .attr("stroke-width", 2);
        }
    };
    const interval = setInterval(updateSpikes, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg ref={svgRef} width="240" height="240" className="drop-shadow-2xl"></svg>
    </div>
  );
};

export default Visualizer;

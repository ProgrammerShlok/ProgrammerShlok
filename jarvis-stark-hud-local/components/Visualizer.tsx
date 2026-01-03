
import React, { useEffect, useRef } from 'react';
// Fix: Use namespace import for d3 to ensure all exported members are accessible in this environment
import * as d3 from 'd3';

interface VisualizerProps {
  isListening?: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isListening }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Use d3 namespace to fix missing exported member errors
    const svg = d3.select(svgRef.current);
    const width = 240;
    const height = 240;
    const centerX = width / 2;
    const centerY = height / 2;

    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "blueGlow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const gRings = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);

    const ring1 = gRings.append("path")
      .attr("d", d3.arc()({innerRadius: 90, outerRadius: 94, startAngle: 0, endAngle: Math.PI}) as string)
      .attr("fill", "rgba(34, 211, 238, 0.6)")
      .attr("filter", "url(#blueGlow)");

    const ring2 = gRings.append("path")
      .attr("d", d3.arc()({innerRadius: 82, outerRadius: 84, startAngle: Math.PI, endAngle: Math.PI * 2}) as string)
      .attr("fill", "rgba(34, 211, 238, 0.3)");

    const animateRings = () => {
      ring1.transition().duration(isListening ? 1000 : 4000).ease(d3.easeLinear)
        .attrTween("transform", () => d3.interpolateString("rotate(0)", "rotate(360)"))
        .on("end", animateRings);
      ring2.transition().duration(isListening ? 1500 : 6000).ease(d3.easeLinear)
        .attrTween("transform", () => d3.interpolateString("rotate(0)", "rotate(-360)"));
    };
    animateRings();

    const gCore = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
    
    const core = gCore.append("circle")
      .attr("r", 45)
      .attr("fill", isListening ? "rgba(34, 211, 238, 0.4)" : "rgba(34, 211, 238, 0.1)")
      .attr("stroke", "rgba(34, 211, 238, 0.5)")
      .attr("stroke-width", 1)
      .attr("filter", "url(#blueGlow)");

    const animateCore = () => {
      const targetR = isListening ? 65 : 55;
      core.transition().duration(isListening ? 500 : 2000).attr("r", targetR).attr("opacity", isListening ? 0.4 : 0.1)
        .transition().duration(isListening ? 500 : 2000).attr("r", 45).attr("opacity", isListening ? 0.8 : 0.5)
        .on("end", animateCore);
    };
    animateCore();

    const gSpikes = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
    const updateSpikes = () => {
        gSpikes.selectAll("line").remove();
        const count = isListening ? 24 : 12;
        for(let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const len = (isListening ? 70 : 60) + Math.random() * (isListening ? 50 : 35);
            gSpikes.append("line")
                .attr("x1", Math.cos(angle) * 35)
                .attr("y1", Math.sin(angle) * 35)
                .attr("x2", Math.cos(angle) * len)
                .attr("y2", Math.sin(angle) * len)
                .attr("stroke", isListening ? "rgba(34, 211, 238, 0.8)" : "rgba(34, 211, 238, 0.4)")
                .attr("stroke-width", isListening ? 3 : 2);
        }
    };
    const interval = setInterval(updateSpikes, isListening ? 80 : 150);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg ref={svgRef} width="240" height="240" className={`drop-shadow-2xl transition-transform duration-500 ${isListening ? 'scale-110' : 'scale-100'}`}></svg>
    </div>
  );
};

export default Visualizer;

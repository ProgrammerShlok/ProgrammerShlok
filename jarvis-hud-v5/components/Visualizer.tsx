
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Visualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 200;
    const height = 200;
    const centerX = width / 2;
    const centerY = height / 2;

    svg.selectAll("*").remove();

    // Outer rotating ring
    const gOuter = svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    const arc = d3.arc()
      .innerRadius(70)
      .outerRadius(75)
      .startAngle(0)
      .endAngle(Math.PI * 1.5);

    const outerRing = gOuter.append("path")
      .attr("d", arc as any)
      .attr("fill", "rgba(34, 211, 238, 0.4)");

    const animateOuter = () => {
      outerRing.transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attrTween("transform", () => d3.interpolateString("rotate(0)", "rotate(360)"))
        .on("end", animateOuter);
    };
    animateOuter();

    // Inner pulsing circle
    const gInner = svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    const innerCircle = gInner.append("circle")
      .attr("r", 40)
      .attr("fill", "none")
      .attr("stroke", "rgba(34, 211, 238, 0.8)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    const animateInner = () => {
        innerCircle.transition()
          .duration(1500)
          .attr("r", 50)
          .attr("opacity", 0)
          .on("end", () => {
            innerCircle.attr("r", 40).attr("opacity", 1);
            animateInner();
          });
    };
    animateInner();

    // Center Core
    gInner.append("circle")
      .attr("r", 20)
      .attr("fill", "rgba(34, 211, 238, 0.2)")
      .attr("stroke", "rgba(34, 211, 238, 1)")
      .attr("stroke-width", 2);

    // Dynamic data lines
    const lineGroup = svg.append("g");
    const updateLines = () => {
        lineGroup.selectAll("line").remove();
        for(let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const length = 80 + Math.random() * 20;
            lineGroup.append("line")
                .attr("x1", centerX + Math.cos(angle) * 30)
                .attr("y1", centerY + Math.sin(angle) * 30)
                .attr("x2", centerX + Math.cos(angle) * length)
                .attr("y2", centerY + Math.sin(angle) * length)
                .attr("stroke", "rgba(34, 211, 238, 0.3)")
                .attr("stroke-width", 1);
        }
    };

    const interval = setInterval(updateLines, 200);
    return () => clearInterval(interval);

  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <svg ref={svgRef} width="200" height="200" className="filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"></svg>
      <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 opacity-70">Core Engine Online</div>
    </div>
  );
};

export default Visualizer;

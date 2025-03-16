
import React from "react";
import { motion, MotionProps, Variants } from "framer-motion";

type ScrollDirection = "up" | "down" | "left" | "right";
type ScrollEffect = "fade" | "zoom" | "slide" | "rotate" | "none";

interface ScrollTransformProps extends Omit<MotionProps, "variants" | "initial" | "whileInView" | "viewport"> {
  children: React.ReactNode;
  direction?: ScrollDirection;
  effect?: ScrollEffect;
  duration?: number;
  delay?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
  className?: string;
}

export const ScrollTransform = ({
  children,
  direction = "up",
  effect = "fade",
  duration = 0.8,
  delay = 0,
  distance = 50,
  once = true,
  threshold = 0.1,
  className = "",
  ...props
}: ScrollTransformProps) => {
  const getVariants = (): Variants => {
    let initial: any = {};
    
    // Apply initial transform based on direction
    if (effect === "slide" || effect === "fade") {
      if (direction === "up") initial.y = distance;
      if (direction === "down") initial.y = -distance;
      if (direction === "left") initial.x = distance;
      if (direction === "right") initial.x = -distance;
    }
    
    // Apply initial opacity for fade
    if (effect === "fade" || effect === "slide") {
      initial.opacity = 0;
    }
    
    // Apply zoom effect
    if (effect === "zoom") {
      initial.scale = 0.8;
      initial.opacity = 0;
    }
    
    // Apply rotation effect
    if (effect === "rotate") {
      initial.rotate = direction === "left" ? -10 : 10;
      initial.opacity = 0;
    }
    
    return {
      hidden: initial,
      visible: {
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier curve
        },
      },
    };
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: `-${threshold * 100}px` }}
      variants={getVariants()}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ScrollTransform;

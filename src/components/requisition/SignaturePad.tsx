import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'sonner';

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

interface SignaturePadProps {
  onSignatureChange?: (hasSignature: boolean) => void;
}

interface Point {
  x: number;
  y: number;
  time: number;
  pressure?: number;
}

interface Stroke {
  points: Point[];
}

// Helper to calculate velocity between two points
function velocityBetween(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dt = p2.time - p1.time || 1;
  return Math.sqrt(dx * dx + dy * dy) / dt;
}

// Helper to get stroke width based on velocity
function strokeWidthFromVelocity(velocity: number, minWidth: number, maxWidth: number): number {
  const maxVelocity = 5;
  const t = Math.min(velocity / maxVelocity, 1);
  return maxWidth - (maxWidth - minWidth) * t;
}

// Bezier curve calculation
function bezierPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const cX = 3 * (p1.x - p0.x);
  const bX = 3 * (p2.x - p1.x) - cX;
  const aX = p3.x - p0.x - cX - bX;

  const cY = 3 * (p1.y - p0.y);
  const bY = 3 * (p2.y - p1.y) - cY;
  const aY = p3.y - p0.y - cY - bY;

  const x = aX * t * t * t + bX * t * t + cX * t + p0.x;
  const y = aY * t * t * t + bY * t * t + cY * t + p0.y;

  return { x, y, time: 0 };
}

// Validate if the signature is realistic
function validateSignature(strokes: Stroke[]): { valid: boolean; reason?: string } {
  if (strokes.length === 0) {
    return { valid: false, reason: 'No signature detected' };
  }

  // Calculate total points
  const totalPoints = strokes.reduce((sum, s) => sum + s.points.length, 0);
  
  if (totalPoints < 20) {
    return { valid: false, reason: 'Signature too small. Please provide a wider signature.' };
  }

  // Calculate bounding box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  strokes.forEach(stroke => {
    stroke.points.forEach(p => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const area = width * height;

  // Check for too small signature
  if (width < 50 || height < 15) {
    return { valid: false, reason: 'Signature too small. Please provide a wider signature.' };
  }

  // Check for dot (very small area)
  if (area < 500) {
    return { valid: false, reason: 'Please draw a proper signature, not a dot.' };
  }

  // Check for straight line (height or width too small relative to the other)
  const aspectRatio = width / height;
  if (aspectRatio > 20 || aspectRatio < 0.05) {
    return { valid: false, reason: 'Please draw a proper signature, not a straight line.' };
  }

  // Check for simple shapes by analyzing direction changes
  let directionChanges = 0;
  let lastDirection = { x: 0, y: 0 };
  
  strokes.forEach(stroke => {
    for (let i = 1; i < stroke.points.length; i++) {
      const dx = stroke.points[i].x - stroke.points[i - 1].x;
      const dy = stroke.points[i].y - stroke.points[i - 1].y;
      
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        const dirX = Math.sign(dx);
        const dirY = Math.sign(dy);
        
        if ((dirX !== 0 && dirX !== lastDirection.x) || (dirY !== 0 && dirY !== lastDirection.y)) {
          directionChanges++;
          lastDirection = { x: dirX, y: dirY };
        }
      }
    }
  });

  // Checkmark or simple shapes have few direction changes
  if (directionChanges < 3) {
    return { valid: false, reason: 'Please draw a realistic signature, not a simple shape.' };
  }

  // Check for rectangle/square pattern (4 distinct corners)
  const corners = detectCorners(strokes);
  if (corners === 4 && strokes.length === 1) {
    return { valid: false, reason: 'Please draw a realistic signature, not a rectangle.' };
  }

  // Check for circle pattern (closed loop with regular curvature)
  if (isCircle(strokes)) {
    return { valid: false, reason: 'Please draw a realistic signature, not a circle.' };
  }

  return { valid: true };
}

function detectCorners(strokes: Stroke[]): number {
  let corners = 0;
  const angleThreshold = Math.PI / 4; // 45 degrees
  
  strokes.forEach(stroke => {
    for (let i = 2; i < stroke.points.length; i++) {
      const p0 = stroke.points[i - 2];
      const p1 = stroke.points[i - 1];
      const p2 = stroke.points[i];
      
      const angle1 = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const angle2 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      
      let angleDiff = Math.abs(angle2 - angle1);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      if (angleDiff > angleThreshold) {
        corners++;
      }
    }
  });
  
  return Math.min(corners, 10);
}

function isCircle(strokes: Stroke[]): boolean {
  if (strokes.length !== 1 || strokes[0].points.length < 10) return false;
  
  const points = strokes[0].points;
  const first = points[0];
  const last = points[points.length - 1];
  
  // Check if closed
  const dist = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
  if (dist > 30) return false;
  
  // Check aspect ratio (circles are roughly 1:1)
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  points.forEach(p => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });
  
  const w = maxX - minX;
  const h = maxY - minY;
  const ratio = w / h;
  
  return ratio > 0.7 && ratio < 1.4;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSignatureChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const strokesRef = useRef<Stroke[]>([]);
    const currentStrokeRef = useRef<Point[]>([]);
    const lastPointRef = useRef<Point | null>(null);
    const lastVelocityRef = useRef<number>(0);

    const minWidth = 0.5;
    const maxWidth = 3.5;

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, rect.width, rect.height);
        }
        
        strokesRef.current = [];
        currentStrokeRef.current = [];
        lastPointRef.current = null;
        lastVelocityRef.current = 0;
        setHasSignature(false);
        onSignatureChange?.(false);
      },
      isEmpty: () => !hasSignature,
      toDataURL: () => {
        // Validate before returning
        const validation = validateSignature(strokesRef.current);
        if (!validation.valid) {
          toast.error(validation.reason || 'Invalid signature');
          return '';
        }
        
        const canvas = canvasRef.current;
        return canvas ? canvas.toDataURL('image/png') : '';
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const resizeCanvas = () => {
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const getPointerPos = (e: React.MouseEvent | React.TouchEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0, time: Date.now() };
      
      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;
      let pressure = 0.5;

      if ('touches' in e) {
        const touch = e.touches[0];
        clientX = touch?.clientX ?? 0;
        clientY = touch?.clientY ?? 0;
        // @ts-ignore - force is available on some touch devices
        pressure = touch?.force ?? 0.5;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        time: Date.now(),
        pressure,
      };
    };

    const drawBezierCurve = (
      ctx: CanvasRenderingContext2D,
      p0: Point,
      p1: Point,
      p2: Point,
      p3: Point,
      startWidth: number,
      endWidth: number
    ) => {
      const steps = 16;
      
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const tNext = (i + 1) / steps;
        
        const point = bezierPoint(t, p0, p1, p2, p3);
        const nextPoint = bezierPoint(tNext, p0, p1, p2, p3);
        
        const width = startWidth + (endWidth - startWidth) * t;
        
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        ctx.stroke();
      }
    };

    const drawLine = (ctx: CanvasRenderingContext2D, from: Point, to: Point, width: number) => {
      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      
      const pos = getPointerPos(e);
      lastPointRef.current = pos;
      currentStrokeRef.current = [pos];
      lastVelocityRef.current = 0;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !lastPointRef.current) return;
      e.preventDefault();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const currentPoint = getPointerPos(e);
      const lastPoint = lastPointRef.current;
      
      // Calculate velocity
      const velocity = velocityBetween(lastPoint, currentPoint);
      const smoothedVelocity = 0.7 * velocity + 0.3 * lastVelocityRef.current;
      
      // Calculate width based on velocity
      const newWidth = strokeWidthFromVelocity(smoothedVelocity, minWidth, maxWidth);
      const lastWidth = strokeWidthFromVelocity(lastVelocityRef.current, minWidth, maxWidth);
      
      // If we have enough points for a bezier curve
      const points = currentStrokeRef.current;
      points.push(currentPoint);
      
      if (points.length >= 4) {
        const p0 = points[points.length - 4];
        const p1 = points[points.length - 3];
        const p2 = points[points.length - 2];
        const p3 = points[points.length - 1];
        
        // Control points for smoother curve
        const cp1 = {
          x: p1.x + (p2.x - p0.x) / 6,
          y: p1.y + (p2.y - p0.y) / 6,
          time: p1.time,
        };
        const cp2 = {
          x: p2.x - (p3.x - p1.x) / 6,
          y: p2.y - (p3.y - p1.y) / 6,
          time: p2.time,
        };
        
        drawBezierCurve(ctx, p1, cp1, cp2, p2, lastWidth, newWidth);
      } else {
        // Simple line for first few points
        drawLine(ctx, lastPoint, currentPoint, newWidth);
      }
      
      lastPointRef.current = currentPoint;
      lastVelocityRef.current = smoothedVelocity;
      
      if (!hasSignature) {
        setHasSignature(true);
        onSignatureChange?.(true);
      }
    };

    const stopDrawing = () => {
      if (isDrawing && currentStrokeRef.current.length > 0) {
        strokesRef.current.push({ points: [...currentStrokeRef.current] });
      }
      setIsDrawing(false);
      currentStrokeRef.current = [];
      lastPointRef.current = null;
    };

    return (
      <div 
        ref={containerRef}
        className="relative border-2 border-border rounded-lg bg-white h-64 touch-none overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="cursor-crosshair w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              width="60%"
              height="60%"
              viewBox="0 0 200 200"
              preserveAspectRatio="xMidYMid meet"
              className="opacity-10"
            >
              <path
                d="M 85 27 c 0 -0.24 0.45 -9.72 0 -14 c -0.17 -1.65 -0.95 -3.95 -2 -5 c -1.57 -1.57 -4.58 -3.15 -7 -4 c -4 -1.4 -8.72 -2.32 -13 -3 c -1.92 -0.3 -4.08 -0.3 -6 0 c -4.28 0.68 -9.01 1.47 -13 3 c -4.41 1.7 -8.63 5.13 -13 7 c -2.44 1.05 -5.87 0.7 -8 2 c -4.96 3.02 -10.34 7.83 -15 12 c -1.55 1.39 -3.11 3.22 -4 5 c -1.32 2.64 -2.38 6.09 -3 9 c -0.33 1.54 -0.49 3.62 0 5 c 1.02 2.85 2.91 6.63 5 9 c 2.6 2.94 7.02 5.27 10 8 c 0.84 0.77 1.15 2.34 2 3 c 1.9 1.48 4.66 3.03 7 4 c 1.48 0.62 3.7 0.35 5 1 c 1.08 0.54 1.93 2.39 3 3 c 1.04 0.59 2.8 0.45 4 1 c 3 1.38 6.18 3.07 9 5 c 3.5 2.4 7.46 5.25 10 8 c 1.07 1.16 1.68 3.38 2 5 c 0.3 1.51 -0.32 3.54 0 5 c 0.29 1.3 1.76 2.69 2 4 c 0.37 2.05 -0.27 4.72 0 7 c 0.39 3.32 1.68 6.67 2 10 c 0.34 3.59 0.29 7.34 0 11 c -0.38 4.71 -1.03 9.87 -2 14 c -0.25 1.05 -1.1 2.67 -2 3 c -4.36 1.61 -11.42 3.03 -17 4 c -1.92 0.33 -4.32 0.65 -6 0 c -7.76 -3 -19.01 -7.4 -25 -12 c -2.61 -2 -3.82 -7.29 -5 -11 c -1.09 -3.44 -1.54 -7.34 -2 -11 c -0.2 -1.64 -0.3 -3.49 0 -5 c 0.32 -1.62 1.03 -3.76 2 -5 c 1.15 -1.48 3.31 -3.06 5 -4 c 1.09 -0.6 2.96 -0.41 4 -1 c 1.07 -0.61 1.89 -2.39 3 -3 c 1.65 -0.92 3.91 -1.44 6 -2 c 18.46 -4.92 36.17 -8.63 54 -14 c 6.59 -1.99 12.7 -5.09 19 -8 c 2.46 -1.14 4.95 -2.43 7 -4 c 2.15 -1.66 4.44 -3.79 6 -6 c 2.3 -3.26 4.3 -7.35 6 -11 c 0.56 -1.2 1 -2.71 1 -4 c 0 -3.45 0.41 -8.74 -1 -11 c -1.32 -2.11 -5.95 -3.74 -9 -5 c -2.45 -1.01 -5.89 -2.47 -8 -2 c -2.99 0.66 -7.82 3.53 -10 6 c -2.26 2.56 -4.34 7.54 -5 11 c -0.55 2.88 -0.09 7.27 1 10 c 1.33 3.32 4.4 7.21 7 10 c 1.83 1.96 5.07 3.07 7 5 c 2.56 2.56 5.19 6.05 7 9 c 0.66 1.07 0.39 3.08 1 4 c 0.54 0.8 2.29 1.18 3 2 c 1.14 1.33 2.58 3.3 3 5 c 0.8 3.21 1.19 7.59 1 11 c -0.12 2.25 -1.15 4.87 -2 7 c -0.42 1.06 -1.12 2.37 -2 3 c -3.38 2.42 -7.89 4.94 -12 7 c -2.53 1.27 -5.4 2.51 -8 3 c -2.44 0.46 -5.54 -0.49 -8 0 c -3.9 0.78 -8.43 3.33 -12 4 c -1.16 0.22 -3.41 -0.18 -4 -1 c -1.55 -2.13 -4.62 -7.51 -4 -10 c 1 -3.98 6.4 -9.45 10 -14 c 2.82 -3.56 5.6 -7.37 9 -10 c 6.59 -5.1 14.33 -9.83 22 -14 c 7.76 -4.22 16.73 -7.23 24 -11 c 1.17 -0.61 1.86 -2.22 3 -3 c 5.06 -3.46 11.51 -6.36 16 -10 l 5 -7"
                stroke="#000000"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

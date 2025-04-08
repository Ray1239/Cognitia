interface Point {
  x: number;
  y: number;
}

interface AngleProps {
  pos: Point[];
}

function angleBetweenThreePoints(pos: Point[]): number {
  if (pos.length < 3) {
    throw new Error('At least 3 points are required to calculate an angle');
  }
  // Extracting points for easier readability
  const p1 = pos[0];
  const p2 = pos[1];
  const p3 = pos[2];

  // Calculating distances between points
  const a = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2); // Distance p1 to p2
  const b = Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2); // Distance p2 to p3
  const c = Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2); // Distance p1 to p3

  // Using Law of Cosines to find the angle in radians
  const angleInRadians = Math.acos((a + b - c) / (2 * Math.sqrt(a * b)));

  // Converting angle from radians to degrees
  const angleInDegrees = (angleInRadians * 180) / Math.PI;

  return angleInDegrees;
}

export default angleBetweenThreePoints;

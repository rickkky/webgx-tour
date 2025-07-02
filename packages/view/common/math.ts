export function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function degreeToRadian(degree: number) {
  return (degree * Math.PI) / 180;
}

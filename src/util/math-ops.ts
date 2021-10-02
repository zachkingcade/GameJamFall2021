export function easyAngle2PI(origin: { x: number, y: number }, obj: { x: number, y: number }): number {
    let dx = origin.x - obj.x;
    let dy = -origin.y - -obj.y;
    let angle = Math.atan2(dy, dx);
    return angle < 0 ? angle + (2 * Math.PI) : angle;
}

export function easyAngle360(origin: { x: number, y: number }, obj: { x: number, y: number }): number {
    return easyAngle2PI(origin, obj) * (180 / Math.PI);
}
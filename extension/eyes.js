// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Md. Sajjad Hossain
// Pure geometry, shared by every monitor. No networking, browser, or AI.
export const EMOTIONS = Object.freeze(['normal', 'happy', 'angry', 'surprised', 'sleepy', 'blinking', 'looking-around']);
export const COLORS = Object.freeze({mint: [137 / 255, 248 / 255, 197 / 255], ice: [163 / 255, 221 / 255, 1], white: [241 / 255, 245 / 255, 238 / 255], amber: [1, 207 / 255, 128 / 255]});

export function makeFrame(seconds, emotion = 'normal') {
    const mood = EMOTIONS.includes(emotion) ? emotion : 'normal';
    const cycle = mood === 'blinking' ? 1.9 : 4.3;
    const age = seconds % cycle;
    const blink = age > 0.01 && age < 0.26 ? Math.sin((age - 0.01) / 0.25 * Math.PI) : 0;
    const height = mood === 'surprised' ? 37 : mood === 'sleepy' ? 11 : mood === 'happy' ? 26 : 28;
    const width = mood === 'normal' || mood === 'blinking' || mood === 'looking-around' ? 25 : 27;
    const radius = mood === 'angry' || mood === 'sleepy' ? 5 : mood === 'happy' || mood === 'surprised' ? 13 : 8;
    const lookCycle = seconds % (mood === 'looking-around' ? 5 : 10);
    const look = mood !== 'sleepy' && lookCycle > 1.8 && lookCycle < 4.6 ? Math.sin((lookCycle - 1.8) / 2.8 * Math.PI) * (Math.floor(seconds / 5) % 2 ? -7 : 7) : 0;
    // Slow drift and blinking avoid leaving exactly the same pixels lit forever.
    const driftX = Math.sin(seconds / 35) * 1.2;
    const driftY = Math.sin(seconds / 29) * 1.2;
    return {mood, width, height: Math.max(1.7, height * (1 - blink)), radius, blink,
        x: look + driftX, y: Math.sin(seconds * 1.7) * 0.3 + driftY + (mood === 'sleepy' ? 3 : 0)};
}

function roundedRect(cr, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    cr.newSubPath();
    cr.arc(x + width - r, y + r, r, -Math.PI / 2, 0);
    cr.arc(x + width - r, y + height - r, r, 0, Math.PI / 2);
    cr.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI);
    cr.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    cr.closePath();
    cr.fill();
}

export function paintEyes(cr, width, height, frame, color, brightness) {
    cr.setSourceRGB(0, 0, 0);
    cr.paint();
    const scale = Math.min(width / 128, height / 64) * 0.83;
    cr.translate((width - 128 * scale) / 2, (height - 64 * scale) / 2);
    cr.scale(scale, scale);
    const rgb = COLORS[color] ?? COLORS.mint;
    const light = Math.max(0.1, Math.min(1, brightness / 100));
    for (const centerX of [40, 88]) {
        const x = centerX + frame.x - frame.width / 2;
        const y = 32 + frame.y - frame.height / 2;
        cr.setSourceRGB(rgb[0] * light, rgb[1] * light, rgb[2] * light);
        roundedRect(cr, x, y, frame.width, frame.height, frame.radius);
        cr.setSourceRGB(0, 0, 0);
        if (frame.mood === 'happy' && frame.blink < 0.85)
            roundedRect(cr, x - 0.5, y + frame.height * 0.31, frame.width + 1, frame.height + 6, frame.width / 2);
        if (frame.mood === 'angry' && frame.blink < 0.9) {
            const slope = 12 * (1 - frame.blink);
            cr.moveTo(x - 2, y - 2);
            cr.lineTo(x + frame.width + 2, y - 2);
            cr.lineTo(x + frame.width + 2, y + (centerX === 40 ? slope : 0));
            cr.lineTo(x - 2, y + (centerX === 40 ? 0 : slope));
            cr.closePath();
            cr.fill();
        }
    }
}

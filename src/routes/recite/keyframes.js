// My goal is to interpolate the keyframes in the best possible way.
// I rejected the idea of using cubic splines because they can overshoot the keyframes.
// I also rejected the idea of using linear interpolation because it looks jerky
// I am using Hermite interpolation:
//  - zero slope at local maxima and minima (so that we don't overshoot them)
//  - slope calculated as the smaller of the left and right one-sided derivatives to make overshooting less likely
//  - zero slope at the endpoints for a smooth beginning and end

import { writable } from 'svelte/store';

function best_slopes(ws, ys) {
    // calculate one-sided derivatives
    const rslopes = ws.map((w, i) => (i===ws.length-1) ? 0 : (ys[i+1] - ys[i]) / (ws[i+1] - w));
    const lslopes = ws.map((w, i) => (i===0) ? 0 : (ys[i] - ys[i-1]) / (w - ws[i-1]));
    // use whichever slope is smaller in magnitude
    const minslopes = rslopes.map((slope, i) => Math.abs(slope) < Math.abs(lslopes[i]) ? slope : lslopes[i]);
    // assign a slope of zero to any local maxima or minima
    const slopes = minslopes.map((slope, i) => (Math.sign(ys[i+1] - ys[i]) !== Math.sign(ys[i] - ys[i-1])) ? 0 : slope);
    return slopes;
}
function standard_hermite_interpolate(y0, y1, d0, d1, x) {
    // interpolate given y-values and derivatives at x=0 and x=1
    const x2 = x * x;
    const x3 = x2 * x;
    return (2*x3 - 3*x2 + 1) * y0 + (x3 - 2*x2 + x) * d0 + (-2*x3 + 3*x2) * y1 + (x3 - x2) * d1;
}
function hermite_interpolate(x1, x2, y1, y2, d1, d2, x) {
    // interpolate given x-values, y-values, and derivatives at x=1 and x=2
    const xdiff = x2 - x1;
    const standard_x = (x - x1) / xdiff;
    return standard_hermite_interpolate(y1, y2, d1 * xdiff, d2 * xdiff, standard_x);
}
function get_spline_idx(w, ws) {
    for (let i = 0; i < ws.length - 1; i++) {
        if (w >= ws[i] && w <= ws[i+1]) {
            return i;
        }
    }
    return ws.length - 2;
}
function interpolate(w, ws, ys, slopes) {
    if (w <= ws[0]) {
        return ys[0];
    } else if (w >= ws[ws.length-1]) {
        return ys[ys.length-1];
    }
    const i = get_spline_idx(w, ws);
    return hermite_interpolate(ws[i], ws[i+1], ys[i], ys[i+1], slopes[i], slopes[i+1], w);
}
// 
function get_all_slopes(keyframes) {
    return {
        x: best_slopes(keyframes.ws, keyframes.xs),
        y: best_slopes(keyframes.ws, keyframes.ys),
        z: best_slopes(keyframes.ws, keyframes.zs)
    }
}
function interpolate_all(w, keyframes, keyframe_slopes) {
    return {
        x: interpolate(w, keyframes.ws, keyframes.xs, keyframe_slopes.x),
        y: interpolate(w, keyframes.ws, keyframes.ys, keyframe_slopes.y),
        z: interpolate(w, keyframes.ws, keyframes.zs, keyframe_slopes.z)
    }
}

export { best_slopes, hermite_interpolate, get_spline_idx, interpolate, get_all_slopes, interpolate_all };
var Queue = require('tinyqueue');

const earthRadius = 6371;
const earthCircumference = 40007;
const rad = Math.PI / 180;

exports.around = function(tree, lng, lat,n = Infinity, maxDistance = Infinity, predicate) {
    var node = tree.data,
    result = [],
    toBBox = tree.toBBox,
    i, child, dist, candidate;
    
    var queue = new Queue([],compareDist);

    const cosLat = Math.cos(lat * rad); 
    const sinLat = Math.sin(lat * rad);

    while (node) {
        for (i = 0; i < node.children.length; i++) {
            child = node.children[i];
            childBBox = node.leaf ? toBBox(child) : child;

            const minLng = childBBox.minX;
            const minLat = childBBox.minY; 
            const maxLng = childBBox.maxX; 
            const maxLat = childBBox.maxY; 

            dist = boxDist(lng, lat, minLng, minLat, maxLng, maxLat, cosLat, sinLat);

            if (!maxDistance || dist <= maxDistance) {
                queue.push({
                    node: child,
                    isItem: node.leaf,
                    dist: dist
                });
            }
        }

        while (queue.length && queue.peek().isItem) {
            candidate = queue.pop().node;
            if (!predicate || predicate(candidate))
                result.push(candidate);
            if (n && result.length === n) return result;
        }

        node = queue.pop();
        if (node) node = node.node;
    }

    return result;
}


function compareDist(a, b) {
    return a.dist - b.dist;
}

// lower bound for distance from a location to points inside a bounding box
function boxDist(lng, lat, minLng, minLat, maxLng, maxLat, cosLat, sinLat) {
    if (minLng === maxLng && minLat === maxLat) {
        return greatCircleDist(lng, lat, minLng, minLat, cosLat, sinLat);
    }

    // query point is between minimum and maximum longitudes
    if (lng >= minLng && lng <= maxLng) {
        if (lat <= minLat) return earthCircumference * (minLat - lat) / 360; // south
        if (lat >= maxLat) return earthCircumference * (lat - maxLat) / 360; // north
        return 0; // inside the bbox
    }

    // query point is west or east of the bounding box;
    // calculate the extremum for great circle distance from query point to the closest longitude
    const closestLng = (minLng - lng + 360) % 360 <= (lng - maxLng + 360) % 360 ? minLng : maxLng;
    const cosLngDelta = Math.cos((closestLng - lng) * rad);
    const extremumLat = Math.atan(sinLat / (cosLat * cosLngDelta)) / rad;

    // calculate distances to lower and higher bbox corners and extremum (if it's within this range);
    // one of the three distances will be the lower bound of great circle distance to bbox
    let d = Math.max(
        greatCircleDistPart(minLat, cosLat, sinLat, cosLngDelta),
        greatCircleDistPart(maxLat, cosLat, sinLat, cosLngDelta));

    if (extremumLat > minLat && extremumLat < maxLat) {
        d = Math.max(d, greatCircleDistPart(extremumLat, cosLat, sinLat, cosLngDelta));
    }

    return earthRadius * Math.acos(d);
}

// distance using spherical law of cosines; should be precise enough for our needs
function greatCircleDist(lng, lat, lng2, lat2, cosLat, sinLat) {
    const cosLngDelta = Math.cos((lng2 - lng) * rad);
    return earthRadius * Math.acos(greatCircleDistPart(lat2, cosLat, sinLat, cosLngDelta));
}

// partial greatCircleDist to reduce trigonometric calculations
function greatCircleDistPart(lat, cosLat, sinLat, cosLngDelta) {
    const d = sinLat * Math.sin(lat * rad) + cosLat * Math.cos(lat * rad) * cosLngDelta;
    return Math.min(d, 1);
}

exports.distance = function(lng, lat, lng2, lat2) {
    return greatCircleDist(lng, lat, lng2, lat2, Math.cos(lat * rad), Math.sin(lat * rad));
}
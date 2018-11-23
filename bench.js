var cities = require('all-the-cities');
var rbush = require('rbush');
var georbush = require('./');

console.log('=== georbush benchmark ===');

var n = cities.length;
var k = 1000;

var randomPoints = [];
for (var i = 0; i < k; i++) randomPoints.push({
    lon: -180 + 360 * Math.random(),
    lat: -60 + 140 * Math.random()
});

console.time(`index ${n} points`);
var index = rbush(9, ['.lon', '.lat', '.lon', '.lat']);
for(i=0; i<cities.length; i++) {
    var city = cities[i];
    index.insert(city);
}
// rbush.load(cities);
console.timeEnd(`index ${n} points`);

console.time('query 1000 closest');
georbush.around(index, -119.7051, 34.4363, 1000);
console.timeEnd('query 1000 closest');

console.time('query 50000 closest');
georbush.around(index, -119.7051, 34.4363, 50000);
console.timeEnd('query 50000 closest');

console.time(`query all ${n}`);
georbush.around(index, -119.7051, 34.4363);
console.timeEnd(`query all ${n}`);

console.time(`${k} random queries of 1 closest`);
for (i = 0; i < k; i++) georbush.around(index, randomPoints[i].lon, randomPoints[i].lat, 1);
console.timeEnd(`${k} random queries of 1 closest`);
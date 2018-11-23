# georbush
Geographical extension for rbush (https://github.com/mourner/rbush)

Based on the spatial search libraries from Vladimir Agafonkin (https://github.com/mourner).

This is a combination of https://github.com/mourner/geoflatbush and https://github.com/mourner/rbush-knn

Benchmark results:
index 138398 points: 420.519ms

query 1000 closest: 7.832ms

query 50000 closest: 57.489ms

query all 138398: 106.827ms

1000 random queries of 1 closest: 34.288ms



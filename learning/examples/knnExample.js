kNN = require("k.n.n");

var data = [
    new kNN.Node(
        {
            homeWLP: 0,
            visitingWLP: 0,
            homeDiff: 0,
            visitingDiff: 0,
            homeLast8WLP: 0,
            visitingLast8WLP: 0,
            visitingWLPAsVisitor: 0,
            homeWLPAsHome: 0,
            type: "VISITING"
        })
    // new kNN.Node(
    //     {
    //         paramA: 3,
    //         paramB: 350,
    //         type: 'typeA'
    //     }),
    // new kNN.Node(
    //     {
    //         paramA: 6,
    //         paramB: 1200,
    //         type: 'typeB'
    //     }),
    // new kNN.Node(
    //     {
    //         paramA: 8,
    //         paramB: 900,
    //         type: 'typeB'
    //     }),
    // new kNN.Node({paramA: 1, paramB: 1220, type: 'typeC'}), new kNN.Node({paramA: 2, paramB: 900, type: 'typeC'})
];

var example = new kNN(data);

var results = example.launch(1,
    new kNN.Node(
        {
            homeWLP: 0,
            visitingWLP: 0,
            homeDiff: 0,
            visitingDiff: 0,
            homeLast8WLP: 0,
            visitingLast8WLP: 0,
            visitingWLPAsVisitor: 0,
            homeWLPAsHome: 0,
            type: "VISITING"
        })
);

console.log(results.type + ": " + results.percentage + "%");
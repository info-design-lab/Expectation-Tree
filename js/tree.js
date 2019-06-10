function node(name) {

    this.probabilities = [];
    this.children = [];

    this.parent = null;
    this.value = null; // if value !== null, it is a leaf

    this.name = name;
    this.expectation = 0;
    this.level = 0;
    this.probability = 0; 

    // Visualization Variables
    this.nodeSVG = null;
    this.height = 0;
    this.width = 0;
    this.x = 0;
    this.y = 0;

    this.setParentNode = function(node) {
        this.parent = node;
    }

    this.setValue = function(v){
        this.value = v;
    }

    this.getParentNode = function() {
        return this.parent;
    }

    this.addChild = function(node, probability) {
        node.setParentNode(this);
        this.children[this.children.length] = node;
        this.probabilities[this.probabilities.length] = probability;
    }

    this.getChildren = function() {
        return this.children;
    }

    this.removeChildren = function() {
        this.children = [];
        this.probabilities = []
    }

    this.preorderTraversal = function(fun){
        console.log(this.expectation);
        for(i in this.children){
            this.children[i].preorderTraversal();
        }
    }

    this.setChildrenHeight = function(){
        if(this.parent){
            this.level = this.parent.level + 1;
        }
        for(var i in this.children){
            this.children[i].setChildrenHeight();
        }
    }

    this.setExpectation = function(){
        if(this.value){
            this.expectation = this.value;
        } else{
            for(var i in this.children){
                this.expectation += this.children[i].setExpectation()*this.probabilities[i];
            }
        }

        return this.expectation;
    }

    this.maxExpectation = function(value){
        var max = value;
        if(this.value){
            if(this.value > max){
                max = this.value;
            }
        } else{
            for(var i in this.children){
                var d = this.children[i].maxExpectation(max);
                if(d > max){
                    max = d;
                }
            }
        }

        return max;
    }

    this.setProbability = function(){
        for(var i in this.children){
            this.children[i].probability = this.probability*this.probabilities[i];
            this.children[i].setProbability();
        }
    }

    this.setDimensions = function(){
        this.width = d3.max([10*this.name.length, 20]);
        this.height = d3.max([25, strokeScale(this.expectation)]);
        this.x = x(this.level);
        this.y = y(this.probability);

        for(var i in this.children){
            this.children[i].setDimensions();
        }
    }

    this.sortProbabilities = function(){
        if(this.value){
            return;
        }

        var merged = []
        for(var i in this.children){
            merged.push([
                    this.children[i],
                    this.probabilities[i]
                ]);
        }   

        merged.sort(function(a, b){
            return a[1] - b[1];
        });

        this.children = [];
        this.probabilities = [];
        for(var i in merged){
            this.children.push(merged[i][0]);
            this.probabilities.push(merged[i][1])
        }

        for(var i in this.children){
            this.children[i].sortProbabilities();
        }
    }

    this.createNode = function(){
        this.nodeSVG = svg.append('g')
            .attr('transform', 'translate(' + this.x + ',' + this.y + ')');

        if(this.parent){
            /*
            this.nodeSVG.append('line')
                .attr('x1', -width/2)
                .attr('y1', 0)
                .attr('x2', -x(2) + width/2)
                .attr('y2', y(this.parent.probability) - y(this.probability))
                .attr('stroke', '#202020')
                .attr('stroke-width', strokeScale(this.expectation) + 'px');
            */

            var path = [
                    {x: x(this.height - 1), y: y(this.parent.probability)},
                    {x: x(this.height - 1) + 10, y: y(this.parent.probability)},
                    {x: x(this.height) - 10, y: y(this.parent.probability)},
                    {x: x(this.height), y: y(this.probability)}
                ];

            var parentHeight = strokeScale(this.parent.expectation);
            var index = this.parent.children.indexOf(this);
            var thickness = strokeScale(this.parent.children[index].expectation*this.parent.probabilities[index]);
            var offset = 0;
            for(var i = 0; i < index; i++){
                offset += strokeScale(this.parent.children[i].expectation*this.parent.probabilities[i])
            }

            var path = [
                {x: -this.width/2, y1: -strokeScale(this.expectation)/2, y0: strokeScale(this.expectation)/2},
                {x: -this.width/2 - x(1.25), y1: -strokeScale(this.expectation)/2, y0: strokeScale(this.expectation)/2},
                {
                    x:  -(this.x - this.parent.x) + 1 + this.parent.width/2 + x(1.25), 
                    y1: y(this.parent.probability) - y(this.probability) + parentHeight/2 - offset - thickness, 
                    y0: y(this.parent.probability) - y(this.probability) + parentHeight/2 - offset},
                {
                    x:  -(this.x - this.parent.x) + 1 + this.parent.width/2, 
                    y1: y(this.parent.probability) - y(this.probability) + parentHeight/2 - offset - thickness, 
                    y0: y(this.parent.probability) - y(this.probability) + parentHeight/2 - offset},
            ]

            this.nodeSVG.append('path')
                .style('fill', colorPallete[index])
                .style('opacity', 0.5)
                .attr('d', area(path));
                
        }

        this.nodeSVG.append('rect')
            .attr('x', -this.width/2)
            .attr('y', -this.height/2)
            .attr('width', this.width)
            .attr('height', this.height)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr('fill', 'white')
            .attr('stroke', '#202020')
            .attr('stroke-width', '2px')
            .text(this.name);

        this.nodeSVG.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr("text-anchor", "middle")
            .attr('alignment-baseline', 'middle')
            .text(this.name);

        for(var i in this.children){
            this.children[i].createNode();
        }
    }
}

A = new node('Arihant');
B = new node("B");

A.addChild(B, 0.5);

C = new node("C");
A.addChild(C, 0.4);

D = new node("D");
D.setValue(1);

B.addChild(D, 0.2);

E = new node("E");
E.setValue(10);

H = new node("Hello");
H.setValue(8);

B.addChild(E, 0.6);
B.addChild(H, 0.4);

F = new node("Fafd");
F.setValue(1);

C.addChild(F, 0.7);
G = new node("G");
G.setValue(1);

C.addChild(G, 0.3);

A.level = 1;
A.setChildrenHeight();

A.probability = 1;
A.setProbability();
A.setExpectation();
A.sortProbabilities();

// Global Variables
var maxHeight = 3;
const windowWidth = document.body.clientWidth;
var width = windowWidth*0.6;
var height = width/2;
var margin = {
    top: 100,
    left: windowWidth*0.2,
    right: windowWidth*0.2,
    bottom: 50
}

var maxExpectation = A.maxExpectation(0);
var maxDepth = 3;
var strokeScale = d3.scaleLinear().domain([0, maxExpectation]).range([0, 50]);
var x = d3.scaleLinear().domain([1, maxDepth]).range([0, width]);
var y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

//A.preorderTraversal();

var SVG = d3.select("#vis").append('svg')
    .attr('width', width + (margin.left + margin.right))
    .attr('height', height + (margin.top + margin.bottom));

var svg = SVG.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var area = d3.area()
    .curve(d3.curveBasis)
    .x(function(d) { return d.x; })
    .y0(function(d) { return d.y0; })
    .y1(function(d) { return d.y1; });

var colorPallete = ["#4575b4", "#d73027", "#74add1", "#f46d43", "#abd9e9", "#fdae61", "#e0f3f8", "#fee090"];

// Add the y Axis
svg.append("g")
    .attr('class', 'axis')
    .style('opacity', 0.8)
    .attr('transform', 'translate(' + (-50) + ', 0)')
    .call(d3.axisLeft(y));

lines = [
    [0, 1],
    [1, 1],
    [0.5, 0.5],
    [0.25, 0.25],
    [0.75, 0.25],
    [0.125*1, 0.125],
    [0.125*3, 0.125],
    [0.125*5, 0.125],
    [0.125*7, 0.125],
]

for(var i in lines){
    svg.append('line')
        .attr('x1',  -50)
        .attr('y1', y(lines[i][0]))
        .attr('x2', width + 50)
        .attr('y2', y(lines[i][0]))
        .attr('opacity', lines[i][1])
        .attr('stroke', 'black')
}

A.setDimensions();

var elementList = [A, B, C, D, E, F, G, H];
rearrangeElement();

A.createNode();

function rearrangeElement(){
    // rearrange elements if there is occlusion
    var levelElements = {};
    for(var i = 1; i < maxDepth + 1; i++){
        levelElements[i] = [];
    }
    
    for(var i in elementList){
        levelElements[elementList[i].level].push(elementList[i])
    }

    //Sort the level elements based on the probabilty values
    for(var i in levelElements){
        levelElements[i].sort(function(a, b){
            return a.probability - b.probability;
        })
    }

    // For each level check the elements which are getting occluded over one another
    var occlusionGroups = [];

    for(var i in levelElements){
        for(var j in levelElements[i]){
            for(var k = j; k < levelElements[i].length; k++){
                a = levelElements[i][j];
                b = levelElements[i][k];
                if(a != b){
                    if(a.y + a.height/2 > b.y - b.height/2){
                        if(a.y - a.height/2 < b.y + b.height/2){
                            b.x += a.x + a.width/2 - (b.x - b.width/2) + 2;
                        }
                    }  
                }
            }
        }
    }
}
// Created on iPhone.

console.log("Hello, Diophantine World!")
let ds =[[60,90,135], // 15deg 1,1,-1
    [60,90,140],  // 10 deg 1,1,-1
    [60,90,108,135], // 3deg -1,1,1,-1
    [60,90,108,135,140], // 1deg 1,0,2,-1,-1
    [140,210,252,300,315], //3/7deg 2,1,-2,-1,1
    [4620,6930,8316,9900,10395,10780,11340], // 1/77deg 1,4,1,-3,-1,1,-1
       // 1/77deg 1,1,1,-3,1,1,-1
    [55,66,90]] // 360/220 =18/11deg 1,6,-5
    //1/77 -2,-2,-2,4,-1,1,1 ??
let ts=[15,10,3,1,1,1,1]
const c=5
let data = ds[c]
let target = ts[c]
sarch =data.map(x=> ({'co':0,'dat':x,'range':[-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]}))
eval = x=> x.reduce((a,c)=>a+c.co*c.dat,0)
coDist = x=> x.reduce((a,c)=>a+c.co*c.co,0)

pickOne = x => x[Math.trunc(Math.random()*x.length)]
console.log(sarch)
console.log(eval(sarch))
let found=true
let i =0
let smallest = [10000,sarch.map(x=> ({...x}))]
while(i<1000000&& !found){
    i++
    sarch.forEach(x=>{ x.co = pickOne(x.range)})
    let val = eval(sarch)
    if (val !=0 && Math.abs(val)<=Math.abs(smallest[0])) {
        if (Math.abs(val)!=Math.abs(smallest[0]) || 
           coDist(sarch)<coDist(smallest[1]) ) {
           smallest = [val,sarch.map(x=> ({...x}))]
        }
    }
    //found = val == target
}
console.log(found,smallest)









const colours = {
    o:"rgb(255,170,0)", //orange
    p:"rgb(153,0,153)", //purple
    r:"rgb(255,0,0)", //r:"red",
    b:"rgb(0,0,255)",//b:"blue",
    l:"rgb(141,153,38)", //olive
    g:"rgb(67,204,0)", //green
    a:"rgb(211,211,211)", //a:"lightGrey",
    y:"rgb(255,255,0)", //y:"yellow",
    k:"rgb(0,0,0)", //k:"black",
    i:"rgb(255,165,253)", //pink
    t:"transparent"
}
const cProgress = [ //royglbpi,ak,t
                    //20754319,68,10
    7,9,0,1,3,4,8,5,6,2,10  
]
const cRegress = [
    2,3,9,4,5,7,8,0,6,1,10
]
nextColour = x=> colours[Object.keys(colours)[cProgress[Object.values(colours).indexOf(x)]]]
previousColour = x=> colours[Object.keys(colours)[cRegress[Object.values(colours).indexOf(x)]]]

console.log(previousColour(colours.i))
console.log(previousColour(colours.k))
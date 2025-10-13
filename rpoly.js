// *******************************************
/**
 * Perhaps this is a waste of time becasue it's only a slight speed advantage
 */
function PolyDat() {
    this.data = 20;
    this.knownRadii = new Array();
    this.knownMinRadii = new Array();
    this.knownAngle = new Array();
    this.distThreshold = 0.0000001;
    this.colourNames = "oprblgaykit"
    this.colours = [
        {index:0, letter:"o", colour:"rgb(255,170,0)"}, //orange
        {index:1, letter:"p", colour:"rgb(153,0,153)"}, //purple
        {index:2, letter:"r", colour:"rgb(255,0,0)"}, //r:"red",
        {index:3, letter:"b", colour:"rgb(0,0,255)"},//b:"blue",
        {index:4, letter:"l", colour:"rgb(141,153,38)"}, //olive
        {index:5, letter:"g", colour:"rgb(67,204,0)"}, //green
        {index:6, letter:"a", colour:"rgb(211,211,211)"}, //a:"lightGrey",
        {index:7, letter:"y", colour:"rgb(255,255,0)"}, //y:"yellow",
        {index:8, letter:"k", colour:"rgb(0,0,0)"}, //k:"black",
        {index:9, letter:"i", colour:"rgb(255,165,253)"}, //pink
        {index:10, letter:"t", colour:"transparent"}
    ]
    this.cProgress = [ //royglbpi,ak,t
        //20754319,68,10
        7,9,0,1,3,4,8,5,6,2,10  
    ]
    this.cRegress = [
        2,3,9,4,5,7,8,0,6,1,10
    ]

    for (let i = 0; i < this.data; i++) {
        this.knownRadii[i] = this.radius(i + 3);
    }

    for (let i = 0; i < this.data; i++) {
        this.knownMinRadii[i] = this.minRadii(i + 3);
    }
    for (let i = 0; i < this.data; i++) {
        this.knownAngle[i] = this.angle(i + 3);
    }

    //	knownAreas[i]=((i+3)/Math.tan(Math.PI/(i+3))*0.25);
}
//---------------------------------------------------

PolyDat.prototype.getRadius = function(sides) {
    if (sides - 3 > this.data)
        return this.radii(sides);
    else
        return this.knownRadii[sides - 3];
};
PolyDat.prototype.radius = function(sides) {
    return 0.5 / Math.sin(Math.PI / (sides));
};
//---------------------------------------------------
PolyDat.prototype.getMinRadii = function(sides) {
    if (sides - 3 > this.data)
        return this.minRadii(sides);
    else
        return this.knownMinRadii[sides - 3];
};
PolyDat.prototype.minRadii = function(sides) {
    return 0.5 / Math.tan(Math.PI / sides);
};
//---------------------------------------------------
PolyDat.prototype.getAngle = function(sides) {
    if (sides - 3 > this.data)
        return this.angle(sides);
    else
        return this.knownAngle[sides - 3];
}
PolyDat.prototype.angle = function(n) {
    return Math.PI * (n - 2) / (n) * 0.5;
}

PolyDat.prototype.sidesFromMinRadii = function(rad,max=11) {
/*need to find index of array less than rad */
    let i=2
    while (i<max) {

        if (rad <this.knownMinRadii[i-2]) return i // kMR[0] retates to the 
        i++
    }
    return i;
}
polydat = new PolyDat();

//******************************************************
/** 
 * Rpoly is the basic class for regular polygons
 **/
function Rpoly(p1 = new Array(0, 1), p2 = new Array(0, 0), sides = 4, colIndex = 0, ref = 0, depth=0,branch = 0 ) {
    this.sides = sides;
    this.colour = polydat.colours[colIndex%polydat.colours.length].colour
    this.colIndex = colIndex
    this.arrowInvert =(colIndex==3 || colIndex ==8 )?true:false; //hmmmm
    this.scale = 1;
    this.heading = Math.ceil(sides / 2);
    this.vertices = new Array();
    this.vertices.push(p1);
    this.vertices.push(p2);
    this.scale = this.computeScale();
    this.center = this.createCenter();
    this.ref = ref;
    this.depth = depth
    // this is a new chunk to use the rtree for efficiency  *********
    this.branch = branch // this is lazy... I should redo this cleanly
    this.extreme = new Array(new Array(0, 0), new Array(0, 0));

    this.setPoints();
}
//---------------------------------------------------
Rpoly.prototype.clone = function() {
    let cl = new Rpoly(this.vertices[0], this.vertices[1], this.sides, this.colIndex, this.ref,this.depth, this.branch);
    cl.heading = this.heading;
    return cl;
};
//---------------------------------------------------
Rpoly.prototype.findAngle = function(one, two) {
    return Math.atan2(two[1] - one[1], two[0] - one[0]);
};
//---------------------------------------------------
Rpoly.prototype.createCenter = function() {
    let two = this.vertices[0];
    let angle = this.findAngle(two, this.vertices[1]) + polydat.getAngle(this.sides);
    let rad = polydat.getRadius(this.sides) * this.scale;

    return new Array(Math.cos(angle) * rad + two[0], Math.sin(angle) * rad + two[1]);
};
//---------------------------------------------------
Rpoly.prototype.computeScale = function() {
    // lazy referencing...
    let one = this.vertices[0];
    let two = this.vertices[1];
    let a = one[0] - two[0];
    let b = one[1] - two[1];

    return Math.sqrt(a * a + b * b);
};
//---------------------------------------------------
Rpoly.prototype.distance = function(one, two) {
    // lazy referencing...
    let a = one[0] - two[0];
    let b = one[1] - two[1];

    return Math.sqrt(a * a + b * b);
};
//--------------------------------------------------
/**
 * essentially I'll only use the first two points and forget the rest.
 */
Rpoly.prototype.setPoints = function() {
    let m = new Array(new Array(1, 0), new Array(0, 1));
    let angle = 2 * Math.PI / this.sides;
    m[0][0] = Math.cos(angle);
    m[0][1] = -Math.sin(angle);
    m[1][0] = -m[0][1];
    m[1][1] = m[0][0];

    let newVs = new Array();
    newVs.push(this.vertices[0]);
    newVs.push(this.vertices[1]);
    this.extreme[0][0] = Math.min(newVs[0][0], newVs[1][0]);
    this.extreme[0][1] = Math.max(newVs[0][0], newVs[1][0]);
    this.extreme[1][0] = Math.min(newVs[0][1], newVs[1][1]);
    this.extreme[1][1] = Math.max(newVs[0][1], newVs[1][1]);

    let diff = new Array(newVs[1][0] - newVs[0][0], newVs[1][1] - newVs[0][1]);
    let newDiff = new Array(0, 0);

    for (let i = 2; i < this.sides; i++) {
        newDiff[0] = (diff[0] * m[0][0] + diff[1] * m[0][1]);
        newDiff[1] = (diff[0] * m[1][0] + diff[1] * m[1][1]);
        diff[0] = newDiff[0];
        diff[1] = newDiff[1];

        newVs.push(new Array(newVs[i - 1][0] + diff[0], newVs[i - 1][1] + diff[1]));
        this.extreme[0][0] = Math.min(this.extreme[0][0], newVs[i][0]);
        this.extreme[0][1] = Math.max(this.extreme[0][1], newVs[i][0]);
        this.extreme[1][0] = Math.min(this.extreme[1][0], newVs[i][1]);
        this.extreme[1][1] = Math.max(this.extreme[1][1], newVs[i][1]);
    }
    this.vertices = newVs;
};
//--------------------------------------------------
Rpoly.prototype.setScale = function(sc) {
    let base = (this.heading + (this.sides - Math.floor(this.sides / 2))) % this.sides;
    let p1 = this.vertices[base];
    let p2 = this.vertices[(base + 1) % this.sides];

    let p3 = new Array(sc * (p2[0] - p1[0]) + p1[0], sc * (p2[1] - p1[1]) + p1[1]);
    this.vertices[0] = p1;
    this.vertices[1] = p3;
    this.setPoints();
};
//--------------------------------------------------
Rpoly.prototype.right = function() {
    this.heading = (this.heading + 1) % this.sides;
};
//--------------------------------------------------
Rpoly.prototype.left = function() {
    this.heading = (this.heading + this.sides - 1) % this.sides;
};
//--------------------------------------------------
Rpoly.prototype.setColIndex = function(colIndex) {
    this.colour = polydat.colours[colIndex%polydat.colours.length].colour;
    this.colIndex = colIndex
    this.arrowInvert =(colIndex==3 || colIndex ==8 )?true:false; //hmmmm
    // this.colour = text;    
    // this.arrowInvert =(text==="black" || text ==="blue")?true:false;
};
//--------------------------------------------------
Rpoly.prototype.make = function(sides = this.sides) {
    return new Rpoly(this.vertices[(this.heading + 1) % this.sides], this.vertices[this.heading], sides, this.colIndex, this.ref, this.depth+1, this.branch);
};
Rpoly.prototype.make2 = function(sides = this.sides) { //lazy me
    return new Rpoly(this.vertices[this.heading], this.vertices[(this.heading + 1) % this.sides], sides, this.colIndex, this.ref, this.depth+1, this.branch);
};
//--------------------------------------------------
Rpoly.prototype.toString = function() {
    return "Rpoly " + this.sides + " {" + this.vertices[0][0] + "," + this.vertices[0][1] + "}{" + this.vertices[1][0] + "," + this.vertices[1][1] + "}";
};
Rpoly.prototype.toStringFull = function() {
    let out = "RPoly " + this.sides;
    for (let i = 0; i < this.sides; i++) {
        out = out + "{" + this.vertices[i][0] + "," + this.vertices[i][1] + "}";
    }
    out = out + "EXT ";
    for (let i = 0; i < 2; i++) {
        out = out + "{" + this.extreme[0][i] + "," + this.extreme[1][i] + "}";
    }
    return out;
};
//--------------------------------------------------
/**
 * not sure if I want to make an integer polygon for drawing...
 */
Rpoly.prototype.drawHL = function(c, arrow = false) {
    if (this.colIndex === 10) //"transparent"
        return;
    let p = this.vertices[0];

    c.fillStyle = "rgba(255,255,255,0.6)";
    c.strokeStyle = "gray"
    c.beginPath();
    c.moveTo(p[0], p[1]);
    for (let i = 1; i < this.sides; i++) {
        p = this.vertices[i];
        c.lineTo(p[0], p[1]);
    }
    c.closePath();
    c.fill();
    c.stroke();

    if (false) {
        // debug
        //if (n != undefined) {  // debug
        //p = this.fix(this.vertices[n],x,y,sx,sy);
        p = this.vertices[n];

        c.beginPath();
        c.arc(p[0], p[1], 3, 0, 2 * Math.PI);
        c.stroke();
    }
    if (arrow) {
        //Math.atan2(y, x)
        c.save();

        //c.strokeStyle = !this.arrowInvert?"rgb(50,50,50)":"white";
        //c.strokeStyle = "gray"
        let dx = (this.vertices[0][0] - this.vertices[1][0]) / 6;
        let dy = (this.vertices[0][1] - this.vertices[1][1]) / 6;
        let ex = (this.vertices[0][0] + this.vertices[1][0]) / 2;
        let ey = (this.vertices[0][1] + this.vertices[1][1]) / 2;
        p = this.center;
        let cx = (p[0] - ex) / 3;
        let cy = (p[1] - ey) / 3;
        c.beginPath();
        p = this.vertices[0];
        c.moveTo(ex, ey);
        p = this.center;
        c.lineTo(p[0], p[1]);
        c.lineTo(p[0] + dx - cx, p[1] + dy - cy);
        c.lineTo(p[0], p[1]);
        c.lineTo(p[0] - dx - cx, p[1] - dy - cy);

        //c.closePath();

        c.stroke();
        c.restore();
    }
    // debug
    if (false) {
        //p = this.fix(this.center,x,y,sx,sy);
        p = this.center;

        c.beginPath();
        c.arc(p[0], p[1], 0.01, 0, 2 * Math.PI);
        c.fill();
        c.stroke();
    }

};
//--------------------------------------------------
function rainbowFix(colour,index) {  //HUGE assumption that the string colour is correctly in the format "rgb(255,255,0)"
    return `rgba(${colour.substring(4,colour.length-1)},${1-(index%2)/1.333})`
}
/**
 * not sure if I want to make an integer polygon for drawing...
 */
Rpoly.prototype.drawSimple = function(c, arrow = false,rainbow=false,thick=1) {
    if (this.colIndex === 10) //"transparent"
    //if (this.colour === "transparent")
        return;
    let p = this.vertices[0];

    c.fillStyle = rainbow? rainbowFix(this.colour,this.branch):this.colour;
    //console.log("RAINBOW",rainbow,c.fillStyle,this.colour,this.branch)
    //c.fillStyle = rainbow? rainbowFix(this.colour,this.ref):this.colour;
    //console.log(rainbow,c.fillStyle,this.colour)

    c.beginPath();
    c.moveTo(p[0], p[1]);
    for (let i = 1; i < this.sides; i++) {
        p = this.vertices[i];
        c.lineTo(p[0], p[1]);
    }
    c.closePath();
    c.fill();
    if (thick==2) {
        c.lineWidth = 0.08
    }
    c.lineJoin = "round"

    if (thick !=0) c.stroke();

    if (false) {
        // debug
        //if (n != undefined) {  // debug
        //p = this.fix(this.vertices[n],x,y,sx,sy);
        p = this.vertices[n];

        c.beginPath();
        c.arc(p[0], p[1], 3, 0, 2 * Math.PI);
        c.stroke();
    }
    if (arrow) {
        //Math.atan2(y, x)
        c.save();

        c.strokeStyle = !this.arrowInvert?"rgb(50,50,50)":"white";

        let dx = (this.vertices[0][0] - this.vertices[1][0]) / 6;
        let dy = (this.vertices[0][1] - this.vertices[1][1]) / 6;
        let ex = (this.vertices[0][0] + this.vertices[1][0]) / 2;
        let ey = (this.vertices[0][1] + this.vertices[1][1]) / 2;
        p = this.center;
        let cx = (p[0] - ex) / 3;
        let cy = (p[1] - ey) / 3;
        c.beginPath();
        p = this.vertices[0];
        c.moveTo(ex, ey);
        p = this.center;
        c.lineTo(p[0], p[1]);
        c.lineTo(p[0] + dx - cx, p[1] + dy - cy);
        c.lineTo(p[0], p[1]);
        c.lineTo(p[0] - dx - cx, p[1] - dy - cy);

        //c.closePath();

        c.stroke();
        c.restore();
    }
    // debug
    if (false) {
        //p = this.fix(this.center,x,y,sx,sy);
        p = this.center;

        c.beginPath();
        c.arc(p[0], p[1], 0.01, 0, 2 * Math.PI);
        c.fill();
        c.stroke();
    }

};
//--------------------------------------------------
/**
 * for interfaces and Lists
 */
Rpoly.prototype.drawOutline = function(c, extra) {
    let p = this.vertices[0];
    c.save();
    c.fillStyle = "none";
    if (extra != undefined) {
        c.lineWidth = 0.2;
        c.strokeStyle = extra;
        c.setLineDash([0.2, 0.2]);
    } else {
        c.lineWidth = 1;
        c.strokeStyle = "grey";
    }
    c.beginPath();
    c.moveTo(p[0], p[1]);
    for (let i = 1; i < this.sides; i++) {
        p = this.vertices[i];
        c.lineTo(p[0], p[1]);
    }
    c.closePath();
    c.stroke();
    c.restore();
};
//--------------------------------------------------
/**
 */
Rpoly.prototype.drawLive = function(c, override) {
    //this.drawSimple(c);
    let p1 = this.vertices[this.heading];
    let p2 = this.vertices[(this.heading + 1) % this.sides];

    if (override === undefined)
        override = "black";

    c.save();
    c.strokeStyle = override;
    c.lineWidth = 0.3;
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(p1[0], p1[1]);
    c.lineTo(p2[0], p2[1]);
    c.closePath();
    c.stroke();
    c.restore();
};
Rpoly.prototype.fix = function(p, x, y, sx, sy) {
    return new Array(Math.round(p[0] * sx + x), Math.round(p[1] * sy + y));
};
//--------------------------------------------------
Rpoly.prototype.drawRect = function(c) {
    let p = new Array(this.extreme[0][0], this.extreme[1][0]);
    c.save();
    c.beginPath();

    c.strokeStyle = "#BBBBBB";

    c.rect(p[0], p[1], (this.extreme[0][1] - this.extreme[0][0]), (this.extreme[1][1] - this.extreme[1][0]));
    c.stroke();
    c.restore();
};
//--------------------------------------------------
Rpoly.prototype.getBounds = function() {
    return {
        x: (this.extreme[0][0]),
        y: (this.extreme[1][0]),
        w: ((this.extreme[0][1] - this.extreme[0][0])),
        h: ((this.extreme[1][1] - this.extreme[1][0]))
    };
        //return {x:(this.extreme[0][0]*1000), y:(this.extreme[1][0]*1000), w:((this.extreme[0][1]-this.extreme[0][0])*1000), h:((this.extreme[1][1]-this.extreme[1][0])*1000)};
};
    //--------------------------------------------------
Rpoly.prototype.collisionTryOld = function(poly) {
    // two issues  Why is the rTree dying
    // is the collision algorithm working?
    if (poly === undefined)
        return false;
    //if (poly.colour === "blue" && this.colour === "blue") {
    //   console.log("blue on blue");
    //}
    //$(htmlEl).html("");
    let angle = this.findAngle(this.center, poly.center);
    if (angle < 0)
        angle += 2 * Math.PI;
    //$(htmlEl).append("angle "+angle);
    let dist = this.distance(this.center, poly.center);
    //$(htmlEl).append("  dist "+dist);

    if (dist + polydat.distThreshold < polydat.minRadii(poly.sides) * poly.scale + polydat.minRadii(this.sides) * this.scale)
        return true;

    //not with in mins but hopefully with in each bounding boxes
    let thisN = this.sideAngle(angle);
    let otherN = poly.sideAngle(Math.PI + angle);

    let v0 = this.vectorSub(this.vertices[thisN], this.vertices[(thisN + 1) % this.sides]);
    let perp = this.perp(this.vectorSub(this.vertices[thisN], this.vertices[(thisN + 1) % this.sides]));
    let v1 = this.vectorSub(poly.vertices[otherN], this.vertices[thisN]);
    let otherEnd = this.dot(v1, perp);
    let v2 = this.vectorSub(poly.vertices[(otherN + 1) % poly.sides], this.vertices[thisN]);
    let otherEnd2 = this.dot(v2, perp);

    //* testing **********************  
    if (false && poly.colIndex === 3 && this.colIndex === 8) {
        console.log(">> " + otherEnd + " " + otherEnd2 + " <" + v0 + " <" + v2 + " p" + perp);
        console.log("poly: " + poly.toStringFull())
        console.log("this: " + this.toStringFull())
        console.log("Extras");
        //if (htmlEl != "junk") console.log(poly.collisionTry(this,"junk"));
    }
    return ((otherEnd > polydat.distThreshold) || (otherEnd2 > polydat.distThreshold));
};

Rpoly.prototype.collisionPoint = function(x, y) {
    let point = [x, y];
    let angle = this.findAngle(point, this.center);
    if (angle < 0)
        angle += 2 * Math.PI;
    let dist = this.distance(point, this.center);

    if (dist + polydat.distThreshold < polydat.minRadii(this.sides) * this.scale)
        return true;

    let thisN = this.sideAngle(angle);
    //figures out which point is closest...?
    let w1 = this.vectorSub(this.vertices[thisN], point);
    let w2 = this.vectorSub(this.center, point);

    return this.dot(w1, w2) < 1;
};

Rpoly.prototype.collisionTry = function(poly) {
    return poly.collisionTryOld(this) && this.collisionTryOld(poly);
}

Rpoly.prototype.sideAngle = function(angle) {
    let angle2one = this.findAngle(this.center, this.vertices[0]);
    let sAngle = 2 * Math.PI / this.sides;
    //console.log("SA "+angle+" "+angle2one+", "+sAngle);
    return Math.floor((2 * Math.PI + angle - angle2one) / sAngle) % this.sides;
};
Rpoly.prototype.sideAngleRound = function(angle) {
    let angle2one = this.findAngle(this.center, this.vertices[0]);
    let sAngle = 2 * Math.PI / this.sides;
    //console.log("SA "+angle+" "+angle2one+", "+sAngle);
    return Math.round((2 * Math.PI + angle - angle2one) / sAngle) % this.sides;
};
Rpoly.prototype.perp = function(p1) {
    return new Array(p1[1], -1 * p1[0]);
};
Rpoly.prototype.vectorSub = function(p1, p2) {
    return new Array(p1[0] - p2[0], p1[1] - p2[1]);
};
Rpoly.prototype.dot = function(p1, p2) {
    return (p1[0] * p2[0] + p1[1] * p2[1]);
};

//--------------------------------------------------------
Rpoly.prototype.drawPoints = function(c, poly) {
    // only testing...
    let p1 = this.center;
    let p2 = poly.center;

    this.doLine(p1, p2, c);
    c.save();
    let angle = this.findAngle(this.center, poly.center);
    let thisN = this.sideAngle(angle);
    let otherN = poly.sideAngle(Math.PI + angle);

    p1 = this.vertices[thisN];
    p2 = this.vertices[(thisN + 1) % this.sides];
    c.strokeStyle = "blue";
    this.doLine(p1, p2, c);

    p1 = this.fix(poly.vertices[otherN], x, y, sx, sy);
    p2 = this.fix(poly.vertices[(otherN + 1) % poly.sides], x, y, sx, sy);
    c.strokeStyle = "pink";
    this.doLine(p1, p2, c);

    let thisNR = this.sideAngleRound(angle);
    if (thisN === thisNR)
        thisN = (thisN + this.sides - 1) % this.sides;
    else
        thisN = (thisN + 1) % this.sides;
    p1 = this.vertices[thisN];
    p2 = this.vertices[(thisN + 1) % this.sides];
    c.strokeStyle = "cyan";
    this.doLine(p1, p2, c);

    let otherNR = poly.sideAngleRound(Math.PI + angle);
    if (otherN === otherNR)
        otherN = (otherN + poly.sides - 1) % poly.sides;
    else
        otherN = (otherN + 1) % poly.sides;
    p1 = poly.vertices[otherN];
    p2 = poly.vertices[(otherN + 1) % poly.sides];
    c.strokeStyle = "red";
    this.doLine(p1, p2, c);

    c.restore();
};
Rpoly.prototype.doLine = function(p1, p2, c) {
    //testing...
    c.beginPath();
    c.arc(p1[0], p1[1], 3, 0, 2 * Math.PI);
    c.stroke();
    c.beginPath();
    c.arc(p2[0], p2[1], 3, 0, 2 * Math.PI);
    c.stroke();
    c.beginPath();
    c.moveTo(p2[0], p2[1]);
    c.lineTo(p1[0], p1[1]);
    c.stroke();
}

Rpoly.prototype.getNextPaintTile = function(point) {
    let proposal = {side:0,tile:null}
    if (this.sides ==2){
        proposal.side = point[1]>this.vertices[0][1]?0:1;

        let midSidePoint = [(this.vertices[proposal.side][0]+this.vertices[(proposal.side+1)%this.sides][0])/2,
        (this.vertices[proposal.side][1]+this.vertices[(proposal.side+1)%this.sides][1])/2]

        let dist = this.distance(midSidePoint,point)
        let newSide = polydat.sidesFromMinRadii(dist)
    
        proposal.tile = new Rpoly(this.vertices[(proposal.side+1)%this.sides ],this.vertices[proposal.side],newSide,this.colIndex)
        return proposal
    }
    let centerPoint = this.center
    let angle = this.findAngle(centerPoint,point)
    let angle0 = this.findAngle(centerPoint, this.vertices[0])
    let diff = angle-angle0


    while (diff<0) diff += 2*Math.PI

    proposal.side = Math.trunc(this.sides * (diff)/(2*Math.PI))  // !!! have to think about the boundary...
    //console.log("details ",proposal.side,angle,angle0, this.findAngle(centerPoint, this.vertices[1]),diff)
    let midSidePoint = [(this.vertices[proposal.side][0]+this.vertices[(proposal.side+1)%this.sides][0])/2,
        (this.vertices[proposal.side][1]+this.vertices[(proposal.side+1)%this.sides][1])/2]
    let dist = this.distance(midSidePoint,point)
    let newSide = polydat.sidesFromMinRadii(dist)
    //console.log("distance ",dist,newSide)

    //if (newSide <2) newSide = 2
    proposal.tile = new Rpoly(this.vertices[(proposal.side+1)%this.sides ],this.vertices[proposal.side],newSide,this.colIndex)

    return proposal
}
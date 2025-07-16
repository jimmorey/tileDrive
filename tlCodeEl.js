/**
 * tlCodeEl will act as screen versions of the code chunks.
 */
//--------------------------------------------------
let tlCodeElCount = 1

function TLDetails() {
  this.keys = new Array("3", "4", "5", "6", "7", "8", "9", "0", "1", "2",
    "r", "b", "y", "o", "p", "g", "l", "i", "e", "k", "t", "<", ">",":")
  this.width = 30
  this.height = 30

  this.polys = new Array()
  for (let i = 3; i < 13; i++) {
    //precalc polygons in [-1,1]^2
    let maxR = polydat.getRadius(i)
    let minR = polydat.getMinRadii(i)
    let p1 = new Array(0.25 / maxR * this.width, 0.5 * (minR / maxR * this.height + this.height))
    let p2 = new Array(-1 * p1[0] + 0.5 * this.width, p1[1])
    p1[0] += this.width * 0.5
    this.polys.push(new Rpoly(p1, p2, i))
  }
  this.colors = new Array("red", "blue", "yellow", "rgb(255,170,0)", "rgb(153,0,153)", "rgb(67,204,0)",
    "rgb(141,153,38)", "rgb(255,165,253)", "lightGrey", "black")


  this.colorContrast = new Array("black", "white", "black", "black", "white", "black",
    "white", "black", "black", "white")
  this.colorContrastOp = new Array("none", "white", "none", "none", "white", "none",
    "white", "none", "none", "white")
}
let tlDetails = new TLDetails()

function tlCodeEl(text, w, h) {
  this.id = "tlCodeEl" + tlCodeElCount
  tlCodeElCount++
  this.width = w
  this.height = h

  this.scale = 1.0
  this.text = text

  this.canvas = document.createElement('canvas')
  this.canvas.setAttribute("id", this.id)

  let fud = this.canvas
  fud.width = w
  fud.height = h
  fud.style.width = w + "px"
  fud.style.height = h + "px"
}

tlCodeEl.prototype.toString = function () {
  return text
}

// *******************************************
function tlCodeColor(text) {
  tlCodeEl.call(this, text, tlDetails.width, 20)
}
tlCodeColor.prototype = Object.create(tlCodeEl.prototype)
tlCodeColor.constructor = tlCodeColor

tlCodeEl.prototype.drawCanvas = function () {
  this.drawCode(document.getElementById(this.id), tlDetails.width, tlDetails.height, this.text)
}
tlCodeEl.prototype.drawCanvas2 = function () {
  let c = document.getElementById(this.id)
  //console.log(c)
  let ctx = c.getContext("2d")
  ctx.save()
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.strokeStyle = "black"
  //console.log(c.width + " jim " + c.height)
  let cx = c.width / 2
  let cy = c.height / 2
  ctx.beginPath()
  ctx.moveTo(c.width / 2, 0)
  ctx.lineTo(c.width / 2, c.height)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, c.height / 2)
  ctx.lineTo(c.width, c.height / 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(c.width, c.height)
  ctx.stroke()
  ctx.font = "50px Georgia"
  ctx.fillText(this.text, 10, 50)

  ctx.restore()
}


tlCodeEl.prototype.countPoly =function (text="55b55",filled=true, ends=true) { 
  let tileLand = new TL(50, 50, 2, 2, text.length)
  tileLand.run(text)

  let rtpolys = tileLand.rt.get_tree().nodes.filter (a=>a.leaf.colour !="transparent")
  return rtpolys.length;
}
tlCodeEl.prototype.createSVG =function (boxWidth=300,boxHeight=300,text,filled=true, ends=true, chunked=false, arrow =false,start=false) { //from https://stackoverflow.com/questions/3492322/javascript-createelementns-and-svg
  let xmlns = "http://www.w3.org/2000/svg";

  //if (arrow) console.log("ARROW")
  if (typeof text !== 'string') {
    text = String(text);
  }
  let startIndex = -1
  let tileLand = new TL(50, 50, 2, 2, text.length)
  tileLand.run(text)

  let rtpolys = tileLand.rt.get_tree().nodes.filter (a=>a.leaf.colour !="transparent")

  let box = RTree.Rectangle.make_MBR(rtpolys)
  //fudge...
  box.x -=0.15
  box.w+=0.3
  box.y -=0.15
  box.h+=0.3
  let hw = Math.min(boxWidth/box.w,boxHeight/box.h)

  //console.log("SVG",boxWidth,boxHeight,text)
  let svgElem = document.createElementNS(xmlns, "svg");
  svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
  svgElem.setAttributeNS(null, "width", boxWidth);
  svgElem.setAttributeNS(null, "height", boxHeight);
  svgElem.style.display = "block";

  let g = document.createElementNS(xmlns, "g");
  svgElem.appendChild(g);

  g.setAttributeNS(null, 'transform', `matrix(${hw},0,0,${(1)*hw},${boxWidth/2+((-1)*box.x-0.5*box.w)*hw},${boxHeight/2- ((1)*box.y+0.5*box.h)*hw})`)

  if (filled && ends) {
    rtpolys.push({leaf:{special:2,colour:tileLand.active.colour,vertices:tileLand.active.vertices}})  //fudge 2
    let line = tileLand.active
    rtpolys.push({leaf:{special:3,colour:"brown",vertices:[line.vertices[line.heading],line.vertices[(line.heading+1)%line.sides]]}})  //fudge 3
    //rtpolys.push({leaf:{special:1,colour:"brown",vertices:[[-0.5,0],[0.5,0]]}})  //fudge 1

  }
  if(start) {
    startIndex = rtpolys.length
    rtpolys.push({leaf:{special:1,colour:"brown",vertices:[[-0.5,0],[0.5,0]]}})  //fudge 1
  }
  for(var i=0;i<rtpolys.length;i++){ 
    let thing = rtpolys[i].leaf 
    if (thing != undefined && thing.colour !== "transparent") {
      let points = thing.vertices.join(" ")

      //console.log("SVGout",points)
    
      let poly = document.createElementNS(xmlns, "polygon");
      poly.setAttributeNS(null, 'stroke', `${thing.colour==="brown"?"brown":"#000000"}`);
      if (thing.special != null) { 
        if (thing.special==1) {
          poly.setAttributeNS(null, 'stroke-width', 0.3);
        } else if (thing.special==3) {
            poly.setAttributeNS(null, 'stroke-width', 0.15);       
        } else {
          poly.setAttributeNS(null, 'stroke-width', 0.1);
           poly.setAttributeNS(null, 'stroke-dasharray', "0.2");      
        }
      }
      else  {
        poly.setAttributeNS(null, 'stroke-width', 0.04);
      }
      poly.setAttributeNS(null, 'stroke-linejoin', "round");
      poly.setAttributeNS(null, 'points', points);
      poly.setAttributeNS(null, 'fill', `${filled?thing.colour:"none"}`);
      poly.setAttributeNS(null, 'opacity', 1.0);

      g.appendChild(poly);
    }
  }
    if (chunked){
      let indices = getChunkIndices(text)
      for(let i=0;i<indices.length;i++){
        let chunk = rtpolys.filter(x=> (i==0 ||x.leaf.ref>indices[i-1]) && x.leaf.ref<indices[i] )
        let pol = [...chunk[0]?.leaf?.vertices] // first one
        for(let j=1;j<chunk.length;j++){
          joinCommon(pol,chunk[j].leaf.vertices)
        }
        let points = pol.join(" ")
      
        let poly = document.createElementNS(xmlns, "polygon")
        if (i%2==0) {
          poly.setAttributeNS(null, 'stroke', "#333333")
          poly.setAttributeNS(null, 'stroke-dasharray', "0.1");      

        } else poly.setAttributeNS(null, 'stroke', "#000000")
        poly.setAttributeNS(null, 'stroke-width', 0.15)
        poly.setAttributeNS(null, 'stroke-linejoin', "round")
        poly.setAttributeNS(null, 'points', points)
        poly.setAttributeNS(null, 'fill', '#ffffff')
        poly.setAttributeNS(null, 'fill-opacity', '0.3')
        poly.setAttributeNS(null, 'opacity', 1.0)
        g.appendChild(poly)
      }
    }
    if (arrow ) {
      for(var i=0;i<rtpolys.length;i++){ 
        let thing = rtpolys[i].leaf 
        if (thing != undefined && thing.colour !== "transparent" && thing.sides>2) {
          let point0 = thing.vertices[0]
          let point1 = thing.vertices[1]
          let dx = (point0[0] - point1[0]) / 6;
          let dy = (point0[1] - point1[1]) / 6;
          let ex = (point0[0] + point1[0]) / 2;
          let ey = (point0[1] + point1[1]) / 2;
          let p = thing.center;
          let cx = (p[0] - ex) / 3;
          let cy = (p[1] - ey) / 3;
          let d = "";
          p = point0;
          d += `M ${ex} ${ey}`
          p = thing.center;
          d += `L ${p[0]} ${p[1]}`
          d += `L ${p[0] + dx - cx} ${ p[1] + dy - cy}`
          d += `L ${p[0]} ${p[1]}`
          d += `L ${p[0] - dx - cx} ${p[1] - dy - cy}`
          //console.log("arrow",d)
          let poly = document.createElementNS(xmlns, "path")
          poly.setAttributeNS(null, 'd', d)

          poly.setAttributeNS(null, 'stroke', "#000000")
          poly.setAttributeNS(null, 'stroke-width', 0.05)
          poly.setAttributeNS(null, 'stroke-linejoin', "round")
          poly.setAttributeNS(null, 'points', "0 0, 0 10, 10 5")
          poly.setAttributeNS(null, 'fill', 'none')
          poly.setAttributeNS(null, 'opacity', 1.0)
          g.appendChild(poly)
          //console.log("arrowp",poly)

        }
      }
    }
    if (  startIndex!= -1) {
      let poly = document.createElementNS(xmlns, "polygon")
      poly.setAttributeNS(null, 'stroke', "black")
      poly.setAttributeNS(null, 'stroke-width', 0.3)
      poly.setAttributeNS(null, 'stroke-linejoin', "round")
      poly.setAttributeNS(null, 'points', rtpolys[startIndex].leaf.vertices.join(" "))
      poly.setAttributeNS(null, 'fill', 'none')
      poly.setAttributeNS(null, 'fill-opacity', '1.0')
      poly.setAttributeNS(null, 'opacity', 1.0)
      g.appendChild(poly)
      poly = document.createElementNS(xmlns, "polygon")
      poly.setAttributeNS(null, 'stroke', "white")
      poly.setAttributeNS(null, 'stroke-width', 0.075)
      poly.setAttributeNS(null, 'stroke-linejoin', "round")
      poly.setAttributeNS(null, 'points', rtpolys[startIndex].leaf.vertices.join(" "))
      poly.setAttributeNS(null, 'fill', 'none')
      poly.setAttributeNS(null, 'fill-opacity', '1.0')
      poly.setAttributeNS(null, 'opacity', 1.0)
      g.appendChild(poly)
    }

  return svgElem
}

tlCodeEl.prototype.addActivePoly =function (polys,codes){
  let tileLand = new TL(50, 50, 2, 2, Math.max(...codes.map(x=>x.length)))
  for(let i=0;i<codes.length;i++){
    tileLand.run(codes[i])
    let rtpolys = tileLand.rt.get_tree().nodes.filter (a=>a.leaf.colour !="transparent")
    for(let j=0;j<rtpolys.length;j++){ 
       polys.push(rtpolys[j].leaf)  
    }
  }
}
// tlCodeEl.prototype.addActivePoly =function (rtpolys,polys){
//   rtpolys.push(addPoly)  //fudge 1
// }
tlCodeEl.prototype.createSVGPoly =function (boxWidth=300,boxHeight=300,rtpolys,filled=true, ends=true, chunked=false, arrow =false,start=false,opacity=1.0) { //from https://stackoverflow.com/questions/3492322/javascript-createelementns-and-svg

  // we fix this soon... Should just use createSVG and dump the polys into this but for now it works 
  let xmlns = "http://www.w3.org/2000/svg";

  let startIndex = -1
  // let tileLand = new TL(50, 50, 2, 2, text.length)
  // tileLand.run(text)

  //let rtpolys = tileLand.rt.get_tree().nodes.filter (a=>a.leaf.colour !="transparent")

 // let box = RTree.Rectangle.make_MBR(rtpolys)
  let coords = rtpolys.map(x=>x.vertices).flat()

  let box = {x:Math.min(...coords.map(x=>x[0])),
      y:Math.min(...coords.map(x=>x[1])),
      w:Math.max(...coords.map(x=>x[0])),
      h:Math.max(...coords.map(x=>x[1]))}
      box.w -= box.x
      box.h -= box.y
  //console.log("BOX",box)
  //fudge...
  box.x -=0.15
  box.w+=0.3
  box.y -=0.15
  box.h+=0.3
  let hw = Math.min(boxWidth/box.w,boxHeight/box.h)

  //console.log("SVG",boxWidth,boxHeight,text)
  let svgElem = document.createElementNS(xmlns, "svg");
  svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
  svgElem.setAttributeNS(null, "width", boxWidth);
  svgElem.setAttributeNS(null, "height", boxHeight);
  svgElem.style.display = "block";

  let g = document.createElementNS(xmlns, "g");
  svgElem.appendChild(g);

  g.setAttributeNS(null, 'transform', `matrix(${hw},0,0,${(1)*hw},${boxWidth/2+((-1)*box.x-0.5*box.w)*hw},${boxHeight/2- ((1)*box.y+0.5*box.h)*hw})`)

  // if (filled && ends) {
  //   rtpolys.push({leaf:{special:2,colour:tileLand.active.colour,vertices:tileLand.active.vertices}})  //fudge 2
  //   let line = tileLand.active
  //   rtpolys.push({leaf:{special:3,colour:"brown",vertices:[line.vertices[line.heading],line.vertices[(line.heading+1)%line.sides]]}})  //fudge 3
  //   //rtpolys.push({leaf:{special:1,colour:"brown",vertices:[[-0.5,0],[0.5,0]]}})  //fudge 1

  // }
  if(start) {
    startIndex = rtpolys.length
    rtpolys.push({special:1,colour:"brown",vertices:[[-0.5,0],[0.5,0]]})  //fudge 1
  }
  for(var i=0;i<rtpolys.length;i++){ 
    let thing = rtpolys[i]
    if (thing != undefined && thing.colour !== "transparent") {
      let points = thing.vertices.join(" ")

      //console.log("SVGout",points)
    
      let poly = document.createElementNS(xmlns, "polygon");
      poly.setAttributeNS(null, 'stroke', `${thing.colour==="brown"?"brown":"#000000"}`);
      if (thing.special != null) { 
        if (thing.special==1) {
          poly.setAttributeNS(null, 'stroke-width', 0.3);
        } else if (thing.special==3) {
            poly.setAttributeNS(null, 'stroke-width', 0.15);       
        } else {
          poly.setAttributeNS(null, 'stroke-width', 0.1);
           poly.setAttributeNS(null, 'stroke-dasharray', "0.2");      
        }
      }
      else  {
        poly.setAttributeNS(null, 'stroke-width', 0.04);
      }
      poly.setAttributeNS(null, 'stroke-linejoin', "round");
      poly.setAttributeNS(null, 'points', points);
      poly.setAttributeNS(null, 'fill', `${filled?thing.colour:"none"}`);
      poly.setAttributeNS(null, 'opacity', opacity);

      g.appendChild(poly);
    }
  }
    if (chunked){
      let indices = getChunkIndices(text)
      for(let i=0;i<indices.length;i++){
        let chunk = rtpolys.filter(x=> (i==0 ||x.leaf.ref>indices[i-1]) && x.leaf.ref<indices[i] )
        let pol = [...chunk[0]?.leaf?.vertices] // first one
        for(let j=1;j<chunk.length;j++){
          joinCommon(pol,chunk[j].leaf.vertices)
        }
        let points = pol.join(" ")
      
        let poly = document.createElementNS(xmlns, "polygon")
        poly.setAttributeNS(null, 'stroke', "#000000")
        poly.setAttributeNS(null, 'stroke-width', 0.15)
        poly.setAttributeNS(null, 'stroke-linejoin', "round")
        poly.setAttributeNS(null, 'points', points)
        poly.setAttributeNS(null, 'fill', '#ffffff')
        poly.setAttributeNS(null, 'fill-opacity', '0.3')
        poly.setAttributeNS(null, 'opacity', 1.0)
        g.appendChild(poly)
      }
    }
    if (arrow ) {
      for(var i=0;i<rtpolys.length;i++){ 
        let thing = rtpolys[i]
        if (thing != undefined && thing.colour !== "transparent" && thing.sides>2) {
          let point0 = thing.vertices[0]
          let point1 = thing.vertices[1]
          let dx = (point0[0] - point1[0]) / 6;
          let dy = (point0[1] - point1[1]) / 6;
          let ex = (point0[0] + point1[0]) / 2;
          let ey = (point0[1] + point1[1]) / 2;
          let p = thing.center;
          let cx = (p[0] - ex) / 3;
          let cy = (p[1] - ey) / 3;
          let d = "";
          p = point0;
          d += `M ${ex} ${ey}`
          p = thing.center;
          d += `L ${p[0]} ${p[1]}`
          d += `L ${p[0] + dx - cx} ${ p[1] + dy - cy}`
          d += `L ${p[0]} ${p[1]}`
          d += `L ${p[0] - dx - cx} ${p[1] - dy - cy}`
          let poly = document.createElementNS(xmlns, "path")
          poly.setAttributeNS(null, 'd', d)

          poly.setAttributeNS(null, 'stroke', "#000000")
          poly.setAttributeNS(null, 'stroke-width', 0.05)
          poly.setAttributeNS(null, 'stroke-linejoin', "round")
          poly.setAttributeNS(null, 'points', "0 0, 0 10, 10 5")
          poly.setAttributeNS(null, 'fill', 'none')
          poly.setAttributeNS(null, 'opacity', 1.0)
          g.appendChild(poly)
        }
      }
    }
    if (  startIndex!= -1 && false) {
      let poly = document.createElementNS(xmlns, "polygon")
      poly.setAttributeNS(null, 'stroke', "black")
      poly.setAttributeNS(null, 'stroke-width', 0.3)
      poly.setAttributeNS(null, 'stroke-linejoin', "round")
      poly.setAttributeNS(null, 'points', rtpolys[startIndex].vertices.join(" "))
      poly.setAttributeNS(null, 'fill', 'none')
      poly.setAttributeNS(null, 'fill-opacity', '1.0')
      poly.setAttributeNS(null, 'opacity', 1.0)
      g.appendChild(poly)
      poly = document.createElementNS(xmlns, "polygon")
      poly.setAttributeNS(null, 'stroke', "white")
      poly.setAttributeNS(null, 'stroke-width', 0.075)
      poly.setAttributeNS(null, 'stroke-linejoin', "round")
      poly.setAttributeNS(null, 'points', rtpolys[startIndex].vertices.join(" "))
      poly.setAttributeNS(null, 'fill', 'none')
      poly.setAttributeNS(null, 'fill-opacity', '1.0')
      poly.setAttributeNS(null, 'opacity', 1.0)
      g.appendChild(poly)
    }

  return svgElem
}
function closeEnough(p1,p2){
  return Math.abs(p1[0]-p2[0])<0.00000001 && Math.abs(p1[1]-p2[1])<0.00000001
}
function joinCommon(poly1,poly2){
  let common = poly1.filter(x=>poly2.filter(y=>closeEnough(x,y)).length>0)
  if (common.length > 0){
    let index1 = poly1.findIndex(x=>closeEnough(x,common[0]))
    let index2 = poly2.findIndex(x=>closeEnough(x,common[0]))
    let i1 = poly1.findIndex(x=>closeEnough(x,common[1]))
    let i2 = poly2.findIndex(x=>closeEnough(x,common[1]))  
    let mi = Math.max(index1,i1)
    let one = mi==index1?index2:i2
    let two = mi==index1?i2:index2

    let p1 = poly1.slice(mi).concat(poly1.slice(0,mi))
    if (mi == poly1.length-1 && Math.min(index1,i1)== 0) p1 = [...poly1]
    let newPoly = p1
    if (poly2.length == 3) {
      //newPoly = poly1.slice(mi+1).concat(poly1.slice(0,mi+1))
      newPoly.push(poly2[(3-index2-i2)%3])
    }
    else newPoly = newPoly.concat(poly2.slice(Math.min(two+1,poly2.length-1))).concat(poly2.slice(0,Math.max(0,two-1)))

    poly1.length = 0
    poly1.push(...newPoly)
  }
}

tlCodeEl.prototype.drawCommand = function () {  //used for the tileland interface...
  //console.log(c)
  c= document.getElementById(this.id)
  w = tlDetails.width
  h = tlDetails.height
  text =this.text
  let ctx = c.getContext("2d")
  ctx.save()
  //ctx.clearRect(0, 0, w, h)
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.strokeStyle = "black"
  let cx = c.width / 2
  let cy = c.height / 2
  let sx = Math.min(cx, cy) * 0.75
  let sy = sx

  if (text.length == 0)  return //oops??
    let i = tlDetails.keys.indexOf(text[0])
    if (i < 10 && i>=0) { // draw poly
      ctx.save()
      ctx.translate(cx * 0.25, 0)
      tlDetails.polys[i].drawOutline(ctx)
      ctx.restore()
    } else if (i < tlDetails.keys.indexOf("t") && i!=-1) {  // draw color
      i = i - tlDetails.keys.indexOf("r")
      ctx.fillStyle = tlDetails.colors[i]
      ctx.save()
      //ctx.fillRect(0, 0, w, h)
      ctx.translate(cx, cy)
      ctx.scale(1, 0.5)
      ctx.beginPath()
      ctx.arc(0, 0, cx, 0, 2 * Math.PI, false)
      ctx.fill()
      ctx.restore()
      ctx.strokeStyle = tlDetails.colorContrastOp[i]
      ctx.fillStyle = tlDetails.colorContrast[i]
    } else if (text[0] == "t") { //draw transparent
      ctx.save()
      ctx.linewidth = 15
      ctx.setLineDash([5, 5])
      ctx.translate(cx, cy)
      ctx.scale(1, 0.5)
      ctx.beginPath()
      ctx.arc(0, 0, cx, 0, 2 * Math.PI, false)
      ctx.stroke()
      ctx.restore()
    } else if (text[0] == ">") { //right
      ctx.translate(0, -1);  //related to 50px font
      ctx.save()
      ctx.translate(cx, cy + 5)
      ctx.beginPath()
      ctx.scale(0.85, 0.3)

      ctx.arc(0, 0, cx, -0.45 * Math.PI, -1.25 * Math.PI, true)
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.restore()
    } else if (text[0] == "<") { //left
      ctx.translate(0, -1);  //related to 50px font
      ctx.save()
      ctx.lineWidth = 3

      ctx.translate(cx, cy + 5)
      ctx.beginPath()
      ctx.scale(1, 0.3)
      ctx.linewidth = 3

      ctx.arc(0, 0, cx, 0.25 * Math.PI, -0.55 * Math.PI, true)
      ctx.stroke()
      ctx.restore()
    } else if (text[0] =="'") { //colour up
      ctx.linewidth = 15
      ctx.translate(cx, cy)
      ctx.scale(1, 0.5)
      ctx.beginPath()
      ctx.arc(0, 0, cx, 0, 2 * Math.PI, false)
      ctx.clip()
      let j= -cx
      let colI = 9
      for(let i=0;i<8;i++){
        ctx.fillStyle = polydat.colours[colI].colour
        ctx.fillRect(j+i*(cx/4), -cx, (cx/4),2*cx)
        colI = polydat.cRegress[colI]
      }
      ctx.restore()
      ctx.fillStyle = "white"
      ctx.strokeStyle = "white"

    } else if (text[0] ==  `"`) { //colour down
      ctx.linewidth = 15
      ctx.translate(cx, cy)
      ctx.scale(1, 0.5)
      ctx.beginPath()
      ctx.arc(0, 0, cx, 0, 2 * Math.PI, false)
      ctx.clip()
      let j= -cx
      let colI = 2
      for(let i=0;i<8;i++){
        ctx.fillStyle = polydat.colours[colI].colour
        ctx.fillRect(j+i*(cx/4), -cx, (cx/4),2*cx)
        colI = polydat.cProgress[colI]
      }
      ctx.restore()
      ctx.fillStyle = "white"
      ctx.strokeStyle = "white"
    } else {
      //ignore mistakes for now
    }
  

  // last polygon
  //this.active.drawLive(cx,cy,this.sx*this.scale,this.sy*this.scale,ctx)
  // starting line
  //this.start.drawLive(cx,cy,this.sx*this.scale,this.sy*this.scale,ctx,"brown")

  ctx.beginPath()
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  ctx.font = "bold 20px sans serif"

  ctx.fillText(this.text, cx, cy)
  if (ctx.strokeStyle != "none") ctx.strokeText(this.text, cx, cy)

  //ctx.text(this.text,cx,cy)
  ctx.stroke()
  ctx.restore()
}

tlCodeEl.prototype.drawCode = function (c, w, h, text) {
  //console.log(c)
  let ctx = c.getContext("2d")
  ctx.save()
  //ctx.clearRect(0, 0, w, h)
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.strokeStyle = "black"
  let cx = c.width / 2
  let cy = c.height / 2
  let sx = Math.min(cx, cy) * 0.75
  let sy = sx

  let tileLand = new TL(50, 50, 2, 2, text.length)

  tileLand.run(text)
  tileLand.drawCanvasFit(c)
}

function startStackRun(name,code, banks =Array.from({length:10},()=>""), tileLand = new TL(500, 500, 20, 20)) {  //will work with TileManager...later
  code = String(code.toLowerCase()).replace(/[\n ]/g, "")
  tileLand.run("")
  let codeStack = []
  pushCode(code,codeStack,banks,tileLand)
  let codeOut = ""
  return {name:name,codeStack:codeStack,codeOut:codeOut,banks:banks,tileLand:tileLand,count:0,debug:false}
}

function showStack(stackRun) {
  return stackRun.name+":"+stackRun.count+stackRun.codeStack.join(" ")+stackRun.codeOut
}

function runStackStep(stackRun) {
  if (stackRun.debug) console.log(showStack(stackRun))
  stackRun.count++
  let codeStack = stackRun.codeStack //for ease
  let command = codeStack.pop()

  if (isToken(command)) { //oops
     console.log("lonely token")
  } else {
    if ("f".indexOf(command[0]) > -1){   // not sure how this one is going to fly
      // these better be stack!!!
      let first  = codeStack.pop()
      let second  = codeStack.pop()
      let third  = codeStack.pop()  // this is used in case the second is out this can third replenish it
      let countStack = []

      // compute the first chunk of first
      if (second.codeStack.length == 0) {
        pushNextStack("reup",0,isToken(third)?third[1]+"":third,countStack,stackRun.banks,stackRun.tileLand)
        second  = countStack.pop()  
      }
      let flag2 = pushChunkFromStack(countStack,second)
      let polyCount =0
      while (countStack.length>0) {
        if ("1234567890".indexOf(countStack.pop()[0]) >-1) polyCount++  //um 
      }
      let stackDump = []
      let flag = pushNPolyFromStack(polyCount,stackDump,first)

      if (flag==1) { //keep mixing
        codeStack.push(third)    
        codeStack.push(second)
        codeStack.push(first)
        codeStack.push("f")
      }
      while(stackDump.length>0) {
        codeStack.push(stackDump.pop())
      }
    } else  if ("m".indexOf(command[0]) > -1){   // not sure how this one is going to fly
        // these better be stack!!!
        let first  = codeStack.pop()
        let second  = codeStack.pop()
        let third  = codeStack.pop()  // this is used in case the second is out this can third replenish it
  
        let stack = []
  
        // compute the first chunk of first
        let flag = pushChunkFromStack(stack,first)
        if (flag!=-1) { // it empty first so no need to continue
          // it worked thus prepare to continue with mix
          
          // compute the first chunk of second
          if (second.codeStack.length == 0) {
            pushNextStack("reup",0,isToken(third)?third[1]+"":third,codeStack,stackRun.banks,stackRun.tileLand)
            second  = codeStack.pop()
          }
          let flag2 = pushChunkFromStack(stack,second)
  
          if (flag==1) { //keep mixing
            codeStack.push(third)    
            codeStack.push(second)
            codeStack.push(first)
            codeStack.push("m")
          }
          while(stack.length>0) {
            codeStack.push(stack.pop())
          }
        }
    } else if ("+=".indexOf(command[0]) > -1){   //repeat
      let number = codeStack.pop()
      if (!isToken(number)) {
        console.log("repeat without number")
      } else {
        //console.log("repeat",number)
        let rep = getDigit(number)
        let chunk = codeStack.pop()
        if (rep==0) {
          //nothing to do
        } else {
          codeStack.push(chunk)
          codeStack.push(createToken(rep-1))
          codeStack.push("+")
          if (isToken(chunk)) chunk = chunk[1]+"" //the digit...
          let chunkR = getBankOrCode(chunk,0,stackRun.banks)
          //console.log("chunkR",chunkR)
          pushCode(chunkR.code,codeStack,stackRun.banks, stackRun.tileLand)
        }
      }
    } else if ("x".indexOf(command[0]) > -1){   //current code to bank
      let bankToken  = codeStack.pop()
      let bank = getDigit(bankToken)-10
      //get rid of the brackets?
      stackRun.banks[bank] = stackRun.codeOut
      stackRun.codeOut = ""
      stackRun.tileLand.run("")
    } else if ("s".indexOf(command[0]) > -1){  
      let bankToken  = codeStack.pop()
      let chunk = codeStack.pop()
      let bank = getDigit(bankToken)-10
      //get rid of the brackets?
      if (isToken(chunk)) chunk = chunk[1]+"" //the digit...

      let bOrCode = getBankOrCode(chunk,0,stackRun.banks)
      //console.log("s",bOrCode)
      if (bOrCode.label == "anon") stackRun.banks[bank] = bOrCode.code
      else stackRun.banks[bank] = stackRun.banks[bOrCode.label]
    } else if ("v".indexOf(command[0]) > -1){  
      let bankToken  = codeStack.pop()
      let bank = getDigit(bankToken)-10
      if (stackRun.banks[bank] == null)  console.log("***empty bank",bankToken)
      pushCode(stackRun.banks[bank],codeStack,stackRun.banks,stackRun.tileLand)
    } else if ("?".indexOf(command[0]) > -1){  
      let check  = codeStack.pop()[1]+"" //the digit...

      let chunkTrue = codeStack.pop()
      if (isToken(chunkTrue)) chunkTrue = stackRun.banks[getDigit(chunkTrue)-10]
      else chunkTrue = chunkTrue.substring(1,chunkTrue.length-1)

      let chunkFalse = codeStack.pop()
      if (isToken(chunkFalse)) chunkFalse = stackRun.banks[getDigit(chunkFalse)-10]
      else chunkFalse = chunkFalse.substring(1,chunkFalse.length-1)

      //console.log("T:",chunkTrue,"F:",chunkFalse)
      pushCode(stackRun.tileLand.check(check)?chunkTrue:chunkFalse,codeStack,stackRun.banks,stackRun.tileLand)
    //} else if ("{}".indexOf(command[0]) > -1){  
      // skip the branches and finish "this one" first
      // have to keep a queue of processes...
    } else {
      stackRun.tileLand.runOn(command)

      stackRun.codeOut += command  //TileDrive code hopefully
    }
  }

  return stackRun.codeOut
}
function stackRun(code,banks) {
  let stackRun = startStackRun("stackRun",code,banks)
  //stackRun.debug = true;
  stackRunning(stackRun) 
  return stackRun.codeOut
}

function stackRunning(stackRun){
  //let max = 1000
  while (stackRun.codeStack.length > 0) {
    runStackStep(stackRun) 
    if (stackRun.newBranch != null) 
      setTimeout(function() { stackRunning(stackRun.newBranch) },1000) // ??let me think about this... perhaps it's yeild time...
  }
}
function pushCode(code,codeStack,banks,tileLand){ //string to stack -- reverse order and leave [] alone & package tokens
  // this is not fault tolerant code 
  let i = 0
  let thisCode = []

  while (code!=null && i < code.length) {
    let ch = code.substring(i, i + 1)
    if ("s".indexOf(ch) > -1) {
      thisCode.push(ch)
      thisCode.push("_"+code.substring(i + 1, i + 2))
      i=pushNextChunk(i+2,code,thisCode,banks)
    } else if ("vx".indexOf(ch) > -1) {
      thisCode.push(ch)
      //let bOrCode = getBankOrCode(code,i+2,banks)
      thisCode.push("_"+code.substring(i + 1, i + 2))
      i+=2
    } else if ("+=".indexOf(ch) > -1){  
      let rep =code.substring(i+1, i + 2)
      thisCode.push(ch)
      thisCode.push("_"+rep)
      i=pushNextChunk(i+2,code,thisCode,banks)
    } else if ("m".indexOf(ch) > -1){  
      thisCode.push(ch)
      i=pushNextStack("fi",i+1,code,thisCode,banks,tileLand) //??
      let oldi = i
      i=pushNextStack("se",i,code,thisCode,banks,tileLand)
      pushNextChunk(oldi,code,thisCode,banks)  // make a copy of the secondary mix part
      //console.log("helping?  mix",...thisCode)
    } else if ("f".indexOf(ch) > -1){  
      thisCode.push(ch)
      i=pushNextStack("ff-fir",i+1,code,thisCode,banks,tileLand)
      let oldi = i
      i=pushNextStack("ff-sec",i,code,thisCode,banks,tileLand)
      pushNextChunk(oldi,code,thisCode,banks)  // make a copy of the secondary mix part
      //console.log("helping?  mix",...thisCode)
    } else if ("?".indexOf(ch) > -1){  
      let rep =code.substring(i+1, i + 2)
      thisCode.push(ch)
      thisCode.push("_"+rep)
      i=pushNextChunk(i+2,code,thisCode,banks)
      i=pushNextChunk(i,code,thisCode,banks)
    } else {
      thisCode.push(ch)
      i++
    }
  }
  //reverse
  while(thisCode.length>0){
    codeStack.push(thisCode.pop())
  }
}

function pushNextChunk(i,code,stack,banks) {
  let bOrCode = getBankOrCode(code,i,banks) 
  if (bOrCode.label == "anon"){
    stack.push("["+bOrCode.code+"]")
    i += bOrCode.code.length +2 //+2 for the brackets
  } else{
    stack.push("_"+bOrCode.label)
    i++
  }
  return i
}

function pushNextStack(role,i,code,stack,banks,tileLand) {
  let bOrCode = getBankOrCode(code,i,banks) 
  //console.log(role,bOrCode)
  if (bOrCode.label == "anon"){
    stack.push(startStackRun("mixStack-"+role,bOrCode.code,banks,tileLand))
    i += bOrCode.code.length +2 //+2 for the brackets and +1 for luck?
  } else{
    //console.log("pushNextStackLabel",bOrCode.label,"%%",bOrCode)
    stack.push(startStackRun("mixStackLabel-"+role,"v"+bOrCode.label,banks,tileLand))
    i++
  }
  return i
}

function pushChunkFromStack(codeStack,mixStack){
  //have to construct a chunk from mixStack
  const TDPOLY="1234567890"
  const TDSIMPLE=TDPOLY+`{},.><rbyopgliakt:'"` // simple
  let valid = false //chunk needs at least one polygon
  let found = false
  let skip = false
  while (!found){
    //console.log("chunk",codeStack)
    if (mixStack.codeStack.length == 0) return !valid?-1:0 
    let last = mixStack.codeStack[mixStack.codeStack.length-1]
    if (TDSIMPLE.indexOf(last[0])>-1) {
      if (last.length != 1) {
        //console.log("chunk error--should be 1 character",last)
      }
      if (TDPOLY.indexOf(last[0]) > -1) {
        if (valid && !skip) {
          found = true
        }
        valid = true
      }
      if (!found) codeStack.push(mixStack.codeStack.pop())
      skip = last[0] == ":"  //skip only lasts one round
    } else {
      runStackStep(mixStack)
    }
  }
  //console.log("intermediate",codeStack)
  return mixStack.length==0?0:1
}

function pushNPolyFromStack(n,codeStack,mixStack){
  //have to construct a chunk from mixStack
  const TDPOLY="1234567890"
  const TDSIMPLE=TDPOLY+"{},.><rbyopgliakt:'"+'"' // simple
  let valid = false //chunk needs at least one polygon
  let found = false
  let skip = false

  while (n>-1){
    if (mixStack.codeStack.length == 0) return !valid?-1:0 
    let last = mixStack.codeStack[mixStack.codeStack.length-1]
    //console.log("NPoly",last)
    if (TDSIMPLE.indexOf(last[0])>-1) {
      if (last.length != 1) {
        //console.log("chunk error--should be 1 character",last)
      }
      if (TDPOLY.indexOf(last[0]) > -1) {
        n--
        if(valid && n>-1)codeStack.push(":")
        valid = true //is it necessary?
      }
      if (n>-1) {
        let thing = mixStack.codeStack.pop()
        if (last[0] != ":") codeStack.push(thing)
      }
      } else {
      runStackStep(mixStack)
    }
  }

  //console.log("intermediate",codeStack,mixStack)
  return mixStack.length==0?0:1
}

function isToken(token){
  return token[0]="_" && token.length==2
}
function createToken(rep){
  return "_"+(rep<10?rep:String.fromCharCode(87 + rep))
}
function getDigit(token){  // fix this later
  let crep = token.charCodeAt(1)
  let rep = parseInt(token.substring(1, 2))
  if (crep>96 && crep<123)
    rep = crep -87  // -'a' +11

  return rep
}

function ppfilter(code, banks =Array.from({length:10},()=>"")) { 
  return stackRun(code,banks)
}
function getChunks(code) {
  let chunks = []
  let chunk = ""
  let inChunk = false
  let pass= false;
  for (let i = 0; i < code.length; i++) {
    let ch = code.substring(i, i + 1)
    if (":;".indexOf(ch) > -1) pass = true;
    else {
      if (!pass && "0123456789".indexOf(ch) > -1) {
        if (inChunk) {
          chunks.push(chunk)
          chunk =""
        }
        inChunk = true
      }
      pass = false
    } 
    chunk += ch
  }
  if (inChunk) {
    chunks.push(chunk)
  }
  return chunks
}
function getChunkIndices(code) {
  let chunks = getChunks(code)  
  //thought about using reduce but this is clearer
  let indices = chunks.map((a, i) => a.length)
  for(i=1;i<indices.length;i++) indices[i] += indices[i-1]

  return indices
}
function getMatching(target,code,start){
  let depth =0;
  let i=start+1
  while (!(depth==0 && code[i] == target ) && i< code.length){
    //console.log("code check",code[i],code[start])
    if (code[i]== code[start]) depth++
    if (code[i]== target) depth--
    i++
  }
  return i;
}

function getBankOrCode(code,pos,banks){
  let bank = code.substring(pos, pos+1)
  let matchIndex =pos+1
  if (bank==='[') { //clutzy but works
    matchIndex = getMatching(']',code,pos)
    return ({"label":"anon","code":code.substring(pos+1,matchIndex)})
  } 
  return  ({"label":bank,"code":banks[bank.toUpperCase().charCodeAt(0)-65]})
}

function doMan(command,banks,ccode){ 
  if (command.substring(0, 1) == "x") {
      let bank = command.toUpperCase().charCodeAt(1) -65
      if (bank >=0 && bank<banks.length)
          banks[bank] = ccode+""
      ccode = ""
  } else if (command.substring(0, 1) == "v") {
    let bank = command.toUpperCase().charCodeAt(1) -65
      if (bank >=0 && bank<banks.length)
      ccode += banks[bank]
  } else if (command === "q" || command === "c") { //not sure if c is used
      ccode =""
      if (command === "q"){
         banks.forEach((a,i)=>banks[i]="")
      }
  }   
  return ccode+""
}

function partition(n, k) { // n is number of items k is number of colons so n-k is the number of chunks
  if (k === 1) {
      return [[Array.from({ length: n }, (_, i) => i)]];
  }
  if (n === k) {
      return [Array.from({ length: n }, (_, i) => [i])];
  }

  let partitions = [];
  for (let i = 1; i < n; i++) {
      let subPartitions = partition(i, k - 1);
      for (let p of subPartitions) {
          partitions.push(p.concat([Array.from({ length: n - i }, (_, j) => i + j)]));
      }
  }
  return partitions;
}
function getForm(i,len) {
  return "2".repeat(i+1) +":" +"2".repeat(len-i-1)
}
getFormP = (p) => p.map((x,i) => "2".repeat(x.length)).join(":")
// function getFormP(p) {
//     return "2".repeat(p[0].length) +":" +"2".repeat(p[1].length) +":" +"2".repeat(p[2].length)
// }
function add2List(list,sym,a,b){
  let item = ppfilter(`+${sym}[m[${a}][${b}]]`)
  //console.log("add2List",item)
  let item2 = String(item.replace(/[: ]/g,""))
  let listText = list.map(x=>x.text)
  for (let i=0;i<item.length;i++) {
      if (listText.indexOf(item2.slice(i) + item2.slice(0, i)) >=0) return
  }
  let j = {rep:sym, text:item2, textChunk:item, textA:String(a), textB:String(b)}
  list.push(j)
}
function roll(a,n) {
  let aa = [...getChunks(a)]
  for (let i=0;i<n;i++) {
      let fa = aa.shift()
      aa.push(fa)
  }
  return aa.join("")
}
function addExamples(list,sym,a,b,na,nb, part1,part2, show=false){
  let aa = ppfilter(a)
  let bb = ppfilter(b)

  for (let p of part1) 
      for (let p2 of part2) 
          for (let i=0;i<na;i++)  //excessive perhaps but being lazy
              for (let j=0;j<nb;j++) 
                  add2List(list, sym, ppfilter(`f[${roll(aa,i)}][${getFormP(p)}]`),ppfilter(`f[${roll(bb,j)}][${getFormP(p2)}`))
}
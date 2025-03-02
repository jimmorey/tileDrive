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
function tlCodePoly(text, sides) {
  tlCodeEl.call(this, text, tlDetails.width, tlDetails.height)
  this.sides = sides
  let p1 = new Array((-1) / 2, 0 / 2)
  let p2 = new Array(p1[0] + 1, p1[1])
  this.poly = new Rpoly(p2, p1, sides, "white")
}
tlCodePoly.prototype = Object.create(tlCodeEl.prototype)
tlCodePoly.constructor = tlCodePoly

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

// tlCodeEl.prototype.dumpSVG = function () {
//   let text = ''
//   let svg = document.createElement('svg')
//   svg.setAttribute("xmlns","http://www.w3.org/2000/svg") //attributes
//   svg.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink") 
//   svg.setAttribute("xml:space","preserve") 
//   svg.setAttribute("x","0px")
//   svg.setAttribute("y","0px")
//   svg.setAttribute("width","400px")
//   svg.setAttribute("height","300px")
//   svg.setAttribute("viewBox","0 0 400 300")
//   let poly = new SVGAElement(`polygon`)

//   svg.append(poly)
//   return svg
// }
tlCodeEl.prototype.countPoly =function (text="55b55",filled=true, ends=true) { //from https://stackoverflow.com/questions/3492322/javascript-createelementns-and-svg

  let tileLand = new TL(50, 50, 2, 2, text.length)
  tileLand.run(text)

  let rtpolys = tileLand.rt.get_tree().nodes.filter (a=>a.leaf.colour !="transparent")
  return rtpolys.length;
}
tlCodeEl.prototype.createSVG =function (boxWidth=300,boxHeight=300,text,filled=true, ends=true, chunked=false, arrow =false,start=false) { //from https://stackoverflow.com/questions/3492322/javascript-createelementns-and-svg
  let xmlns = "http://www.w3.org/2000/svg";

  if (arrow) console.log("ARROW")
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
          console.log("arrow",d)
          let poly = document.createElementNS(xmlns, "path")
          poly.setAttributeNS(null, 'd', d)

          poly.setAttributeNS(null, 'stroke', "#000000")
          poly.setAttributeNS(null, 'stroke-width', 0.05)
          poly.setAttributeNS(null, 'stroke-linejoin', "round")
          poly.setAttributeNS(null, 'points', "0 0, 0 10, 10 5")
          poly.setAttributeNS(null, 'fill', 'none')
          poly.setAttributeNS(null, 'opacity', 1.0)
          g.appendChild(poly)
          console.log("arrowp",poly)

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

  if (text.length == 0) {

  } else if (text.length > 1) {
    //** not sure... what I was thinking */
    //console.log("yup",text,this.width,this.height)
    //ignore for now
    let tileLand = new TL(50, 50, 2, 2, text.length)
    //let tileLand = new TL(this.width, this.height, this.width, this.height, text.length)
    tileLand.run(text)
    tileLand.drawCanvasFit(c)
    return
  } else {
    //single command
    let i = tlDetails.keys.indexOf(text[0])
    if (i < 10) { // draw poly
      ctx.save()
      ctx.translate(cx * 0.25, 0)
      tlDetails.polys[i].drawOutline(ctx)
      ctx.restore()
    } else if (i < tlDetails.keys.indexOf("t")) {  // draw color
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
    } else {
      //ignore mistakes for now
    }
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
function ppfilter(code, banks =Array.from({length:10},()=>"")){
  //code = properCode(code)
  //console.log("ppINIT",code)
  code = String(code).replace(/[\n ]/g, "")
  let codeOut = ""
  let cursor =0
  for (let i = 0; i < code.length; i++) {
      var ch = code.substring(i, i + 1).toLowerCase()
      //console.log("pp",ch,i,codeOut,banks)
      if ("xv".indexOf(ch) > -1) {
          //console.log("huuh",code.substring(i, i + 2))
          codeOut = doMan(code.substring(i, i + 2),banks,codeOut)
          i++
      } else if ("+=".indexOf(ch) > -1){  // why is there an =? ...in case of no shift....
          let crep = code.toUpperCase().charCodeAt(i+1)
          let rep = parseInt(code.substring(i+1, i + 2))
          if (crep>64 && crep<91)
                rep = crep -55  // -'A' +11

          let bOrCode = getBankOrCode(code,i+2,banks)
          if (bOrCode.label == "anon"){
            for (let jj = 0;jj<rep;jj++) codeOut+= ppfilter(bOrCode.code,banks);
            i += bOrCode.code.length +3    
          } else {
            for (let jj = 0;jj<rep;jj++) codeOut = doMan("v"+bOrCode.label,banks,codeOut)
            i+=2 
          }   
      } else if ("mM".indexOf(ch) > -1){  //  the new MIX command  DUCT TAPE code  redo soon
        let bOrCode = getBankOrCode(code,i+1,banks)
        let bankCode =[]
        if (bOrCode.label == "anon"){
          let anon= ppfilter(bOrCode.code,banks);
          bankCode =  getChunks(anon)
          i += bOrCode.code.length +2     
        } else {
          bankCode = getChunks(bOrCode.code)
          i++
        }
        //console.log("bank1",bankCode, i, code.substring(i+1, i + 2))

        let b2OrCode = getBankOrCode(code,i+1,banks)
        let bank2Code =[]
        let bank2Reset =""
        if (b2OrCode.label == "anon"){
          bank2Reset= ppfilter(b2OrCode.code,banks);
          i += b2OrCode.code.length +2     
        } else {
          bank2Reset = b2OrCode.code
          i++
        }

        while (bankCode.length > 0 ) {
          codeOut += bankCode.shift()
          if ( bank2Code.length == 0) bank2Code =  getChunks(bank2Reset)
          codeOut += bank2Code.shift()
        } 
      } else if ("fF".indexOf(ch) > -1){  //  Free from :???
        let bOrCode = getBankOrCode(code,i+1,banks)
        let bankCode =""
        if (bOrCode.label == "anon"){
          let anon= ppfilter(bOrCode.code,banks);
          bankCode =  anon
          i += bOrCode.code.length +2     
        } else {
          bankCode =bOrCode.code
          i++
        }

        let b2OrCode = getBankOrCode(code,i+1,banks)
        if (b2OrCode.label == "anon"){
          bank2Reset= ppfilter(b2OrCode.code,banks);
          i += b2OrCode.code.length +2     
        } else {
          bank2Reset = b2OrCode.code
          i++
        }

        bankCodeCh =  getChunks(bankCode.replace(/[:]/g, ""))
        bank2CodeCh =  getChunks(bank2Reset)

        //console.log("Format",bank,bank2,bankCode,bank2Code)
        let curChunk=[]
        while (bankCodeCh.length > 0) {
          if ( curChunk.length == 0) { //reload
            if ( bank2CodeCh.length == 0) { //reload
                bank2CodeCh =  getChunks(bank2Reset)
            }
            curChunk=getChunks(bank2CodeCh.shift().replace(/[:]/g, ""))
          }
          curChunk.shift();
          codeOut += bankCodeCh.shift() + (curChunk.length == 0?"":":")
        }      
    }  else if ("dD".indexOf(ch) > -1){  // I'm only implementing d simply for now (w & e are a little more complex)...not sure that its' an actual benefit
        codeOut = codeOut.substring(0,codeOut.length-1)
    }  else if ("czqCZQ".indexOf(ch) > -1){  
          codeOut = doMan(ch,banks,codeOut)
    }  else if ("uU".indexOf(ch) > -1){
        if (galleryContent !== undefined){
          let next =code.substring(i+1, i + 2).toUpperCase()
          if(next == "C"){
            galleryContent = []
            galleryIndex =0
        }
          if(next == "C" || next=="U"){
            //console.log("uU",galleryContent,codeOut)
            galleryContent.push(["u",codeOut])
            codeOut=""
            galleryIndex =galleryContent.length-1
          }
        } 
        i+=1
      } else {
          codeOut += ch
      }
      //console.log(i,getCode(),getCursor())
  }
  //console.log("pp",codeOut)
  return codeOut
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
      pass = false;
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
    //console.log("+bOCanon",bank,pos+1,matchIndex,code.substring(pos+1,matchIndex))
    //let anon= ppfilter(code.substring(pos+1,matchIndex),banks);
    return ({"label":"anon","code":code.substring(pos+1,matchIndex)})
  } 
  return  ({"label":bank,"code":banks[bank.toUpperCase().charCodeAt(0)-65]})
}

function doMan(command,banks,ccode) {
  //console.log("doM",command,ccode)
  if (command.substring(0, 1) == "x") {
      let bank = command.toUpperCase().charCodeAt(1) -65
        if (bank >=0 && bank<banks.length)
          banks[bank] = ccode+""
      ccode = ""
  } else if (command.substring(0, 1) == "v") {
    let bank = command.toUpperCase().charCodeAt(1) -65
      if (bank >=0 && bank<banks.length)
      ccode += banks[bank]
  } else if (command === "{" || command === "["  ) {
      //insert text at counter.
      newText = newText.substring(0, counter) + (command === "{"?"{}":"[]") + newText.substring(counter)
      setCode(newText)
      setCursor(parseInt(counter) + 1)
  } else if (command === "q" || command === "c") {
      ccode =""
      if (command === "q"){
         // banks =Array.from({length:10},()=>"")  oops
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
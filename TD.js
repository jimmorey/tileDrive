// *******************************************
/**
 * This is a cut down TileLand javascript library
 */
// quick and dirty
// Keystroke Commands to implement 
// 0-9 deca, unadeca, tri, square, ..., non
// leave zxv for text manipulation
// rbyopgliek and t  orange purple red blue olive green grey pink 
// <>,. for right left (perhaps keyboard isn't so important')
//
// currently, the collision detection is unverified but it seems
// to work
//--------------------------------------------------
let tempShow  // debug for now.
function TL(width,height,x,y,max){
  this.maxPoly = 2000
  if (max !=undefined) this.maxPoly=max
  this.rt = new RTree()
  var p1 = new Array((-1)/2,0/2)
  var p2 = new Array(p1[0]+1,p1[1])
  this.start = new Rpoly(p2,p1,2,2) // second 2 is "red"
  this.active = this.start.clone() //run takes care of active... so this is just a dumby
  this.cursor = this.active.clone()
  this.stack = []
  // this.width = width   //this doesn't look used...
  //this.height = height //this doesn't look used... except for scale?
  this.width = width
  this.height = height
 
  this.sx = Math.min(width/x,height/y) //it's redundant but...
  this.sy = this.sx
  //this.setScale(width,height,x,y)

  this.scale = 1.0
  this.names = new Array("triangle","square","pentagon","hexagon","heptagon",
                          "octagon","nonagon","decagon","hendecagon","line",
                          "red","blue","yellow","orange","purple","green",
                          "olive","pink","gray","black","transparent",
                          "left","right","cut all","remove last chunk","clear","branch","endbranch","arrowLeft","arrowRight","delete","colourUp","colourDown")
  this.keys = new Array("3","4","5","6","7","8","9","0","1","2",
                        "r","b","y","o","p","g","l","i","a","k","t","<",">","x","z","c","{","}","w","e","d",`"`,"'")
  this.CURS_CHAR = "*"
  this.validCmds = "0123456789rbyopgliaktdcwez<>{}+=:;"+this.CURS_CHAR
  this.TESTDIST = 0.01
}
TL.prototype.setScale= function(width,height,x,y){
  this.width = width
  this.height = height
  this.sx = Math.min(1.0*width/x,1.0*height/y)
  this.sy = this.sx
}

TL.prototype.drawCanvasFit = function(c){
  var ctx = c.getContext("2d")
  var box = RTree.Rectangle.make_MBR(this.rt.get_tree().nodes)
  ctx.save()
  ctx.lineWidth = 0.05
  ctx.clearRect(0, 0, c.width, c.height)
  
  ctx.strokeStyle = "black"
  var hw = Math.max(box.w,box.h)
  var cx=(2*box.x+hw)/2
  var cy=(2*box.y+hw)/2
  ctx.scale(c.width/hw,c.height/hw)
  ctx.translate(-1*box.x,-1*box.y)
  
  var rtpolys = this.rt.get_tree().nodes

  for(var i=0;i<rtpolys.length;i++){
    var thing = rtpolys[i]
    // I'm a little sketchy on the working of rtree but "leaf" seems to be working 
    if (rtpolys[i].leaf != undefined)
       rtpolys[i].leaf.drawSimple(ctx)
  }

  // last polygon
  this.active.drawLive(ctx)
  //this.active.drawOutline(ctx)

  // starting line
  this.start.drawLive(ctx,"brown")
  ctx.restore()
}

TL.prototype.filePoly= function(p){
}
TL.prototype.showPolys = function(c){
  /*
  var ctx = c.getContext("2d")
  ctx.save()
  ctx.lineWidth = 0.05
  ctx.clearRect(0, 0, c.width, c.height)
  
  //var box = RTree.Rectangle.make_MBR(this.rt.get_tree().nodes)
  ctx.strokeStyle = "black"

  ctx.translate(c.width/2, c.height/2)  // put 0,0 in the center of canvas
  ctx.scale(this.sx*this.scale,this.sy*this.scale)
  */
  
  let rtpolys = this.rt.get_tree().nodes
  //rtpolys.sort((a,b)=>(a.leaf.depth-b.leaf.depth)*10000+a.leaf.ref-b.leaf.ref)  //not needed
  rtpolys.sort((a,b)=>(a.leaf.depth-b.leaf.depth))

  //let shortr = rtpolys.map(x=>({ref:x.leaf.ref, depth:x.leaf.depth,sides:x.leaf.sides,colour:x.leaf.colour}))
    //console.log(shortr)

  return rtpolys
}
TL.prototype.drawCanvas = function(c,arrow=true,rainbow=false, thick=1){
  var ctx = c.getContext("2d")
  ctx.save()
  ctx.lineWidth = 0.05
  ctx.clearRect(0, 0, c.width, c.height)
  
  //var box = RTree.Rectangle.make_MBR(this.rt.get_tree().nodes)
  ctx.strokeStyle = "black"

  ctx.translate(c.width/2, c.height/2)  // put 0,0 in the center of canvas
  ctx.scale(this.sx*this.scale,this.sy*this.scale)
  //ctx.rect(box.x,box.y,box.w,box.h)
  //ctx.stroke()
  
  var rtpolys = this.rt.get_tree().nodes

  for(var i=0;i<rtpolys.length;i++){
    var thing = rtpolys[i]
    // I'm a little sketchy on the working of rtree but "leaf" seems to be working 
    if (rtpolys[i].leaf != undefined)
       rtpolys[i].leaf.drawSimple(ctx,arrow,rainbow,thick)
  }

  // starting line
  this.start.drawLive(ctx,"brown")

  // cursor
  if (!(this.cursor.ref == 0 && this.cursor.sides ==2)){
    this.cursor.drawOutline(ctx,"rgba(0,0,0,0.5)")
    this.cursor.drawLive(ctx,"rgba(0,0,0,0.75)")
  } else  if (this.active != null){
    //console.log("active",this.active)
    this.active.drawOutline(ctx,"rgba(0,0,0,0.5)")
    this.active.drawLive(ctx,"rgba(0,0,0,0.75)")
  } 
  if (tempShow != null) {
    drawBound(ctx,tempShow)
  }
  ctx.restore()
}
TL.prototype.drawCanvasAnimate = function(c,rtpolys,highlight=false,arrowOn=true,percent=1){
  var ctx = c.getContext("2d")
  ctx.save()
  ctx.lineWidth = 0.05 
  
  ctx.strokeStyle = "black"
  ctx.globalAlpha = percent  //MAYBE

  ctx.translate(c.width/2, c.height/2)  // put 0,0 in the center of canvas
  ctx.scale(this.sx*this.scale,this.sy*this.scale)
  
  for(var i=0;i<rtpolys.length;i++){
    var thing = rtpolys[i]
    // I'm a little sketchy on the working of rtree but "leaf" seems to be working 
    if (rtpolys[i].leaf != undefined  && rtpolys[i].leaf.sides>2) {
      if (highlight)
        rtpolys[i].leaf.drawHL(ctx,arrowOn)
      else
        rtpolys[i].leaf.drawSimple(ctx,arrowOn)
    }
  }

  ctx.restore()
}

drawBound=function(c,b) {
  c.beginPath();
  c.strokeStyle = 'blue';

  c.moveTo(b.x, b.y);

  c.lineTo(b.x+b.w,b.y);
  c.lineTo(b.x+b.w,b.y+b.h);
  c.lineTo(b.x,    b.y+b.h);
  c.closePath();
  c.fill();
  c.stroke();
}
/* -- canvas -- */
TL.prototype.augmentCanvas = function(c,poly){
  var ctx = c.getContext("2d")
  ctx.save()
  ctx.lineWidth = 0.05
//Sctx.clearRect(0, 0, c.width, c.height)
  
  //var box = RTree.Rectangle.make_MBR(this.rt.get_tree().nodes)
  ctx.strokeStyle = "red"

  ctx.translate(c.width/2, c.height/2)  // put 0,0 in the center of canvas
  ctx.scale(this.sx*this.scale,this.sy*this.scale)
  //ctx.rect(box.x,box.y,box.w,box.h)
  //ctx.stroke()
  poly.drawSimple(ctx)
  ctx.restore()
}
//--------------------------------------------------
TL.prototype.toString = function() {
  return "TL  "+this.start.toStringFull()
}
//--------------------------------------------------

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
nextColour = x=> { try{
  colours[Object.keys(colours)[cProgress[Object.values(colours).indexOf(x)]]]
}catch(error){colours.p}}
previousColour = x=> { try{
  colours[Object.keys(colours)[cRegress[Object.values(colours).indexOf(x)]]]
}catch(error){colours.b}}

TL.prototype.run = function(text,curs) {
  this.active = this.start.clone()
  this.cursor = this.start.clone()
  this.stack = []
  this.stack.push(this.active.make())

  this.rt = new RTree(this.maxPoly)

  this.runOn(text,curs)
}
TL.prototype.runOn = function(text,curs,debug=false) {  // keep consistent with... ****

  for(let i=0;i<text.length;i++){

    if (debug) console.log("runOn", this.active.sides)
    let ch = text.substring(i,i+1)

    if (i==curs) this.cursor = this.active.clone()
    
    if ("3456789012".indexOf(ch)>-1){
         let sides=parseInt(ch)
         if (sides<2) sides +=10
         this.active.depth++

         this.addPoly(sides)
         if (i<text.length+1 && text.substring(i+1,i+2)!="t") // ** FRAGILE!!
           this.addRPoly(this.active)  // the transparent polygon shouldn't erase polygons...  ****
         this.active.ref =i

    } else if (polydat.colourNames.indexOf(ch)>-1){ //"oprblgaiykit"
      this.active.setColIndex(polydat.colourNames.indexOf(ch))
      this.active.ref =i
      this.addRPoly(this.active)// maybe??    
    } else switch(ch){
      case ".":
      case ">":
        this.active.right()
        break
      case "<":
      case ",":
        this.active.left()
        break
      case `"`:
        this.active.setColIndex(polydat.cProgress[this.active.colIndex])
        this.active.ref =i
        this.addRPoly(this.active)// maybe??
        break
      case `'`:
        this.active.setColIndex(polydat.cRegress[this.active.colIndex])
        this.active.ref =i
        this.addRPoly(this.active)// maybe??
        break
      case "{":
        let newa = this.active.clone()
        this.stack.push(newa)
        this.active.branch++
        break
      case "}":
        if (this.stack.length==0) this.active = this.start.clone()
        else this.active = this.stack[this.stack.length-1].clone()
        this.stack.pop()
        break

      default:
    }
  }
}
TL.prototype.check = function(ch) {
  // check if 
  //  * # -- there is space for a new polygon with sides ch 
  //  * rbygplika or if in fron of this polygon with the same shape if there is a colour ch

  //console.log("**",this.active,this.stack)
  if ("3456789012".indexOf(ch)>-1){
    let sides=parseInt(ch)
    if (sides<2) sides +=10
    //console.log("check",ch, this.active)
    let list = this.getCollisionList(sides)
    //console.log("checklist",list)

    if (list.length==0) return true
    return false
  }
  if ("oprblgaiyki".indexOf(ch)>-1){
    //console.log("checkColor",ch, this.active)
    let list = this.getCollisionList(this.active.sides,true)
    //console.log("checklist",list,colours[ch])

    list = list.filter((x)=> x.colour.localeCompare(colours[ch])==0)
    //console.log("result",list.length!=0)

    return list.length!=0
  }
  return false
}
//--------------------------------------------------
TL.prototype.addTest = function(dist) {
  var p1 = new Array((-1)/2, (dist*1.0))
  var p2 = new Array(p1[0]+2, p1[1])
  var junk = new Rpoly(p1,p2,5,colours.r)
  console.log("blah "+junk.toStringFull())
  this.addRPoly(junk)
}
//--------------------------------------------------
TL.prototype.addPoly = function(sides) {
  //this.addRPoly(this.active) //earlier version???
  //if (this.active.sides != 2) this.addRPoly(this.active) //earlier version???
  let branch = this.active.branch
  this.active = this.active.make(sides)
  this.active.branch = branch
}
//--------------------------------------------------
TL.prototype.testPoint = function(x,y){
  let bound = {x:x-this.TESTDIST,y:y-this.TESTDIST,w:2*this.TESTDIST,h:2*this.TESTDIST}
  //tempShow = bound
  //console.log(x,y,bound)
  //console.log(this.rt.search(bound))
  let list = this.rt.search(bound)
  let closestHit = null
  let closestDist = Number.MAX_SAFE_INTEGER
  for (let i=0;i<list.length ;i++){
    if (list[i].collisionPoint(x,y)){  //collision ona point????
      let cen = list[i].center
      let dist = this.distance2(x,y,cen[0],cen[1])
      //console.log("*",list[i].ref,dist,cen,list[i])

      if (dist <closestDist) {
        closestDist = dist
        closestHit = list[i]
      }
    }
  }
  return closestHit
}
TL.prototype.distance2 = function(x,y,w,z){
  return (x-w)^2+(y-z)^2
}

TL.prototype.getCollisionList = function(pol,flip=false) {
  let newPoly = flip?this.active.make2(pol):this.active.make(pol)
  //console.log(pol,flip,newPoly, this.active.make2(pol),this.active.make(pol))
  let bound = newPoly.getBounds()

  let list = this.rt.search(bound)
  if (newPoly.colour != "transparent" && newPoly.sides !=2){
    list = list.filter((x)=> newPoly.collisionTry(x) )
  }
  return list
}
TL.prototype.addRPoly = function(pol) {
  this.active = pol
  let bound = this.active.getBounds()
  
  //console.log(this.rt.search(bound))
  let list = this.rt.search(bound)

  if (this.active.colour != "transparent" && this.active.sides !=2){
    for (let i=0;i<list.length ;i++){
      if (this.active.collisionTry(list[i])){
        this.rt.remove(bound,list[i])
        //console.log("remove "+list[i])
      }
    }
    //console.log("actve " + this.active)
    this.rt.insert(bound,this.active)
  }
}
TL.prototype.getTooltip = function(key){
  return this.names[this.keys.indexOf(key)]
}

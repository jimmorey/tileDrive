
//For code display etc.... NEEDS to be updated....
let spacePat = [
  "[4o4b>][4o4b>][4o4b>][4o4b>]",
  "[4o4o4b>][4o4o4b>][4o4o4b>][4o4o4b>]",
  "[4o>4<4>4b][4o>4<4>4b][4o>4<4>4b][4o>4<4>4b]",
  "[4o4b>4o4b>4o4b<][4o4b>4o4b>4o4b<][4o4b>4o4b>4o4b<][4o4b>4o4b>4o4b<]",
  "[6o4b>][6o4b>][6o4b>][6o4b>]",
  "[3o3o<4b><<][3o3o<4b><<][3o3o<4b><<][3o3o<4b><<]",
  "[4o>4<444b<4o4<4<>>4r][4o>4<444b<4o4<4<>>4r][4o>4<444b<4o4<4<>>4r][4o>4<444b<4o4<4<>>4r]",
  "[4o4b>4o4b>4o4b<][4o4b>4o4b>4o4b<][4o4b>4o4b>4o4b<][4o4b>4o4b>4o4b<]",
  "[4p3434347i3p>7i][4p3434347i3p>7i][4p3434347i3p>7i][4p3434347i3p>7i][4p3434347i3p>7i][4p3434347i3p>7i][4p3434347i3p>7i]",
  "[4p34343453>5i][4p34343453>5i][4p34343453>5i][4p34343453>5i][4p34343453>5i]",
  "[5p5>54i<][5p5>54i<][5p5>54i<][5p5>54i<]",
  "[7i7>7>4p<][7i7>7>4p<][7i7>7>4p<][7i7>7>4p<]",
  "[4o4b>4o4b>4o6b<<][4o4b>4o4b>4o6b<<][4o4b>4o4b>4o6b<<][4o4b>4o4b>4o6b<<][4o4b>4o4b>4o6b<<][4o4b>4o4b>4o6b<<]"
];

// write the document
document.addEventListener("DOMContentLoaded", () => {
  
  //let sv = new tlCodeEl().createSVG(200,200,"55b55") 
  //document.querySelector("main").prepend(sv)
  document.querySelectorAll('.summary').forEach(sum => {
    let curs = sum.getAttribute("data-cur") == "false"?false:true
    let no_colour = sum.getAttribute("data-no-colour") == "true"?false:true
    addCanvas(sum.getAttribute("data-code"), sum, parseInt(sum.getAttribute("data-w")), parseInt(sum.getAttribute("data-h")), sum.getAttribute("data-text"),no_colour,curs)  
  })


  document.querySelectorAll(".test").forEach(el => {  //TEMP
    console.log("TEST",el.getAttribute("data-text"))
    let curs = el.getAttribute("data-cur") == "false"?false:true
    let arrows = el.getAttribute("data-arrow") == "false"?false:true

    let no_colour = el.getAttribute("data-no-colour") == "true"?false:true

    el.append(new tlCodeEl().createSVG(parseInt(el.getAttribute("data-w")), parseInt(el.getAttribute("data-h")) , ppfilter(el.getAttribute("data-text")),no_colour,false,arrows)) 
})

  document.querySelectorAll(".title").forEach(el => {
      // no idea why data-arrow is not working / messes things up.....
      let curs = el.getAttribute("data-cur") == "false"?false:true
      let no_colour = el.getAttribute("data-no-colour") == "true"?false:true
      let arrows = el.getAttribute("data-arrow") === "false"?false:true
      let multi = el.getAttribute("data-multi") == "true"?true:false
      let start = el.getAttribute("data-start") == "true"?true:false

      if (multi){
        let list = el.getAttribute("data-text").split("|")
        list = list.map(x => ppfilter(x))  
        //console.log("LIST",list)
        polys =[]
        new tlCodeEl().addActivePoly(polys,list)
        //console.log("POLYS",polys)
        el.append(new tlCodeEl().createSVGPoly(parseInt(el.getAttribute("data-w")), parseInt(el.getAttribute("data-h")) ,polys,no_colour,curs,false,false,true,0.75)) 
      }else
      el.append(new tlCodeEl().createSVG(parseInt(el.getAttribute("data-w")), parseInt(el.getAttribute("data-h")) , ppfilter(el.getAttribute("data-text")),no_colour,curs,false,false,start)) 
  })

})

function appendList(list, id,w=100,h=100){
  let html = document.getElementById(id)
  //console.log("appendList",list.length)
  if (typeof list[Symbol.iterator] !== 'function') return
  list.forEach(cod =>  {

    let div = document.createElement("div")
    div.classList.add("inline")

    div.append(new tlCodeEl().createSVG(w, h ,String(cod),true,false,true))  
    //console.log("worked")
    html.append(div) 
  })
}
function turn() {
  if (Math.random() > 0.5) return ">";
  return "<";
}
function go(x = 1) {
  //return "44444444444444444444".substring(0,x);
  return x > 0 ? "4".repeat(x) : "";
}
function chooseOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}
function range(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
function addCanvas(text, html, w = 100, h = 100, textshow = null,filled = true,cursor = true) {
  //console.log(w,h)
  if (isNaN(w)) w = 100
  if (isNaN(h)) h = 100

  let div = document.createElement("div")
  div.classList.add("fig")
  //console.log("PATTI",text,"PP",ppfilter(text))

  let title = document.createElement("div")
  let sv = new tlCodeEl().createSVG(w == null ? 100 : w, h == null ? 100 : h, ppfilter(text),filled,cursor) 
  if (text !=="")div.append(sv)
  title.innerHTML = (textshow === null) ? htmlfix(text) : textshow
  div.append(title)
  html.append(div)

  //chunk.drawCanvas();
}
function addCanvas2(text, html, w = 100, h = 100, textshow = null) {
  //console.log(w,h)
  if (isNaN(w)) w = 100
  if (isNaN(h)) h = 100

  let div = document.createElement("div")
  div.classList.add("fig")
  //console.log("PATTI",text,"PP",ppfilter(text))
  let chunk = new tlCodeEl(ppfilter(text), w == null ? 100 : w, h == null ? 100 : h)
  let title = document.createElement("div")

  div.append(chunk.canvas)
  title.innerHTML = (textshow === null) ? htmlfix(text) : textshow
  div.append(title)
  html.append(div)

  chunk.drawCanvas();
}
function htmlfix(arr) {
  let code = "";
  for (let i = 0; i < arr.length; i++) {
    let tmp = arr[i];
    tmp = tmp.replace(/,/g, "<");
    tmp = tmp.replace(/\./g, ">");
    //tmp = tmp.replace(/,/g,"&lt;");
    //tmp = tmp.replace(/\./g,"&gt;");

    //tmp = tmp.replace(/ /g,"&nbsp;");
    code += tmp;
  }

  return code;
}
//---------------------
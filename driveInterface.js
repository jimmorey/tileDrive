//---------------------
// barebones interface for the TileDrive, rpoly, and rtree libraries

// have to revisit Array.from (document...).forEach being necessary...???

let resetDrive = (new URLSearchParams(document.location.search).get("reset") !== null)
//let initDrive = (new URLSearchParams(document.location.search).get("init") )
// will use encodeURIComponent(param) later...
//?init="q4r%20xa%205b%20xb%20%2Ba[vavb]"
//console.log("init",initDrive)

var galleryContent =[
["","4444>34343"],
  ["","xA xB+7[vB 4r> vA xB vA 4o xA] vB"],
  ["",".7l,,,{43443444}{.4344}{..44}{...44}{,,,43,44},,43,443,444"],
  ["","8p{>>>>6b {<4344} >43<44} {<<6>45y} {>>6>45y} 8y"],
  ["","8p{i}.....{5y}.{5y}.{5y}.{5y}.{5y}.{5y}.{5y}.4g44{.33}{,3,3}4"],
  ["","5i{,,5,5,5}.5,{5i{555}.5t,5i.5{.5b},5i{,33,3}.5,i{.5b}5i."],
  ["","4b{,3g33,34y4}4{3r3{3}{,3}}.4.4"]
]
var galleryIndex = 0
var tileLand = new TL(300, 500, 20.0, 20.0)  //revisit at some time....
var huhCanvas //revisit at some time....an old work around.
var cHistory = []
var mult = 1
var listening = true
var banks = []
let lastCursor
let bufferXV = null
let arrowOn = false
let printColour = true
let scrollPos = 0
let rainbowOn = false
let proposedTile = null  //tilePainting...
let touchUpIssue = null

let animate = {
    on: false,
    running: false,
    tempPolyList: null,
    depthList: null,
    index: 0,
    checkSet: function () {
        if (!this.on || this.tempPolyList == null) {
            this.tempPolyList = tileLand.showPolys()
            // create a list with all depths of visible tiles (unique)
            this.depthList = this.tempPolyList.map(x => x.leaf.depth).reduce((a, c) => a.includes(c) ? a : [...a, c], []).sort((x, y) => x - y)
            this.on = true
        }
    },
    snapPercent: function (percent) {
        if (percent != -1) this.index = Math.floor((this.depthList.length+2) * percent / 100)
        return this.index * 100 / (this.depthList.length+2)
    },
    nextIndex: function () {
        if (this.on) {
            this.index++
            if (this.index >= (this.depthList.length+2)) this.on = false
        } else {
            this.checkSet()
            if (!this.running) this.index = 0
        }
        this.running = false
    },
    prevIndex: function () {
        if (this.on) {
            this.index--
            if (this.index < 0) this.on = false
        } else {
            this.checkSet()
            if (!this.running) this.index = this.depthList.length - 1
        }
        this.running = false

    },
    getList: function (index = -1) {
        if (index == -1) index = this.index
        return this.tempPolyList.filter(x => x.leaf.depth == this.depthList[index])
    }
}

var verifyIndex = (string, index) => {
    //console.log(index, index<0?0:index>=string.length?string.length:index)
    return index < 0 ? 0 : index >= string.length ? string.length : index
}

//5r{i}5{g}5{b}55  these are all red....!!! fix
let program = {
    text: "", //+tileLand.CURS_CHAR, 
    cursor: 0,
    setText: function (text) {
        this.text = text
        //this.cursor = verifyIndex(this.text,this.cursor)
    },
    getText: function () {
        return this.text
    },
    setCursor: function (num) {
        this.cursor = verifyIndex(this.text, num)
    },
    getCursor: function () {
        return this.cursor
    },
    treeCode: function (text, cursor = -1, maxLen = 20) {
        //console.log("curs",cursor)
        //cursor = 3
        let res = ""
        //resulting html
        let st = [-1]
        // remember the layers-- its difficult because implicit layers 
        let flip = false
        // is this doing what I want??? 
        let i = 0
        let len = 0
        let depth = 0;
        for (i = 0; i < text.length; i++) {
            len++;
            if (len > 20) {
                res += "<br>"
                len = 0;
            }
            if (i == cursor)
                res += '<span class="cursor">*</span>'
            let c = text.charAt(i)
            if (c === ">")
                c = "&gt;"
            if (c === "<")
                c = "&lt;"

            if (c === "{") {
                ///flip = !flip
                ///if (st[st.length - 1] < 0) {
                ///    st.push(0)
                ///    res += `<div class="branch std ${flip ? 'odd' : 'even'}">`
                //}
                ///len=0
                ///st.push(1)
                len = 0
                depth++
                res += (res.trim().substring(res.length - 4) === "<br>" ? "" : `<br>`) + `${"&nbsp;".repeat(2 * depth)}{`
            } else if (c === "}") {
                if (depth>0) depth--  // in case of bad code

                //let cur = st.pop()
                //let ends = ""
                //while (cur != 1&&st.length!=0) {
                /// let ends = `</div>`
                /// len=0
                /// if (st.length>0) cur = st.pop()
                //}
                //res += (cur == 0) ? ends + "}" : "}" + ends
                res += `}<br>${"&nbsp;".repeat(2 * depth)}` ///+ends

            } else {
                ///if (st[st.length - 1] != -1)
                ///    st.push(-1)
                res += `<span data-index="${i}" class="norm">${c}</span>`
            }
        }
        if (cursor >= text.length) res += '<span class="cursor">*</span>'
        while (st.length > 0) {
            res += `</div>`
            st.pop()
        }
        return res
    },
    dirty: function () {
        return this.treeCode(this.text, this.cursor)
    },
    reset: function () {

    }
}

function resizeCanvas() {
    // const canvas = document.getElementById('myCanvas');
    // const first = document.getElementById('first');
    // canvas.width = first.clientWidth;
    // canvas.height = first.clientHeight;
    huhC = document.getElementById("thecanvas")
    huhC.style.width = '100%'
    huhC.style.height = '100%'
    //huhC.width = huhC.offsetWidth
    //huhC.height = huhC.offsetHeight
    huhC.width = huhC.clientWidth
    huhC.height = huhC.clientHeight
    tileLand.setScale(huhC.width, huhC.height, 20.0, 20.0)
    scaleScreen(document.getElementById("range").value)
    tileLand.drawCanvas(huhC, arrowOn, rainbowOn)
}
function mousedown(eventx,eventy) {
        //remove junk
       // document.getElementById("scratch").textContent +="td "+eventx+" "+eventy+" "
        setCode(properCode(getCode()))
        runCode()

        // Find the point
        let hCanvas = document.getElementById("thecanvas") 
        let fud = 1.0 / (tileLand.sx * tileLand.scale)
        let rect2 = hCanvas.getBoundingClientRect()
       
        let p = [(eventx - rect2.x - rect2.width / 2.0) * fud * (tileLand.width / rect2.width), (eventy - rect2.y - rect2.height / 2.0) * fud * (tileLand.height / rect2.height)]
        let tile = tileLand.testPoint(p[0], p[1])
        // setup
        if (tile!=null) proposedTile = {md:p,tile:tile,newTile:null}
        else if (tileLand.rt.get_tree().nodes.length==0) {//dirty dirty dirty
            proposedTile = {md:p,tile:tileLand.start.clone(),newTile:null}
        }
}
function mousemove(eventx,eventy) {
    //document.getElementById("scratch").textContent +="tm "+eventx+" "+eventy+" "

    if (proposedTile != null){
        // Find the point

        let hCanvas = document.getElementById("thecanvas") 
        let fud = 1.0 / (tileLand.sx * tileLand.scale)
        let rect2 = hCanvas.getBoundingClientRect()
    
        let p = [(eventx - rect2.x - rect2.width / 2.0) * fud * (tileLand.width / rect2.width), (eventy - rect2.y - rect2.height / 2.0) * fud * (tileLand.height / rect2.height)]

        proposedTile.newTile = proposedTile.tile.getNextPaintTile(p)

        // find edge
        tileLand.drawCanvas(huhCanvas, arrowOn)
        let list =[{leaf:proposedTile.newTile.tile}]
        tileLand.drawCanvasAnimate(huhCanvas, list,true, true)
    }
}
function mouseup(eventx,eventy) {
    //document.getElementById("scratch").textContent +="tu "+eventx+" "+eventy+" "

    if (proposedTile != null && proposedTile.newTile != null && proposedTile.newTile.tile.sides != 2) {
        let tile = proposedTile.tile
        if (tile.sides ==2) {
            //setCursor(findLastBranch(tile.ref) + 1)
            if (proposedTile.newTile.side==1)
                runCommand(`${proposedTile.newTile.tile.sides%10}`, true)
            else 
                runCommand(`.${proposedTile.newTile.tile.sides%10}`, true)

        } else {
            //console.log("dragend",proposedTile.newTile.side,proposedTile.newTile.tile.sides)
            let rot = (proposedTile.newTile.side + Math.trunc(proposedTile.tile.sides/2))%proposedTile.tile.sides

            let rot2 = proposedTile.tile.sides-rot

            //proposedTile.newTile.tile.sides%2
            let turn = rot2<rot?",".repeat(rot2):".".repeat(rot)
            if (tile !== null && tile.sides !=2) {
                if (tile.ref >= 0) {
                    setCursor(findLastBranch(tile.ref) + 1)
                    if (isMidpath(tile.ref))
                        runCommand(`{${turn+proposedTile.newTile.tile.sides%10}}`, true)
                    else 
                        runCommand(`${turn+proposedTile.newTile.tile.sides%10}`, true)
                    //setCode(getCode())
                    //console.log("click", tile.ref)
                    runCode()
                }
            }
        }
        sendFocus()
    } else {  //click

        setCode(properCode(getCode()))
        runCode()

        // Find the point
        let hCanvas = document.getElementById("thecanvas") //issues with updates hcanvas huhCanvas??
        let fud = 1.0 / (tileLand.sx * tileLand.scale) //tileLand.scale * 
        let rect2 = hCanvas.getBoundingClientRect()

        let p = [(eventx - rect2.x - rect2.width / 2.0) * fud * (tileLand.width / rect2.width), (eventy - rect2.y - rect2.height / 2.0) * fud * (tileLand.height / rect2.height)]
        let tile = tileLand.testPoint(p[0], p[1])
        if (tile !== null) {
            if (tile.ref >= 0) {
                setCursor(findLastBranch(tile.ref) + 1)
                doManipulation("{")
                runCode()
            }
        }

        sendFocus()
    }
    proposedTile = null;
}

/* start up ------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
    //hide(document.getElementById('first'))
    setupButtons()
    setupBanks()
    updateGallery()
    doTitles()

    //setup buttons response
    huhCanvas = document.getElementById("thecanvas")

    scaleScreen(100)
    tileLand.drawCanvas(huhCanvas, arrowOn, rainbowOn)

    //huhCanvas.addEventListener('resize', resizeCanvas))
    huhCanvas.dispatchEvent(new Event('resize'))
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(document.getElementById('first'));
    const observer2 = new ResizeObserver(resizeCanvas);
    observer.observe(document.getElementById('thecanvas'));


    /* create a paint drag interface */
    /* need a temp cursor for morphing polygon prerelease/commit
        probably changing the code would be too laggy 
        strategically best to first fiddle with the visual with zero effect on code so nothing breaks...*/
    huhCanvas.addEventListener('mousedown', (event) => { mousedown(event.x,event.y) })
    huhCanvas.addEventListener('mousemove', (event) => { mousemove(event.x,event.y)})
    huhCanvas.addEventListener('mouseup', (event) => {  mouseup(event.x,event.y) })

    /* this is a cludge...not sure what's best. */
    huhCanvas.addEventListener('touchstart', (event) => { 
        event.preventDefault()
        touchUpIssue = {x:event.touches[0].clientX,y:event.touches[0].clientY}
        mousedown(touchUpIssue.x,touchUpIssue.y)
    })
    huhCanvas.addEventListener('touchmove', (event) => { 
        event.preventDefault()
        touchUpIssue = {x:event.touches[0].clientX,y:event.touches[0].clientY}
        mousemove(touchUpIssue.x,touchUpIssue.y)
    })
    huhCanvas.addEventListener('touchend', (event) => {  
        event.preventDefault()
        mouseup(touchUpIssue.x,touchUpIssue.y) 
    })

    document.getElementById("ppcode").addEventListener('focusout', () => {
        //console.log("adv focusout")
        let pretty = prettyCode(document.getElementById("ppcode").textContent)
        document.getElementById("ppcode").innerHTML = pretty
        window.localStorage.setItem('advcode', document.getElementById("ppcode").textContent)
    }) 

    document.getElementById("scratch").addEventListener('focusout', () => {
        //console.log("notes focusout")
        window.localStorage.setItem('notescode', document.getElementById("scratch").textContent)
    }) 

    Array.from(document.querySelectorAll('#ppcode, #scratch')).forEach(el => {
        el.addEventListener('focus', () => sendFocus(true)) //flipMode(true)
    })

    document.querySelector("body").addEventListener("keyup", (event) => {
    //huhCanvas.addEventListener("keyup", (event) => {
        //console.log("keyup",event.key)
        if (event.isComposing || event.key === 229) { // 229 is for keyCode so it's probably not needed
            return
        }
        if (listening) {
            let key = event.key

            key = key==="ArrowLeft"?"w":key==="ArrowRight"?"e":key==="Backspace"?"d":key==="Delete"?"d":key

            if (key == "x" || key == "v" || key == "u") {
                //x and v deal with these...
                if (key=="u" && bufferXV =="u"){
                    doManipulation(bufferXV + key, true)
                    bufferXV = null
                } else  bufferXV = key
            } else if (key == "^") {
                document.getElementById("arrowbut").click()
            } else if (key == "~" || key == "`") {
                document.getElementById("rainbowbut").click()
            } else if (key == "@") {
                document.getElementById("animatebut").click()
            } else if (key == "$") {
                document.getElementById("animatestepbut").click()           
            } else if (key == "!") {
                    document.getElementById("exclaim").click()
            } else if (key == "#") {
                document.getElementById("animatebackbut").click()
            } else if (key == "n") {
                document.getElementById("next").click()
            } else if (key == "-" || key == "_") {
                document.getElementById("prev").click()
            } else if (key == "h") {
                document.getElementById("help").click()
            } else if (key == "z") {
                document.getElementById("undo").click()
            } else if (key == "c" && bufferXV == null) {
                document.getElementById("clear").click()
            } else if ("ABCDEFGHIJabcdefghij".indexOf(key) >= 0 && bufferXV != null ) {
                //console.log("!!!",key)
                if (bufferXV =="u" && key == "c"){
                    doManipulation("uc", true)
                    bufferXV = null
                } else {
                    doManipulation(bufferXV + key, true)
                    bufferXV = null
                    fixRun()
                }
            }
            else if ((`${tileLand.validCmds}'".,[`).indexOf(key) >= 0) {
                if ("cewd{[".indexOf(key) >= 0) {
                    doManipulation(key, true)
                    if ("cewd".indexOf(key) >= 0) fixRun()
                } else {
                    runCommand(key, true, "keyup")
                    bufferXV = null
                    fixRun()
                }
            }
        }
    })

    document.getElementById("prev").addEventListener('click', (event) => {
        galleryIndex = (galleryIndex + galleryContent.length - 1) % galleryContent.length
        updateGallery()
    })

    document.getElementById("next").addEventListener('click', (event) => {
        galleryIndex = (galleryIndex + 1) % galleryContent.length
        updateGallery()
        sendFocus()
    })

    document.getElementById("help").addEventListener('click', (event) => {
        mixGallery()
        sendFocus()
    })

    Array.from(document.querySelectorAll("canvas.tlButN, canvas.tlButT")).forEach(b => {
        b.addEventListener('click', (e) => {
            runCommand(e.target.code, true, "But")
            sendFocus()
        })
    })

    Array.from(document.querySelectorAll("button.tlButM")).forEach(b => {
        b.addEventListener('click', (e) => {
            //console.log("!!!what",b.textContent)

            doManipulation(b.textContent, true)
            if (b.textContent.substring(0, 1) == "x") runCode()
            sendFocus()

        })
    })

    Array.from(document.querySelectorAll("canvas.tlButP")).forEach(b => {
        b.addEventListener('click', (e) => {
            //console.log("!!!really",e.target.title)
            doManipulation(e.target.title, true)
            fixRun()
            //runCode()
            sendFocus()

        })
    })

    Array.from(document.querySelectorAll(".choice")).forEach(b => {
        b.addEventListener('click', (e) => {
            let thischoice = e.target
            let currentChoice = document.querySelector(".choice.selected")
            //console.log("cur",currentChoice)
            if (currentChoice?.id == "first") scrollPos = document.body.scrollTop
            // old code from my teaching long ago...
            Array.from(document.querySelectorAll(".choice")).forEach(b2 => b2.classList.remove("selected"))

            thischoice.classList.add("selected")

            Array.from(document.querySelectorAll("main > div")).forEach(el => hide(el) )
            if (thischoice.getAttribute("name")=="third") {
                printColour = !printColour
                let third = document.getElementById(thischoice.getAttribute("name"))
                let rect = document.querySelector("header").getBoundingClientRect()  
                let w = rect.width
                let h = window.innerHeight -rect.height -10
                let div = document.createElement("div") 

                let sv = new tlCodeEl().createSVG(w == null ? 400 : w, h == null ? 400 : h, ppfilter(getCode()),printColour,!printColour) 

                third.innerHTML="";
                div.append(sv)
                third.append(div)
            } else if (thischoice.id == "first")  {
                doucument.body.scrollTop = scrollPos
            }
            show(document.getElementById(thischoice.getAttribute("name")))
            sendFocus()
        })
    })

    document.getElementById("prepro").addEventListener('click', (e) => {
        //preprocessCode2(document.getElementById("ppcode").textContent)
        let arr = banks.map(x => x.text)
        let newCode = ppfilter(document.getElementById("ppcode").textContent.toLowerCase(),arr)

        arr.forEach((x, i) => {
            banks[i].text = x
            banks[i].drawCanvas()
            //console.log("bank", i, x)
        })
        setCode(properCode(newCode))
        fixRun(false)
        sendFocus()
    })

    document.getElementById("sendOver").addEventListener('click', (e) => {
        document.querySelector("#scratch").innerHTML += "<br>" + document.getElementById("ppcode").textContent

        sendFocus()
    })
    document.getElementById("examine").addEventListener('click', (e) => {
        //document.getElementById("ppcode").innerHTML = prettyCode( document.getElementById("dcode").textContent)  

        // **** YIKES  -- to get a "editting feel" for the preprocessor the cursor needs to be current and correspond to the active polygon
        let el = document.getElementById("ppcode")
        el.innerHTML = prettyCode(getCode())
        el.focus({ focusVisible: true })
        let range = document.createRange()
        range.selectNode(el)
        let curRange = getCursor()
        range.setStart(el.childNodes[0], curRange - 1)  // fudgy
        range.setEnd(el.childNodes[0], curRange - 1)    // fudgy
        document.getSelection().removeAllRanges()
        document.getSelection().addRange(range)
    })

    Array.from(document.querySelectorAll("button.sendable")).forEach(b => {
        b.addEventListener('click', (e) => {
            document.querySelector(".choice[name=first]").click()
            pasteLiCode(b.nextElementSibling)
            sendFocus()
        })
    })

    // *** LOCAL STORAGE....
    let firstTime =false
    if (resetDrive) {
        window.localStorage.removeItem('bankcode')
        window.localStorage.removeItem('currentcode')
        window.localStorage.removeItem('advcode')
        window.localStorage.removeItem('notescode')        
        window.localStorage.removeItem('gallerycode')
        firstTime = true
    }
    let tileCode = window.localStorage.getItem('bankcode')
    //console.log("tilecode",tileCode)
    let text = window.localStorage.getItem('currentcode')
    //console.log("tilecode",text)

    let text2 = window.localStorage.getItem('advcode')
    let text3 = window.localStorage.getItem('notescode')
    let gallerycode = window.localStorage.getItem('gallerycode')
    //console.log("advcode",text2)
    if (gallerycode != null) {
        galleryContent = gallerycode.split(/u./).map(x=>["u",x])
        galleryContent.pop()
        galleryIndex = 0
        //console.log("gallery",gallerycode,"X",galleryContent)
        updateGallery()
    }
    if ( text=== undefined|| text == null ){  //qun sounds like a something dated...
        text = "4o5b4o5b4o5b"
        firstTime = true
    }
    //document.getElementById("ppcode").innerHTML = text

    if (tileCode == null )
        tileCode = ""
    // if (initDrive != null){
    //     //console.log("init",initDrive) probably going to turf initDrive
    //     setCode(initDrive )
    //     fixRun(false)
    //     runCode()
    //     updateGallery()
    //else if (tileCode != null) {
        setCode(tileCode+text)
        fixRun(false)
    // } else {
    //     setCode('4t>>4>444464>4r444>34343>4t3<43<4<444<64b<4>333t4>>4444o<4<6>>>4t>44<64<5g<5>>5<<5>5<<5')
    //     runCode()
    // }
    document.getElementById("ppcode").textContent= text2
    document.getElementById("scratch").textContent = text3

    // ********!!!!  trigger choices?
    if (firstTime)   hide(document.getElementById('first'))
    else {
       //hide(document.getElementById('second'))
       document.querySelectorAll('.choice[name="first"')[0].click();
    }


})

function doTitles() {
    document.querySelectorAll(".title").forEach(el => {
        el.append(new tlCodeEl().createSVG(parseInt(el.getAttribute("data-w")), parseInt(el.getAttribute("data-h")) , el.getAttribute("data-text"),true,false)) 
    })
}
function flipMode(notListen=false) {
    listening = !notListen
    if (listening) {
        document.querySelector("body").classList.add("activeKeys")
        sendFocus();
    } else
        document.querySelector("body").classList.remove("activeKeys")
}
function sendFocus(notListen=false) {
    listening = !notListen
    if (listening) {
        document.querySelector("body").classList.add("activeKeys")
        huhCanvas.focus()//sendFocus();
        // save advcode here?
        // work around for IOS --my iPad
        //document.querySelector("dcode").touchstart()
        document.querySelector("#dcode").click()

    } else
        document.querySelector("body").classList.remove("activeKeys")
    //huhCanvas.focus()
}
function getCode() {
    return program.getText()
}
function setCode(text, tree = true) {
    program.setText(text)
    if (tree) createTree(text)
}
function chkCursor() {
    if (lastCursor != getCursor())
        runCode()
}
function getCursor() {
    let chk = program.getCursor()
    lastCursor = chk

    return chk
}
function setCursor(num) {
    program.setCursor(num)
}
function runCommand(text, updateH = false, orig = "noorig") {  // runCommand and DoManipulation trigger a cHistory....?
    let counter = getCursor()
    let newText = getCode()
    if (updateH) {
        cHistory.push([counter, newText])
    }
    //insert text at counter.
    newText = newText.substring(0, counter) + text + newText.substring(counter)
    setCode(ppfilter(newText, banks.map(x => x.text)))

    if (text[0] == '{')   setCursor(parseInt(counter) + text.length-1)   //ugly but works....  this is for tilePainting
    else setCursor(parseInt(counter) + text.length)

    fixRun()
}

function pasteLiCode(comp) {
    var text = comp.textContent
    document.getElementById("ppcode").innerHTML = prettyCode(text)
    setCode(text)
    fixRun(false)
}
function doManipulation(command, updateH = false) {  //not reached...
    //manipulate text....
    var counter = getCursor()
    var newText = getCode()
    if (command === "z") {// need to look into UNDO -- interaction stack...
        if (cHistory.length > 0) {
            const [coun, newT] = cHistory.pop()
            //cHistory = cHistory.slice(0,cHistory.length-2)

            setCursor(coun)
            setCode(newT)
            runCode()
            return
        }
    }
    if (updateH) {
        cHistory.push([counter, newText])
    }
    if (command.substring(0, 1) == "x") {
        let bank = command.toUpperCase().charCodeAt(1) - 65

        if ((getCode() + "").length != 0) {
            let textCut = properCode(getCode())
            setCode("")
            setCursor(0)

            banks[bank].text = textCut;  //??
            banks[bank].drawCanvas()
        }
    } else if (command.substring(0, 1) == "v") {
        let bank = command.toUpperCase().charCodeAt(1) - 65
        let aug = banks[bank].text
        let updateCursor =         getCode().length-getCursor()
        //console.log("v",aug)
        runCommand(aug, true,"vMan")
        setCursor(getCode().length-updateCursor)
    } else if (command.substring(0, 1) == "u") {
        let next = command.substring(1, 2)
        if(next == "c"){
            galleryContent = []
            galleryIndex =0
        }
        if (next == "u" || next=="c"){
           galleryContent.push(["u",properCode(getCode())])

           galleryIndex =galleryContent.length-1
            setCode("")
            setCursor(0)
            runCode()
           updateGallery()
        } 
    } else if (command === "{" || command === "[") {
        //insert text at counter.
        newText = newText.substring(0, counter) + (command === "{" ? "{}" : "[]") + newText.substring(counter)
        //setCode(newText)
        setCursor(parseInt(counter) + 1)
        setCode(newText)
    } else if (command === "q" || command === "c") {
        setCode("")
        setCursor(1)
        //tileLand.cursor = tileLand.active.clone()  // think about this
        if (command === "q") {  // disabled... too dangerous!!
            //cHistory = []
            //resetBanks()
        }
        runCode()
    } else if (command === "w" || command === "e") {
        setCursor(getCursor() + (command === "w" ? -1 : 1))
        setCode(getCode())
        runCode()
    } else if (command === "d") { //this is garbage!! fix it
        let del = newText.substring(counter - 1, counter)
        if (del == "{") {
            notdone = 1
            count = counter
            counter++

            while (notdone > 0 && counter < newText.length) {
                del = newText.substring(counter - 1, counter)

                if (del == "{") notdone++
                if (del == "}") notdone--

                counter++
            }
            newText = newText.substring(0, count - 1) + newText.substring(counter - 1)

        } else if (del == "}") {
            notdone = 1
            count = counter
            counter--

            while (notdone > 0 && counter > 0) {
                del = newText.substring(counter - 1, counter)

                if (del === "{") notdone--
                if (del === "}") notdone++

                counter--
            }
            newText = newText.substring(0, counter) + newText.substring(count)

        } else {
            newText = newText.substring(0, counter - 1) + newText.substring(counter)
        }
        setCursor(getCursor() - 1)
        setCode(newText)
        runCode()
    }
}
function properCode(c) {
    // no CAPs and replace ., for <>

    let code = c.replace(/\./g, ">")
    //make it better for keyboard --no shifting required
    code = code.replace(/\,/g, "<")
    code = code.replace(/\<\>/g, "")
    code = code.replace(/\>\</g, "")

    // code = code.replace(/\[/g, "{")
    // code = code.replace(/\]/g, "}")
    code = code.replace(/\{\}/g, "")
    //code = code.toLowerCase()
    return code
}
function properHtml(c) {
    // no CAPs and replace ., for <>
    let code = c.replace(/\>/g, "&gt;")
    //make it better for keyboard --no shifting required
    code = code.replace(/\</g, "&lt;")
    return code
}

function fixRunOld(leaveCursor = true) { // need to dump this and use ppfilter??
    // massage and run preprocessor code
    var counter = getCursor()
    let code = getCode()

    code = properCode(code)
    setCode("", false)
    for (let i = 0; i < code.length; i++) {
        var ch = code.substring(i, i + 1)
        if ("xv".indexOf(ch) > -1) {
            doManipulation(code.substring(i, i + 2))
            i++
        } else if ("fF".indexOf(ch) > -1){  //  Free from :???
            let bank = code.substring(i+1, i + 2).toUpperCase().charCodeAt(0) -65
            let bank2 = code.substring(i+2, i + 3).toUpperCase().charCodeAt(0) -65
            let bankCode =  getChunks(banks[bank].text.replace(/[:]/g, ""))
            let bank2Code =  getChunks(banks[bank2].text)
    
            //console.log("Format",bank,bank2,bankCode,bank2Code)
            codeOut = ""
            let curChunk=[]
            while (bankCode.length > 0) {
              if ( curChunk.length == 0) { //reload
                if ( bank2Code.length == 0) { //reload
                    bank2Code =  getChunks(banks[bank2].text)
                }
                curChunk=getChunks(bank2Code.shift().replace(/[:]/g, ""))
              }
              curChunk.shift();
              codeOut += bankCode.shift() + (curChunk.length == 0?"":":")
            }

            let updateCursor = getCursor() + codeOut.length
            runCommand(codeOut, "vMan")
            setCursor(updateCursor)
            i+=2         
        } else if ("mM".indexOf(ch) > -1){  //  the new MIX command does this work?? in immediate mode???
            let bank = code.substring(i+1, i + 2).toUpperCase().charCodeAt(0) -65
            let bank2 = code.substring(i+2, i + 3).toUpperCase().charCodeAt(0) -65
            //get string for each bank...
            //console.log("MIX",bank,bank2,code.substring(i+1, i + 2),code.substring(i+2, i + 3))
    
            let bankCode =  getChunks(banks[bank].text)
            let bank2Code =  getChunks(banks[bank2].text)
    
            //console.log("MIX",bank,bank2,bankCode,bank2Code)
            codeOut = ""
            while (bankCode.length > 0) {
              codeOut += bankCode.shift()
              if ( bank2Code.length == 0) bank2Code =  getChunks(banks[bank2].text)
              codeOut += bank2Code.shift()
            }
            // while (bankCode.length > 0 ) {
            //   codeOut += bankCode.shift()
            // }        
            // // while (bank2Code.length > 0) {
            //   codeOut += bank2Code.shift()
            // }
            //****** ugly as sin */
            let updateCursor = getCursor() + codeOut.length
            runCommand(codeOut, "vMan")
            setCursor(updateCursor)
            i+=2         
        } else if ("+=".indexOf(ch) > -1) {
            let bank = code.substring(i + 2, i + 3)

            let crep = code.toUpperCase().charCodeAt(i + 1)
            let rep = parseInt(code.substring(i + 1, i + 2))
            if (crep > 64 && crep < 91)
                rep = crep - 55
            for (let jj = 0; jj < rep; jj++)     doManipulation("v" + bank)
            i += 2
        } else if ("czq".indexOf(ch) > -1)
            doManipulation(ch)
        else if ((`[]'"` + tileLand.validCmds).indexOf(ch) > -1) {
            setCode(getCode() + ch, false)
            setCursor(getCode().length)
        }
    }
    if (leaveCursor) setCursor(parseInt(counter))

    setCode(getCode())
    runCode()
}

function fixRun(leaveCursor = true) {
    // massage and run preprocessor code
    
    if (leaveCursor) {
        fixRunOld(true)
        return
    } 
    let newCode = "{4t.4{84r,44.33}4r,44.33}3{3}<434{>4}3433"
    let code = ""
    let mess =0
    try {
        code = getCode()
        
        let textBanks = banks.map(x=>x.text)
        newCode = ppfilter(code,textBanks)
        //console.log("Huh",textBanks)
        //update banks
        textBanks.forEach((x,i)=>{
            banks[i].text = x;  //??
            mess=i
            if (!x.indexOf("["[0])>-1)banks[i].drawCanvas()
        })
    } catch (e){
        console.log("bad code!",mess,":",code,e)
    }
    //setCursor(newCode.length)
    if (/[uU][uUcC]/.test(code)) {
        updateGallery()
    }
    setCode(newCode)
    setCursor(newCode.length)
    runCode()
}
//--------------------------------------------------------
function findLastBranch(cursor) {
    let code = getCode()
    let curs = cursor + 1
    let search = code.substring(curs, curs + 1)
    while (search == "{") {
        notdone = 1
        curs++

        while (notdone > 0 && curs < code.length) {
            search = code.substring(curs, curs + 1)
            if (search == "{") notdone++
            if (search == "}") notdone--

            curs++
        }
        search = code.substring(curs, curs + 1)
    }

    return curs - 1
}

function isMidpath(ref){  //Are these the only cases?
    let code = getCode()
    if (code.length == ref +1) return false

    return code.substring(ref+1, ref + 2) != "}" 
}
function removeLast(input) {
    if (input === "")
        return ""
    var inpu = input.substring(0, input.length - 1)
    if (input[input.length - 1] != "]")
        return inpu
    return removeLevel(inpu)
}
function removeLevel(input) {
    if (input === "")
        return "*"
    var inpu = input.substring(0, input.length - 1)
    if (input[input.length - 1] === "[")
        return inpu
    if (input[input.length - 1] === "]")
        inpu = removeLevel(inpu)
    return removeLevel(inpu)
}
function totalSave() {
    var out = "q"
    //add all the clips
    for (let i = 0; i < banks.length; i++) {
        out = out + banks[i].text + "x" + String.fromCharCode(65 + i);
    }
    return out //+ getCode() redundant
}
function runCode() {
    animate.on = false
    tileLand.run(getCode(), getCursor())
    tileLand.drawCanvas(huhCanvas, arrowOn, rainbowOn)
    setCursor(getCursor())

     // fix this up for efficiency later  OOPS!
    window.localStorage.setItem('bankcode', totalSave())
    window.localStorage.setItem('currentcode', getCode())
    //window.localStorage.setItem('advcode', document.getElementById("ppcode").textContent)
    //console.log("advcode",document.getElementById("ppcode").textContent)
    //window.localStorage.setItem('notescode', document.getElementById("scratch").textContent)
    let test = galleryContent.filter(y=> y[1]!=null).map((x,i)=>x[1]+(i==0?'uc':'uu')).join("")
    window.localStorage.setItem('gallerycode', test)
    //console.log("gallery",test)
}
// ---------------------------------------------------
function setupButtons() {
    let newDiv = document.createElement('div')
    newDiv.classList.add("border")
    newDiv.classList.add("buttons")
    document.getElementById("buttons").prepend(newDiv)

    addCanvasPolyBut("3", "N", newDiv)
    addCanvasPolyBut("4", "N", newDiv)
    addCanvasPolyBut("5", "N", newDiv)
    newDiv.append(document.createElement("br"))
    addCanvasPolyBut("6", "N", newDiv)
    addCanvasPolyBut("7", "N", newDiv)
    addCanvasPolyBut("8", "N", newDiv)

    newDiv.append(document.createElement("br"))
    addCanvasPolyBut("<", "T", newDiv)
    addCanvasPolyBut(">", "T", newDiv)
    let but = document.createElement("button")
    but.classList.add("tlButM")
    but.classList.add("big")
    but.setAttribute("title", "branch")
    but.textContent = "{"
    newDiv.append(but)

    newDiv.append(document.createElement("br"))
    addCanvasPolyBut("r", "T", newDiv)
    addCanvasPolyBut("y", "T", newDiv)
    addCanvasPolyBut("b", "T", newDiv)
    newDiv.append(document.createElement("br"))
    addCanvasPolyBut("o", "T", newDiv)
    addCanvasPolyBut("g", "T", newDiv)
    addCanvasPolyBut("p", "T", newDiv)
    newDiv.append(document.createElement("br"))
    addCanvasPolyBut("l", "T", newDiv)
    addCanvasPolyBut("i", "T", newDiv)
    addCanvasPolyBut("t", "T", newDiv)
    newDiv.append(document.createElement("br"))
    addCanvasPolyBut("'", "T", newDiv)
    addCanvasPolyBut(`"`, "T", newDiv)
    // animation...

    but = document.createElement("button")

    but.setAttribute("title", "animate")
    but.textContent = "@"
    but.id = "animatebut"

    document.getElementById("canvasControl").append(but)
    but.addEventListener("click", (event) => {
        let rtpolys = tileLand.showPolys()

        animator()
        sendFocus()
    })

    but = document.createElement("button")

    but.setAttribute("title", "animate step")
    but.textContent = "#"
    but.id = "animatebackbut"

    document.getElementById("canvasControl").append(but)
    but.addEventListener("click", (event) => {
        animateStep(false)
    })

    but = document.createElement("button")

    but.setAttribute("title", "animate step")
    but.textContent = "$"
    but.id = "animatestepbut"

    document.getElementById("canvasControl").append(but)
    but.addEventListener("click", (event) => {
        animateStep(true)
    })

    but = document.createElement("button")
    but.setAttribute("title", "arrows")
    but.textContent = "^"
    but.id = "arrowbut"
    if (arrowOn) but.classList.add("selected")
    document.getElementById("canvasControl").prepend(but)

    but.addEventListener("click", (event) => {

        arrowOn = !arrowOn
        let but = document.getElementById("arrowbut")  // this is not the way...but
        if (arrowOn)
            but.classList.add("selected")
        else
            but.classList.remove("selected")

        //tileLand.drawCanvas(huhCanvas,arrowOn)
        runCode();
        sendFocus()
    })

    but = document.createElement("button")
    but.setAttribute("title", "rainbow")
    but.textContent = "~"
    but.id = "rainbowbut"
    if (rainbowOn) but.classList.add("selected")
    document.getElementById("canvasControl").prepend(but)

    but.addEventListener("click", (event) => {

        rainbowOn = !rainbowOn
        let but = document.getElementById("rainbowbut")  // this is not the way...but
        if (rainbowOn)
            but.classList.add("selected")
        else
            but.classList.remove("selected")

        //tileLand.drawCanvas(huhCanvas,arrowOn)
        runCode();
        sendFocus()
    })
}

function scaleAni(percent = -1,stop=false) {
    if (stop) animate.running = false
    animate.checkSet()
    let newpercent = animate.snapPercent(percent)
    document.getElementById('rangeAni').value = newpercent

    //reset 
    document.getElementById('dcode').querySelectorAll("span.codeHL").forEach(el => el?.classList?.remove("codeHL"))
    tileLand.drawCanvas(huhCanvas, arrowOn)
    let list = animate.getList()

    hlCode(list.map(x => x.leaf.ref), false, "codeHL")
    tileLand.drawCanvasAnimate(huhCanvas, list, true)
    if (animate.index>1){
        let list2 = animate.getList(animate.index-1)
        tileLand.drawCanvasAnimate(huhCanvas, list2, true,true,0.5)
    }
    if (animate.index>2){
        let list2 = animate.getList(animate.index-2)
        tileLand.drawCanvasAnimate(huhCanvas, list2, true,true,0.25)
    }
}
function animateStep(forward = true) {

    if (forward) animate.nextIndex()
    else animate.prevIndex()

    scaleAni()
}

function animator(count = 0) {
    if (count == 0) {
        animate.on = false
        animate.running = true
    }

    animate.checkSet()
    if (animate.running && count <= animate.depthList.length+2) {

        animate.index = count;
        scaleAni()
        setTimeout(function () { animator(count + 1) }, 75)
    } else animate.running = false
}
function hlCode(indices, remove, className) {
    if (remove) {
        indices.forEach(index => {
            (document.getElementById('dcode').querySelector(`[data-index="${index}"]`))?.classList?.remove(className)
        })
        return
    }
    indices.forEach(index => {
        //let el = document.getElementById('dcode').querySelector(`[data-index='${index}']`)
        document.getElementById('dcode').querySelector(`[data-index="${index}"]`)?.classList?.add(className)
    })

}

function resetBanks() {
    for (let i = 0; i < 10; i++) {
        setBank(i, "2")
    }
}
function setupBanks() {
    for (let i = 0; i < 10; i++) {
        let newDiv = document.createElement('div')
        let label = String.fromCharCode(65 + i)
        newDiv.classList.add("border")
        newDiv.classList.add("down")
        document.getElementById("banks").append(newDiv)

        //banks[i] = addCanvasPolyBut(galleryContent[i % galleryContent.length][1], "P", newDiv, 50, 50, "v" + label)   // ?? just throwing in junk

        banks[i] = addCanvasPolyBut("", "P", newDiv, 50, 50, "v" + label)   // ?? just throwing in junk
        let but = document.createElement("button")
        but.classList.add("tlButM")
        but.setAttribute("title", `x${label}`)
        but.innerHTML = prettyCode("x" + label)
        newDiv.append(but)
        // $(newDiv).append(`<button class="tlButM" title="x${i}">${prettyCode("x" + i)}</button>`)
    }
}
function setBank(i, text) {
    banks[i].text = ""

    banks[i].drawCanvas()
}
function addCanvasPolyBut(cmd, type, div, hsize = 40, vsize = 30, text = "null") {
    if (type === "T")
        vsize = 20
    var chunk = new tlCodeEl(cmd, hsize, vsize)
    div.append(chunk.canvas)
    chunk.canvas.classList.add("tlBut" + type)
    chunk.canvas.title = text == "null" ? tileLand.getTooltip(cmd) : text
    chunk.canvas.code = cmd
    // necessary .text...?block
    chunk.canvas.tlCodeEl = chunk
    // is this really the way to do it?
    chunk.drawCommand()
    return chunk
}
// ---------------------------------------------------
function toggleFooter() {
    let foot = document.querySelector("#footer")
    foot.style.visibility = (foot.style.visibility == "hidden") ? "visible" : "hidden"
    if (foot.style.visibility == "hidden") foot.classList.add('hidden')
    else foot.classList.remove('hidden')
    sendFocus()
}
function scaleScreen(percent) {  //hmmmm
    // make it a logorithmic scaling
    tileLand.scale = Math.exp(percent / 50) / 4
    tileLand.drawCanvas(huhCanvas, arrowOn, rainbowOn)
}
function updateGallery() {
    let gal = document.getElementById("gallery")
    gal.innerHTML = ""
    let item = galleryContent[galleryIndex]
    //let chunk = new tlCodeEl(ppfilter(text),w==null?100:w,h==null?100:h)
    let text = ppfilter(item[1])
    document.getElementById("gname").innerHTML = `: ${text.length}`

    let chunk = new tlCodeEl(text, 80, 80)
    gal.prepend(chunk.canvas)
    chunk.drawCanvas()
}
function mixGallery() {
    let item = galleryContent[galleryIndex]
    let text = ppfilter(item[1])
    let mixTileLand = new TL(50, 50, 2, 2, text.length)
    //let tileLand = new TL(this.width, this.height, this.width, this.height, text.length)
    mixTileLand.run(text)
    mixPolys = mixTileLand.showPolys()
    tileLand.drawCanvas(huhCanvas, arrowOn, rainbowOn)
    tileLand.drawCanvasAnimate(huhCanvas, mixPolys, true)
}
//---------------------
function prettyCode(text,b =banks.map(x => x.text)) {

    let html = ""
    text = properHtml(properCode(text))

    for (let i = 0; i < text.length; i++) {
        html +=  text.substring(i, i + 1)
        if ("xvXV".indexOf(text.substring(i, i + 1))> -1){
            html +=  "<sub>" + text.substring(i + 1, i + 2).toUpperCase() + "</sub>"
            if ("xX".indexOf(text.substring(i, i + 1))> -1)
                html += "<br>"
            i++
        } else if ("mMfF".indexOf(text.substring(i, i + 1))> -1) {
            //console.log("mmFF",i,text.substring(i, i + 1))
            for(let j=0;j<2;j++){
                let bOrCode = getBankOrCode(text,i+1,b)
                //console.log("b|c",bOrCode)

                if (bOrCode.label == "anon") {
                    html +=  "["+prettyCode(bOrCode.code,b)+"]"
                    i+=bOrCode.code.length+2
                } else {
                    html +=  "<sub>" +  bOrCode.label.toUpperCase() +"</sub>"
                    i++
                }
            }
        }  else if ("+".indexOf(text.substring(i, i + 1))> -1) {
            //console.log("+",i,text.substring(i, i + 1))
            html += text.substring(i + 1, i + 2).toLowerCase()
            i++
            let bOrCode = getBankOrCode(text,i+1,b)
            //console.log("b|c",bOrCode)

            if (bOrCode.label == "anon") {
                html +=  "["+prettyCode(bOrCode.code,b)+"]"
                i+=bOrCode.code.length+2
            } else {
                html +=  "<sub>" +  bOrCode.label.toUpperCase() +"</sub>"
                i++
            }
        }
    }
    return html
}
// ---------------------------------------------------
function createTree(text) {
    let decode = document.getElementById("dcode")
    let decodeLen = document.getElementById("dcodeLen")

    dcode.innerHTML = ""

    //progCount = 0
    dcode.innerHTML = program.treeCode(text, getCursor())
    let thing = dcode.querySelector("span.cursor")
    dcode.scrollTo(0, (thing.offsetTop < dcode.clientHeight) ? 0 : thing.offsetTop - dcode.clientHeight)
    //$("#dcode").append(`<p>${$("#dcode").text()}</p>`);  //looks right
    decodeLen.innerHTML = text.length
}

// ---------------------------------------------------
// Show an element
var show = function (elem) {
    //oops
    elem.style.display = 'flex'
}

// Hide an element
var hide = function (elem) {
    elem.style.display = 'none'
}

// Toggle element visibility
var toggle = function (elem) {
    // If the element is visible, hide it
    if (window.getComputedStyle(elem).display !== 'none') {
        hide(elem)
        return
    }
    // Otherwise, show it
    show(elem)
}
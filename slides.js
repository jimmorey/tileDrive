"use strict"
/* from https://singaporecss.github.io/talk.css/ */

var controls = function controls(event) {
  var isCover = window.location.hash === '' || window.location.hash === '#start'

  if (isCover) {
    start(event)
  } else {
    navigate(event)
  }
}

var start = function start(event) {
  if (event.code === 'Space' || event.code === 'ArrowRight' || event.code === 'Period') {
    window.location.hash = '#slide1'
  }
}

var navigate = function navigate(event) {
  var isFirstSlide = window.location.hash === '#slide1'
  var isLastSlide = window.location.hash === '#slide' + (slideCount)
  var activeSlide = document.querySelector('[id^="slide"]:target')
  var slideNum = parseInt(activeSlide.getAttribute('id').substring(5))

  if (activeSlide && !isLastSlide && (event.code === 'Space' || event.code === 'ArrowRight' || event.code === 'PageDown')) {
    window.location.hash = 'slide' + (slideNum + 1)
  }

  if (!isFirstSlide && (event.code === 'ArrowLeft' || event.code === 'PageUp')) {
    window.location.hash = 'slide' + (slideNum - 1)
  }

  if (isLastSlide && event.code === 'KeyR') {
    window.location.hash = '#start'
  }

  if (activeSlide && event.code === 'Period') {
    var winHash = window.location.hash
    var activeList = document.querySelector(winHash + ' .revealable')

    if (activeList) {
      var listArray = _toConsumableArray(document.querySelectorAll(winHash + ' .revealable .fragment'))

      if (listArray[0]) {
        listArray[0].classList.remove('fragment')
      }
    }
  }

  if (activeSlide && event.code === 'Comma') {
    var _winHash = window.location.hash

    var _activeList = document.querySelector(_winHash + ' .revealable')

    if (_activeList) {
      var _listArray = _toConsumableArray(document.querySelectorAll(_winHash + ' .revealable li'))

      var hideList = _listArray.forEach(function (list) {
        list.classList.add('fragment')
      })

      return hideList
    }
  }
}


var launchFullscreen = function launchFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  }
}

var toggleFullScreen = function toggleFullScreen(event) {
  if (event.code === 'KeyF') {
    launchFullscreen(document.documentElement)
  }
}

var slideCount =0
window.onload = function() {
  let slides = document.querySelectorAll('section')
  slideCount = slides.length

  slides.forEach( (x,i) => {
      x.id = "slide" + (i+1)
  })
  document.body.addEventListener('keydown', controls, false)
  document.addEventListener('keydown', toggleFullScreen, false)

  // Add rainbow colours to elements with class 'rainbow'
  document.querySelectorAll(".rainbow").forEach( x => {
      x.innerHTML = x.innerHTML.split("").map(ch => `<span>${ch}</span>`).join("")
  })
}

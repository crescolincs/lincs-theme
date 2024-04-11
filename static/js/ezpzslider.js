var button = document.getElementById("next");
button.onclick = function () {
  var container = document.getElementById("ezpzwrap");
  sideScroll(container, "right", 50, container.clientWidth, 100);
};

var back = document.getElementById("prev");
back.onclick = function () {
  var container = document.getElementById("ezpzwrap");
  sideScroll(container, "left", 50, container.clientWidth, 100);
};

function sideScroll(element, direction, speed, distance, step) {
  scrollAmount = 0;
  var slideTimer = setInterval(function () {
    if (direction == "left") {
      element.scrollLeft -= step;
    } else {
      element.scrollLeft += step;
    }
    scrollAmount += step;
    if (scrollAmount >= distance) {
      window.clearInterval(slideTimer);
    }
  }, speed);
}
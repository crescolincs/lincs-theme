/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function dodd() { //dodd: do dropdown
    document.getElementById("sector-dropdown").classList.toggle("show");
  }
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropdown')) {
      var dropdowns = document.getElementsByClassName("dropdown-menu");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

  //
  function openmm(){mobnav = document.getElementById("navbarSupportedContent");
  mobnav.classList.toggle("show");
  mobnav.toggleAttribute("open");
}

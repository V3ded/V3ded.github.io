//Who hates Javascript? I sure do!
function SetLightIcon() {
    document.getElementById("themeTglCls").classList.remove("fa-moon-o");
    document.getElementById("themeTglCls").classList.add("fa-lightbulb-o");
  }

  function SetDarkIcon() {
    document.getElementById("themeTglCls").classList.remove("fa-lightbulb-o");
    document.getElementById("themeTglCls").classList.add("fa-moon-o");
  }

  function SetLightTheme() {
    document.body.classList.remove("lightModeTgl");
    document.body.classList.add("darkModeTgl");
  }

  function SetDarkTheme() {
    document.body.classList.remove("darkModeTgl");
    document.body.classList.add("lightModeTgl");
  }

  function DisqusRefresh() { //Ajax to refresh Disqus
    if(document.getElementById("disqus_thread")) {
      reset();
    }
  }
  
  function SetDark() {
    SetDarkTheme();
    SetDarkIcon();

    DisqusRefresh(); 
  }

  function SetLight() {
    SetLightTheme();
    SetLightIcon();

    DisqusRefresh();
  }

  function ToggleThemeOnLoad() { //This could be placed into window.onload, but it produces some ugly graphical artifacts.
    currentTheme = localStorage.getItem("theme");

    if(!currentTheme) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        SetLight();
      }
      else { 
        SetDark();
      }
    }
    else {
      if (currentTheme == "dark") {
        SetLight();
      }
      else if (currentTheme == "light") {
        SetDark();
      }
    }
  }
ToggleThemeOnLoad();

function ToggleTheme() {
  if(document.body.classList.contains("darkModeTgl")) {
    SetDark();

    localStorage.setItem("theme", "light");
  }
  else { 
    SetLight();

    localStorage.setItem("theme", "dark");
  }
}
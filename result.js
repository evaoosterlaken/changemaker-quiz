$(document).ready(function () {
  //Replace with local storage data
  let personaNames = localStorage.getItem("personaNames").split(",");
  let personaPercentages = localStorage
    .getItem("personaPercentages")
    .split(",");
  let thisPage = document.title.toLowerCase();

  //if page is not first match, change the local arrays so tat the content matches
  if (personaNames[0] !== thisPage) {
    //Find and remove this Page
    for (let i = 1; i < personaNames.length; i++) {
      if (personaNames[i] === thisPage) {
        personaNames.splice(i, 1);
        var thisPercentage = personaPercentages.splice(i, 1);
      }
    }
    personaNames.unshift(thisPage);
    personaPercentages.unshift(thisPercentage[0]);
  }

  document.getElementById("match-label").innerHTML =
    personaPercentages[0] + "% match";

  document.getElementById("next-match-1-name").innerHTML = personaNames[1];
  document.getElementById("next-match-1-percent").innerHTML =
    personaPercentages[1] + "%";
  document.getElementById("next-match-1-fill").style.width =
    personaPercentages[1] + "%";
  document.getElementById("first-match").href = personaNames[1];

  document.getElementById("next-match-2-name").innerHTML = personaNames[2];
  document.getElementById("next-match-2-percent").innerHTML =
    personaPercentages[2] + "%";
  document.getElementById("next-match-2-fill").style.width =
    personaPercentages[2] + "%";
  document.getElementById("second-match").href = personaNames[2];

  //change language to Dutch
  let isDutch = localStorage.getItem("isDutch");

  if (isDutch === "true") {
    //Change the language to Dutch
    document.getElementById("quiz-result-header").innerHTML = "Jij bent de";
    document.getElementById("matches-header").innerHTML =
      "Je matcht ook met de...";
    document.getElementById("button-retake").innerHTML = "Doe de test opnieuw";
    document.getElementById("read-more").innerHTML = "Lees verder";
    document.getElementById("lang-selector").innerHTML = "English";

    //change redirect link
    document.getElementById("button-retake").href = "/changemakers/nl/quiz";

    //change richt Text block
    let dutchRichText = document.getElementsByClassName(
      "changemaker-rich-text-dutch"
    )[0].innerHTML;
    document.getElementsByClassName(
      "changemaker-rich-text"
    )[0].innerHTML = dutchRichText;
  }

  //Add event listener
  document
    .getElementById("lang-selector")
    .addEventListener("click", function () {
      if (isDutch === "true") {
        localStorage.setItem("isDutch", "false");
      } else {
        localStorage.setItem("isDutch", "true");
      }
      location.reload();
    });
});

//*******GLOBAL VARIABLES******//
var currentQuestion = 0;
var userAnswers = [];
var matchesReady = false;
var match;
var errorMessage;
var isDutch = localStorage.getItem("isDutch");
console.log("It is " + isDutch + " that this quiz should be in Dutch");

//******FUNCTIONS********//

function nextQuestion() {
  fadeOut();
  //increase question number
  currentQuestion++;

  setTimeout(function () {
    if (currentQuestion <= questions.length) {
      changeQuestion();

      if (currentQuestion == 2) {
        document.getElementById("back-button").style.visibility = "visible";
      }

      //clear button selection
      if (currentQuestion > 12) {
        deselectButton();
      }
    }
  }, 200);

  setTimeout(fadeIn, 400);
}

function previousQuestion() {
  let previousQuestion = currentQuestion;
  currentQuestion--;

  if (currentQuestion <= questions.length) {
    //reset layout

    if (previousQuestion > 13) {
      deselectButton();
      resetLayout();
    }

    if (previousQuestion == 14) {
      var answers = document.getElementsByClassName("quiz-answer");
      for (var i = 0; i < answers.length; i++) {
        answers.item(i).style.animation = "";
      }
    }

    changeQuestion();

    if (currentQuestion == 1) {
      document.getElementById("back-button").style.visibility = "hidden";
    }
  }
}

function changeQuestion() {
  //clear selection
  questions[currentQuestion - 1].clearSelection();

  //update data
  questions[currentQuestion - 1].fill();
}

function fadeOut() {
  document.getElementById("grid-quiz-question").classList.remove("visible");
  document.getElementById("grid-quiz-question").classList.add("hidden");
}
function fadeIn() {
  document.getElementById("grid-quiz-question").classList.remove("hidden");
  document.getElementById("grid-quiz-question").classList.add("visible");
}

function replaceText(id, text) {
  var element = document.getElementById(id);
  element.innerHTML = text;
}

function show(id) {
  document.getElementById(id).classList.remove("extra");
}

function hide(id) {
  document.getElementById(id).classList.add("extra");
}

function resetLayout() {
  //remove extra answers
  let answerLetters = ["C", "D", "E", "F", "G", "H"];
  for (let i = 0; i < answerLetters.length; i++) {
    hide("answer" + answerLetters[i]);
  }

  hide("quiz-buttons");
  hide("help-text-wrapper");

  //add height again
  const answerboxes = document.getElementsByClassName("quiz-answer");
  for (let i = 0; i < answerboxes.length; i++) {
    const element = answerboxes[i];
    element.style.height = "175px";
  }
}

function showLastPage() {
  // Hide stuff
  hide("answers");
  hide("question-number-parent");
  hide("help-text-wrapper");

  //change question appearance (by adding a class)
  let element = document.getElementById("question-box");
  element.style.backgroundColor = "#ffffff";
  element.style.border = "0px";
  document.getElementById("question-text").style.color = "#007bed";

  //change text
  if (!errorMessage) {
    //Dutch language support
    let finalText;
    let buttonText;
    if (isDutch == "true") {
      finalText =
        "Klaar! Tijd om uit te rekenen welke Changemaker het beste bij je past...";
      buttonText = "Zie m'n match";
    } else {
      finalText = "You’re done! Time to find out your changemaker type...";
      buttonText = "See my match";
    }

    replaceText("question-text", finalText);
    replaceText("quiz-button-text", buttonText);
  } else {
    replaceText("question-text", errorMessage);
    replaceText("quiz-button-text", "Retake test");
  }
}

function calculateScores() {
  deselectButton();

  console.log("time to calculate scores!");
  //After next has been pressed on 16.

  //check whether all user answers are there
  var isDataComplete = true;
  for (let i = 1; i < 17; i++) {
    if (!userAnswers[i - 1]) {
      isDataComplete = false;
      console.log("Test data for question " + i + " is incomplete");
      errorMessage =
        "Awww shucks! You did not answer all the questions so a result could not be calculated. Try taking the test again 🤞";
    }
  }

  showLastPage();

  var orderedPersonas = personas;

  if (isDataComplete) {
    personas.forEach((persona) => {
      persona.getMatch(userAnswers);
    });

    //Find order
    orderedPersonas.sort(sortByScore);

    //figure out percentages
    const min_score = 0;
    const max_score = orderedPersonas[0].score;
    var max_percentage;

    if (max_score < 1000) {
      max_percentage = 80 + ((max_score - 500) / 500) * 20;
    } else {
      max_percentage = 100;
    }

    //calculate percentages
    orderedPersonas.forEach((persona) => {
      persona.percentage = Math.floor(
        ((persona.score - min_score) / (-min_score + max_score)) *
          max_percentage
      );
    });

    //save to local storage
    let personaNames = [];
    let personaPercentages = [];

    orderedPersonas.forEach((persona) => {
      personaNames.push(persona.name);
      personaPercentages.push(persona.percentage);
    });

    localStorage.setItem("personaNames", personaNames);
    localStorage.setItem("personaPercentages", personaPercentages);

    match = personaNames[0];
    matchesReady = true;
  }
}

function sortByScore(a, b) {
  if (a.score < b.score) {
    return 1;
  }
  if (a.score > b.score) {
    return -1;
  }
  return 0;
}

function redirect() {
  deselectButton();
  window.location.href = "/changemaker-types/" + match;
}

function selectButton() {
  document.getElementById("next-button").classList.add("selected2");
}

function deselectButton() {
  document.getElementById("next-button").classList.remove("selected2");
}

function stopLoading() {
  document.body.classList.remove("loading");
}

function stopClicks(delay) {
  //add selected answer to userAnswers
  document.body.classList.add("loading");
  setTimeout(stopLoading, delay);
}

//******CLASSES********//

//Question class
class Question {
  constructor(no, name, question, answers) {
    this.no = no;
    this.name = name;
    this.question = question;
    this.answers = answers;
    this.selectedAnswer;
  }

  fill() {
    replaceText("question-number", this.no);
    replaceText("question-text", this.question);

    let answerLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    for (let i = 0; i < this.answers.length; i++) {
      replaceText("answer" + answerLetters[i] + "-label", this.answers[i]);
      if (i > 1) {
        show("answer" + answerLetters[i]);
      }
    }
  }

  //keep track of selected answers
  select(answerLetter = this.selectedAnswer) {
    if (answerLetter !== this.selectedAnswer) {
      //Adds animation if it's a new or changed answer
      document.getElementById("answerA").style.animation = "";
      document.getElementById("answerB").style.animation = "";
    } else if (this.selectedAnswer) {
      //EO removes the animation if there is already an answer selected
      document.getElementById("answer" + this.selectedAnswer).style.animation =
        "unset";
    }

    //If answer is already selected
    if (this.selectedAnswer) {
      //deselect old answer if it was there
      document
        .getElementById("answer" + this.selectedAnswer)
        .classList.remove("selected2");
    }
    this.selectedAnswer = answerLetter;
    document.getElementById("answer" + answerLetter).classList.add("selected2");
    console.log("selection added");
  }

  clearSelection() {
    let answerLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    answerLetters.forEach((letter) => {
      document.getElementById("answer" + letter).classList.remove("selected2");
    });

    if (this.selectedAnswer) {
      this.select();
    }
  }

  submit() {
    //add selected answer to userAnswers
    if (this.selectedAnswer) {
      userAnswers[this.no - 1] = this.selectedAnswer;
    } else {
      console.log("No answer was selected.");
    }
    console.log(userAnswers);
  }
}

//Multiquestion class
class MultiQuestion extends Question {
  constructor(no, name, question, answers, isMultiple) {
    super(no, name, question, answers);
    this.isMultiple = isMultiple;
    this.selectedAnswers = {};

    //create selected object Array
    let answerLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    for (let i = 0; i < this.answers.length; i++) {
      this.selectedAnswers[answerLetters[i]] = false;
    }
  }

  fill() {
    //reduce question box height
    const answerboxes = document.getElementsByClassName("quiz-answer");
    for (let i = 0; i < answerboxes.length; i++) {
      const element = answerboxes[i];
      element.style.height = "100px";
    }

    replaceText("question-number", this.no);
    replaceText("question-text", this.question);

    let answerLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    for (let i = 0; i < this.answers.length; i++) {
      replaceText("answer" + answerLetters[i] + "-label", this.answers[i]);
      if (i > 1) {
        show("answer" + answerLetters[i]);
      }
    }

    if (this.isMultiple) {
      //CHANGE TO PROPER ID (buttons) DONE
      show("quiz-buttons");
      show("help-text-wrapper");
    }
  }

  select(answerLetter) {
    //get rid of animation
    document.getElementById("answer" + answerLetter).style.animation = "unset";

    //should toggle if selected
    document
      .getElementById("answer" + answerLetter)
      .classList.toggle("selected2");
    this.selectedAnswers[answerLetter] = !this.selectedAnswers[answerLetter];

    //add animation again
    //document.getElementById('answer'+answerLetter).style.animation = "";
  }

  clearSelection() {
    let answerLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    answerLetters.forEach((letter) => {
      document.getElementById("answer" + letter).classList.remove("selected2");
    });

    for (var answerLetter in this.selectedAnswers) {
      if (this.selectedAnswers[answerLetter]) {
        document
          .getElementById("answer" + answerLetter)
          .classList.add("selected2");
      }
    }
  }

  submit() {
    //add selected answer to userAnswers
    let selected = [];

    for (var answerLetter in this.selectedAnswers) {
      if (this.selectedAnswers[answerLetter]) {
        selected.push(answerLetter);
      }
      if (!selected) {
        console.log("no answers to log!");
      }
      userAnswers[this.no - 1] = selected;
    }
    console.log(userAnswers);
  }
}

//Persona class
class Persona {
  constructor(name, criteria) {
    this.name = name;
    this.criteria = criteria;
    this.score = 0;
    this.percentage = 0;
  }

  getMatch(answers) {
    this.score = 1; //why start with 1? (so score can't be zero?)

    //First 13 questions
    for (let q = 0; q < 13; q++) {
      let val = 0;
      if (answers[q] == "A") {
        val = 100;
      } else {
        val = -100;
      }
      let newScore = val * this.criteria[q];
      if (newScore > 0) {
        this.score += newScore;
      }
    }

    //Question 14
    if (answers[13] == this.criteria[13]) {
      this.score += 100;
    }

    //Question 15 and 16
    for (let q = 14; q < 16; q++) {
      let letters = answers[q];
      letters.forEach((letter) => {
        if (letter == this.criteria[q]) {
          this.score += 100;
        }
      });
    }

    console.log(this.name + ": " + this.score);
    return this.score;
  }
}

//******VARIABLES********//

//Question objects//
const q1 = new Question(
  1,
  "one",
  "In a group discussion, you are most likely the person...",
  ["talking", "listening"]
);

const q2 = new Question(
  2,
  "two",
  "When someone does something that irritates you, you...",
  ["Say something about it", "Keep calm and carry on"]
);

const q3 = new Question(
  3,
  "three",
  "When you encounter a problem your first thought is to...",
  ["Text your friends for advice", "Come up with solutions"]
);

const q4 = new Question(
  4,
  "four",
  "When one of your friends has a problem you...",
  [
    "Take time to make them feel better",
    "Try to help them figure out what went wrong",
  ]
);

const q5 = new Question(
  5,
  "five",
  "Halfway through a project you lose interest. You...",
  ["Move on to the next exciting thing", "Finish what you started"]
);
const q6 = new Question(6, "six", "You make decisions based on...", [
  "What feels right",
  "Careful consideration",
]);
const q7 = new Question(
  7,
  "seven",
  "When your friend group can’t decide what to do next you",
  [
    "Take initiative and propose a plan",
    "Are happy to go along with someone else’s idea",
  ]
);
const q8 = new Question(8, "eight", "You tend to...", [
  "Stick to your values",
  "Change your mind easily",
]);
const q9 = new Question(9, "nine", "You consider yourself...", [
  "An optimist",
  "A realist",
]);
const q10 = new Question(
  10,
  "ten",
  "You would rather take part in an activity where you get to",
  ["Try new things", "Meet new people"]
);
const q11 = new Question(11, "eleven", "Your preferred weekend plans are...", [
  "Being creative and making something new",
  "Bring people together for a fun activity",
]);
const q12 = new Question(12, "twelve", "You are not afraid to...", [
  "Stand out",
  "Be vulnerable",
]);
const q13 = new Question(13, "thirteen", "Your preferred mode is to...", [
  "Provoke",
  "Cooperate",
]);
const q14 = new Question(
  14,
  "fourteen",
  "Articles you read online are most likely about...",
  [
    "Art and design",
    "Science and nature",
    "Politics and current events",
    "Popular culture",
  ],
  false
);

const q15 = new MultiQuestion(
  15,
  "fifteen",
  "Compliments you would give yourself are...",
  [
    "You're clever",
    "You're popular",
    "You're mindful",
    "You're talented",
    "You're fearless",
    "You're patient",
  ],
  true
);

const q16 = new MultiQuestion(
  16,
  "sixteen",
  "Activities you might enjoy are...",
  [
    "Mentoring someone",
    "Hosting a podcast",
    "Planning an event",
    "Starting a social business",
    "Restoring a natural area",
    "Giving a public talk",
    "Creating an artwork",
    "Joining a Protest",
  ],
  true
);

//

if (isDutch == "true") {
  q1.question = "In een groepsdiscussie ben je meestal de persoon die...";
  q1.answers = ["Praat", "Luistert"];

  q2.question = "Als iemand iets doet wat je irriteert...";
  q2.answers = ["Zeg je er iets van", "Laat je het gaan"];

  q3.question =
    "Het eerste wat je doet als je tegen een probleem aanloopt is...";
  q3.answers = [
    "Je vrienden whatsappen voor advies",
    "Zelf een aantal oplossingen bedenken",
  ];

  q4.question = "Als een van je vrienden ergens mee zit...";
  q4.answers = [
    "Neem je de tijd ze een goed gevoel te geven",
    "Probeer je er achter te komen wat er mis is gegaan",
  ];

  q5.question = "Halverwege een project ben je er op uitgekeken. Wat doe je? ";
  q5.answers = [
    "Door naar de volgende uitdaging",
    "Je maakt af wat je bent begonnen",
  ];

  q6.question = "Je neemt beslissingen op basis van";
  q6.answers = ["Wat goed voelt", "Er goed over na te denken"];

  q7.question = "Als jij en je vrienden nog geen plan hebben voor vanavond";
  q7.answers = [
    "Neem jij het initiatief",
    "Ga je graag mee in het voorstel van iemand anders",
  ];

  q8.question = "Jij...";
  q8.answers = [
    "Blijft bij je eigen standpunt",
    "Verandert makkelijk van gedachte",
  ];

  q9.question = "Je ziet jezelf als...";
  q9.answers = ["Een optimist", "Een realist"];

  q10.question = "Deelnemen aan een activiteit doe je ";
  q10.answers = [
    "Om nieuwe dingen te proberen",
    "Om nieuwe mensen te leren kennen",
  ];

  q11.question = "Jouw favoriete weekendplannen zijn";
  q11.answers = [
    "Creatief bezig zijn en nieuwe dingen maken",
    "Samen met vrienden iets leuks ondernemen",
  ];

  q12.question = "Je bent niet bang om...";
  q12.answers = ["Er uit te springen", "Jezelf kwetsbaar op te stellen"];

  q13.question = "Het liefste ben je...";
  q13.answers = ["Uitdagend", "Meewerkend"];

  q14.question = "Artikelen die je leest, gaan waarschijnlijk over ...";
  q14.answers = [
    "Kunst en design",
    "Wetenschap en natuur",
    "Politiek en actualiteit",
    "(Pop)cultuur",
  ];

  q15.question = "Welke complimenten zou je aan je zelf geven?";
  q15.answers = [
    "Je bent slim",
    "Je bent populair",
    "Je bent vriendelijk",
    "Je hebt talent",
    "Je durft alles",
    "Je bent geduldig",
  ];

  q16.question = "Activiteiten die je leuk zou vinden";
  q16.answers = [
    "Een mentor worden",
    "Een podcast hosten",
    "Een evenement organiseren",
    "Een sociaal initiatief starten",
    "Een natuur herstellings project",
    "Een presentatie geven",
    "Een kunstwerk maken",
    "Deelnemen aan een protest",
  ];
}

//Persona objects
const commentator = new Persona("commentator", [
  1,
  1,
  1,
  0,
  1,
  -1,
  0,
  -1,
  -1,
  0,
  1,
  0,
  1,
  "C",
  "A",
  "B",
]);

const educator = new Persona("educator", [
  -1,
  -1,
  -1,
  -1,
  0,
  -1,
  -1,
  -1,
  0,
  -0.5,
  0,
  -0.5,
  -1,
  "B",
  "F",
  "A",
]);

const caretaker = new Persona("caretaker", [
  -1,
  -1,
  0,
  1,
  -0.5,
  1,
  -1,
  0,
  1,
  0,
  0.5,
  -1,
  -1,
  "B",
  "C",
  "E",
]);

const representative = new Persona("representative", [
  0.5,
  1,
  0,
  0,
  -1,
  -1,
  1,
  1,
  1,
  -1,
  -1,
  0.5,
  0,
  "C",
  "E",
  "F",
]);

const creator = new Persona("creator", [
  0,
  0,
  -1,
  0,
  1,
  1,
  1,
  -1,
  0,
  1,
  1,
  1,
  1,
  "A",
  "D",
  "G",
]);

const activist = new Persona("activist", [
  1,
  1,
  0,
  0,
  -1,
  1,
  1,
  1,
  -1,
  0,
  0,
  1,
  1,
  "C",
  "E",
  "H",
]);

const organiser = new Persona("organiser", [
  1,
  0,
  1,
  0.5,
  -0.5,
  0,
  1,
  1,
  1,
  -1,
  -1,
  0,
  -1,
  "D",
  "B",
  "C",
]);

const inventor = new Persona("inventor", [
  0,
  0,
  -1,
  -1,
  1,
  -1,
  0.5,
  -0.5,
  1,
  1,
  1,
  1,
  0,
  "A",
  "D",
  "D",
]);

//Array of question answers
const questions = [
  q1,
  q2,
  q3,
  q4,
  q5,
  q6,
  q7,
  q8,
  q9,
  q10,
  q11,
  q12,
  q13,
  q14,
  q15,
  q16,
];

//Array of personas
const personas = [
  commentator,
  educator,
  caretaker,
  representative,
  creator,
  activist,
  organiser,
  inventor,
];

//******EVENT LISTENERS********//

//WAIT FOR DOM TO LOAD
document.addEventListener("DOMContentLoaded", (event) => {
  nextQuestion();

  //Answer clicks
  let answerLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];

  for (let i = 0; i < answerLetters.length; i++) {
    document
      .getElementById("answer" + answerLetters[i])
      .addEventListener("click", function () {
        //Toggle selection
        questions[currentQuestion - 1].select(answerLetters[i]);

        if (currentQuestion < 15) {
          questions[currentQuestion - 1].submit();

          //disable clicking for X ms
          stopClicks(800);
          setTimeout(nextQuestion, 800);
        }
      });
  }

  //Click on next button
  document.getElementById("next-button").addEventListener("click", function () {
    //button select
    selectButton();

    if (currentQuestion < 16) {
      questions[currentQuestion - 1].submit();
      //disable clicking for X ms
      stopClicks(800);
      setTimeout(nextQuestion, 800);
    } else if (errorMessage) {
      location.reload();
    } else if (!matchesReady) {
      questions[currentQuestion - 1].submit();
      setTimeout(calculateScores, 800);
    } else {
      //redirect to right persona page
      setTimeout(redirect, 800);
    }
  });

  //click on previous button
  document
    .getElementById("back-button")
    .addEventListener("click", previousQuestion);
});

/**
 * Game score app
 */

var UI,
  Vector2,
  main,
  dyGameScore;

dyGameScore = (function () {
  var myPublic = {},
      myPrivate = {};
  
  myPublic.increment = function (step) {
    step = step || 1;
    myPrivate.currentScore = myPrivate.currentScore + step;
    myPrivate.storeScore(myPrivate.currentScore);
  };
  myPublic.decrement = function (step) {
    step = step || 1;
    myPrivate.currentScore = myPrivate.currentScore - step;
    myPrivate.storeScore(myPrivate.currentScore);
  };
  myPrivate.storeScore = function (score) {
    if (localStorage && localStorage.setItem) {
      localStorage.setItem("currentScore", score);
    }
  }
  myPublic.getScore = function () {
    return myPrivate.currentScore;
  };
  myPublic.getScoreText = function () {
    return "My score is " + myPublic.getScore();
  };

  myPublic.showScoreWindow = function () {
    var wind,
      textfield;
    wind = new UI.Window();
    textfield = new UI.Text({
      position: new Vector2(0, 50),
      size: new Vector2(144, 30),
      font: "gothic-24-bold",
      text: "Current score " + myPublic.getScore(),
      textAlign: "center"
    });
    wind.add(textfield);
    wind.show();
  };
  
  function init() {
    var initScore = 0,
        score;
    if (localStorage && localStorage.getItem) {
      score = localStorage.getItem("currentScore");
      score = parseInt(score, 10);
    }
    if (!isNaN(score) && isFinite(score)) {
      initScore = score;
    }
    
    myPrivate.currentScore = initScore;
  }
  init();

  return myPublic;
}());

UI = require("ui");
Vector2 = require("vector2");

main = new UI.Card({
  "title": "Game score",
  "subtitle": "Keep track of your score",
  "body": "Press select to start"
});
main.show();

main.on("click", "select", function (e) {
  var scoreTracking = new UI.Card({
    "title": "Tracking",
    "subtitle": dyGameScore.getScoreText()
  });
  
  scoreTracking.on("click", function (e) {
    var updateSubTitle = false;
    if (e.button === "up") {
      updateSubTitle = true;
      dyGameScore.increment();
    } else if (e.button === "down") {
      updateSubTitle = true;
      dyGameScore.decrement();
    }
    if (updateSubTitle) {
      scoreTracking.subtitle(dyGameScore.getScoreText()); 
    }
  });
  scoreTracking.show();
});

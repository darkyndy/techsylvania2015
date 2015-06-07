window.dyGameScore = (function () {
  var myPublic = {},
    myPrivate = {};

  myPrivate.baseStep = 1;
  
  myPrivate.getStoredScore = function () {
    var initScore = 0,
      score;
    if (localStorage && localStorage.getItem) {
      score = localStorage.getItem("currentScore");
      score = parseInt(score, 10);
      if (!isNaN(score) && isFinite(score)) {
        initScore = score;
      }
    }
    myPrivate.currentScore = initScore;
  };
  
  myPrivate.setStoredScore = function () {
    if (localStorage && localStorage.setItem) {
      myPrivate.currentScore = myPrivate.currentScore || 0;
      score = localStorage.setItem("currentScore", myPrivate.currentScore);
    }
  };

  myPrivate.updateScore = function () {
    myPrivate.setStoredScore();
    myPrivate.scoreEl.textContent = myPrivate.currentScore;
  };

  myPrivate.incrementAction = function () {
    myPrivate.currentScore += myPrivate.baseStep;
    //update score
    myPrivate.updateScore();
  };

  myPrivate.decrementAction = function () {
    myPrivate.currentScore -= myPrivate.baseStep;
    //update score
    myPrivate.updateScore();
  };

  myPrivate.delegate = function () {
    myPrivate.incrementEl.addEventListener("click", myPrivate.incrementAction);
    myPrivate.decrementEl.addEventListener("click", myPrivate.decrementAction);
  };

  myPrivate.removeDelegate = function () {
    myPrivate.incrementEl.removeEventListener("click", myPrivate.incrementAction);
    myPrivate.decrementEl.removeEventListener("click", myPrivate.decrementAction);
  };

  myPublic.destroy = function () {
    myPrivate.removeDelegate();
    //clear cached elements
    myPrivate.incrementEl = null;
    myPrivate.decrementEl = null;
    myPrivate.scoreEl = null;
  };

  myPublic.init = function () {
    myPrivate.incrementEl = document.getElementById("increment");
    myPrivate.decrementEl = document.getElementById("decrement");
    myPrivate.scoreEl = document.getElementById("currentScore");
    //get stored score
    myPrivate.getStoredScore();
    //update score
    myPrivate.updateScore();
    //attach events
    myPrivate.delegate();
  };

  myPublic.init();

  return myPublic;
}());
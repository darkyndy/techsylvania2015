window.dyColor = (function () {
  "use strict";
  var myPublic = {},
    myPrivate = {};

  myPrivate.colors = ["aqua", "aquamarine", "bisque", "black", "blue", "blueviolet",
    "brown", "burlywood", "cadetblue", "chartreuse", "coral", "cyan",
    "fuchsia", "green", "indigo", "lime", "olive", "navy", "orange", 
    "purple", "red", "salmon", "silver", "violet", "yellow"];
  myPrivate.colorsLength = myPrivate.colors.length;
  myPrivate.score = 0;
  myPrivate.total = 0;
  myPrivate.responseTime = [];
  myPrivate.waitForRelax = false;
  myPrivate.prevFromLeap = false;
  
  myPrivate.random = function (minimum, maximum) {
    return Math.round(minimum + Math.random() * (maximum-minimum));
  };
  
  myPrivate.intToTime = function (nr) {
    var ms,
      s,
      m,
      time;
    ms = nr % 1000;
    s = parseInt((nr - ms) /  1000, 10);
    if (s > 60) {
      m = parseInt(s /  60, 10);
      s = s % 60;
    }
    time = s + "s " + parseInt(ms, 10) + "ms";
    if (m) {
      time = m + "min " + time;
    }
    
    return time;
  };
  
  myPrivate.calculateAvgResponseTime = function () {
    var avg = 0,
      i,
      len;
    len = myPrivate.responseTime.length;
    if (len > 0) {
      for (i = 0; i < len; i += 1) {
        avg += myPrivate.responseTime[i];
      }
      avg = avg / len;
    }
    return avg;
  };
  
  myPrivate.calculateResponseTime = function () {
    var responseTime;
    if (myPrivate.roundEnd) {
      responseTime = myPrivate.roundEnd - myPrivate.roundStart;
      myPrivate.responseTime.push(responseTime);
      myPrivate.responseTimeEl.textContent = myPrivate.intToTime(responseTime);
      myPrivate.avgResponseTimeEl.textContent = myPrivate.intToTime(myPrivate.calculateAvgResponseTime());
    }
    myPrivate.roundStart = Date.now();
  };
  
  myPrivate.setColor = function () {
    var randomNr,
      colorText,
      colorStyle,
      matchColor,
      tempColors;
    colorText = myPrivate.colors[myPrivate.random(0, myPrivate.colorsLength - 1)];
    colorStyle = myPrivate.colors[myPrivate.random(0, myPrivate.colorsLength - 1)];
    if (colorText === colorStyle) {
      myPrivate.matchColor = true;
    } else {
      myPrivate.matchColor = false;
    }
    if (!matchColor) {
      //statistically chance to have different colors is big
      tempColors = [colorText, colorStyle];
      colorStyle = tempColors[myPrivate.random(0, 1)];
    }
    if (colorText === colorStyle) {
      myPrivate.matchColor = true;
    } else {
      myPrivate.matchColor = false;
    }
    myPrivate.calculateResponseTime();
    myPrivate.contentEl.style.color = colorStyle;
    myPrivate.contentEl.textContent = colorText;
  };
  
  myPrivate.nextRound = function () {
    myPrivate.scoreEl.textContent = myPrivate.score + " / " + myPrivate.total;
    myPrivate.total += 1;
    myPrivate.setColor();
  };
  
  myPrivate.matchTrueCb = function () {
    myPrivate.prevFromLeap = false;
    if (myPrivate.matchColor) {
      myPrivate.score += 1;
    }
    myPrivate.roundEnd = Date.now();
    myPrivate.nextRound();
  };
  
  myPrivate.matchFalseCb = function () {
    myPrivate.prevFromLeap = false;
    if (!myPrivate.matchColor) {
      myPrivate.score += 1;
    }
    myPrivate.roundEnd = Date.now();
    myPrivate.nextRound();
  };
  
  myPrivate.matchFromLeap = function (matchType) {
    if (myPrivate.prevFromLeap) {
      if ((matchType && myPrivate.matchColor) ||
         (!matchType && !myPrivate.matchColor)) {
        myPrivate.score += 1;
      }
      myPrivate.roundEnd = Date.now();
    } else {
      myPrivate.prevFromLeap = true;
      myPrivate.total -= 1;
      myPrivate.roundEnd = 0;
    }
    myPrivate.waitForRelax = true;
    myPrivate.contentEl.textContent = "relax now";
  };
  
  myPrivate.delegate = function () {
    myPrivate.matchTrueEl.addEventListener("click", myPrivate.matchTrueCb);
    myPrivate.matchFalseEl.addEventListener("click", myPrivate.matchFalseCb);
  };
  
  myPrivate.readLeapFrame = function (frame) {
    var palmNormal0,
      palmNormal1,
      possiblePos0,
      possiblePos1,
      firstObjForRightHand,
      relaxCounter = 0,
      considerMatch;
    if (frame.hands.length === 2) {
      //ready, both hands are placed
      //
      //console.log(Date.now());
      //console.log(frame.hands[0].palmPosition, frame.hands[1].palmPosition);
      //console.log(frame.pointables);
      if (frame.hands[0].palmNormal && frame.hands[0].palmNormal.length) {
        palmNormal0 = Math.abs(frame.hands[0].palmNormal[0]);
        palmNormal1 = Math.abs(frame.hands[0].palmNormal[1]);
        if (palmNormal0 >= 0.5 && palmNormal1 < 0.5) {
          //possible vote
          possiblePos0 = true;
          //console.log("pos");
        } else {
          //relax
          //console.log("rel");
          relaxCounter += 1;
        }
      }
      if (!possiblePos0) {
        //only if it's not a valid position
        if (frame.hands[1].palmNormal && frame.hands[1].palmNormal.length) {
          palmNormal0 = Math.abs(frame.hands[1].palmNormal[0]);
          palmNormal1 = Math.abs(frame.hands[1].palmNormal[1]);
          if (palmNormal0 >= 0.5 && palmNormal1 < 0.5) {
            //possible vote
            possiblePos1 = true;
            //console.log("pos 1");
          } else {
            //relax
            //console.log("rel 1");
            relaxCounter += 1;
          }
        }
      }
      if (myPrivate.waitForRelax) {
        if (relaxCounter === 2) {
          //ready for next round
          myPrivate.waitForRelax = false;
          myPrivate.nextRound();
        }
        
        return;
      }
      if (possiblePos0 || possiblePos1) {
        if (frame.hands[0].palmPosition[0] > frame.hands[1].palmPosition[0]) {
          //first object is for right hand
          firstObjForRightHand = true;
        }
        if (possiblePos0 && firstObjForRightHand) {
          considerMatch = true;
        } else if (possiblePos1 && !firstObjForRightHand) {
          considerMatch = true;
        } else {
          considerMatch = false;
        }
        //console.log("match as " + considerMatch)
        myPrivate.matchFromLeap(considerMatch);
        
      }
      
    }
  };

  myPublic.init = function () {
    myPrivate.contentEl = document.getElementById("content");
    myPrivate.matchTrueEl = document.getElementById("matchTrue");
    myPrivate.matchFalseEl = document.getElementById("matchFalse");
    myPrivate.scoreEl = document.getElementById("score");
    myPrivate.responseTimeEl = document.getElementById("responseTime");
    myPrivate.avgResponseTimeEl = document.getElementById("avgResponseTime");
    //delegate
    myPrivate.delegate();
    //next round
    myPrivate.nextRound();
    //init Leap
    Leap.loop(myPrivate.readLeapFrame);
  };

  myPublic.init();

  return myPublic;
}());
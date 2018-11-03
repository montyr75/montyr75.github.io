library game_view;

import 'dart:html';
import 'package:polymer/polymer.dart';
import '../../model/model.dart';
import 'dart:async';
import '../../model/cards.dart';

@CustomTag('game-view')
class GameView extends PolymerElement with ChangeNotifier  {

  @reflectable @published Model get model => __$model; Model __$model; @reflectable set model(Model value) { __$model = notifyPropertyChange(#model, __$model, value); }

  StreamSubscription<String> _cardFlippedEventSub;    // fired when card is flipped over

  // game data
  @reflectable @observable int get matchesNeeded => __$matchesNeeded; int __$matchesNeeded; @reflectable set matchesNeeded(int value) { __$matchesNeeded = notifyPropertyChange(#matchesNeeded, __$matchesNeeded, value); }
  @reflectable @observable int get unmatchedPairs => __$unmatchedPairs; int __$unmatchedPairs; @reflectable set unmatchedPairs(int value) { __$unmatchedPairs = notifyPropertyChange(#unmatchedPairs, __$unmatchedPairs, value); }
  @reflectable @observable int get attempts => __$attempts; int __$attempts; @reflectable set attempts(int value) { __$attempts = notifyPropertyChange(#attempts, __$attempts, value); }
  Card firstPick;
  Card secondPick;
  @reflectable @observable bool get interfaceEnabled => __$interfaceEnabled; bool __$interfaceEnabled; @reflectable set interfaceEnabled(bool value) { __$interfaceEnabled = notifyPropertyChange(#interfaceEnabled, __$interfaceEnabled, value); }
  @reflectable @observable bool get win => __$win; bool __$win = false; @reflectable set win(bool value) { __$win = notifyPropertyChange(#win, __$win, value); }

  GameView.created() : super.created();

  @override void enteredView() {
    super.enteredView();
    print("GameView::enteredView()");

    _setboardWidth();

    // set game data
    _resetGameData();
  }

  void _resetGameData() {
    matchesNeeded = unmatchedPairs = model.currentDeck.numPairs;
    attempts = 0;
    firstPick = null;
    secondPick = null;
    interfaceEnabled = true;
    win = false;
  }

  void _setboardWidth() {
    String boardWidthClass;

    if (model.numCards > 4 && model.numCards % 4 == 0) {
      boardWidthClass = "row4";
    }
    else if (model.numCards % 3 == 0) {
      boardWidthClass = "row3";
    }
    else if (model.numCards % 2 == 0) {
      boardWidthClass = "row2";
    }
    else {
      boardWidthClass = "row4";
    }

    this.classes.add(boardWidthClass);
  }

  void cardFlipped(Event event, Card card, Element target) {
    print("GameView::cardFlipped() -- $card");

    if (firstPick == null) {
      firstPick = card;
    }
    else if (secondPick == null) {
      interfaceEnabled = false;
      secondPick = card;
      attempts++;

      // check for match
      if (firstPick.id == secondPick.id) {
        // delay this to allow animations to finish
        new Timer(new Duration(seconds: 1), _matchMade);
      }
      else {
        // delay this to allow animations to finish
        new Timer(new Duration(seconds: 2), _noMatchMade);
      }
    }
  }

  void _matchMade() {
    print("Match!");

    firstPick.match();
    secondPick.match();
    firstPick = secondPick = null;
    unmatchedPairs--;
    interfaceEnabled = true;

    // check for a win
    if (unmatchedPairs == 0) {
      print("Win!");

      interfaceEnabled = false;
      win = true;
      _unmatchAll();
    }
  }

  void _noMatchMade() {
    print("No match");

    firstPick.flip();
    secondPick.flip();
    firstPick = secondPick = null;
    interfaceEnabled = true;
  }

  void _unmatchAll() {
    model.currentDeck.cards.forEach((Card card) => card.match());
  }
}


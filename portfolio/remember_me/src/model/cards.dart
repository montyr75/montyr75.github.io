library cards;

// include Polymer to have access to @observable
import 'package:polymer/polymer.dart';

import 'dart:convert';
import 'events.dart';
import 'dart:html';

class Card extends Object with ChangeNotifier {
  String id;
  @reflectable @observable String get title => __$title; String __$title; @reflectable set title(String value) { __$title = notifyPropertyChange(#title, __$title, value); }
  @reflectable @observable String get imageFilename => __$imageFilename; String __$imageFilename; @reflectable set imageFilename(String value) { __$imageFilename = notifyPropertyChange(#imageFilename, __$imageFilename, value); }

  @reflectable @observable bool get flipped => __$flipped; bool __$flipped = false; @reflectable set flipped(bool value) { __$flipped = notifyPropertyChange(#flipped, __$flipped, value); }
  @reflectable @observable bool get matched => __$matched; bool __$matched = false; @reflectable set matched(bool value) { __$matched = notifyPropertyChange(#matched, __$matched, value); }

  Card(String this.id, String title, String imageFilename) : __$title = title, __$imageFilename = imageFilename;

  Card.fromMap(Map<String, String> map) : this(map["id"], map["title"], map["imageFilename"]);

  void flip() {
    flipped = !flipped;
  }

  void match() {
    matched = !matched;
  }

  String toString() => title;
}

class Deck extends Object with ChangeNotifier {
  String title;
  String baseImagePath;
  String backImageURL;
  String _cardsFileURL;

  List<Map<String, String>> _cardMaps;   // includes all cards in the deck
  @reflectable @observable List<Card> get cards => __$cards; List<Card> __$cards = toObservable([]); @reflectable set cards(List<Card> value) { __$cards = notifyPropertyChange(#cards, __$cards, value); }  // just the cards being used in the current game

  int _numPairs;

  Deck.fromMap(Map<String, String> deckMap, String cardsFilePath) {
    title = deckMap["title"];
    baseImagePath = deckMap["baseImagePath"];
    backImageURL = "${baseImagePath}${deckMap['backImageFilename']}";
    _cardsFileURL = "${cardsFilePath}${deckMap['cardsFilename']}";
  }

  // this public function is called when this deck is selected for a game
  void createGameDeck(int numPairs) {
    void _prepareGameDeck() {
      _cardMaps.shuffle();

      cards.clear();

      // take only the number of cards we need and add 2 of each to the game deck
      _cardMaps.take(numPairs).forEach((Map<String, String> card) {
        cards.add(new Card.fromMap(card));
        cards.add(new Card.fromMap(card));
      });

      cards.shuffle();

      eventBus.fire(deckReadyEvent, null);
    }

    void _loadCards() {
      HttpRequest.getString(_cardsFileURL).then((String jsonStr) {
        _cardMaps = JSON.decode(jsonStr);
        _prepareGameDeck();
      });
    }

    _numPairs = numPairs;

    if (_cardMaps == null) {
      _loadCards();
    }
    else {
      _prepareGameDeck();
    }
  }

  int get numPairs => _numPairs;

  String toString() {
    StringBuffer sb = new StringBuffer();

    cards.forEach((Card card) => sb.writeln(card));

    return sb.toString();
  }
}
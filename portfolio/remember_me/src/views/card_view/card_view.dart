library card_view;

import 'dart:html';
import 'package:polymer/polymer.dart';
import '../../model/cards.dart';

@CustomTag('card-view')
class CardView extends PolymerElement with ChangeNotifier  {

  @reflectable @published Card get card => __$card; Card __$card; @reflectable set card(Card value) { __$card = notifyPropertyChange(#card, __$card, value); }
  @reflectable @published String get baseImagePath => __$baseImagePath; String __$baseImagePath; @reflectable set baseImagePath(String value) { __$baseImagePath = notifyPropertyChange(#baseImagePath, __$baseImagePath, value); }
  @reflectable @published String get backImageURL => __$backImageURL; String __$backImageURL; @reflectable set backImageURL(String value) { __$backImageURL = notifyPropertyChange(#backImageURL, __$backImageURL, value); }
  @reflectable @published bool get interfaceEnabled => __$interfaceEnabled; bool __$interfaceEnabled; @reflectable set interfaceEnabled(bool value) { __$interfaceEnabled = notifyPropertyChange(#interfaceEnabled, __$interfaceEnabled, value); }

  @reflectable @observable String get imageURL => __$imageURL; String __$imageURL; @reflectable set imageURL(String value) { __$imageURL = notifyPropertyChange(#imageURL, __$imageURL, value); }

  CardView.created() : super.created();

  @override void enteredView() {
    super.enteredView();
//    print("CardView::enteredView()");

    imageURL = "${baseImagePath}${card.imageFilename}";
  }

  void flip(Event event, var detail, Element target) {
    print("CardView::flip() -- $card");

    if (!card.flipped && interfaceEnabled) {
      card.flip();
      fire("card-revealed", detail: card);
    }
  }
}


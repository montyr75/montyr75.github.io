library app_bootstrap;

import 'package:polymer/polymer.dart';

import 'src/components/polymer_selection/polymer_selection.dart' as i0;
import 'src/components/polymer_selector/polymer_selector.dart' as i1;
import 'src/views/settings_view/settings_view.dart' as i2;
import 'src/views/card_view/card_view.dart' as i3;
import 'src/views/game_view/game_view.dart' as i4;
import 'src/views/main_view/main_view.dart' as i5;
import 'index.html.0.dart' as i6;
import 'package:smoke/smoke.dart' show Declaration, PROPERTY, METHOD;
import 'package:smoke/static.dart' show useGeneratedCode, StaticConfiguration;
import 'src/components/polymer_selection/polymer_selection.dart' as smoke_0;
import 'package:polymer/polymer.dart' as smoke_1;
import 'package:observe/src/metadata.dart' as smoke_2;
import 'src/components/polymer_selector/polymer_selector.dart' as smoke_3;
import 'dart:html' as smoke_4;
import 'src/views/settings_view/settings_view.dart' as smoke_5;
import 'src/model/model.dart' as smoke_6;
import 'src/views/card_view/card_view.dart' as smoke_7;
import 'src/model/cards.dart' as smoke_8;
import 'src/views/game_view/game_view.dart' as smoke_9;
import 'src/views/main_view/main_view.dart' as smoke_10;
abstract class _M0 {} // PolymerElement & ChangeNotifier

void main() {
  useGeneratedCode(new StaticConfiguration(
      checkedMode: false,
      getters: {
        #activateEvent: (o) => o.activateEvent,
        #attempts: (o) => o.attempts,
        #backImageURL: (o) => o.backImageURL,
        #baseImagePath: (o) => o.baseImagePath,
        #card: (o) => o.card,
        #cardFlipped: (o) => o.cardFlipped,
        #cards: (o) => o.cards,
        #currentDeck: (o) => o.currentDeck,
        #currentView: (o) => o.currentView,
        #deck: (o) => o.deck,
        #deckSelected: (o) => o.deckSelected,
        #decks: (o) => o.decks,
        #diff: (o) => o.diff,
        #difficulties: (o) => o.difficulties,
        #difficultySelected: (o) => o.difficultySelected,
        #dummy: (o) => o.dummy,
        #flip: (o) => o.flip,
        #flipped: (o) => o.flipped,
        #imageURL: (o) => o.imageURL,
        #images_path: (o) => o.images_path,
        #interfaceEnabled: (o) => o.interfaceEnabled,
        #itemsSelector: (o) => o.itemsSelector,
        #matched: (o) => o.matched,
        #matchesNeeded: (o) => o.matchesNeeded,
        #model: (o) => o.model,
        #multi: (o) => o.multi,
        #notap: (o) => o.notap,
        #numCards: (o) => o.numCards,
        #replay: (o) => o.replay,
        #selected: (o) => o.selected,
        #selectedAttribute: (o) => o.selectedAttribute,
        #selectedChanged: (o) => o.selectedChanged,
        #selectedClass: (o) => o.selectedClass,
        #selectedItem: (o) => o.selectedItem,
        #selectedItemChanged: (o) => o.selectedItemChanged,
        #selectedModel: (o) => o.selectedModel,
        #selectedProperty: (o) => o.selectedProperty,
        #selectionSelect: (o) => o.selectionSelect,
        #showSettingsView: (o) => o.showSettingsView,
        #start: (o) => o.start,
        #target: (o) => o.target,
        #targetChanged: (o) => o.targetChanged,
        #title: (o) => o.title,
        #unmatchedPairs: (o) => o.unmatchedPairs,
        #valueattr: (o) => o.valueattr,
        #win: (o) => o.win,
      },
      setters: {
        #activateEvent: (o, v) { o.activateEvent = v; },
        #attempts: (o, v) { o.attempts = v; },
        #backImageURL: (o, v) { o.backImageURL = v; },
        #baseImagePath: (o, v) { o.baseImagePath = v; },
        #card: (o, v) { o.card = v; },
        #currentView: (o, v) { o.currentView = v; },
        #dummy: (o, v) { o.dummy = v; },
        #imageURL: (o, v) { o.imageURL = v; },
        #interfaceEnabled: (o, v) { o.interfaceEnabled = v; },
        #itemsSelector: (o, v) { o.itemsSelector = v; },
        #matchesNeeded: (o, v) { o.matchesNeeded = v; },
        #model: (o, v) { o.model = v; },
        #multi: (o, v) { o.multi = v; },
        #notap: (o, v) { o.notap = v; },
        #selected: (o, v) { o.selected = v; },
        #selectedAttribute: (o, v) { o.selectedAttribute = v; },
        #selectedClass: (o, v) { o.selectedClass = v; },
        #selectedItem: (o, v) { o.selectedItem = v; },
        #selectedModel: (o, v) { o.selectedModel = v; },
        #selectedProperty: (o, v) { o.selectedProperty = v; },
        #target: (o, v) { o.target = v; },
        #unmatchedPairs: (o, v) { o.unmatchedPairs = v; },
        #valueattr: (o, v) { o.valueattr = v; },
        #win: (o, v) { o.win = v; },
      },
      parents: {
        smoke_0.PolymerSelection: _M0,
        smoke_3.PolymerSelector: _M0,
        smoke_7.CardView: _M0,
        smoke_9.GameView: _M0,
        smoke_10.MainView: _M0,
        smoke_5.SettingsView: _M0,
        _M0: smoke_1.PolymerElement,
      },
      declarations: {
        smoke_0.PolymerSelection: {
          #multi: const Declaration(#multi, bool, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
        smoke_3.PolymerSelector: {
          #activateEvent: const Declaration(#activateEvent, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #dummy: const Declaration(#dummy, dynamic, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #itemsSelector: const Declaration(#itemsSelector, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #multi: const Declaration(#multi, bool, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #notap: const Declaration(#notap, bool, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #selected: const Declaration(#selected, dynamic, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #selectedAttribute: const Declaration(#selectedAttribute, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #selectedChanged: const Declaration(#selectedChanged, Function, kind: METHOD),
          #selectedClass: const Declaration(#selectedClass, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #selectedItem: const Declaration(#selectedItem, dynamic, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #selectedItemChanged: const Declaration(#selectedItemChanged, Function, kind: METHOD),
          #selectedModel: const Declaration(#selectedModel, dynamic, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #selectedProperty: const Declaration(#selectedProperty, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #target: const Declaration(#target, smoke_4.Element, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #targetChanged: const Declaration(#targetChanged, Function, kind: METHOD),
          #valueattr: const Declaration(#valueattr, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
        smoke_7.CardView: {
          #backImageURL: const Declaration(#backImageURL, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #baseImagePath: const Declaration(#baseImagePath, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #card: const Declaration(#card, smoke_8.Card, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #imageURL: const Declaration(#imageURL, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_2.observable]),
          #interfaceEnabled: const Declaration(#interfaceEnabled, bool, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
        smoke_9.GameView: {
          #attempts: const Declaration(#attempts, int, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_2.observable]),
          #interfaceEnabled: const Declaration(#interfaceEnabled, bool, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_2.observable]),
          #matchesNeeded: const Declaration(#matchesNeeded, int, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_2.observable]),
          #model: const Declaration(#model, smoke_6.Model, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #unmatchedPairs: const Declaration(#unmatchedPairs, int, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_2.observable]),
          #win: const Declaration(#win, bool, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_2.observable]),
        },
        smoke_10.MainView: {
          #currentView: const Declaration(#currentView, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_2.observable]),
          #model: const Declaration(#model, smoke_6.Model, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_2.observable]),
        },
        smoke_5.SettingsView: {
          #model: const Declaration(#model, smoke_6.Model, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
      },
      names: {
        #activateEvent: r'activateEvent',
        #attempts: r'attempts',
        #backImageURL: r'backImageURL',
        #baseImagePath: r'baseImagePath',
        #card: r'card',
        #cardFlipped: r'cardFlipped',
        #cards: r'cards',
        #currentDeck: r'currentDeck',
        #currentView: r'currentView',
        #deck: r'deck',
        #deckSelected: r'deckSelected',
        #decks: r'decks',
        #diff: r'diff',
        #difficulties: r'difficulties',
        #difficultySelected: r'difficultySelected',
        #dummy: r'dummy',
        #flip: r'flip',
        #flipped: r'flipped',
        #imageURL: r'imageURL',
        #images_path: r'images_path',
        #interfaceEnabled: r'interfaceEnabled',
        #itemsSelector: r'itemsSelector',
        #matched: r'matched',
        #matchesNeeded: r'matchesNeeded',
        #model: r'model',
        #multi: r'multi',
        #notap: r'notap',
        #numCards: r'numCards',
        #replay: r'replay',
        #selected: r'selected',
        #selectedAttribute: r'selectedAttribute',
        #selectedChanged: r'selectedChanged',
        #selectedClass: r'selectedClass',
        #selectedItem: r'selectedItem',
        #selectedItemChanged: r'selectedItemChanged',
        #selectedModel: r'selectedModel',
        #selectedProperty: r'selectedProperty',
        #selectionSelect: r'selectionSelect',
        #showSettingsView: r'showSettingsView',
        #start: r'start',
        #target: r'target',
        #targetChanged: r'targetChanged',
        #title: r'title',
        #unmatchedPairs: r'unmatchedPairs',
        #valueattr: r'valueattr',
        #win: r'win',
      }));
  configureForDeployment([
      () => Polymer.register('polymer-selection', i0.PolymerSelection),
      () => Polymer.register('polymer-selector', i1.PolymerSelector),
      () => Polymer.register('settings-view', i2.SettingsView),
      () => Polymer.register('card-view', i3.CardView),
      () => Polymer.register('game-view', i4.GameView),
      () => Polymer.register('main-view', i5.MainView),
    ]);
  i6.main();
}

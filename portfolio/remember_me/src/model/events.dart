library events;

import 'package:event_bus/event_bus.dart';

// event bus
EventBus eventBus = new EventBus();

// events
final EventType<String> modelReadyEvent = new EventType<String>();   // model fires these
final EventType<String> deckReadyEvent = new EventType<String>();   // decks fire these

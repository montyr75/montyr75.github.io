library polymer_elements.polymer_selection;

import 'dart:async' as async;
import 'dart:html' as dom;

import 'package:polymer/polymer.dart';

@CustomTag('polymer-selection')
class PolymerSelection extends PolymerElement with ChangeNotifier  {

  final List _selection = [];

  /**
   * If true, multiple selections are allowed.
   */
  @reflectable @published
  bool get multi => __$multi; bool __$multi = false; @reflectable set multi(bool value) { __$multi = notifyPropertyChange(#multi, __$multi, value); }

  PolymerSelection.created() : super.created();

  /**
  * Fired when an item's selection state is changed. This event is fired both
  * when an item is selected or deselected. The `isSelected` detail property
  * contains the selection state.
  *
  * @event polymer-select
  * @param {Object} detail
  *   @param {boolean} detail.isSelected true for selection and false for deselection
  *   @param {Object} detail.item the item element
  */
  async.Stream<dom.CustomEvent> get onPolymerSelect =>
      PolymerSelection._onPolymerSelect.forTarget(this);

  static const dom.EventStreamProvider<dom.CustomEvent> _onPolymerSelect =
      const dom.EventStreamProvider<dom.CustomEvent>('polymer-select');

  void ready(){
    super.ready();
    this.clear();
  }

  void clear(){
    this._selection.clear();
  }

  /**
   * Retrieves the selected item(s) (String or Element).
   * If the multi property is true,
   * selection will return a [List], otherwise it will return
   * the selected item or null if there is no selection.
   */
  dynamic get selection {
    if(this.multi){
     return this._selection;
    } else if(this._selection.isNotEmpty){
      return this._selection[0];
    } else {
      return null;
    }
  }

  /**
   * Indicates if a given item is selected.
   * @param {any} item The item whose selection state should be checked.
   * Returns true if [item] is selected.
   */
  bool isSelected(item){
    if(this.selection == null) {
      return false;
    }
    return this.selection.indexOf(item) >= 0;
  }

  /**
   * Sets the selected state of [item] to [isSelected] and fires
   * a corresponding 'polymer-select' event with the [CustomEvent.detail] set to
   * a map containing 'item' set to [item] and 'isSelected' set to [isSelected].
   */
  void setItemSelected(item, isSelected) {
    if (item != null) {
      if (isSelected) {
        this._selection.add(item);
      } else {
        var i = this._selection.indexOf(item);
        if (i >= 0) {
          this._selection.removeAt(i);
        }
      }

      this.fire('polymer-select', detail: {'item': item, 'isSelected': isSelected});
    }
  }

  /**
   * Set the selection state for a given [item]. If the multi property
   * is true, then the selected state of [item] will be toggled; otherwise
   * the [item] will be selected.  Fires a corresponding 'polymer-select' event
   * with the [CustomEvent.detail] set to a map containing 'item' set to [item]
   * and 'isSelected' set to [isSelected]. set to the new selection state for
   * the [item].
   */
  void select(item) {
    if (this.multi) {
      this.toggle(item);
    } else if (this.selection != item) {
      this.setItemSelected(this.selection, false);
      this.setItemSelected(item, true);
    }
  }

  /**
    * Toggles the selection state for `item`.
    * @param {any} item: The item to toggle.
   */
  void toggle(item) {
    this.setItemSelected(item, !this.isSelected(item));
  }
}
library polymer_elements.polymer_selector;

import 'dart:async' as async;
import 'dart:html' as dom;
import 'dart:mirrors' as mirr;

import 'package:polymer/polymer.dart';
import '../polymer_selection/polymer_selection.dart' show PolymerSelection;

@CustomTag('polymer-selector')
class PolymerSelector extends PolymerElement with ChangeNotifier  {

  @reflectable @published
  dynamic get dummy => __$dummy; dynamic __$dummy; @reflectable set dummy(dynamic value) { __$dummy = notifyPropertyChange(#dummy, __$dummy, value); } // TODO remove workaround for polymer-selector-multi test

  /**
   * Gets or sets the selected element.  Default to use the index
   * of the item element.
   *
   * If you want a specific attribute value of the element to be
   * used instead of index, set "valueattr" to that attribute name.
   *
   * Example:
   *
   *     <polymer-selector valueattr="label" selected="foo">
   *       <div label="foo"></div>
   *       <div label="bar"></div>
   *       <div label="zot"></div>
   *     </polymer-selector>
   *
   * In multi-selection this should be an array of values.
   *
   * Example:
   *
   *     <polymer-selector id="selector" valueattr="label" multi>
   *       <div label="foo"></div>
   *       <div label="bar"></div>
   *       <div label="zot"></div>
   *     </polymer-selector>
   *
   *     this.$.selector.selected = ['foo', 'zot'];
   *
   */
  @reflectable @published
  dynamic get selected => __$selected; dynamic __$selected = null; @reflectable set selected(dynamic value) { __$selected = notifyPropertyChange(#selected, __$selected, value); }

  /**
   * If true, multiple selections are allowed.
   */
  @reflectable @published
  bool get multi => __$multi; bool __$multi = false; @reflectable set multi(bool value) { __$multi = notifyPropertyChange(#multi, __$multi, value); }

  /**
   * Specifies the attribute to be used for "selected" attribute.
   */
  @reflectable @published
  String get valueattr => __$valueattr; String __$valueattr = 'name'; @reflectable set valueattr(String value) { __$valueattr = notifyPropertyChange(#valueattr, __$valueattr, value); }

  /**
   * Specifies the CSS class to be used to add to the selected element.
   */
  @reflectable @published
  String get selectedClass => __$selectedClass; String __$selectedClass = 'polymer-selected'; @reflectable set selectedClass(String value) { __$selectedClass = notifyPropertyChange(#selectedClass, __$selectedClass, value); }

  /**
   * Specifies the property to be used to set on the selected element
   * to indicate its active state.
   */
  @reflectable @published
  String get selectedProperty => __$selectedProperty; String __$selectedProperty = ''; @reflectable set selectedProperty(String value) { __$selectedProperty = notifyPropertyChange(#selectedProperty, __$selectedProperty, value); }

  /**
   * Specifies the property to be used to set on the selected element
   * to indicate its active state.
   */
  @reflectable @published
  String get selectedAttribute => __$selectedAttribute; String __$selectedAttribute = 'active'; @reflectable set selectedAttribute(String value) { __$selectedAttribute = notifyPropertyChange(#selectedAttribute, __$selectedAttribute, value); }

  /**
   * Returns the currently selected element. In multi-selection this returns
   * an array of selected elements.
   */
  @reflectable @published
  dynamic get selectedItem => __$selectedItem; dynamic __$selectedItem = null; @reflectable set selectedItem(dynamic value) { __$selectedItem = notifyPropertyChange(#selectedItem, __$selectedItem, value); }

  /**
   * In single selection, this returns the model associated with the
   * selected element.
   */
  @reflectable @published
  dynamic get selectedModel => __$selectedModel; dynamic __$selectedModel = null; @reflectable set selectedModel(dynamic value) { __$selectedModel = notifyPropertyChange(#selectedModel, __$selectedModel, value); }

  /**
   * In single selection, this returns the selected index.
   */
  int selectedIndex = -1;

  @reflectable @published
  bool get notap => __$notap; bool __$notap = false; @reflectable set notap(bool value) { __$notap = notifyPropertyChange(#notap, __$notap, value); }

  /**
   * The target element that contains items.  If this is not set
   * polymer-selector is the container.
   *
   * (egrimes) Note: Working around
   */
  @reflectable @published
  dom.Element get target => __$target; dom.Element __$target = null; @reflectable set target(dom.Element value) { __$target = notifyPropertyChange(#target, __$target, value); }

  /**
   * This can be used to query nodes from the target node to be used for
   * selection items.  Note this only works if the 'target' property is set.
  *
   * Example:
  *
   *     <polymer-selector target="{ {$['myForm'] }}" itemsSelector="input[type=radio]"></polymer-selector>
   *     <form id="myForm">
   *       <label><input type="radio" name="color" value="red"> Red</label> <br>
   *       <label><input type="radio" name="color" value="green"> Green</label> <br>
   *       <label><input type="radio" name="color" value="blue"> Blue</label> <br>
   *       <p>color = {{color}}</p>
   *     </form>
   *
   */
  @reflectable @published
  String get itemsSelector => __$itemsSelector; String __$itemsSelector = ''; @reflectable set itemsSelector(String value) { __$itemsSelector = notifyPropertyChange(#itemsSelector, __$itemsSelector, value); }

  /**
   * The event that would be fired from the item element to indicate
   * it is being selected.
   */
  @reflectable @published
  String get activateEvent => __$activateEvent; String __$activateEvent = 'click'; @reflectable set activateEvent(String value) { __$activateEvent = notifyPropertyChange(#activateEvent, __$activateEvent, value); }
      // TODO change to tap when pointerevents are supported

  PolymerSelector.created(): super.created();

  dom.MutationObserver _observer;

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
  async.Stream<dom.CustomEvent> get onPolymerSelect {
    var selection = ($['selection'] as PolymerSelection);
    if (selection != null) {
      return selection.onPolymerSelect;
    }
    return null;
  }

  /**
   * Fired when an item element is tapped.
   *
   * @event polymer-activate
   * @param {Object} detail
   *   @param {Object} detail.item the item element
   */
  async.Stream<dom.CustomEvent> get onPolymerActivate =>
      PolymerSelector._onPolymerActivate.forTarget(this);

  static const dom.EventStreamProvider<dom.CustomEvent> _onPolymerActivate =
      const dom.EventStreamProvider<dom.CustomEvent>('polymer-activate');

  void ready() {
    super.ready();
    this._observer = new dom.MutationObserver(_onMutation);

    if (this.target == null) {
      this.target = this;
    }
  }

  List<dom.Element> get items {
    List nodes;
    if (this.target != this) {
      if (this.itemsSelector != null && this.itemsSelector.isNotEmpty) {
        nodes = this.target.querySelectorAll(this.itemsSelector);
      } else {
        nodes = this.target.children;
      }
    } else {
      nodes = (this.$['items'] as dom.ContentElement).getDistributedNodes();
    }

    return nodes.where((dom.Element e) {
      return e != null && e.localName != 'template';
    }).toList();
  }

  void targetChanged(old) {
    if (old != null) {
      this._removeListener(old);
      this._observer.disconnect();
    }
    if (this.target != null) {
      this._addListener(this.target);
      this._observer.observe(this.target, childList: true);
    }
  }

  void _addListener(node) {
    node.addEventListener(this.activateEvent, activateHandler);
  }

  void _removeListener(node) {
    node.removeEventListener(this.activateEvent, activateHandler);
  }

  dynamic get selection {
    return (this.$['selection'] as PolymerSelection).selection;
  }

  void selectedChanged(old) {
    //(egrimes) Note: Workaround for https://code.google.com/p/dart/issues/detail?id=14496
    // TODO should be fixed
    new async.Future(() => _updateSelected());
    //this._updateSelected();
  }

  void _onMutation(records, observer) {
    _updateSelected();
  }

  void _updateSelected() {
    this._validateSelected();
    if (this.multi) {
      this.clearSelection();
      if (this.selected != null) {
        this.selected.forEach((s) {
          this._valueToSelection(s);
        });
      }
    } else {
      this._valueToSelection(this.selected);
    }
  }

  void _validateSelected() {
    // convert to a list for multi-selection
    if (this.multi && this.selected != null && this.selected is! List) {
      this.selected = [this.selected];
    }
  }

  void clearSelection() {
    if (this.multi) {
      var copy = new List.from(this.selection);
      copy.forEach((s) {
        (this.$['selection'] as PolymerSelection).setItemSelected(s, false);
      });
    } else {
      (this.$['selection'] as PolymerSelection).setItemSelected(this.selection,
          false);
    }
    this.selectedItem = null;
    (this.$['selection'] as PolymerSelection).clear();
  }

  void _valueToSelection(value) {
    var item = (value == null) ? null : this.items[this._valueToIndex(value)];
    (this.$['selection'] as PolymerSelection).select(item);
  }

  void _updateSelectedItem() {
    this.selectedItem = this.selection;
  }

  void selectedItemChanged(old) {
    if (!multi) {
      if (this.selectedItem != null) {
        //TODO Figure out why this doesn't work - filed https://code.google.com/p/dart/issues/detail?id=17462
        try {
          var t = this.selectedItem.templateInstance;
          this.selectedModel = t ? t.model : null;
        } catch (e) {}
      } else {
        this.selectedModel = null;
      }
      this.selectedIndex = (this.selectedItem != null) ? this._valueToIndex(
          this.selected) : 1;
    }
  }

  int _valueToIndex(value) {
    // find an item with value == value and return it's index
    for (var i = 0,
        items = this.items; i < items.length; i++) {
      if (this._valueForNode(items[i]) == value) {
        return i;
      }
    }
    // if no item found, the value itself is probably the index
    if (value is int) {
      return value;
    }

    if (value is String && value.isNotEmpty) {
      return int.parse(value, onError: (s) => -1);
    }
    return -1;
  }

  // TODO set mirrorsused, it's also important that the element that is accessed
  // ensures that the attribute doesn't get removed by tree-shaking
  String _valueForNode(dom.HtmlElement node) {
    var mirror = mirr.reflect(node);
    // TODO (zoechi) I think we could require that a published property (attribute) is used.
    // than we can drop reflection (not sure if this really would work).
    //TODO This is gross.  The alternative is to search the type heirarchy
    //for a matching variable or getter.
    try {
      return mirror.getField(new Symbol('${this.valueattr}')).reflectee;
    } catch (e) {
      return node.attributes[this.valueattr];
    }
    ;
  }

  // events fired from <polymer-selection> object
  void selectionSelect(e, detail, target) {
    this._updateSelectedItem();
    if (detail.containsKey('item')) {
      this._applySelection(detail['item'], detail['isSelected']);
    }
  }

  // TODO set mirrorsused
  void _applySelection(dom.HtmlElement item, bool isSelected) {
    if (this.selectedClass != null && this.selectedClass.isNotEmpty) {
      item.classes.toggle(this.selectedClass, isSelected);
    }

    if (this.selectedProperty != null && this.selectedProperty.isNotEmpty) {
      //(egrimes) Note: It looks like Polymer.js adds the property dynamically to
      //the item. PolymerSelector defaults selectedAttribute to 'active', so users
      //will have to explicitly set selectedProperty to an empty string to keep
      //from blowing up. I'm not sure that's reasoable.
      mirr.InstanceMirror itemIM = mirr.reflect(item);
      Symbol selectedPropertySym = new Symbol('${this.selectedProperty}');
      mirr.MethodMirror selectedPropertySetter =
          itemIM.type.instanceMembers[selectedPropertySym];

      //Note: Reflection is required to work properly with checkboxes
      // TODO check if a setter is available instead of try/catch
      //try {
      if (selectedPropertySetter != null && selectedPropertySetter.isSetter &&
          !selectedPropertySetter.isStatic) {
        // polymer-ui-submenu-item works only with this
        itemIM.setField(selectedPropertySym, isSelected);

        //} catch(e) { // required for polymer_ui_breadcrumbs (when an attribute is set on a DOM element
      } else {
        item.attributes[this.selectedProperty] = isSelected.toString();
        if(!isSelected) {
          item.attributes.remove(this.selectedProperty);
        }
      }
    }

    // item.attributes.remove('this.selectedAttribute') doesn't lead to a call of the fieldChangedMethod
    if (this.selectedAttribute != null && this.selectedAttribute.isNotEmpty) {
      item.attributes[this.selectedAttribute] = isSelected.toString();
      if(!isSelected) {
        item.attributes.remove(this.selectedAttribute);
      }
    }
  }

  void activateHandler(e) {
    if (!this.notap) {
      var i = this._findDistributedTarget(e.target, this.items);
      if (i >= 0) {
        var item = this.items[i];
        var s = this._valueForNode(item);
        if (s == null) {
          s = i;
        }
        if (this.multi) {
          if (this.selected != null) {
            this._addRemoveSelected(s);
          } else {
            this.selected = [s];
          }
        } else {
          this.selected = s;
        }
        this.asyncFire('polymer-activate', detail: {
          'item': item
        });
      }
    }
  }

  void _addRemoveSelected(value) {
    int i = this.selected.indexOf(value);
    if (i >= 0) {
      this.selected.removeAt(i);
    } else {
      this.selected.add(value);
    }
    this._valueToSelection(value);
  }

  int _findDistributedTarget(target, nodes) {
    // find first ancestor of target (including itself) that
    // is in nodes, if any
    int i = 0;
    while (target != null && target != this) {
      i = nodes.indexOf(target);
      if (i >= 0) {
        return i;
      }
      target = target.parentNode;
    }
    return -1;
  }
}
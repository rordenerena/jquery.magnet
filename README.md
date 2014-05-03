jquery.magnet
=============

A plugin to magnetize elements into magnet elements in a determinate position and zone.

[http://dakotadelnorte.github.io/jquery.magnet/demo.html "VIEW DEMO"]

##Options

### Type Positioning *Custom*
|Type|Description|
|:--|:--|
| **Inner**| Around the element inside the elements dropped in this, will be magnetized to the border.|
| **CenterV**| At the middle vertically will be magnetized the elements dropped his center position in this virtual line, which has offset to bottom and offset to the top.|
| **CenterH**| At the middle horizontally will be magnetized the elements dropped his center position in this virtual line, which has offset to left side and offset to the right side.|
| **Center**| Having present the offset setted, from center of the magnet element will be a radius form with a offset distance from center.|

###Offset *unit (px, em, %)*
* The offset in **em, px or %** of distance to be magnetize the element dropped

### animate *Boolean*
Is a boolean that set if when the element has been dropped in magnet element will be an animation.

### classAffected *css class*
Which elements has been dealed about the plugin when has been dropped in element magnet.

### debug
Flag that set if the plugin should be print in console traces of information.

## Callbacks

### dragCallback
This callback is triggered when an element with class *classAffected* is being dragging.

### overCallback

This callback is triggered when an element with class *classAffected* is being moved over the magnet element.

### outCallback

This callback is triggered when an element with class *classAffected* has been outside from the magnet element.

###animateCallback

This callback is triggered when an element with class *classAffected* has been dropped inside the magnet element and if the option *animate* has been setted to *true*.
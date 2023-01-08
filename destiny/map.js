/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var l8raw = ee.ImageCollection("LANDSAT/LC08/C02/T2_L2");
/***** End of imports. If edited, may not auto-convert in the playground. *****/





  var points = {
Adirampattinam: [79.25,10.21,15],
Ambasamudram: [77.29,8.43,15],
Ambur: [78.45,21.50,15],
Anaimalai_Hills: [76.40,10.24,15],
Arakkonam: [79.434, 13.05,15],
Arantangi: [79.02, 10.10,15],
Arcot: [79.24, 79.24, 9],
Arni: [79.19,12.40,9],
Aruppukkotai: [85.361, 19.7501,11],
Attur: [78.39, 11.36, 10],
Atur: [77.53, 10.16, 11],
Bodinayakkanur: [77.24, 10.01, 13],
Calimere_Point: [79.52, 10.18, 10],
Carnatic: [80.00, 12.00,10],
Chidambaram: [79.44,11.24, 11],
Chingleput: [80.01,12.42,10],
Coimbatore:[77.00,11.00, 10],
Cuddalore: [79.49, 11.43, 11],
Devakottai: [78.53, 9.57, 11],
Dhanushkodi: [79.28,9.10, 13],
Dharapuram: [77.34, 10.45, 10],
Dharmapuri: [78.13,12.08, 11],
Ennore:	[80.22,10.21 ,10],
Erode:	[77.46,77.46,10],
Kanchipuram:[79.45,12.50,10],
Karur:	[78.07,10.58,10],
Kaveri:	[77.50,	11.20,10],
Kayalpatnam	:[78.50,8.34, 10],
Kilakarai:	[78.50,9.14, 10],
Kodaikanal: [77.32,9.14, 10],
Krishnagiri:	[78.16,12.32, 10],
Kumbakonam:[79.25,10.58,10],
Madras_Chennai:[80.01 ,	13.04,10],
Madurai	:[78.10 ,	9.58 ,10],
Madurantakam:	[79.56,12.30,10],

Yercaud:	[78.13,	11.48,10]

};

var app = {};

/** Creates the UI panels. */
app.createPanels = function() {
  /* The introduction section. */
  app.intro = {
    panel: ui.Panel([
      ui.Label({
        value: 'INDIVIDUAL CROP HEALTH MONITORING SYSTEM USING SATELLITE IMAGE PROCESSING AND GROUND DATA FOR PRECISION AGRICULTURE',
        style: {color:'blue',fontWeight: 'bold', fontSize: '24px', margin: '10px 5px'}
      }),
      ui.Label('This is team of destiney makers \t\n' 
               )
    ])
  };

  app.lakePicker = {
    select: ui.Select({
      placeholder: ' Select District',
      items: Object.keys(points),
      onChange: function(key) {
        Map.setCenter(points[key][0], points[key][1], points[key][2]);
      }
    })
  };

  app.lakePicker.panel = ui.Panel({
    widgets: [
      ui.Label('1) Select district', {fontWeight: 'bold'}),
      ui.Panel([app.lakePicker.select], ui.Panel.Layout.flow('horizontal'))]
  });

  /* The collection filter controls. */
  app.filters = {
    mapCenter: ui.Checkbox({label: 'Filter to map center', value: true}),
    startDate: ui.Textbox('YYYY-MM-DD', ''),
    endDate: ui.Textbox('YYYY-MM-DD', ''),
    applyButton: ui.Button('Apply filters', app.applyFilters),
    loadingLabel: ui.Label({
      value: 'Loading...',
      style: {stretch: 'vertical', color: 'gray', shown: false}
    })
  };

  /* The panel for the filter control widgets. */
  app.filters.panel = ui.Panel({
    widgets: [
      ui.Label('2) Select Duration', {fontWeight: 'bold'}),
      ui.Label('Start date', app.HELPER_TEXT_STYLE), app.filters.startDate,
      ui.Label('End date', app.HELPER_TEXT_STYLE), app.filters.endDate,
      app.filters.mapCenter,
      ui.Panel([
        app.filters.applyButton,
        app.filters.loadingLabel
      ], ui.Panel.Layout.flow('horizontal'))
    ],
    style: app.SECTION_STYLE
  });

  /* The image picker section. */
  app.picker = {
    // Create a select with a function that reacts to the "change" event.
    select: ui.Select({
      placeholder: 'Select an image ID',
      onChange: app.refreshMapLayer
    }),
    // Create a button that centers the map on a given object.
    centerButton: ui.Button('Center on map', function() {
      Map.centerObject(Map.layers().get(0).get('eeObject'));
    })
  };

  /* The panel for the picker section with corresponding widgets. */
  app.picker.panel = ui.Panel({
    widgets: [
      ui.Label('3) Select an image', {fontWeight: 'bold'}),
      ui.Panel([
        app.picker.select,
        app.picker.centerButton
      ], ui.Panel.Layout.flow('horizontal'))
    ],
    style: app.SECTION_STYLE
  });

  /* The visualization section. */
  app.vis = {
    label: ui.Label(),
    // Create a select with a function that reacts to the "change" event.
    select: ui.Select({
      items: Object.keys(app.VIS_OPTIONS),
      onChange: function() {
        // Update the label's value with the select's description.
        var option = app.VIS_OPTIONS[app.vis.select.getValue()];
        app.vis.label.setValue(option.description);
        // Refresh the map layer.
        app.refreshMapLayer();
      }
    })
  };

  /* The panel for the visualization section with corresponding widgets. */
  app.vis.panel = ui.Panel({
    widgets: [
      ui.Label('4) Select a visualization', {fontWeight: 'bold'}),
      app.vis.select,
      app.vis.label
    ],
    style: app.SECTION_STYLE
  });

  // Default the select to the first value.
  app.vis.select.setValue(app.vis.select.items().get(0));

  /* The export section. */
  app.export = {
    button: ui.Button({
      label: 'Export the current image to Drive',
      // React to the button's click event.
      onClick: function() {
        // Select the full image id.
        var imageIdTrailer = app.picker.select.getValue();
        var imageId = app.COLLECTION_ID + '/' + imageIdTrailer;
        // Get the visualization options.
        var visOption = app.VIS_OPTIONS[app.vis.select.getValue()];
        // Export the image to Drive.
        Export.image.toDrive({
          image: ee.Image(imageId).select(visOption.visParams.bands),
          description: 'L8_Export-' + imageIdTrailer,
        });
      }
    })
  };

  /* The panel for the export section with corresponding widgets. */
  app.export.panel = ui.Panel({
    widgets: [
      ui.Label('5) Start an export', {fontWeight: 'bold'}),
      app.export.button
    ],
    style: app.SECTION_STYLE
  });
};

/** Creates the app helper functions. */
app.createHelpers = function() {
  /**
   * Enables or disables loading mode.
   * @param {boolean} enabled Whether loading mode is enabled.
   */
  app.setLoadingMode = function(enabled) {
    // Set the loading label visibility to the enabled mode.
    app.filters.loadingLabel.style().set('shown', enabled);
    // Set each of the widgets to the given enabled mode.
    var loadDependentWidgets = [
      app.lakePicker.select,
      app.vis.select,
      app.filters.startDate,
      app.filters.endDate,
      app.filters.applyButton,
      app.filters.mapCenter,
      app.picker.select,
      app.picker.centerButton,
      app.export.button
    ];
    loadDependentWidgets.forEach(function(widget) {
      widget.setDisabled(enabled);
    });
  };

  /** Applies the selection filters currently selected in the UI. */
  app.applyFilters = function() {
    app.setLoadingMode(true);
    var filtered = ee.ImageCollection(app.COLLECTION_ID);

    // Filter bounds to the map if the checkbox is marked.
    if (app.filters.mapCenter.getValue()) {
      filtered = filtered.filterBounds(Map.getCenter());
    }

    // Set filter variables.
    var start = app.filters.startDate.getValue();
    if (start) start = ee.Date(start);
    var end = app.filters.endDate.getValue();
    if (end) end = ee.Date(end);
    if (start) filtered = filtered.filterDate(start, end);

    // Get the list of computed ids.
    var computedIds = filtered
        .limit(app.IMAGE_COUNT_LIMIT)
        .reduceColumns(ee.Reducer.toList(), ['system:index'])
        .get('list');

    computedIds.evaluate(function(ids) {
      // Update the image picker with the given list of ids.
      app.setLoadingMode(false);
      app.picker.select.items().reset(ids);
      // Default the image picker to the first id.
      app.picker.select.setValue(app.picker.select.items().get(0));
    });
  };

  /** Refreshes the current map layer based on the UI widget states. */
  app.refreshMapLayer = function() {
    Map.clear();
    var imageId = app.picker.select.getValue();
    if (imageId) {
      // If an image id is found, create an image.
      var image = ee.Image(app.COLLECTION_ID + '/' + imageId);
      if(app.vis.select.getValue().toString() == "NDVI") {
        image = ee.ImageCollection(app.EVI_COLLECTION_ID);
        image = image.select('EVI');
      }
      // Add the image to the map with the corresponding visualization options.
      var visOption = app.VIS_OPTIONS[app.vis.select.getValue()];
      Map.addLayer(image, visOption.visParams, imageId);
    }
  };
};

/** Creates the app constants. */
app.createConstants = function() {
  app.COLLECTION_ID = 'LANDSAT/LE07/C01/T1_RT_TOA';
  app.EVI_COLLECTION_ID = 'LANDSAT/LE07/C01/T1_8DAY_EVI';
  app.SECTION_STYLE = {margin: '20px 0 0 0'};
  app.HELPER_TEXT_STYLE = {
      margin: '8px 0 -3px 8px',
      fontSize: '12px',
      color: 'gray'
  };
  app.IMAGE_COUNT_LIMIT = 10;
  app.VIS_OPTIONS = {
    'False color (B7/B6/B4)': {
      description: 'Vegetation is shades of red, urban areas are ' +
                   'cyan blue, and soils are browns.',
      visParams: {gamma: 1.3, min: 0, max: 0.3, bands: ['B6_VCID_1', 'B4', 'B3']}
    },
    'Natural color (B4/B3/B2)': {
      description: 'Ground features appear in colors similar to their ' +
                   'appearance to the human visual system.',
      visParams: {gamma: 1.3, min: 0, max: 0.3, bands: ['B4', 'B3', 'B2']}
    },
    'Atmospheric (B7/B6/B5)': {
      description: 'Coast lines and shores are well-defined. ' +
                   'Vegetation appears blue.',
      visParams: {gamma: 1.3, min: 0, max: 0.3, bands: ['B7', 'B6_VCID_2', 'B5']}
    },
    'NDVI': {
      description: 'Vegetation index to detect the NDVI (raw) for the footprint' + 
                   'in focus - works for both land and water areas.',
      visParams: {min: 0.0,
      max: 1.0,
      palette: [
        'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
        '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
        '012E01', '011D01', '011301'
      ]}
    }
  };
};

/** Creates the application interface. */
app.boot = function() {
  app.createConstants();
  app.createHelpers();
  app.createPanels();
  var main = ui.Panel({
    widgets: [
      app.intro.panel,
      app.lakePicker.panel,
      app.filters.panel,
      app.picker.panel,
      app.vis.panel,
      app.export.panel
    ],
    style: {width: '320px', padding: '8px'}
  });
  Map.setCenter(-97, 26, 9);
  ui.root.insert(0, main);
  app.applyFilters();
};

app.boot();

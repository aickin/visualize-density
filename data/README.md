# Data

Origins and notes about the data used in this project:

## Tile processing

To upload geojson feature collections as Mapbox tilesets:

```
node uploadTileset.js stops transit/output/stops.geo.json
node uploadTileset.js segments transit/output/highFrequencySegments.geo.json
```

Some files can be too large to be uploaded directly, so we'll need to pre-process them:

```
brew install tippecanoe
tippecanoe -o parcels/output/enriched.mbtiles -Z12 -z15 -aN -P -f parcels/output/enriched.geo.json
node uploadTileset.js parcels parcels/output/enriched.mbtiles
```

### Feeds

Santa Barbara feed: https://transit.land/feed-registry/operators/o-9q4g-santabarbaramtd
Santa Rosa CityBus: https://transit.land/feed-registry/operators/o-9qbdx-santarosacitybus
SMART: http://511.org/developers/list/data/
Amtrak: https://transit.land/feed-registry/operators/o-9-amtrak
Foothill: http://foothilltransit.org/gtfs/foothilltransit-ca-us.zip

Note that some agencies have a file called `benchmark-date.txt` added to the GTFS which
specifies a date to use for testing the schedule for 15 minute service. The date in that
file should be of the form YYYYMMDD. If there is no `benchmark-date.txt` file, then
January 8th, 2018 will be used.

### California borders

California GeoJSON was acquired from US Census here: https://www.census.gov/cgi-bin/geo/shapefiles2010/main
Then the following command was run with ogr2ogr from GDAL 1.11.5:

```
ogr2ogr -f GeoJSON -t_srs crs:84 california.geo.json tl_2010_06_state10/tl_2010_06_state10.shp
```

and then extract the first feature from the geoJSON.

### California Senate & Assembly districts

2016 California Senate and Assembly districts were acquired here: https://www.census.gov/geo/maps-data/data/cbf/cbf_sld.html
Then the following command was run with ogr2ogr from GDAL 1.11.5:

```
ogr2ogr -f GeoJSON -t_srs crs:84 senate-districts.geo.json cb_2016_06_sldu_500k/cb_2016_06_sldu_500k.shp
ogr2ogr -f GeoJSON -t_srs crs:84 assembly-districts.geo.json cb_2016_06_sldl_500k/cb_2016_06_sldl_500k.shp
```

These geoJSON files are FeatureCollections. Each feature is one district with a `NAME` property equal to
the district number.

### California populations

The California population information was pulled from https://www.census.gov/data/datasets/2016/demo/popest/total-cities-and-towns.html#ds and
converted from CSV to JSON.

### California places

The California places were acquired here: https://www.census.gov/geo/maps-data/data/cbf/cbf_place.html
Then the following command was run with ogr2ogr from GDAL 1.11.5:

```
ogr2ogr -f GeoJSON -t_srs crs:84 california-places.geo.json cb_2016_06_place_500k/cb_2016_06_place_500k.shp
```

To generate the largest cities in each legislative district: `node ./data/findPopulousCities.js`. This doesn't
generally need to be done, because it shouldn't change very frequently.

### California Block Groups

The California block groups were acquired here: https://www.census.gov/cgi-bin/geo/shapefiles/index.php
They were 2016 Block Groups for California, and then were transformed by the following
command with ogr2ogr from from GDAL 2.2.4:

```
ogr2ogr -f GeoJSON -t_srs crs:84 california-block-groups.geo.json tl_2016_06_bg/tl_2016_06_bg.shp
```

### California Block Group Income

The California block group income was acquired from ACS American Fact Finder.
I added block group geography for every county in CA and selected table B19013:
"MEDIAN HOUSEHOLD INCOME IN THE PAST 12 MONTHS (IN 2016 INFLATION-ADJUSTED DOLLARS)"
for the 2012-2016 American Community Survey 5-Year Estimates.

### California Coastal Zone

The California coastal zone information was acquired here: http://atlas.resources.ca.gov/arcgis/rest/services/Boundaries/Coastal_Conservancy/MapServer.

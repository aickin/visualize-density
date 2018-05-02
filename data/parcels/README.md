# Parcels

Combine raw parcel data with census, zoning and transit information to show per-parcel diffs of height, density, and parking as a result of SB 827.

### Download data

Raw parcel data is gathered from various cities and counties across California.

Parcel data is stored in `data/parcels/input/`. Each county has a directory that includes a `parcels.geo.json` file, plus an `info.json` file that specifies which raw field should be used as the canonical parcel identifier.

The data has been excluded from the repo due to its size but you can download it from s3:

```
aws s3 sync s3://ca-maps/parcels input
```

### Postgis

Parcel data is too large for memory. We use PostgreSQL to store data on disk and
PostGIS to index it.

To install PostgreSQL and PostGIS:

```
brew install postgres postgis
initdb /usr/local/var/postgres -E utf8
pg_ctl -D /usr/local/var/postgres start
createdb ca_yimby
```

To install the PostGIS extension to the database:

```
psql -p 5432 -d ca_yimby
CREATE EXTENSION postgis;
```

### Load

First, you need to load the parcel, street, and zoning data into the PostGIS
database.

To load parcel data into the database:

```
node parcels/loadParcels.js

# OR: just load a particular county or counties (notice these are directory names,
# not county names):
node parcels/loadParcels.js --include los-angeles yolo

# OR: first drop the existing parcel table completely (DANGER!)
node parcels/loadParcels.js --drop
```

Note that dropping the parcel table can be extremely costly, as loading and
enriching all the parcels in California can take a long time (as much as a day
or more).

Also note that only 51 of the 58 California counties are included in our parcel
data set; we are missing Colusa, Inyo, Mariposa, Modoc, Plumas, San Luis Obispo,
and Siskiyou counties.

To load street data into the database:

```
node streets/loadStreets.js

# OR: just load a particular county or counties (notice these are directory names,
# not county names):
node parcels/loadStreets.js --include los-angeles yolo

# OR: first drop the existing street table completely (DANGER!)
node streets/loadStreets.js --drop
```

To load zoning data into the database:

```
# takes no arguments and always drops the existing zoning table
node zoning/loadZoning.js
```

### Enrich

Enrichers take a parcel as input, then output a set of properties to "enrich" the parcel. e.g. `ZoningEnricher` intersect a parcel with known zones, and attaches the zoning information to the parcel.

To enrich the parcel data in the database, specify the enrichers you'd like to use. Enrichers will run per-parcel in sequence.

```
node enrich.js census
node enrich.js zoning
node enrich.js street
node enrich.js census city zoning street sb827
```

The `sb827` enricher depends on both `zoning` and `street` running before it, so make sure
that you put it later in the list (or run it later).

You can optionally provide a region (center point + mile radius) to enrich only a subset of the data:

```
node enrich.js census zoning street sb827 -p=-117.14173,32.71029 -r=2
```

Or you can list just the counties you would like to enrich, using their proper names:

```
node enrich.js census zoning street sb827 --counties "Los Angeles" Yolo
```

Note that enriching the entire parcel database with all the enrichers can easily take a day or more,
depending on your machine's horsepower. As the enrichers are single-threaded and
generally CPU-bound, you may find it helpful to launch 2 or more enriching processes,
each running on a subset of the counties in California.

### Export

To export parcel, street, and zoning data from the database as GeoJSON, specify the table to export. You can optionally provide a region  (center point + mile radius) to export only a subset of the data:

```
node exportTable.js parcels parcels/output/enriched.geo.json
node exportTable.js parcels parcels/output/enriched.geo.json -p=-117.14173,32.71029 -r=2
```

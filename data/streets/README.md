# Streets

Enrich parcels with available street data.

### Download data

Raw street data originates from https://www.census.gov/cgi-bin/geo/shapefiles/index.php.

Street data is stored in `data/streets/input/`. Each county in California has a directory that includes a `streets.geo.json` file.

The data has been excluded from the repo due to its size but you can download it from s3:

```
aws s3 sync s3://ca-maps/streets input
```

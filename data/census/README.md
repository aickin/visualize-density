# Census

Enrich parcels with census data.

### Download data

Raw census data originates from https://www.census.gov/cgi-bin/geo/shapefiles/index.php.

Census data is stored in `data/census/input/california.geo.json`.

The data has been excluded from the repo due to its size but you can download it from s3:

```
aws s3 sync s3://ca-maps/census input
```

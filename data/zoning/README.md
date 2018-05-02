# Zoning

Digitized zoning data!

### Inputs

Input zoning data is stored in `input/`. This input is the GeoJSON output from [Matt's code](https://github.com/mattwigway/upzone-california). It is too large to check into git, so it lives under the S3 path `s3://zoning-data/output`. Ask Hunter for a key, then download:

```
aws configure --profile zoning
aws --profile zoning s3 sync s3://zoning-data/output input
```

### Process

To generate zoning tiles for the private site, run the following command:

```
node processZoning.js
```

The tiles will be saved to `private-site/public/zoning/tiles`.

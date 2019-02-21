# transitrichhousing.org

This is the repo that drives https://transitrichhousing.org/. To install the
repo:

```
git clone https://github.com/aickin/visualize-density.git
cd visualize-density
yarn install
yarn build-data
```

To run the site in development mode locally:

```
yarn start-site
```

To generate a production version of the site:

```
yarn build-site
```

The resulting site will be in the `/site/build` directory, and it can be deployed to
any static webserver.

To regenerate the data for the site:

```
yarn build-data
```

Note that the data used by the site is checked in to the repo, rather than being generated
at build time. This is because the data generation takes quite a long time (~17m currently
on my laptop), and I'm not sure Netlify can handle that.

If you change the data generation code, you need to run `yarn build-data` before
checking in.

### Re-generating zoning tiles

See data/zoning/README.md

### Re-generating parcel tiles

See data/parcels/README.md

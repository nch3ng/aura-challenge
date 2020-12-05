
# Aura Code Challenge

  The data.json is scanned and another grid.index.json is generated for the purpose of finding the closest zipcode.
  The original README.md are renamed to README_WITH_CHALLENGE.md

## Install serverless cli to run the demo:
```shell
npm install -g serverless
```

## API definition

   [https://github.com/qqnc/aura-challenge/blob/main/swagger.yml](https://github.com/qqnc/aura-challenge/blob/main/swagger.yml)

## Run with events
All test events are saved in `./events`

```shell
sls invoke local --function search -p ./events/querywithFilter.json
```
## Run tests
```shell
npm run test
```


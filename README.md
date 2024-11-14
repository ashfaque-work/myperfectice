## Generate type from proto file

protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./proto ./proto/time-sheet.proto

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Starting Redis Server

- Install Linux as a Subsystem on Windows
``` wsl --install ```

- Create a User by entering new ***username*** and new ***password***

- Install Redis with below command
``` sudo snap install redis ```

- Start the server with below command
``` sudo snap start redis ```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## build docker imgae

docker build ../../ -f Dockerfile -t priytam1993/gateway-prod:latest
docker build ../../ -f Dockerfile -t priytam1993/auth-prod:latest
docker build ../../ -f Dockerfile -t priytam1993/notify-prod:latest
docker build ../../ -f Dockerfile -t priytam1993/timesheet-prod:latest
docker build ../../ -f Dockerfile -t priytam1993/administration-prod:latest
docker build ../../ -f Dockerfile -t priytam1993/assessment-prod:latest
docker build ../../ -f Dockerfile -t priytam1993/classroom-prod:latest
docker build ../../ -f Dockerfile -t priytam1993/course-prod:latest
docker build ../../ -f Dockerfile -t priytam1993/questionbank-prod:latest

sub:
[
  "60dd4b1197816881fcf24d31",
  "61c29a5b71509ad43d3b255b",
  "5fc2798942e608529069c7ee"
]
prog:
[
  "5bc97c1e6dcc694f0247ea57"
]
loc:
[
  "5ff27f90fbed292f304be5df"
]

## Instance Key Implementation
In libs/common/src/config folder, there is an index file, here we set 'prod' or 'dev' as the environment
There are local.ts and production.ts files in the config folder only, where all connection URIs along with instance keys are written. (*req- there must be a common instance key between these config files)

Send instancekey in header.


## Starting Redis Server
- Install Linux as a Subsystem on Windows
``` wsl --install ```

- Create a User by entering new ***username*** and new ***password***

- Install Redis with below command
``` sudo snap install redis ```

- Start the server with below command
``` sudo snap start redis ```
# Image Repository Infrastructure

This is the AWS CDK infrastructure for the repository.
Here, you will find:

- Core CDK application (`bin/app.ts`)
- CDK stack (`lib/app-stack.ts`)
- Lambda source code (`src/*.js`)
- CDK config files (`cdk.json`, `tsconfig.json`, etc.)

## Usage

First install required dependencies with `npm install`.

To deploy the infrastructure, first bundle the lambda assets with `npm run bundle`.
Next, trigger the CDK deployment with `npm run deploy`.

To teardown the entire stack, use `npm run destroy`

That's it!

## On Different AWS Accounts

To deploy to your own account, you'll first need an `S3` bucket to house the images, and a `DynamoDB` table to house the metadata.

If you have never initialized CDK on the account, you will also need to use `npm run bootstrap`.

Update the values in `bin/app.ts` for their names, then follow the deployment steps above.

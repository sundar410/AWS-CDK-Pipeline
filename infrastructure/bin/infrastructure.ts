import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {StaticSiteStack} from '../lib/static-site.stack';
import {identifyResource} from '../lib/config-util';
import {CiCdStack} from '../lib/ci-cd.stack';
import {Fn} from 'aws-cdk-lib';

const accountId = '693896544254';
const region = 'us-east-1';

const app = new cdk.App();

// Create stack that sets up the static hosting of the site
const staticSiteResourcePrefix = 'cdk-web-static';
const STATIC_SITE_BUCKET_NAME_OUTPUT_ID = identifyResource(staticSiteResourcePrefix, 'bucket-name');
const STATIC_SITE_DISTRIBUTION_ID_OUTPUT_ID = identifyResource(staticSiteResourcePrefix, 'distribution-id');


new StaticSiteStack(app, identifyResource(staticSiteResourcePrefix, 'stack'), {
  env: {
    account: accountId,
    region: region,
  },
  resourcePrefix: staticSiteResourcePrefix,
  hostedZoneName: 'www.sundar.com',
  domainName: 'static.www.sundar.com',
  includeWWW: false,
  siteSourcePath: '../src',
  staticSiteBucketNameOutputId: STATIC_SITE_BUCKET_NAME_OUTPUT_ID,
  staticSiteDistributionIdOutputId: STATIC_SITE_DISTRIBUTION_ID_OUTPUT_ID,
});

// Create stack that sets up the CI/CD pipeline for the static site
const ciCdResourcePrefix = 'cdk-web-cicd';
const staticSiteBucket = Fn.importValue(STATIC_SITE_BUCKET_NAME_OUTPUT_ID);
const staticSiteDistributionId = Fn.importValue(STATIC_SITE_DISTRIBUTION_ID_OUTPUT_ID);

new CiCdStack(app, identifyResource(ciCdResourcePrefix, 'stack'), {
  env: {
    account: accountId,
    region: region
  },
  resourcePrefix: ciCdResourcePrefix,
  distributionId: staticSiteDistributionId,
  bucket: staticSiteBucket,
  repo: 'AWS-CDK-Pipeline',
  repoOwner: 'sundar410',
  repoBranch: 'main',
  githubTokenSecretId: '/static-cdk/cicd/github_token',
  buildAlertEmail: 'm.sundar410@gmail.com',
});
